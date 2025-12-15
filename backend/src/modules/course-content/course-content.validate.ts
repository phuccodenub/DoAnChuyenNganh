const { body, param, query } = require('express-validator');

/**
 * Course Content Module Validation Schemas
 */
export const courseContentValidation = {
  // ===== SECTION VALIDATIONS =====
  createSection: [
    body('title')
      .notEmpty()
      .withMessage('Section title is required')
      .isLength({ min: 3, max: 255 })
      .withMessage('Section title must be between 3 and 255 characters')
      .trim(),
    
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Description must not exceed 2000 characters')
      .trim(),
    
    body('order_index')
      .isInt({ min: 0 })
      .withMessage('Order index must be a non-negative integer')
      .toInt(),
    
    body('is_published')
      .optional()
      .isBoolean()
      .withMessage('is_published must be a boolean')
      .toBoolean(),
    
    body('duration_minutes')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Duration must be a non-negative integer')
      .toInt(),
    
    body('objectives')
      .optional()
      .isArray()
      .withMessage('Objectives must be an array')
  ],

  updateSection: [
    body('title')
      .optional()
      .isLength({ min: 3, max: 255 })
      .withMessage('Section title must be between 3 and 255 characters')
      .trim(),
    
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Description must not exceed 2000 characters')
      .trim(),
    
    body('order_index')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order index must be a non-negative integer')
      .toInt(),
    
    body('is_published')
      .optional()
      .isBoolean()
      .withMessage('is_published must be a boolean')
      .toBoolean(),
    
    body('duration_minutes')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Duration must be a non-negative integer')
      .toInt()
  ],

  reorderSections: [
    body('orders')
      .isArray({ min: 1 })
      .withMessage('Orders must be a non-empty array'),
    
    body('orders.*.id')
      .isUUID()
      .withMessage('Each order item must have a valid UUID id'),
    
    body('orders.*.order_index')
      .isInt({ min: 0 })
      .withMessage('Each order item must have a non-negative order_index')
      .toInt()
  ],

  // ===== LESSON VALIDATIONS =====
  createLesson: [
    body('title')
      .notEmpty()
      .withMessage('Lesson title is required')
      .isLength({ min: 3, max: 255 })
      .withMessage('Lesson title must be between 3 and 255 characters')
      .trim(),
    
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Description must not exceed 2000 characters')
      .trim(),
    
    body('content_type')
      .isIn(['video', 'document', 'text', 'link', 'quiz', 'assignment'])
      .withMessage('Content type must be one of: video, document, text, link, quiz, assignment'),
    
    body('content')
      .optional()
      .isLength({ max: 50000 })
      .withMessage('Content must not exceed 50000 characters'),
    
    body('video_url')
      .optional()
      .isURL()
      .withMessage('Video URL must be a valid URL'),
    
    body('video_duration')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Video duration must be a non-negative integer')
      .toInt(),
    
    body('order_index')
      .isInt({ min: 0 })
      .withMessage('Order index must be a non-negative integer')
      .toInt(),
    
    body('duration_minutes')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Duration must be a non-negative integer')
      .toInt(),
    
    body('is_published')
      .optional()
      .isBoolean()
      .withMessage('is_published must be a boolean')
      .toBoolean(),
    
    body('is_free_preview')
      .optional()
      .isBoolean()
      .withMessage('is_free_preview must be a boolean')
      .toBoolean()
  ],

  updateLesson: [
    body('title')
      .optional()
      .isLength({ min: 3, max: 255 })
      .withMessage('Lesson title must be between 3 and 255 characters')
      .trim(),
    
    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Description must not exceed 2000 characters')
      .trim(),
    
    body('content_type')
      .optional()
      .isIn(['video', 'document', 'text', 'link', 'quiz', 'assignment'])
      .withMessage('Content type must be one of: video, document, text, link, quiz, assignment'),
    
    body('content')
      .optional()
      .isLength({ max: 50000 })
      .withMessage('Content must not exceed 50000 characters'),
    
    body('video_url')
      .optional()
      .isURL()
      .withMessage('Video URL must be a valid URL'),
    
    body('is_published')
      .optional()
      .isBoolean()
      .withMessage('is_published must be a boolean')
      .toBoolean(),
    
    body('is_free_preview')
      .optional()
      .isBoolean()
      .withMessage('is_free_preview must be a boolean')
      .toBoolean()
  ],

  // ===== MATERIAL VALIDATIONS =====
  addMaterial: [
    body('file_name')
      .notEmpty()
      .withMessage('File name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('File name must be between 1 and 255 characters')
      .trim(),
    
    body('file_url')
      .notEmpty()
      .withMessage('File URL is required')
      .isURL()
      .withMessage('File URL must be a valid URL'),
    
    body('file_type')
      .optional()
      .isLength({ max: 50 })
      .withMessage('File type must not exceed 50 characters'),
    
    body('file_size')
      .optional()
      .isInt({ min: 0 })
      .withMessage('File size must be a non-negative integer')
      .toInt(),
    
    body('file_extension')
      .optional()
      .isLength({ max: 10 })
      .withMessage('File extension must not exceed 10 characters'),
    
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters')
      .trim(),
    
    body('is_downloadable')
      .optional()
      .isBoolean()
      .withMessage('is_downloadable must be a boolean')
      .toBoolean(),
    
    body('order_index')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order index must be a non-negative integer')
      .toInt()
  ],

  // ===== PROGRESS VALIDATIONS =====
  updateProgress: [
    body('last_position')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Last position must be a non-negative integer')
      .toInt(),
    
    body('completion_percentage')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Completion percentage must be between 0 and 100')
      .toInt(),
    
    body('time_spent_seconds')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Time spent must be a non-negative integer')
      .toInt(),
    
    body('notes')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Notes must not exceed 2000 characters')
      .trim(),
    
    body('bookmarked')
      .optional()
      .isBoolean()
      .withMessage('Bookmarked must be a boolean')
      .toBoolean()
  ],

  // ===== PARAM VALIDATIONS =====
  // Use regex instead of isUUID() to accept non-standard UUIDs (like seed data)
  courseId: [
    param('courseId')
      .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      .withMessage('Invalid course ID format')
  ],

  sectionId: [
    param('sectionId')
      .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      .withMessage('Invalid section ID format')
  ],

  lessonId: [
    param('lessonId')
      .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      .withMessage('Invalid lesson ID format')
  ],

  materialId: [
    param('materialId')
      .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      .withMessage('Invalid material ID format')
  ],

  // ===== QUERY VALIDATIONS =====
  includeUnpublished: [
    query('include_unpublished')
      .optional()
      .isBoolean()
      .withMessage('include_unpublished must be a boolean')
      .toBoolean()
  ],

  limit: [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt()
  ]
};






