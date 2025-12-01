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
      .max(5000, 'Course description must be less than 5000 characters')
      .optional(),
    short_description: z.string()
      .max(500, 'Short description must be less than 500 characters')
      .optional(),
    category: z.string()
      .min(2, 'Category must be at least 2 characters')
      .max(50, 'Category must be less than 50 characters')
      .optional(),
    category_id: z.string().optional(), // Can be UUID or category slug
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    duration: z.number()
      .int('Duration must be an integer')
      .min(0, 'Duration cannot be negative')
      .max(10000, 'Duration must be less than 10000 hours')
      .optional(),
    price: z.number()
      .min(0, 'Price cannot be negative')
      .max(10000000, 'Price must be less than 10,000,000')
      .optional(),
    is_free: z.boolean().optional(),
    thumbnail: z.string().optional(),
    thumbnail_url: z.string().optional(),
    language: z.string().max(50).optional(),
    prerequisites: z.array(z.string()).optional(),
    learning_objectives: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    isPublished: z.boolean().default(false)
  }),
  
  // Update course schema
  updateCourse: z.object({
    title: z.string()
      .min(3, 'Course title must be at least 3 characters')
      .max(200, 'Course title must be less than 200 characters')
      .optional(),
    description: z.string()
      .max(5000, 'Course description must be less than 5000 characters')
      .optional(),
    short_description: z.string()
      .max(500, 'Short description must be less than 500 characters')
      .optional(),
    category: z.string()
      .min(2, 'Category must be at least 2 characters')
      .max(50, 'Category must be less than 50 characters')
      .optional(),
    category_id: z.string().optional(), // Can be UUID or category slug
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    duration: z.number()
      .int('Duration must be an integer')
      .min(0, 'Duration cannot be negative')
      .max(10000, 'Duration must be less than 10000 hours')
      .optional(),
    price: z.number()
      .min(0, 'Price cannot be negative')
      .optional(),
    is_free: z.boolean().optional(),
    thumbnail: z.string().optional(),
    thumbnail_url: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    language: z.string().max(50).optional(),
    prerequisites: z.array(z.string()).optional(),
    learning_objectives: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
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


