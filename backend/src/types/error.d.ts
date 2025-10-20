/**
 * Enhanced Error Types
 * Định nghĩa các interface cho error handling với type safety
 */

import { ValidationError as ZodValidationError } from 'zod';

// Base error context interface
export interface ErrorContext {
  url?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
  requestId?: string;
  timestamp?: string;
  type?: string;
  [key: string]: unknown;
}

// Enhanced Error interface với các properties thường được access
export interface CustomError extends Error {
  statusCode?: number;
  code?: string | number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  isOperational?: boolean;
  context?: ErrorContext;
  
  // Sequelize error properties
  sql?: string;
  parent?: Error;
  original?: Error;
  fields?: string[];
  table?: string;
  
  // Validation error properties
  validationErrors?: Array<{
    field: string;
    message: string;
    value?: unknown;
    code?: string;
  }>;
  
  // HTTP error properties
  expose?: boolean;
  headers?: Record<string, string>;
}

// Sequelize specific error interface
export interface SequelizeError extends CustomError {
  sql: string;
  parent?: Error;
  original?: Error;
  fields?: string[];
  table?: string;
  constraint?: string;
  index?: string;
  relationType?: string;
  value?: unknown;
}

// Validation error interface
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
  code?: string;
  path?: (string | number)[];
}

export interface ValidationErrorInterface extends CustomError {
  validationErrors: ValidationErrorDetail[];
}

// JWT payload interface
export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  token_version: number;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

// Type guards for error identification
export function isCustomError(error: unknown): error is CustomError {
  return error instanceof Error;
}

export function isSequelizeError(error: unknown): error is SequelizeError {
  return (
    error instanceof Error &&
    'sql' in error &&
    typeof (error as any).sql === 'string'
  );
}

export function isValidationError(error: unknown): error is ValidationErrorInterface {
  return (
    error instanceof Error &&
    'validationErrors' in error &&
    Array.isArray((error as any).validationErrors)
  );
}

export function isZodError(error: unknown): error is ZodValidationError {
  return error instanceof ZodValidationError;
}

export function hasStatusCode(error: unknown): error is CustomError & { statusCode: number } {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    typeof (error as any).statusCode === 'number'
  );
}

export function hasErrorCode(error: unknown): error is CustomError & { code: string | number } {
  return (
    error instanceof Error &&
    'code' in error &&
    ((error as any).code !== undefined)
  );
}