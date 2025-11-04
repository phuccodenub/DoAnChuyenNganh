import { z } from 'zod';

export const lessonSchemas = {
  // Lesson query schema
  lessonQuery: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
    course_id: z.string().optional(),
    section_id: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional()
  }),

  // Lesson ID parameter schema
  lessonId: z.object({
    id: z.string().min(1, 'Lesson ID is required')
  }),

  // Create lesson schema
  createLesson: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().optional(),
    content: z.string().optional(),
    course_id: z.string().min(1, 'Course ID is required'),
    section_id: z.string().optional(),
    order_index: z.number().int().min(0).optional(),
    duration_minutes: z.number().int().min(0).optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    is_free: z.boolean().default(false),
    video_url: z.string().url().optional(),
    attachments: z.array(z.string()).optional()
  }),

  // Update lesson schema
  updateLesson: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    course_id: z.string().min(1, 'Course ID is required').optional(),
    section_id: z.string().optional(),
    order_index: z.number().int().min(0).optional(),
    duration_minutes: z.number().int().min(0).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    is_free: z.boolean().optional(),
    video_url: z.string().url().optional(),
    attachments: z.array(z.string()).optional()
  })
};
