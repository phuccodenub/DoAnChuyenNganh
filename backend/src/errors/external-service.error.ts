/**
 * External Service Error Class
 * For external service-related errors
 */

import { BaseError, BaseErrorOptions } from './base.error';
import { ErrorCode, HttpStatusCode, ErrorType, ErrorSeverity } from './error.constants';

export interface ExternalServiceErrorOptions extends BaseErrorOptions {
  serviceName?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  retryCount?: number;
  maxRetries?: number;
  timeout?: number;
  requestId?: string;
}

export class ExternalServiceError extends BaseError {
  public readonly serviceName?: string;
  public readonly endpoint?: string;
  public readonly method?: string;
  public readonly statusCode?: number;
  public readonly responseTime?: number;
  public readonly retryCount?: number;
  public readonly maxRetries?: number;
  public readonly timeout?: number;
  public readonly requestId?: string;

  constructor(options: ExternalServiceErrorOptions = {}) {
    const {
      code = 'EXTERNAL_SERVICE_UNAVAILABLE',
      statusCode = 503,
      type = 'EXTERNAL_SERVICE',
      severity = 'HIGH',
      serviceName,
      endpoint,
      method,
      statusCode: httpStatusCode,
      responseTime,
      retryCount,
      maxRetries,
      timeout,
      requestId,
      ...baseOptions
    } = options;

    super({
      code,
      statusCode,
      type,
      severity,
      ...baseOptions
    });

    this.serviceName = serviceName;
    this.endpoint = endpoint;
    this.method = method;
    this.statusCode = httpStatusCode;
    this.responseTime = responseTime;
    this.retryCount = retryCount;
    this.maxRetries = maxRetries;
    this.timeout = timeout;
    this.requestId = requestId;

    // Add external service-specific context
    if (serviceName) this.addContext('serviceName', serviceName);
    if (endpoint) this.addContext('endpoint', endpoint);
    if (method) this.addContext('method', method);
    if (httpStatusCode) this.addContext('httpStatusCode', httpStatusCode);
    if (responseTime) this.addContext('responseTime', responseTime);
    if (retryCount) this.addContext('retryCount', retryCount);
    if (maxRetries) this.addContext('maxRetries', maxRetries);
    if (timeout) this.addContext('timeout', timeout);
    if (requestId) this.addContext('requestId', requestId);
  }

  /**
   * Create service unavailable error
   */
  static serviceUnavailable(
    serviceName: string,
    endpoint?: string,
    retryCount?: number
  ): ExternalServiceError {
    return new ExternalServiceError({
      code: 'EXTERNAL_SERVICE_UNAVAILABLE',
      message: `External service '${serviceName}' is unavailable`,
      statusCode: 503,
      type: 'EXTERNAL_SERVICE',
      severity: 'HIGH',
      serviceName,
      endpoint,
      retryCount
    });
  }

  /**
   * Create service timeout error
   */
  static serviceTimeout(
    serviceName: string,
    timeout: number,
    endpoint?: string
  ): ExternalServiceError {
    return new ExternalServiceError({
      code: 'EXTERNAL_SERVICE_TIMEOUT',
      message: `External service '${serviceName}' timeout after ${timeout}ms`,
      statusCode: 504,
      type: 'EXTERNAL_SERVICE',
      severity: 'HIGH',
      serviceName,
      timeout,
      endpoint
    });
  }

  /**
   * Create invalid response error
   */
  static invalidResponse(
    serviceName: string,
    statusCode: number,
    endpoint?: string
  ): ExternalServiceError {
    return new ExternalServiceError({
      code: 'EXTERNAL_SERVICE_INVALID_RESPONSE',
      message: `Invalid response from external service '${serviceName}'`,
      statusCode: 502,
      type: 'EXTERNAL_SERVICE',
      severity: 'HIGH',
      serviceName,
      statusCode,
      endpoint
    });
  }

  /**
   * Create email service failed error
   */
  static emailServiceFailed(
    endpoint?: string,
    statusCode?: number,
    details?: Record<string, any>
  ): ExternalServiceError {
    return new ExternalServiceError({
      code: 'EMAIL_SERVICE_FAILED',
      message: 'Email service failed',
      statusCode: 503,
      type: 'EXTERNAL_SERVICE',
      severity: 'HIGH',
      serviceName: 'email',
      endpoint,
      statusCode,
      details
    });
  }

  /**
   * Create SMS service failed error
   */
  static smsServiceFailed(
    endpoint?: string,
    statusCode?: number,
    details?: Record<string, any>
  ): ExternalServiceError {
    return new ExternalServiceError({
      code: 'SMS_SERVICE_FAILED',
      message: 'SMS service failed',
      statusCode: 503,
      type: 'EXTERNAL_SERVICE',
      severity: 'HIGH',
      serviceName: 'sms',
      endpoint,
      statusCode,
      details
    });
  }

  /**
   * Create payment service failed error
   */
  static paymentServiceFailed(
    endpoint?: string,
    statusCode?: number,
    details?: Record<string, any>
  ): ExternalServiceError {
    return new ExternalServiceError({
      code: 'PAYMENT_FAILED',
      message: 'Payment service failed',
      statusCode: 503,
      type: 'EXTERNAL_SERVICE',
      severity: 'HIGH',
      serviceName: 'payment',
      endpoint,
      statusCode,
      details
    });
  }

  /**
   * Create from HTTP error
   */
  static fromHttpError(
    serviceName: string,
    statusCode: number,
    message: string,
    endpoint?: string,
    method?: string
  ): ExternalServiceError {
    let errorCode: ErrorCode = 'EXTERNAL_SERVICE_UNAVAILABLE';
    let severity: ErrorSeverity = 'HIGH';

    if (statusCode >= 500) {
      errorCode = 'EXTERNAL_SERVICE_UNAVAILABLE';
      severity = 'HIGH';
    } else if (statusCode === 408 || statusCode === 504) {
      errorCode = 'EXTERNAL_SERVICE_TIMEOUT';
      severity = 'HIGH';
    } else if (statusCode >= 400) {
      errorCode = 'EXTERNAL_SERVICE_INVALID_RESPONSE';
      severity = 'MEDIUM';
    }

    return new ExternalServiceError({
      code: errorCode,
      message: `External service '${serviceName}' error: ${message}`,
      statusCode: 502,
      type: 'EXTERNAL_SERVICE',
      severity,
      serviceName,
      endpoint,
      method,
      statusCode
    });
  }

  /**
   * Convert to JSON with external service-specific fields
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      serviceName: this.serviceName,
      endpoint: this.endpoint,
      method: this.method,
      statusCode: this.statusCode,
      responseTime: this.responseTime,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      requestId: this.requestId
    };
  }
}
