/**
 * Error Factory
 * Factory for creating common error instances
 */

import { BaseError } from './base.error';
import { ApiError } from './api.error';
import { ValidationError } from './validation.error';
import { AuthenticationError } from './authentication.error';
import { AuthorizationError } from './authorization.error';
import { DatabaseError } from './database.error';
import { FileError } from './file.error';
import { ExternalServiceError } from './external-service.error';
import { ErrorCode, ErrorType, ErrorSeverity, HttpStatusCode } from './error.constants';

export class ErrorFactory {
  /**
   * Create API error
   */
  static createApiError(
    code: ErrorCode,
    message?: string,
    statusCode?: HttpStatusCode,
    details?: Record<string, any>
  ): ApiError {
    return new ApiError({
      code,
      message,
      statusCode,
      details
    });
  }

  /**
   * Create validation error
   */
  static createValidationError(
    code: ErrorCode,
    message?: string,
    field?: string,
    value?: any,
    details?: Record<string, any>
  ): ValidationError {
    return new ValidationError({
      code,
      message,
      field,
      value,
      details
    });
  }

  /**
   * Create authentication error
   */
  static createAuthenticationError(
    code: ErrorCode,
    message?: string,
    userId?: string,
    email?: string,
    details?: Record<string, any>
  ): AuthenticationError {
    return new AuthenticationError({
      code,
      message,
      userId,
      email,
      details
    });
  }

  /**
   * Create authorization error
   */
  static createAuthorizationError(
    code: ErrorCode,
    message?: string,
    userId?: string,
    requiredRole?: string,
    details?: Record<string, any>
  ): AuthorizationError {
    return new AuthorizationError({
      code,
      message,
      userId,
      requiredRole,
      details
    });
  }

  /**
   * Create database error
   */
  static createDatabaseError(
    code: ErrorCode,
    message?: string,
    table?: string,
    details?: Record<string, any>
  ): DatabaseError {
    return new DatabaseError({
      code,
      message,
      table,
      details
    });
  }

  /**
   * Create file error
   */
  static createFileError(
    code: ErrorCode,
    message?: string,
    filename?: string,
    details?: Record<string, any>
  ): FileError {
    return new FileError({
      code,
      message,
      filename,
      details
    });
  }

  /**
   * Create external service error
   */
  static createExternalServiceError(
    code: ErrorCode,
    message?: string,
    serviceName?: string,
    details?: Record<string, any>
  ): ExternalServiceError {
    return new ExternalServiceError({
      code,
      message,
      serviceName,
      details
    });
  }

  /**
   * Create error from unknown error
   */
  static fromUnknownError(error: unknown, context?: Record<string, any>): BaseError {
    // Check if error is already a BaseError or any of its subclasses
    if (error instanceof BaseError) {
      // Add context if provided
      if (context) {
        (error as BaseError).withContext(context);
      }
      return error;
    }

    // Check for known error subclasses by checking properties
    // This handles cases where instanceof doesn't work due to prototype chain issues
    if (error && typeof error === 'object') {
      const err = error as any;
      // If it has statusCode, code, and type properties, treat it as BaseError
      if ('statusCode' in err && 'code' in err && 'type' in err) {
        // Preserve the original error properties
        const baseError = new BaseError({
          code: err.code || 'INTERNAL_SERVER_ERROR',
          message: err.message || 'Unknown error occurred',
          statusCode: err.statusCode || 500,
          type: err.type || 'SYSTEM',
          severity: err.severity || 'HIGH',
          details: err.details,
          context: { ...context, ...err.context }
        });
        return baseError;
      }
    }

    if (error instanceof Error) {
      return new BaseError({
        code: 'INTERNAL_SERVER_ERROR',
        message: (error as Error).message,
        type: 'SYSTEM',
        severity: 'HIGH',
        cause: error,
        context
      });
    }

    return new BaseError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unknown error occurred',
      type: 'SYSTEM',
      severity: 'HIGH',
      context: { ...context, originalError: error }
    });
  }

  /**
   * Create error from HTTP status code
   */
  static fromHttpStatus(
    statusCode: HttpStatusCode,
    message?: string,
    context?: Record<string, any>
  ): ApiError {
    let code: ErrorCode = 'INTERNAL_SERVER_ERROR';
    let severity: ErrorSeverity = 'HIGH';

    switch (statusCode) {
      case 400:
        code = 'VALIDATION_FAILED';
        severity = 'MEDIUM';
        break;
      case 401:
        code = 'AUTH_TOKEN_MISSING';
        severity = 'MEDIUM';
        break;
      case 403:
        code = 'AUTH_INSUFFICIENT_PERMISSIONS';
        severity = 'MEDIUM';
        break;
      case 404:
        code = 'DATABASE_RECORD_NOT_FOUND';
        severity = 'MEDIUM';
        break;
      case 409:
        code = 'DATABASE_DUPLICATE_ENTRY';
        severity = 'MEDIUM';
        break;
      case 422:
        code = 'VALIDATION_FAILED';
        severity = 'MEDIUM';
        break;
      case 429:
        code = 'RATE_LIMIT_EXCEEDED';
        severity = 'MEDIUM';
        break;
      case 500:
        code = 'INTERNAL_SERVER_ERROR';
        severity = 'HIGH';
        break;
      case 503:
        code = 'SERVICE_UNAVAILABLE';
        severity = 'HIGH';
        break;
    }

    return new ApiError({
      code,
      message,
      statusCode,
      type: 'SYSTEM',
      severity,
      context
    });
  }

  /**
   * Create error from Zod validation error
   */
  static fromZodError(zodError: any, context?: Record<string, any>): ValidationError {
    return ValidationError.fromZodError(zodError).withContext(context || {});
  }

  /**
   * Create error from Sequelize error
   */
  static fromSequelizeError(sequelizeError: any, context?: Record<string, any>): DatabaseError {
    return DatabaseError.fromSequelizeError(sequelizeError).withContext(context || {});
  }

  /**
   * Create error from HTTP error
   */
  static fromHttpError(
    serviceName: string,
    statusCode: number,
    message: string,
    endpoint?: string,
    method?: string
  ): ExternalServiceError {
    return ExternalServiceError.fromHttpError(serviceName, statusCode, message, endpoint, method);
  }
}

