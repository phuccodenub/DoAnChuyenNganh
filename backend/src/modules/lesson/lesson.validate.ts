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
    content_type: z.enum(['video', 'document', 'text', 'link', 'quiz', 'assignment']).default('text'),
    section_id: z.string().min(1, 'Section ID is required'),
    order_index: z.number().int().min(0).optional(),
    duration_minutes: z.number().int().min(0).optional(),
    is_published: z.boolean().default(true), // Mặc định published để enrolled users có thể truy cập ngay
    is_free_preview: z.boolean().default(false),
    video_url: z.string().optional().nullable(),
    video_duration: z.number().int().min(0).optional(),
    metadata: z.record(z.string(), z.any()).optional()
  }),

  // Update lesson schema
  updateLesson: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    content_type: z.enum(['video', 'document', 'text', 'link', 'quiz', 'assignment']).optional(),
    section_id: z.string().optional(),
    order_index: z.number().int().min(0).optional(),
    duration_minutes: z.number().int().min(0).optional(),
    is_published: z.boolean().optional(),
    is_free_preview: z.boolean().optional(),
    video_url: z.string().optional().nullable(),
    video_duration: z.number().int().min(0).optional(),
    metadata: z.record(z.string(), z.any()).optional()
  })
};
