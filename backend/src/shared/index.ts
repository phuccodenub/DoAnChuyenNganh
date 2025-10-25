// Shared configuration exports
// Avoid exporting JS config without types to prevent TS7016
// export * from '../config/database.config';
export * from '../config/jwt.config';
export * from '../config/mail.config';
// export * from '../config/redis.config'; // Temporarily disabled

// Shared constants
export * from '../constants/app.constants';
export * from '../constants/response.constants';
export * from '../constants/user.constants';
export * from '../constants/roles.enum';

// Shared middlewares
export * from '../middlewares/auth.middleware';
export * from '../middlewares/error.middleware';
export * from '../middlewares/logger.middleware';
export * from '../middlewares/validate.middleware';

// Shared utilities
export * from '../utils/hash.util';
// Re-export response utilities but avoid naming conflicts
export { responseUtils,
  sendSuccessResponse, sendErrorResponse, sendNotFoundResponse,
  sendValidationErrorResponse, sendUnauthorizedResponse, sendForbiddenResponse,
  sendConflictResponse, sendCreatedResponse, sendNoContentResponse,
  sendTooManyRequestsResponse, sendServiceUnavailableResponse } from '../utils/response.util';
export { default as logger } from '../utils/logger.util';

// Validation schemas
export * from '../validates';

// Common types
// Export only selected common types to avoid conflicts with Base classes
export type { ApiErrorItem, ApiResponse as CommonApiResponse, PaginatedResponse as CommonPaginatedResponse,
  Pagination, PaginationOptions, SearchOptions, AuthenticatedRequest } from '../types/common.types';

// Base classes
export { BaseController } from './base/base.controller';

