/**
 * Error Handler
 * Centralized error handling for Express.js
 */

console.log('[ERROR_HANDLER] Starting imports...');
import { Request, Response, NextFunction } from 'express';
console.log('[ERROR_HANDLER] express imported');

import { ZodError } from 'zod';
console.log('[ERROR_HANDLER] zod imported');

import { BaseError } from './base.error';
console.log('[ERROR_HANDLER] BaseError imported');

import { ApiError } from './api.error';
console.log('[ERROR_HANDLER] ApiError imported');

import { ValidationError } from './validation.error';
console.log('[ERROR_HANDLER] ValidationError imported');

import { AuthenticationError } from './authentication.error';
console.log('[ERROR_HANDLER] AuthenticationError imported');

import { AuthorizationError } from './authorization.error';
console.log('[ERROR_HANDLER] AuthorizationError imported');

import { DatabaseError } from './database.error';
console.log('[ERROR_HANDLER] DatabaseError imported');

import { FileError } from './file.error';
console.log('[ERROR_HANDLER] FileError imported');

import { ExternalServiceError } from './external-service.error';
console.log('[ERROR_HANDLER] ExternalServiceError imported');

import { ErrorFactory } from './error.factory';
console.log('[ERROR_HANDLER] ErrorFactory imported');

import { ErrorUtils } from './error.utils';
console.log('[ERROR_HANDLER] ErrorUtils imported');

import { responseUtils } from '../utils/response.util';
console.log('[ERROR_HANDLER] responseUtils imported');

import logger from '../utils/logger.util';
console.log('[ERROR_HANDLER] logger imported');

import { objectUtils } from '../utils/object.util';
console.log('[ERROR_HANDLER] objectUtils imported');

console.log('[ERROR_HANDLER] All imports complete, defining ErrorHandler class...');
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
      // If this is a Sequelize error, normalize it via the Sequelize-specific path
      const errName = (error as any)?.name || (error as any)?.constructor?.name || '';
      if (typeof errName === 'string' && errName.startsWith('Sequelize')) {
        return ErrorHandler.handleSequelizeError(error, req, res, next);
      }

      // Convert unknown errors to BaseError
      const baseError = ErrorFactory.fromUnknownError(error, {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: objectUtils.get(req, 'user.id'),
        requestId: objectUtils.get(req, 'requestId')
      });

      // Log error if necessary
      if (ErrorUtils.shouldLog(baseError)) {
        logger.error('Error occurred:', ErrorUtils.formatForLogging(baseError as any, {
          url: req.url,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: objectUtils.get(req, 'user.id'),
          requestId: objectUtils.get(req, 'requestId')
        }));
      }

      // Send error response
      ErrorHandler.sendErrorResponse(res, baseError);
    } catch (handlerError) {
      // Fallback error handling
      logger.error('Error handler failed:', {
        originalError: error.message,
        handlerError: handlerError instanceof Error ? handlerError.message : 'Unknown error'
      } as any);

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
      userId: objectUtils.get(req, 'user.id'),
      requestId: objectUtils.get(req, 'requestId')
    });

    logger.logWarning('Validation error:', ErrorUtils.formatForLogging(validationError));

    ErrorHandler.sendErrorResponse(res, validationError);
  }

  /**
   * Handle Sequelize errors
   */
  static handleSequelizeError(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const databaseError = ErrorFactory.fromSequelizeError(error, {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: objectUtils.get(req, 'user.id'),
      requestId: objectUtils.get(req, 'requestId')
    });

    logger.logError('Database error:', ErrorUtils.formatForLogging(databaseError as any) as any);

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
      const message = isDevelopment ? (error as Error).message : 'Database error occurred';
      responseUtils.sendError(res, message, error.statusCode);
    } else if (error instanceof FileError) {
      responseUtils.sendError(res, ErrorUtils.getUserMessage(error), error.statusCode);
    } else if (error instanceof ExternalServiceError) {
      const message = isDevelopment ? (error as Error).message : 'External service error occurred';
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

    logger.logError('Uncaught exception:', ErrorUtils.formatForLogging(baseError as any) as any);

    // Exit process for critical errors
    if (ErrorUtils.isCritical(baseError)) {
      process.exit(1);
    }
  }

  /**
   * Error boundary for unhandled promise rejections
   */
  static handleUnhandledRejection(reason: unknown, promise: Promise<unknown>): void {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    const baseError = ErrorFactory.fromUnknownError(error, {
      type: 'unhandled_rejection',
      promise: promise.toString(),
      timestamp: new Date().toISOString()
    });

    logger.logError('Unhandled rejection:', ErrorUtils.formatForLogging(baseError as any) as any);

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
