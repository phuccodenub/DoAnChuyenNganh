import { z } from 'zod';

export const quizSchemas = {
  // Quiz query schema
  quizQuery: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
    course_id: z.string().optional(),
    lesson_id: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional()
  }),

  // Quiz ID parameter schema
  quizId: z.object({
    id: z.string().min(1, 'Quiz ID is required')
  }),

  // Quiz attempt parameters schema
  quizAttemptParams: z.object({
    attemptId: z.string().min(1, 'Attempt ID is required')
  }),

  // Quiz question parameters schema
  quizQuestionParams: z.object({
    id: z.string().min(1, 'Quiz ID is required')
  }),

  // Submit quiz attempt schema
  submitQuizAttempt: z.object({
    answers: z.record(z.string(), z.union([
      z.string(),           // For single_choice and true_false
      z.array(z.string())   // For multiple_choice
    ])).refine(
      (answers) => Object.keys(answers).length > 0,
      'At least one answer is required'
    )
  }),

  // Create quiz schema
  createQuiz: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().optional(),
    course_id: z.string().min(1, 'Course ID is required'),
    duration_minutes: z.number().int().min(0).optional(),
    max_attempts: z.number().int().min(0).optional(), // 0 = unlimited attempts
    passing_score: z.number().min(0).max(100).optional(),
    shuffle_questions: z.boolean().default(false),
    show_correct_answers: z.boolean().default(true),
    available_from: z.string().datetime().optional(),
    available_until: z.string().datetime().optional(),
    is_published: z.boolean().default(false)
  }),

  // Update quiz schema
  updateQuiz: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
    description: z.string().optional(),
    course_id: z.string().min(1, 'Course ID is required').optional(),
    duration_minutes: z.number().int().min(0).optional(),
    max_attempts: z.number().int().min(0).optional(), // 0 = unlimited attempts
    passing_score: z.number().min(0).max(100).optional(),
    shuffle_questions: z.boolean().optional(),
    show_correct_answers: z.boolean().optional(),
    available_from: z.string().datetime().optional(),
    available_until: z.string().datetime().optional(),
    is_published: z.boolean().optional()
  }),

  // Create question schema
  createQuestion: z.object({
    question_text: z.string().min(1, 'Question text is required'),
    question_type: z.enum(['single_choice', 'multiple_choice', 'true_false']),
    points: z.number().min(0).default(1.0),
    order_index: z.number().int().min(0).default(1),
    explanation: z.string().optional(),
    options: z.array(z.object({
      option_text: z.string().min(1, 'Option text is required'),
      is_correct: z.boolean().default(false)
    })).optional()
  }),

  // Update question schema
  updateQuestion: z.object({
    question_text: z.string().min(1, 'Question text is required').optional(),
    question_type: z.enum(['single_choice', 'multiple_choice', 'true_false']).optional(),
    points: z.number().min(0).optional(),
    order_index: z.number().int().min(0).optional(),
    explanation: z.string().optional()
  })
};