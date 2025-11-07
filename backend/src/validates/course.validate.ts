import { z } from 'zod';
import { baseValidation } from './base.validate';
import { validatorsUtils } from '../utils/validators.util';

// Course validation schemas
export const courseValidation = {
  // Create course schema
  createCourse: z.object({
    title: z.string()
      .min(3, 'Course title must be at least 3 characters')
      .max(200, 'Course title must be less than 200 characters'),
    description: z.string()
      .min(10, 'Course description must be at least 10 characters')
      .max(2000, 'Course description must be less than 2000 characters'),
    category: z.string()
      .min(2, 'Category must be at least 2 characters')
      .max(50, 'Category must be less than 50 characters')
      .optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    duration: z.number()
      .int('Duration must be an integer')
      .min(1, 'Duration must be at least 1 hour')
      .max(1000, 'Duration must be less than 1000 hours')
      .optional(),
    price: z.number()
      .min(0, 'Price cannot be negative')
      .max(10000, 'Price must be less than 10000')
      .optional(),
    thumbnail: baseValidation.url.optional(),
    isPublished: z.boolean().default(false)
  }),
  
  // Update course schema
  updateCourse: z.object({
    title: z.string()
      .min(3, 'Course title must be at least 3 characters')
      .max(200, 'Course title must be less than 200 characters')
      .optional(),
    description: z.string()
      .min(10, 'Course description must be at least 10 characters')
      .max(2000, 'Course description must be less than 2000 characters')
      .optional(),
    category: z.string()
      .min(2, 'Category must be at least 2 characters')
      .max(50, 'Category must be less than 50 characters')
      .optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    duration: z.number()
      .int('Duration must be an integer')
      .min(1, 'Duration must be at least 1 hour')
      .max(1000, 'Duration must be less than 1000 hours')
      .optional(),
    price: z.number()
      .min(0, 'Price cannot be negative')
      .max(10000, 'Price must be less than 10000')
      .optional(),
    thumbnail: baseValidation.url.optional(),
    isPublished: z.boolean().optional()
  }),
  
  // Course ID parameter schema
  courseId: z.object({
    id: baseValidation.uuid
  }),
  
  // Course query schema
  courseQuery: z.object({
    ...baseValidation.pagination.shape,
    category: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    isPublished: z.coerce.boolean().optional(),
    search: z.string().min(1, 'Search term cannot be empty').optional()
  }),
  
  // Enroll in course schema
  enrollCourse: z.object({
    courseId: baseValidation.uuid
  }),
  
  // Course rating schema
  courseRating: z.object({
    rating: z.number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5'),
    review: z.string()
      .max(1000, 'Review must be less than 1000 characters')
      .optional()
  })
};

// Course validation helpers
export const courseValidateHelpers = {
  // Validate course level
  isValidCourseLevel: (level: string): boolean => {
    return ['beginner', 'intermediate', 'advanced'].includes(level);
  },
  
  // Validate price range
  isValidPriceRange: (minPrice: number, maxPrice: number): boolean => {
    return minPrice >= 0 && maxPrice >= minPrice && maxPrice <= 10000;
  },
  
  // Validate course duration
  isValidDuration: (duration: number): boolean => {
    return duration >= 1 && duration <= 1000;
  },
  
  // Validate rating
  isValidRating: (rating: number): boolean => {
    return Number.isInteger(rating) && rating >= 1 && rating <= 5;
  },
  
  // Sanitize course input
  sanitizeCourseInput: (input: unknown) => {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>]/g, '');
    }
    return input;
  }
};

// Legacy export for backward compatibility
export const courseSchemas = courseValidation;


