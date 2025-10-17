import { z } from 'zod';
import { baseValidation } from '../../validates/base.validate';

export const courseSchemas = {
  // Course creation schema
  createCourse: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(200, 'Title must be less than 200 characters'),
    description: z.string()
      .max(2000, 'Description must be less than 2000 characters')
      .optional(),
    short_description: z.string()
      .max(500, 'Short description must be less than 500 characters')
      .optional(),
    category: z.string().max(100).optional(),
    subcategory: z.string().max(100).optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    language: z.string().max(10).default('en'),
    price: z.coerce.number().min(0).default(0),
    currency: z.string().max(3).default('USD'),
    discount_price: z.coerce.number().min(0).optional(),
    discount_percentage: z.coerce.number().int().min(0).max(100).optional(),
    discount_start: z.coerce.date().optional(),
    discount_end: z.coerce.date().optional(),
    thumbnail: z.string().max(500).optional(),
    video_intro: z.string().max(500).optional(),
    duration_hours: z.coerce.number().int().min(0).optional(),
    total_lessons: z.coerce.number().int().min(0).default(0),
    is_featured: z.boolean().default(false),
    is_free: z.boolean().default(false),
    prerequisites: z.array(z.string()).default([]),
    learning_objectives: z.array(z.string()).default([]),
    tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').default([]),
    metadata: z.any().optional()
  }).refine((data) => {
    if (data.discount_start && data.discount_end) {
      return data.discount_start < data.discount_end;
    }
    return true;
  }, {
    message: 'Discount end date must be after discount start date',
    path: ['discount_end']
  }),

  // Course update schema
  updateCourse: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(255, 'Title must be less than 255 characters')
      .optional(),
    description: z.string()
      .max(2000, 'Description must be less than 2000 characters')
      .optional(),
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional(),
    max_students: z.coerce.number()
      .int()
      .min(1, 'Max students must be at least 1')
      .max(1000, 'Max students must be less than 1000')
      .optional(),
    thumbnail_url: z.string().url('Invalid thumbnail URL').optional(),
    tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
    settings: z.object({
      allow_enrollment: z.boolean().optional(),
      require_approval: z.boolean().optional(),
      enable_discussions: z.boolean().optional(),
      enable_assignments: z.boolean().optional(),
      enable_quizzes: z.boolean().optional(),
      enable_certificates: z.boolean().optional(),
      grading_policy: z.enum(['pass_fail', 'letter_grade', 'percentage']).optional(),
      passing_score: z.coerce.number().int().min(0).max(100).optional(),
      max_attempts: z.coerce.number().int().min(1).max(10).optional(),
      time_limit: z.coerce.number().int().min(0).optional(),
      prerequisites: z.array(z.string()).optional(),
      learning_objectives: z.array(z.string()).optional()
    }).optional()
  }).refine((data) => {
    if (data.start_date && data.end_date) {
      return data.start_date < data.end_date;
    }
    return true;
  }, {
    message: 'End date must be after start date',
    path: ['end_date']
  }),

  // Course ID parameter schema
  courseId: z.object({
    id: z.string().uuid('Invalid course ID format')
  }),

  // Instructor ID parameter schema
  instructorId: z.object({
    instructorId: baseValidation.uuid
  }),

  // Course query schema
  courseQuery: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().min(1, 'Search term cannot be empty').optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    instructor_id: z.string().uuid('Invalid instructor ID').optional(),
    // Nới lỏng category để chấp nhận dữ liệu seed/test tuỳ ý
    category: z.string().max(100).optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    tags: z.string().optional(), // Comma-separated tags
    sort: z.string().optional(),
    order: z.enum(['ASC', 'DESC', 'asc', 'desc']).transform(val => val.toUpperCase()).default('DESC')
  }),

  // Course search schema
  courseSearch: z.object({
    query: z.string().min(1, 'Search query is required').optional(),
    status: z.array(z.enum(['draft', 'published', 'archived'])).optional(),
    instructor_id: z.array(z.string().uuid()).optional(),
    category: z.array(z.enum(['programming', 'design', 'business', 'marketing', 'data-science', 'other'])).optional(),
    level: z.array(z.enum(['beginner', 'intermediate', 'advanced'])).optional(),
    tags: z.array(z.string()).optional(),
    price_range: z.object({
      min: z.coerce.number().min(0).optional(),
      max: z.coerce.number().min(0).optional()
    }).optional(),
    duration_range: z.object({
      min: z.coerce.number().min(0).optional(), // in days
      max: z.coerce.number().min(0).optional()
    }).optional(),
    rating_min: z.coerce.number().min(0).max(5).optional(),
    enrollment_min: z.coerce.number().int().min(0).optional()
  }),

  // Course material schema
  courseMaterial: z.object({
    id: z.string().uuid(),
    title: z.string().min(1, 'Title is required'),
    type: z.enum(['video', 'document', 'link', 'quiz', 'assignment']),
    url: z.string().url('Invalid URL').optional(),
    content: z.string().optional(),
    duration: z.coerce.number().int().min(0).optional(), // in minutes
    order: z.coerce.number().int().min(0),
    is_required: z.boolean().default(false)
  }),

  // Course settings update schema
  updateCourseSettings: z.object({
    allow_enrollment: z.boolean().optional(),
    require_approval: z.boolean().optional(),
    enable_discussions: z.boolean().optional(),
    enable_assignments: z.boolean().optional(),
    enable_quizzes: z.boolean().optional(),
    enable_certificates: z.boolean().optional(),
    grading_policy: z.enum(['pass_fail', 'letter_grade', 'percentage']).optional(),
    passing_score: z.coerce.number().int().min(0).max(100).optional(),
    max_attempts: z.coerce.number().int().min(1).max(10).optional(),
    time_limit: z.coerce.number().int().min(0).optional(),
    prerequisites: z.array(z.string()).optional(),
    learning_objectives: z.array(z.string()).optional()
  }),

  // Course status update schema
  updateCourseStatus: z.object({
    status: z.enum(['draft', 'published', 'archived'])
  }),

  // Course analytics query schema
  courseAnalyticsQuery: z.object({
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional(),
    group_by: z.enum(['day', 'week', 'month']).default('week')
  }).refine((data) => {
    if (data.start_date && data.end_date) {
      return data.start_date < data.end_date;
    }
    return true;
  }, {
    message: 'End date must be after start date',
    path: ['end_date']
  })
};

