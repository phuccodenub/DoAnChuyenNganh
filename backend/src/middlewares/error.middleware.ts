/**
 * Error Middleware
 * Legacy error middleware - now uses the new error handling system
 */

import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../errors/error.handler';

// Re-export from new error handling system
export const errorHandler = ErrorHandler.handle;
export const notFoundHandler = ErrorHandler.handleNotFound;
export const asyncHandler = ErrorHandler.asyncHandler;

// Legacy ApiError class for backward compatibility
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}


