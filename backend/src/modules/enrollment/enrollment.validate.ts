import { z } from 'zod';
import { baseValidation } from '../../validates/base.validate';

export const enrollmentSchemas = {
  // Enrollment creation schema
  createEnrollment: z.object({
    user_id: baseValidation.uuid,
    course_id: baseValidation.uuid,
    status: z.string().default('pending'),
    enrollment_type: z.string().default('free'),
    payment_status: z.string().default('pending'),
    payment_method: z.string().optional(),
    payment_id: z.string().optional(),
    amount_paid: z.coerce.number().min(0).optional(),
    currency: z.string().max(3).optional(),
    total_lessons: z.coerce.number().int().min(0).default(0)
  }),

  // Enrollment update schema
  updateEnrollment: z.object({
    status: z.string().optional(),
    enrollment_type: z.string().optional(),
    payment_status: z.string().optional(),
    payment_method: z.string().optional(),
    payment_id: z.string().optional(),
    amount_paid: z.coerce.number().min(0).optional(),
    currency: z.string().max(3).optional(),
    progress_percentage: z.coerce.number()
      .min(0, 'Progress percentage must be at least 0')
      .max(100, 'Progress percentage must be at most 100')
      .optional(),
    completed_lessons: z.coerce.number().int().min(0).optional(),
    total_lessons: z.coerce.number().int().min(0).optional(),
    last_accessed_at: z.coerce.date().optional(),
    completion_date: z.coerce.date().optional(),
    certificate_issued: z.boolean().optional(),
    certificate_url: z.string().max(500).optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    review: z.string().optional(),
    review_date: z.coerce.date().optional(),
    access_expires_at: z.coerce.date().optional(),
    metadata: z.any().optional()
  }),

  // Enrollment query schema
  enrollmentQuery: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.string().optional(),
    order: z.enum(['ASC', 'DESC', 'asc', 'desc']).transform(val => val.toUpperCase()).default('DESC'),
    user_id: baseValidation.uuid.optional(),
    course_id: baseValidation.uuid.optional(),
    status: z.enum(['enrolled', 'completed', 'dropped']).optional(),
    search: z.string().min(1, 'Search term cannot be empty').optional()
  }),

  // Enrollment ID parameter schema
  enrollmentId: z.object({
    id: baseValidation.uuid
  }),

  // Course ID parameter schema
  courseId: z.object({
    courseId: baseValidation.uuid
  }),

  // User ID parameter schema
  userId: z.object({
    userId: baseValidation.uuid
  }),

  // Enrollment completion schema
  completeEnrollment: z.object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    completion_date: z.coerce.date().optional()
  }),

  // Enrollment analytics query schema
  enrollmentAnalyticsQuery: z.object({
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional(),
    course_id: baseValidation.uuid.optional(),
    user_id: baseValidation.uuid.optional(),
    group_by: z.enum(['day', 'week', 'month']).default('day')
  }).refine((data) => {
    if (data.start_date && data.end_date) {
      return data.start_date <= data.end_date;
    }
    return true;
  }, {
    message: 'End date must be after or equal to start date',
    path: ['end_date']
  }),

  // Bulk enrollment schema
  bulkEnrollment: z.object({
    user_ids: z.array(baseValidation.uuid)
      .min(1, 'At least one user ID is required')
      .max(100, 'Maximum 100 users per bulk enrollment'),
    course_id: baseValidation.uuid,
    status: z.enum(['enrolled', 'completed', 'dropped']).default('enrolled')
  }),

  // Enrollment search schema
  enrollmentSearch: z.object({
    query: z.string().min(1, 'Search query cannot be empty'),
    filters: z.object({
      status: z.enum(['enrolled', 'completed', 'dropped']).optional(),
      course_id: baseValidation.uuid.optional(),
      user_id: baseValidation.uuid.optional(),
      min_progress: z.coerce.number().min(0).max(100).optional(),
      max_progress: z.coerce.number().min(0).max(100).optional(),
      min_grade: z.coerce.number().min(0).max(100).optional(),
      max_grade: z.coerce.number().min(0).max(100).optional(),
      enrolled_after: z.coerce.date().optional(),
      enrolled_before: z.coerce.date().optional()
    }).optional()
  })
};
