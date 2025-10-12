/**
 * Error handling system
 * Centralized error classes and utilities
 */

// ===== BASE ERROR CLASSES =====
export { BaseError } from './base.error';
export { ApiError } from './api.error';
export { ValidationError } from './validation.error';
export { AuthenticationError } from './authentication.error';
export { AuthorizationError } from './authorization.error';
export { DatabaseError } from './database.error';
export { FileError } from './file.error';
export { ExternalServiceError } from './external-service.error';

// ===== ERROR FACTORIES =====
export { ErrorFactory } from './error.factory';

// ===== ERROR HANDLERS =====
export { ErrorHandler } from './error.handler';

// ===== ERROR UTILITIES =====
export { ErrorUtils } from './error.utils';

// ===== ERROR CONSTANTS =====
export { ERROR_CODES, ERROR_MESSAGES, ERROR_TYPES } from './error.constants';

// ===== DEFAULT EXPORT =====
export * from './error.handler';
