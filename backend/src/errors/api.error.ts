/**
 * API Error Class
 * For general API-related errors
 */

import { BaseError, BaseErrorOptions } from './base.error';
import { ErrorCode, HttpStatusCode, ErrorType, ErrorSeverity } from './error.constants';

export interface ApiErrorOptions extends BaseErrorOptions {
  endpoint?: string;
  method?: string;
  requestId?: string;
  userId?: string;
}

export class ApiError extends BaseError {
  public readonly endpoint?: string;
  public readonly method?: string;
  public readonly requestId?: string;
  public readonly userId?: string;

  // Overload to support legacy (message, statusCode)
  constructor(message?: string, statusCode?: number);
  constructor(options?: ApiErrorOptions);
  constructor(optionsOrMessage: ApiErrorOptions | string = {}, maybeStatusCode?: number) {
    let options: ApiErrorOptions;
    if (typeof optionsOrMessage === 'string') {
      options = {
        message: optionsOrMessage,
        statusCode: (maybeStatusCode as HttpStatusCode) || 500
      } as ApiErrorOptions;
    } else {
      options = optionsOrMessage as ApiErrorOptions;
    }

    const {
      code = 'INTERNAL_SERVER_ERROR',
      statusCode = 500 as HttpStatusCode,
      type = 'SYSTEM',
      severity = 'MEDIUM',
      endpoint,
      method,
      requestId,
      userId,
      ...baseOptions
    } = options || {};

    super({
      code,
      statusCode: statusCode as HttpStatusCode,
      type,
      severity,
      ...baseOptions
    });

    this.endpoint = endpoint;
    this.method = method;
    this.requestId = requestId;
    this.userId = userId;

    // Add API-specific context
    if (endpoint) this.addContext('endpoint', endpoint);
    if (method) this.addContext('method', method);
    if (requestId) this.addContext('requestId', requestId);
    if (userId) this.addContext('userId', userId);
  }

  /**
   * Create a bad request error
   */
  static badRequest(message?: string, details?: Record<string, any>): ApiError {
    return new ApiError({
      code: 'VALIDATION_FAILED',
      message,
      statusCode: 400,
      type: 'VALIDATION',
      severity: 'MEDIUM',
      details
    });
  }

  /**
   * Create an unauthorized error
   */
  static unauthorized(message?: string, details?: Record<string, any>): ApiError {
    return new ApiError({
      code: 'AUTH_TOKEN_MISSING',
      message,
      statusCode: 401,
      type: 'AUTHENTICATION',
      severity: 'MEDIUM',
      details
    });
  }

  /**
   * Create a forbidden error
   */
  static forbidden(message?: string, details?: Record<string, any>): ApiError {
    return new ApiError({
      code: 'AUTH_INSUFFICIENT_PERMISSIONS',
      message,
      statusCode: 403,
      type: 'AUTHORIZATION',
      severity: 'MEDIUM',
      details
    });
  }

  /**
   * Create a not found error
   */
  static notFound(message?: string, details?: Record<string, any>): ApiError {
    return new ApiError({
      code: 'DATABASE_RECORD_NOT_FOUND',
      message,
      statusCode: 404,
      type: 'BUSINESS_LOGIC',
      severity: 'MEDIUM',
      details
    });
  }

  /**
   * Create a conflict error
   */
  static conflict(message?: string, details?: Record<string, any>): ApiError {
    return new ApiError({
      code: 'DATABASE_DUPLICATE_ENTRY',
      message,
      statusCode: 409,
      type: 'BUSINESS_LOGIC',
      severity: 'MEDIUM',
      details
    });
  }

  /**
   * Create an unprocessable entity error
   */
  static unprocessableEntity(message?: string, details?: Record<string, any>): ApiError {
    return new ApiError({
      code: 'VALIDATION_FAILED',
      message,
      statusCode: 422,
      type: 'VALIDATION',
      severity: 'MEDIUM',
      details
    });
  }

  /**
   * Create a too many requests error
   */
  static tooManyRequests(message?: string, details?: Record<string, any>): ApiError {
    return new ApiError({
      code: 'RATE_LIMIT_EXCEEDED',
      message,
      statusCode: 429,
      type: 'SYSTEM',
      severity: 'MEDIUM',
      details
    });
  }

  /**
   * Create an internal server error
   */
  static internalServerError(message?: string, details?: Record<string, any>): ApiError {
    return new ApiError({
      code: 'INTERNAL_SERVER_ERROR',
      message,
      statusCode: 500,
      type: 'SYSTEM',
      severity: 'HIGH',
      details
    });
  }

  /**
   * Create a service unavailable error
   */
  static serviceUnavailable(message?: string, details?: Record<string, any>): ApiError {
    return new ApiError({
      code: 'SERVICE_UNAVAILABLE',
      message,
      statusCode: 503,
      type: 'SYSTEM',
      severity: 'HIGH',
      details
    });
  }

  /**
   * Convert to JSON with API-specific fields
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      endpoint: this.endpoint,
      method: this.method,
      requestId: this.requestId,
      userId: this.userId
    };
  }
}

