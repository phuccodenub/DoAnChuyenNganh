import { z } from 'zod';

export const sectionSchemas = {
  // Section query schema
  sectionQuery: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
    course_id: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional()
  }),

  // Section ID parameter schema
  sectionId: z.object({
    id: z.string().min(1, 'Section ID is required')
  }),

  // Create section schema
  createSection: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().optional(),
    course_id: z.string().min(1, 'Course ID is required'),
    order_index: z.number().int().min(0).optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    is_free: z.boolean().default(false)
  }),

  // Update section schema
  updateSection: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
    description: z.string().optional(),
    course_id: z.string().min(1, 'Course ID is required').optional(),
    order_index: z.number().int().min(0).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    is_free: z.boolean().optional()
  })
};
