console.log('[BASE_VALIDATE] Starting imports...');
import { z } from 'zod';
console.log('[BASE_VALIDATE] zod imported');

import { validatorsUtils } from '../utils/validators.util';
console.log('[BASE_VALIDATE] validatorsUtils imported');

console.log('[BASE_VALIDATE] Creating baseValidation object...');
// Base validation schemas
export const baseValidation = {
  // ===== COMMON FIELD VALIDATIONS =====
  
  /**
   * Username validation
   */
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    // Allow letters, numbers, underscores, and hyphens (factories generate usernames with hyphens)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .transform(val => val.trim().toLowerCase()),
  
  /**
   * UUID validation - relaxed for database compatibility
   * Accepts standard UUIDs and database-friendly formats
   */
  uuid: z.string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'Invalid UUID format'
    ),
  
  /**
   * Email validation
   */
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .max(255, 'Email must be less than 255 characters'),
  
  /**
   * Strong password validation
   */
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .refine((password) => {
      // Check password strength using validatorsUtils
      return validatorsUtils.isStrongPassword(password);
    }, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  /**
   * Name validation
   */
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Name can only contain letters and spaces')
    .transform(val => val.trim()),
  
  /**
   * Phone number validation
   */
  phone: z.string()
    .refine((phone) => validatorsUtils.isPhone(phone), 'Invalid phone number format')
    .optional(),
  
  /**
   * Bio validation
   */
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  
  /**
   * URL validation
   */
  url: z.string()
    .refine((url) => validatorsUtils.isURL(url), 'Invalid URL format')
    .optional(),
  
  /**
   * Date validation
   */
  date: z.string()
    .refine((date) => validatorsUtils.isISODate(date), 'Invalid date format')
    .optional(),
  
  /**
   * Gender validation
   */
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'])
    .optional(),
  
  /**
   * Status validation
   */
  status: z.enum(['active', 'inactive', 'suspended', 'pending'])
    .optional(),

  // ===== PAGINATION VALIDATION =====
  
  /**
   * Pagination query validation
   */
  pagination: z.object({
    page: z.coerce.number()
      .int('Page must be an integer')
      .min(1, 'Page must be at least 1')
      .default(1),
    limit: z.coerce.number()
      .int('Limit must be an integer')
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit must be less than 100')
      .default(10),
    sortBy: z.string()
      .optional(),
    sortOrder: z.enum(['ASC', 'DESC'])
      .default('DESC')
  }),

  // ===== SEARCH VALIDATION =====
  
  /**
   * Search query validation
   */
  search: z.object({
    q: z.string()
      .min(1, 'Search term cannot be empty')
      .max(100, 'Search term must be less than 100 characters')
      .optional(),
    filters: z.record(z.string(), z.any())
      .optional()
  }),

  // ===== FILE VALIDATION =====
  
  /**
   * File upload validation
   */
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number()
      .min(1, 'File size must be at least 1 byte')
      .max(10 * 1024 * 1024, 'File size must be less than 10MB'),
    buffer: z.any() // Buffer type for file uploads
  }),

  // ===== COMMON RESPONSE VALIDATION =====
  
  /**
   * Success response validation
   */
  successResponse: z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.any().optional(),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number()
    }).optional()
  }),

  /**
   * Error response validation
   */
  errorResponse: z.object({
    success: z.literal(false),
    message: z.string(),
    error: z.string().optional(),
    details: z.any().optional()
  })
};

// ===== VALIDATION HELPERS =====
export const validationHelpers = {
  /**
   * Validate UUID
   */
  isValidUUID: (id: string): boolean => {
    return baseValidation.uuid.safeParse(id).success;
  },
  
  /**
   * Validate email
   */
  isValidEmail: (email: string): boolean => {
    return baseValidation.email.safeParse(email).success;
  },
  
  /**
   * Validate password strength
   */
  isValidPassword: (password: string): boolean => {
    return baseValidation.password.safeParse(password).success;
  },
  
  /**
   * Validate phone number
   */
  isValidPhone: (phone: string): boolean => {
    return baseValidation.phone.safeParse(phone).success;
  },
  
  /**
   * Validate URL
   */
  isValidURL: (url: string): boolean => {
    return baseValidation.url.safeParse(url).success;
  },
  
  /**
   * Sanitize string input
   */
  sanitizeString: (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  },
  
  /**
   * Validate pagination parameters
   */
  validatePagination: (query: unknown) => {
    return baseValidation.pagination.parse(query);
  },
  
  /**
   * Validate search parameters
   */
  validateSearch: (query: unknown) => {
    return baseValidation.search.parse(query);
  },
  
  /**
   * Validate file upload
   */
  validateFile: (file: unknown) => {
    return baseValidation.file.parse(file);
  },
  
  /**
   * Validate date range
   */
  validateDateRange: (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  },
  
  /**
   * Validate age
   */
  validateAge: (birthDate: string, minAge: number = 13, maxAge: number = 120): boolean => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    return age >= minAge && age <= maxAge;
  }
};

// Legacy export for backward compatibility
console.log('[BASE_VALIDATE] Exporting baseSchemas and validateHelpers...');
export const baseSchemas = baseValidation;
export const validateHelpers = validationHelpers;
console.log('[BASE_VALIDATE] Exports complete');

