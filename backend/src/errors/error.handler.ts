/**
 * Error Handler
 * Centralized error handling for Express.js
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { BaseError } from './base.error';
import { ApiError } from './api.error';
import { ValidationError } from './validation.error';
import { AuthenticationError } from './authentication.error';
import { AuthorizationError } from './authorization.error';
import { DatabaseError } from './database.error';
import { FileError } from './file.error';
import { ExternalServiceError } from './external-service.error';
import { ErrorFactory } from './error.factory';
import { ErrorUtils } from './error.utils';
import { responseUtils } from '../utils/response.util';
import logger from '../utils/logger.util';

export class ErrorHandler {
  /**
   * Global error handler middleware
   */
  static handle(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    try {
      // Convert unknown errors to BaseError
      const baseError = ErrorFactory.fromUnknownError(error, {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        requestId: (req as any).requestId
      });

      // Log error if necessary
      if (ErrorUtils.shouldLog(baseError)) {
        logger.logError('Error occurred:', ErrorUtils.formatForLogging(baseError, {
          url: req.url,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: (req as any).user?.id,
          requestId: (req as any).requestId
        }));
      }

      // Send error response
      ErrorHandler.sendErrorResponse(res, baseError);
    } catch (handlerError) {
      // Fallback error handling
      logger.logError('Error handler failed:', {
        originalError: error.message,
        handlerError: handlerError instanceof Error ? handlerError.message : 'Unknown error'
      });

      responseUtils.sendError(res, 'Internal server error', 500);
    }
  }

  /**
   * Handle Zod validation errors
   */
  static handleZodError(
    error: ZodError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const validationError = ErrorFactory.fromZodError(error, {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
      requestId: (req as any).requestId
    });

    logger.logWarning('Validation error:', ErrorUtils.formatForLogging(validationError));

    ErrorHandler.sendErrorResponse(res, validationError);
  }

  /**
   * Handle Sequelize errors
   */
  static handleSequelizeError(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const databaseError = ErrorFactory.fromSequelizeError(error, {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
      requestId: (req as any).requestId
    });

    logger.logError('Database error:', ErrorUtils.formatForLogging(databaseError));

    ErrorHandler.sendErrorResponse(res, databaseError);
  }

  /**
   * Handle 404 errors
   */
  static handleNotFound(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const notFoundError = ApiError.notFound(`Route ${req.originalUrl} not found`, {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.logWarning('Route not found:', ErrorUtils.formatForLogging(notFoundError));

    ErrorHandler.sendErrorResponse(res, notFoundError);
  }

  /**
   * Send error response
   */
  private static sendErrorResponse(res: Response, error: BaseError): void {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const includeStack = isDevelopment && ErrorUtils.isHighSeverity(error);

    // Format error for API response
    const errorResponse = ErrorUtils.formatForApi(error, includeStack);

    // Send appropriate response based on error type
    if (error instanceof ValidationError) {
      responseUtils.sendValidationError(res, error.message, error.validationErrors || []);
    } else if (error instanceof AuthenticationError) {
      responseUtils.sendError(res, ErrorUtils.getUserMessage(error), error.statusCode);
    } else if (error instanceof AuthorizationError) {
      responseUtils.sendError(res, ErrorUtils.getUserMessage(error), error.statusCode);
    } else if (error instanceof DatabaseError) {
      const message = isDevelopment ? error.message : 'Database error occurred';
      responseUtils.sendError(res, message, error.statusCode);
    } else if (error instanceof FileError) {
      responseUtils.sendError(res, ErrorUtils.getUserMessage(error), error.statusCode);
    } else if (error instanceof ExternalServiceError) {
      const message = isDevelopment ? error.message : 'External service error occurred';
      responseUtils.sendError(res, message, error.statusCode);
    } else {
      // Generic API error
      responseUtils.sendError(res, ErrorUtils.getUserMessage(error), error.statusCode);
    }
  }

  /**
   * Async error wrapper
   */
  static asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Error boundary for uncaught exceptions
   */
  static handleUncaughtException(error: Error): void {
    const baseError = ErrorFactory.fromUnknownError(error, {
      type: 'uncaught_exception',
      timestamp: new Date().toISOString()
    });

    logger.logError('Uncaught exception:', ErrorUtils.formatForLogging(baseError));

    // Exit process for critical errors
    if (ErrorUtils.isCritical(baseError)) {
      process.exit(1);
    }
  }

  /**
   * Error boundary for unhandled promise rejections
   */
  static handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    const baseError = ErrorFactory.fromUnknownError(error, {
      type: 'unhandled_rejection',
      promise: promise.toString(),
      timestamp: new Date().toISOString()
    });

    logger.logError('Unhandled rejection:', ErrorUtils.formatForLogging(baseError));

    // Exit process for critical errors
    if (ErrorUtils.isCritical(baseError)) {
      process.exit(1);
    }
  }

  /**
   * Setup global error handlers
   */
  static setupGlobalHandlers(): void {
    process.on('uncaughtException', this.handleUncaughtException);
    process.on('unhandledRejection', this.handleUnhandledRejection);
  }
}

// Export individual handlers for backward compatibility
export const errorHandler = ErrorHandler.handle;
export const zodErrorHandler = ErrorHandler.handleZodError;
export const sequelizeErrorHandler = ErrorHandler.handleSequelizeError;
export const notFoundHandler = ErrorHandler.handleNotFound;
export const asyncHandler = ErrorHandler.asyncHandler;