// Course validation helpers
export const courseValidateHelpers = {
  // Validate course status
  validateCourseStatus: (status: string): boolean => {
    return ['draft', 'published', 'archived'].includes(status);
  },

  // Validate course level
  validateCourseLevel: (level: string): boolean => {
    return ['beginner', 'intermediate', 'advanced'].includes(level);
  },

  // Validate course category
  validateCourseCategory: (category: string): boolean => {
    return ['programming', 'design', 'business', 'marketing', 'data-science', 'other'].includes(category);
  },

  // Validate grading policy
  validateGradingPolicy: (policy: string): boolean => {
    return ['pass_fail', 'letter_grade', 'percentage'].includes(policy);
  },

  // Validate material type
  validateMaterialType: (type: string): boolean => {
    return ['video', 'document', 'link', 'quiz', 'assignment'].includes(type);
  },

  // Validate tags
  validateTags: (tags: string[]): boolean => {
    return tags.length <= 10 && tags.every(tag => tag.length > 0 && tag.length <= 50);
  },

  // Validate date range
  validateDateRange: (startDate: Date, endDate: Date): boolean => {
    return startDate < endDate;
  },

  // Validate max students
  validateMaxStudents: (maxStudents: number): boolean => {
    return maxStudents >= 1 && maxStudents <= 1000;
  },

  // Validate passing score
  validatePassingScore: (score: number): boolean => {
    return score >= 0 && score <= 100;
  },

  // Validate max attempts
  validateMaxAttempts: (attempts: number): boolean => {
    return attempts >= 1 && attempts <= 10;
  }
};