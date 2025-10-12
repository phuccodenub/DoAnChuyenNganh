/**
 * Validation Error Class
 * For validation-related errors
 */

import { BaseError, BaseErrorOptions } from './base.error';
import { ErrorCode, HttpStatusCode, ErrorType, ErrorSeverity } from './error.constants';

export interface ValidationErrorOptions extends BaseErrorOptions {
  field?: string;
  value?: any;
  expected?: any;
  received?: any;
  validationErrors?: Array<{
    field: string;
    message: string;
    code: string;
    value?: any;
  }>;
}

export class ValidationError extends BaseError {
  public readonly field?: string;
  public readonly value?: any;
  public readonly expected?: any;
  public readonly received?: any;
  public readonly validationErrors?: Array<{
    field: string;
    message: string;
    code: string;
    value?: any;
  }>;

  constructor(options: ValidationErrorOptions = {}) {
    const {
      code = 'VALIDATION_FAILED',
      statusCode = 422,
      type = 'VALIDATION',
      severity = 'MEDIUM',
      field,
      value,
      expected,
      received,
      validationErrors,
      ...baseOptions
    } = options;

    super({
      code,
      statusCode,
      type,
      severity,
      ...baseOptions
    });

    this.field = field;
    this.value = value;
    this.expected = expected;
    this.received = received;
    this.validationErrors = validationErrors;

    // Add validation-specific context
    if (field) this.addContext('field', field);
    if (value !== undefined) this.addContext('value', value);
    if (expected !== undefined) this.addContext('expected', expected);
    if (received !== undefined) this.addContext('received', received);
    if (validationErrors) this.addDetails('validationErrors', validationErrors);
  }

  /**
   * Create a required field error
   */
  static requiredField(field: string, value?: any): ValidationError {
    return new ValidationError({
      code: 'VALIDATION_REQUIRED_FIELD',
      message: `Field '${field}' is required`,
      field,
      value,
      statusCode: 422,
      type: 'VALIDATION',
      severity: 'MEDIUM'
    });
  }

  /**
   * Create an invalid format error
   */
  static invalidFormat(field: string, value: any, expected: string): ValidationError {
    return new ValidationError({
      code: 'VALIDATION_INVALID_FORMAT',
      message: `Field '${field}' has invalid format. Expected: ${expected}`,
      field,
      value,
      expected,
      statusCode: 422,
      type: 'VALIDATION',
      severity: 'MEDIUM'
    });
  }

  /**
   * Create an out of range error
   */
  static outOfRange(field: string, value: any, min?: number, max?: number): ValidationError {
    let message = `Field '${field}' is out of range`;
    if (min !== undefined && max !== undefined) {
      message += `. Expected: ${min} - ${max}`;
    } else if (min !== undefined) {
      message += `. Minimum: ${min}`;
    } else if (max !== undefined) {
      message += `. Maximum: ${max}`;
    }

    return new ValidationError({
      code: 'VALIDATION_OUT_OF_RANGE',
      message,
      field,
      value,
      expected: { min, max },
      statusCode: 422,
      type: 'VALIDATION',
      severity: 'MEDIUM'
    });
  }

  /**
   * Create a duplicate value error
   */
  static duplicateValue(field: string, value: any): ValidationError {
    return new ValidationError({
      code: 'VALIDATION_DUPLICATE_VALUE',
      message: `Value '${value}' for field '${field}' already exists`,
      field,
      value,
      statusCode: 409,
      type: 'VALIDATION',
      severity: 'MEDIUM'
    });
  }

  /**
   * Create multiple validation errors
   */
  static multiple(errors: Array<{
    field: string;
    message: string;
    code: string;
    value?: any;
  }>): ValidationError {
    return new ValidationError({
      code: 'VALIDATION_FAILED',
      message: 'Multiple validation errors occurred',
      statusCode: 422,
      type: 'VALIDATION',
      severity: 'MEDIUM',
      validationErrors: errors
    });
  }

  /**
   * Create from Zod error
   */
  static fromZodError(zodError: any): ValidationError {
    const errors = zodError.issues?.map((issue: any) => ({
      field: issue.path?.join('.') || 'unknown',
      message: issue.message,
      code: issue.code,
      value: issue.received
    })) || [];

    return new ValidationError({
      code: 'VALIDATION_FAILED',
      message: 'Validation failed',
      statusCode: 422,
      type: 'VALIDATION',
      severity: 'MEDIUM',
      validationErrors: errors
    });
  }

  /**
   * Convert to JSON with validation-specific fields
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      field: this.field,
      value: this.value,
      expected: this.expected,
      received: this.received,
      validationErrors: this.validationErrors
    };
  }
}
