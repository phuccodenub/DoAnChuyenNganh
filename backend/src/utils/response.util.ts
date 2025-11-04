import { Response } from 'express';
import { RESPONSE_CONSTANTS } from '../constants/response.constants';
import type { ApiErrorItem, ApiResponse, PaginatedResponse, Pagination } from '../types/common.types';

// Response utility functions
export type { ApiErrorItem, ApiResponse, PaginatedResponse, Pagination } from '../types/common.types';


export const responseUtils = {
  // Send success response
  sendSuccess<T>(
    res: Response,
    message: string = 'Success',
    data?: T,
    statusCode: number = RESPONSE_CONSTANTS.STATUS_CODE.OK,
    meta?: Record<string, unknown>
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      ...(data !== undefined && { data }),
      ...(meta && { meta })
    };

    res.status(statusCode).json(response);
  },

  // Send error response
  sendError(
    res: Response,
    message: string = 'Error',
    statusCode: number = RESPONSE_CONSTANTS.STATUS_CODE.INTERNAL_SERVER_ERROR,
    errors?: unknown[]
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      // Backward-compat alias expected by some tests
      // e.g., tests assert body.error exists
      // Keep both for compatibility during integration
      ...(message && { error: message }),
      ...(errors && { errors: this.formatValidationErrors(errors) })
    };

    res.status(statusCode).json(response);
  },

  // Send validation error response
  sendValidationError(
    res: Response,
    message: string = 'Validation failed',
    errors: unknown[] = []
  ): void {
    this.sendError(
      res,
      message,
      RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST,
      errors
    );
  },

  // Send not found response
  sendNotFound(
    res: Response,
    message: string = 'Resource not found'
  ): void {
    this.sendError(
      res,
      message,
      RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND
    );
  },

  // Send unauthorized response
  sendUnauthorized(
    res: Response,
    message: string = 'Unauthorized'
  ): void {
    this.sendError(
      res,
      message,
      RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED
    );
  },

  // Send forbidden response
  sendForbidden(
    res: Response,
    message: string = 'Forbidden'
  ): void {
    this.sendError(
      res,
      message,
      RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN
    );
  },

  // Send conflict response
  sendConflict(
    res: Response,
    message: string = 'Conflict'
  ): void {
    this.sendError(
      res,
      message,
      RESPONSE_CONSTANTS.STATUS_CODE.CONFLICT
    );
  },

  // Send paginated response
  sendPaginated<T>(
    res: Response,
    data: T[],
    pagination: Pagination,
    message: string = 'Success',
    statusCode: number = RESPONSE_CONSTANTS.STATUS_CODE.OK,
    dataKey?: string
  ): void {
    const response: any = {
      success: true,
      message,
      data: dataKey ? { [dataKey]: data, pagination } : data,
      ...(dataKey ? {} : { pagination })
    };

    res.status(statusCode).json(response);
  },

  // Send created response
  sendCreated<T>(
    res: Response,
    message: string = 'Created successfully',
    data?: T
  ): void {
    this.sendSuccess(
      res,
      message,
      data,
      RESPONSE_CONSTANTS.STATUS_CODE.CREATED
    );
  },

  // Send no content response
  sendNoContent(res: Response): void {
    res.status(RESPONSE_CONSTANTS.STATUS_CODE.NO_CONTENT).send();
  },

  // Send too many requests response
  sendTooManyRequests(
    res: Response,
    message: string = 'Too many requests'
  ): void {
    this.sendError(
      res,
      message,
      RESPONSE_CONSTANTS.STATUS_CODE.TOO_MANY_REQUESTS
    );
  },

  // Send service unavailable response
  sendServiceUnavailable(
    res: Response,
    message: string = 'Service unavailable'
  ): void {
    this.sendError(
      res,
      message,
      RESPONSE_CONSTANTS.STATUS_CODE.SERVICE_UNAVAILABLE
    );
  },

  // Format error for response
  formatError(error: unknown): ApiErrorItem {
    if (typeof error === 'string') {
      return { message: error };
    }

    if (error instanceof Error) {
      return { message: error.message };
    }

    if (error && typeof error === 'object') {
      const obj = error as Record<string, unknown>;
      const message = typeof obj.message === 'string' ? obj.message : 'Unknown error';
      const code = typeof obj.code === 'string' ? obj.code : undefined;
      const field = typeof obj.field === 'string' ? obj.field : undefined;
      const value = Object.prototype.hasOwnProperty.call(obj, 'value') ? obj.value : undefined;
      return { message, code, field, value };
    }

    return { message: 'Unknown error' };
  },

  // Format validation errors
  formatValidationErrors(errors: unknown[]): ApiErrorItem[] {
    return errors.map(error => this.formatError(error));
  },

  // Send response with custom status
  sendCustom<T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T,
    success: boolean = true
  ): void {
    const response: ApiResponse<T> = {
      success,
      message,
      ...(data !== undefined && { data })
    };

    res.status(statusCode).json(response);
  },

  // Check if response is successful
  isSuccessResponse(response: ApiResponse): boolean {
    return response.success === true;
  },

  // Extract error message from response
  getErrorMessage(response: ApiResponse): string {
    return response.message || 'Unknown error';
  },

  // Extract data from response
  getResponseData<T>(response: ApiResponse<T>): T | undefined {
    return response.data;
  },

  // Alias for backward compatibility
  success: function<T>(
    res: Response,
    data?: T,
    message: string = 'Success',
    statusCode: number = RESPONSE_CONSTANTS.STATUS_CODE.OK,
    meta?: Record<string, unknown>
  ): void {
    return this.sendSuccess(res, message, data, statusCode, meta);
  },

  // Alias for error
  error: function(
    res: Response,
    message: string = 'Error',
    statusCode: number = RESPONSE_CONSTANTS.STATUS_CODE.INTERNAL_SERVER_ERROR,
    errors?: unknown[]
  ): void {
    return this.sendError(res, message, statusCode, errors);
  }
};

// Legacy functions for backward compatibility
export const sendSuccessResponse = responseUtils.sendSuccess.bind(responseUtils);
export const sendErrorResponse = responseUtils.sendError.bind(responseUtils);
export const sendNotFoundResponse = responseUtils.sendNotFound.bind(responseUtils);
export const sendValidationErrorResponse = responseUtils.sendValidationError.bind(responseUtils);
export const sendUnauthorizedResponse = responseUtils.sendUnauthorized.bind(responseUtils);
export const sendForbiddenResponse = responseUtils.sendForbidden.bind(responseUtils);
export const sendConflictResponse = responseUtils.sendConflict.bind(responseUtils);
export const sendCreatedResponse = responseUtils.sendCreated.bind(responseUtils);
export const sendNoContentResponse = responseUtils.sendNoContent.bind(responseUtils);
export const sendTooManyRequestsResponse = responseUtils.sendTooManyRequests.bind(responseUtils);
export const sendServiceUnavailableResponse = responseUtils.sendServiceUnavailable.bind(responseUtils);

