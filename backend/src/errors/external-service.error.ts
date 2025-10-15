/**
 * External Service Error Class
 * For external service-related errors
 */

import { BaseError, BaseErrorOptions } from './base.error';
import { ErrorCode, ErrorSeverity } from './error.constants';

export interface ExternalServiceErrorOptions extends BaseErrorOptions {
  serviceName?: string;
  endpoint?: string;
  method?: string;
  serviceStatusCode?: number; // HTTP status code returned by the external service
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
  public readonly serviceStatusCode?: number;
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
      serviceStatusCode,
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
    this.serviceStatusCode = serviceStatusCode;
    this.responseTime = responseTime;
    this.retryCount = retryCount;
    this.maxRetries = maxRetries;
    this.timeout = timeout;
    this.requestId = requestId;

    // Add external service-specific context
    if (serviceName) this.addContext('serviceName', serviceName);
    if (endpoint) this.addContext('endpoint', endpoint);
    if (method) this.addContext('method', method);
    if (serviceStatusCode) this.addContext('serviceStatusCode', serviceStatusCode);
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
    serviceStatusCode: number,
    endpoint?: string
  ): ExternalServiceError {
    return new ExternalServiceError({
      code: 'EXTERNAL_SERVICE_INVALID_RESPONSE',
      message: `Invalid response from external service '${serviceName}'`,
      statusCode: 502,
      type: 'EXTERNAL_SERVICE',
      severity: 'HIGH',
      serviceName,
      serviceStatusCode,
      endpoint
    });
  }

  /**
   * Create email service failed error
   */
  static emailServiceFailed(
    endpoint?: string,
    serviceStatusCode?: number,
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
      serviceStatusCode,
      details
    });
  }

  /**
   * Create SMS service failed error
   */
  static smsServiceFailed(
    endpoint?: string,
    serviceStatusCode?: number,
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
      serviceStatusCode,
      details
    });
  }

  /**
   * Create payment service failed error
   */
  static paymentServiceFailed(
    endpoint?: string,
    serviceStatusCode?: number,
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
      serviceStatusCode,
      details
    });
  }

  /**
   * Create from HTTP error
   */
  static fromHttpError(
    serviceName: string,
    serviceStatusCode: number,
    message: string,
    endpoint?: string,
    method?: string
  ): ExternalServiceError {
    let errorCode: ErrorCode = 'EXTERNAL_SERVICE_UNAVAILABLE';
    let severity: ErrorSeverity = 'HIGH';

    if (serviceStatusCode >= 500) {
      errorCode = 'EXTERNAL_SERVICE_UNAVAILABLE';
      severity = 'HIGH';
    } else if (serviceStatusCode === 408 || serviceStatusCode === 504) {
      errorCode = 'EXTERNAL_SERVICE_TIMEOUT';
      severity = 'HIGH';
    } else if (serviceStatusCode >= 400) {
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
      serviceStatusCode
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
      serviceStatusCode: this.serviceStatusCode,
      responseTime: this.responseTime,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      requestId: this.requestId
    };
  }
}

