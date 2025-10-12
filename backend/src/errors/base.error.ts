/**
 * Base Error Class
 * Foundation for all custom error classes
 */

import { ErrorCode, ErrorMessage, ErrorType, HttpStatusCode, ErrorSeverity } from './error.constants';

export interface BaseErrorOptions {
  code?: ErrorCode;
  message?: string;
  statusCode?: HttpStatusCode;
  type?: ErrorType;
  severity?: ErrorSeverity;
  isOperational?: boolean;
  details?: Record<string, any>;
  cause?: Error;
  timestamp?: Date;
  context?: Record<string, any>;
}

export class BaseError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: HttpStatusCode;
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly isOperational: boolean;
  public readonly details: Record<string, any>;
  public readonly cause?: Error;
  public readonly timestamp: Date;
  public readonly context: Record<string, any>;

  constructor(options: BaseErrorOptions = {}) {
    const {
      code = 'INTERNAL_SERVER_ERROR',
      message,
      statusCode = 500,
      type = 'SYSTEM',
      severity = 'MEDIUM',
      isOperational = true,
      details = {},
      cause,
      timestamp = new Date(),
      context = {}
    } = options;

    // Use provided message or default from ERROR_MESSAGES
    const errorMessage = message || ERROR_MESSAGES[code] || 'An error occurred';

    super(errorMessage);

    // Set error properties
    this.code = code;
    this.statusCode = statusCode;
    this.type = type;
    this.severity = severity;
    this.isOperational = isOperational;
    this.details = details;
    this.cause = cause;
    this.timestamp = timestamp;
    this.context = context;

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, BaseError.prototype);

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      type: this.type,
      severity: this.severity,
      isOperational: this.isOperational,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack
    };
  }

  /**
   * Convert error to string
   */
  toString(): string {
    return `${this.name}: ${this.message} (Code: ${this.code}, Status: ${this.statusCode})`;
  }

  /**
   * Check if error is operational
   */
  isOperationalError(): boolean {
    return this.isOperational;
  }

  /**
   * Check if error is critical
   */
  isCritical(): boolean {
    return this.severity === 'CRITICAL';
  }

  /**
   * Check if error is high severity
   */
  isHighSeverity(): boolean {
    return this.severity === 'HIGH' || this.severity === 'CRITICAL';
  }

  /**
   * Get error summary for logging
   */
  getSummary(): Record<string, any> {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      type: this.type,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      context: this.context
    };
  }

  /**
   * Add context to error
   */
  addContext(key: string, value: any): this {
    this.context[key] = value;
    return this;
  }

  /**
   * Add details to error
   */
  addDetails(key: string, value: any): this {
    this.details[key] = value;
    return this;
  }

  /**
   * Create a new error with additional context
   */
  withContext(context: Record<string, any>): this {
    Object.assign(this.context, context);
    return this;
  }

  /**
   * Create a new error with additional details
   */
  withDetails(details: Record<string, any>): this {
    Object.assign(this.details, details);
    return this;
  }
}
