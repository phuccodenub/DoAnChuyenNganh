import { z } from 'zod';

export const assignmentSchemas = {
  // Assignment query schema
  assignmentQuery: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
    course_id: z.string().optional(),
    lesson_id: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional()
  }),

  // Assignment ID parameter schema
  assignmentId: z.object({
    id: z.string().min(1, 'Assignment ID is required')
  }),

  // Create assignment schema
  createAssignment: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().optional(),
    course_id: z.string().min(1, 'Course ID is required'),
    due_date: z.string().datetime().optional(),
    max_points: z.number().int().min(0).optional(),
    allow_late_submission: z.boolean().default(false)
  }),

  // Update assignment schema
  updateAssignment: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
    description: z.string().optional(),
    course_id: z.string().min(1, 'Course ID is required').optional(),
    due_date: z.string().datetime().optional(),
    max_points: z.number().int().min(0).optional(),
    allow_late_submission: z.boolean().optional()
  })
};