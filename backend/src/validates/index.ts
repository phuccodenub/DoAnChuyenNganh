/**
 * Validation exports
 * Centralized validation schemas for all modules
 */

// ===== BASE VALIDATION =====
export { baseValidation } from './base.validate';

// ===== AUTH VALIDATION =====
export { authValidation } from './auth.validate';

// ===== USER VALIDATION =====
export { userValidation } from './user.validate';

// ===== COURSE VALIDATION =====
export { courseValidation } from './course.validate';

// ===== FILE VALIDATION =====
export { fileValidation } from './file.validate';

// ===== VALIDATION INSTANCES =====
import { baseValidation } from './base.validate';
import { authValidation } from './auth.validate';
import { userValidation } from './user.validate';
import { courseValidation } from './course.validate';
import { fileValidation } from './file.validate';

/**
 * Validation instances
 * Pre-instantiated objects for easy use
 */
export const validations = {
  base: baseValidation,
  auth: authValidation,
  user: userValidation,
  course: courseValidation,
  file: fileValidation
};

/**
 * Validation factory
 * Creates new instances of validation schemas
 */
export const createValidations = () => ({
  base: baseValidation,
  auth: authValidation,
  user: userValidation,
  course: courseValidation,
  file: fileValidation
});

// ===== DEFAULT EXPORT =====
export default validations;
