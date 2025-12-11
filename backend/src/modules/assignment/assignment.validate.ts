import { z } from 'zod';

export const assignmentSchemas = {
  // Assignment query schema
  assignmentQuery: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
    course_id: z.string().optional(),
    section_id: z.string().optional(),
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
    course_id: z.string().min(1, 'Course ID is required').optional().nullable(),
    section_id: z.string().min(1).optional().nullable(),
    due_date: z.string().datetime().optional(),
    max_points: z.number().int().min(0).optional(),
    allow_late_submission: z.boolean().default(false),
    is_practice: z.boolean().default(false) // true = Practice Assignment, false = Graded Assignment
  }).refine((data) => {
    const hasCourseId = !!data.course_id;
    const hasSectionId = !!data.section_id;
    return !hasCourseId && !hasSectionId || (hasCourseId !== hasSectionId);
  }, {
    message: 'Cần chọn course_id hoặc section_id (chỉ 1), hoặc cả hai đều undefined',
    path: ['course_id'],
  }),

  // Update assignment schema
  updateAssignment: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
    description: z.string().optional(),
    course_id: z.string().min(1, 'Course ID is required').optional().nullable(),
    section_id: z.string().min(1).optional().nullable(),
    due_date: z.string().datetime().optional(),
    max_points: z.number().int().min(0).optional(),
    allow_late_submission: z.boolean().optional(),
    is_practice: z.boolean().optional() // true = Practice Assignment, false = Graded Assignment
  }).refine((data) => {
    if (data.course_id && data.section_id) return false;
    return true;
  }, {
    message: 'Chỉ chọn course_id hoặc section_id (không chọn cả hai)',
    path: ['course_id'],
  })
};