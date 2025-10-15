/**
 * Utils module exports with namespaces for better IDE autocomplete
 * Import example: import { bcryptUtils, stringUtils } from '@utils';
 */

// ===== SECURITY UTILITIES =====
export * as bcryptUtils from './bcrypt.util';
export * as hashUtils from './hash.util';
export * as jwtUtils from './jwt.util';
export * as tokenUtils from './token.util';
export * as secureUtils from './secure.util';

// ===== STRING & VALIDATION UTILITIES =====
export * as stringUtils from './string';
export * as objectUtils from './object.util';

// ===== DATE & TIME UTILITIES =====
export * as dateUtils from './date.util';

// ===== FILE & PAGINATION UTILITIES =====
export * as fileUtils from './file.util';
export * as paginationUtils from './pagination.util';

// ===== RESPONSE & LOGGING UTILITIES =====
export * as responseUtils from './response.util';
export * as loggerUtils from './logger.util';

// ===== USER & DOMAIN UTILITIES =====
export * as userUtils from './user.util';
export * as roleUtils from './role.util';
export * as validatorsUtils from './validators.util';

// ===== CONSTANTS =====
export * as constantsUtils from './constants.util';

// ===== LEGACY EXPORTS (for backward compatibility) =====
export { hashPassword, comparePassword } from './hash.util';
export { generateRandomString, generateRandomNumber, generateUUID } from './hash.util';
export { jwtUtils as jwtHelpers } from './jwt.util';
