/**
 * Error Utilities
 * Utility functions for error handling
 */

import { BaseError } from './base.error';
import { ErrorCode, ErrorSeverity, ErrorType } from './error.constants';

export class ErrorUtils {
  /**
   * Check if error is operational
   */
  static isOperational(error: Error): boolean {
    if (error instanceof BaseError) {
      return error.isOperationalError();
    }
    return false;
  }

  /**
   * Check if error is critical
   */
  static isCritical(error: Error): boolean {
    if (error instanceof BaseError) {
      return error.isCritical();
    }
    return false;
  }

  /**
   * Check if error is high severity
   */
  static isHighSeverity(error: Error): boolean {
    if (error instanceof BaseError) {
      return error.isHighSeverity();
    }
    return false;
  }

  /**
   * Get error severity
   */
  static getSeverity(error: Error): ErrorSeverity {
    if (error instanceof BaseError) {
      return error.severity;
    }
    return 'MEDIUM';
  }

  /**
   * Get error type
   */
  static getType(error: Error): ErrorType {
    if (error instanceof BaseError) {
      return error.type;
    }
    return 'SYSTEM';
  }

  /**
   * Get error code
   */
  static getCode(error: Error): ErrorCode {
    if (error instanceof BaseError) {
      return (error as any).code;
    }
    return 'INTERNAL_SERVER_ERROR';
  }

  /**
   * Get error summary for logging
   */
  static getSummary(error: Error): Record<string, any> {
    if (error instanceof BaseError) {
      return error.getSummary();
    }

    return {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack,
      type: 'SYSTEM',
      severity: 'MEDIUM',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format error for API response
   */
  static formatForApi(error: Error, includeStack = false): Record<string, any> {
    if (error instanceof BaseError) {
      const formatted: Record<string, any> = {
        code: (error as any).code,
        message: (error as Error).message,
        type: error.type,
        severity: error.severity,
        timestamp: error.timestamp.toISOString(),
        details: error.details
      };

      if (includeStack) {
        formatted.stack = (error as Error).stack;
      }

      return formatted;
    }

    const formatted: Record<string, any> = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      type: 'SYSTEM',
      severity: 'HIGH',
      timestamp: new Date().toISOString()
    };

    if (includeStack) {
      formatted.stack = (error as Error).stack;
    }

    return formatted;
  }

  /**
   * Format error for logging
   */
  static formatForLogging(error: Error, context?: Record<string, any>): Record<string, any> {
    const summary = this.getSummary(error);
    
    return {
      ...summary,
      context: context || {},
      url: context?.url,
      method: context?.method,
      ip: context?.ip,
      userAgent: context?.userAgent,
      userId: context?.userId,
      requestId: context?.requestId
    };
  }

  /**
   * Check if error should be logged
   */
  static shouldLog(error: Error): boolean {
    if (error instanceof BaseError) {
      return error.isHighSeverity() || !error.isOperationalError();
    }
    return true;
  }

  /**
   * Check if error should be reported to external service
   */
  static shouldReport(error: Error): boolean {
    if (error instanceof BaseError) {
      return error.isCritical() || (!error.isOperationalError() && error.isHighSeverity());
    }
    return true;
  }

  /**
   * Get error message for user
   */
  static getUserMessage(error: Error): string {
    if (error instanceof BaseError) {
      // Return user-friendly message for operational errors
      if (error.isOperationalError()) {
        return (error as Error).message;
      }
    }
    
    // Return generic message for non-operational errors
    return 'An unexpected error occurred. Please try again later.';
  }

  /**
   * Get error message for developer
   */
  static getDeveloperMessage(error: Error): string {
    if (error instanceof BaseError) {
      return `${(error as Error).name}: ${(error as Error).message} (Code: ${(error as any).code}, Status: ${(error as any).statusCode})`;
    }
    
    return `${(error as Error).name}: ${(error as Error).message}`;
  }

  /**
   * Extract error context
   */
  static extractContext(error: Error): Record<string, any> {
    if (error instanceof BaseError) {
      return error.context;
    }
    return {};
  }

  /**
   * Extract error details
   */
  static extractDetails(error: Error): Record<string, any> {
    if (error instanceof BaseError) {
      return error.details;
    }
    return {};
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: Error): boolean {
    if (error instanceof BaseError) {
      // Retryable errors are usually external service errors or temporary database errors
      return error.type === 'EXTERNAL_SERVICE' || 
             (error.type === 'DATABASE' && error.severity === 'HIGH');
    }
    return false;
  }

  /**
   * Get retry delay in milliseconds
   */
  static getRetryDelay(error: Error, attempt: number): number {
    if (!this.isRetryable(error)) {
      return 0;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const baseDelay = 1000;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    
    return Math.floor(delay + jitter);
  }

  /**
   * Create error chain
   */
  static createErrorChain(errors: Error[]): BaseError {
    if (errors.length === 0) {
      throw new Error('Cannot create error chain from empty array');
    }

    const firstError = errors[0];
    let chainError: BaseError;

    if (firstError instanceof BaseError) {
      chainError = firstError;
    } else {
      chainError = new BaseError({
        code: 'INTERNAL_SERVER_ERROR',
        message: firstError.message,
        cause: firstError
      });
    }

    // Chain remaining errors
    for (let i = 1; i < errors.length; i++) {
      const error = errors[i];
      if (error instanceof BaseError) {
        chainError.addDetails(`error_${i}`, error.toJSON());
      } else {
        chainError.addDetails(`error_${i}`, {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack
        });
      }
    }

    return chainError;
  }
}

