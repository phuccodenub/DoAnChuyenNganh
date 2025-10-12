import { body, param, query } from 'express-validator';
import { validatorsUtils } from '../../utils/validators.util';

/**
 * Course validation schemas
 */

export const courseValidation = {
  /**
   * Validation for creating a course
   */
  createCourse: [
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters')
      .customSanitizer(value => value?.trim()),
    
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters')
      .customSanitizer(value => value?.trim()),
    
    body('instructor_id')
      .notEmpty()
      .withMessage('Instructor ID is required')
      .custom(validatorsUtils.isUUID)
      .withMessage('Invalid instructor ID format'),
    
    body('category')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Category must be between 2 and 50 characters')
      .customSanitizer(value => value?.trim()),
    
    body('level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Level must be beginner, intermediate, or advanced'),
    
    body('duration')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Duration must be between 1 and 1000 hours'),
    
    body('price')
      .optional()
      .isFloat({ min: 0, max: 10000 })
      .withMessage('Price must be between 0 and 10000'),
    
    body('thumbnail')
      .optional()
      .isURL()
      .withMessage('Thumbnail must be a valid URL'),
    
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Status must be draft, published, or archived'),
    
    body('start_date')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO date')
      .custom((value) => {
        if (new Date(value) < new Date()) {
          throw new Error('Start date cannot be in the past');
        }
        return true;
      }),
    
    body('end_date')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO date')
      .custom((value, { req }) => {
        if (req.body.start_date && new Date(value) <= new Date(req.body.start_date)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    
    body('max_students')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Max students must be between 1 and 1000'),
    
    body('prerequisites')
      .optional()
      .isArray()
      .withMessage('Prerequisites must be an array')
      .custom((value) => {
        if (value && value.length > 10) {
          throw new Error('Maximum 10 prerequisites allowed');
        }
        return true;
      }),
    
    body('learning_objectives')
      .optional()
      .isArray()
      .withMessage('Learning objectives must be an array')
      .custom((value) => {
        if (value && value.length > 20) {
          throw new Error('Maximum 20 learning objectives allowed');
        }
        return true;
      }),
    
    body('course_materials')
      .optional()
      .isArray()
      .withMessage('Course materials must be an array')
      .custom((value) => {
        if (value && value.length > 50) {
          throw new Error('Maximum 50 course materials allowed');
        }
        return true;
      })
  ],

  /**
   * Validation for updating a course
   */
  updateCourse: [
    param('id')
      .notEmpty()
      .withMessage('Course ID is required')
      .custom(validatorsUtils.isUUID)
      .withMessage('Invalid course ID format'),
    
    body('title')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters')
      .customSanitizer(value => value?.trim()),
    
    body('description')
      .optional()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters')
      .customSanitizer(value => value?.trim()),
    
    body('category')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Category must be between 2 and 50 characters')
      .customSanitizer(value => value?.trim()),
    
    body('level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Level must be beginner, intermediate, or advanced'),
    
    body('duration')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Duration must be between 1 and 1000 hours'),
    
    body('price')
      .optional()
      .isFloat({ min: 0, max: 10000 })
      .withMessage('Price must be between 0 and 10000'),
    
    body('thumbnail')
      .optional()
      .isURL()
      .withMessage('Thumbnail must be a valid URL'),
    
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Status must be draft, published, or archived'),
    
    body('start_date')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO date'),
    
    body('end_date')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO date'),
    
    body('max_students')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Max students must be between 1 and 1000'),
    
    body('prerequisites')
      .optional()
      .isArray()
      .withMessage('Prerequisites must be an array'),
    
    body('learning_objectives')
      .optional()
      .isArray()
      .withMessage('Learning objectives must be an array'),
    
    body('course_materials')
      .optional()
      .isArray()
      .withMessage('Course materials must be an array')
  ],

  /**
   * Validation for course ID parameter
   */
  courseId: [
    param('id')
      .notEmpty()
      .withMessage('Course ID is required')
      .custom(validatorsUtils.isUUID)
      .withMessage('Invalid course ID format')
  ],

  /**
   * Validation for course ID parameter (alternative name)
   */
  courseIdParam: [
    param('courseId')
      .notEmpty()
      .withMessage('Course ID is required')
      .custom(validatorsUtils.isUUID)
      .withMessage('Invalid course ID format')
  ],

  /**
   * Validation for instructor ID parameter
   */
  instructorId: [
    param('instructorId')
      .notEmpty()
      .withMessage('Instructor ID is required')
      .custom(validatorsUtils.isUUID)
      .withMessage('Invalid instructor ID format')
  ],

  /**
   * Validation for pagination query parameters
   */
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
    
    query('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Status must be draft, published, or archived'),
    
    query('search')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search term must be between 2 and 100 characters')
      .customSanitizer(value => value?.trim())
  ],

  /**
   * Validation for course filters
   */
  filters: [
    query('category')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Category must be between 2 and 50 characters'),
    
    query('level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Level must be beginner, intermediate, or advanced'),
    
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Min price must be a positive number')
      .toFloat(),
    
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Max price must be a positive number')
      .toFloat(),
    
    query('minDuration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Min duration must be a positive integer')
      .toInt(),
    
    query('maxDuration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Max duration must be a positive integer')
      .toInt(),
    
    query('hasEnrollments')
      .optional()
      .isBoolean()
      .withMessage('Has enrollments must be a boolean')
      .toBoolean()
  ],

  /**
   * Validation for course sorting
   */
  sorting: [
    query('sortBy')
      .optional()
      .isIn(['title', 'created_at', 'updated_at', 'price', 'duration', 'enrollment_count'])
      .withMessage('Invalid sort field'),
    
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC'])
      .withMessage('Sort order must be ASC or DESC')
  ],

  /**
   * Validation for enrollment
   */
  enrollment: [
    param('courseId')
      .notEmpty()
      .withMessage('Course ID is required')
      .custom(validatorsUtils.isUUID)
      .withMessage('Invalid course ID format')
  ],

  /**
   * Validation for course students query
   */
  courseStudents: [
    param('courseId')
      .notEmpty()
      .withMessage('Course ID is required')
      .custom(validatorsUtils.isUUID)
      .withMessage('Invalid course ID format'),
    
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt()
  ]
};
