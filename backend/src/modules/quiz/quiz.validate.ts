import { z } from 'zod';

export const quizSchemas = {
  // Quiz query schema
  quizQuery: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
    course_id: z.string().optional(),
    section_id: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional()
  }),

  // Completion status query schema
  completionStatusQuery: z.object({
    course_id: z.string().min(1, 'Course ID is required')
  }),


  // Quiz ID parameter schema
  quizId: z.object({
    id: z.string().min(1, 'Quiz ID is required')
  }),

  // Quiz attempt parameters schema
  quizAttemptParams: z.object({
    attemptId: z.string().min(1, 'Attempt ID is required')
  }),
  
  // Quiz question parameters schema (for routes: /quizzes/:quizId/questions/:questionId)
  quizQuestionParams: z.object({
    quizId: z.string().min(1, 'Quiz ID is required'),
    questionId: z.string().min(1, 'Question ID is required'),
  }),

  // Student quiz attempts parameters schema (for routes: /quizzes/:id/attempts/student/:studentId)
  studentQuizAttemptsParams: z.object({
    id: z.string().min(1, 'Quiz ID is required'),
    studentId: z.string().min(1, 'Student ID is required'),
  }),

  // Submit quiz attempt schema
  // FE gửi answers là mảng QuizAnswerDto
  submitQuizAttempt: z.object({
    answers: z.array(
      z.object({
        question_id: z.string().min(1, 'Question ID is required'),
        selected_option_id: z.string().optional(),
        selected_options: z.array(z.string()).optional(),
      })
    ).optional(),
  }),

  // Create quiz schema (course_id XOR section_id, hoặc cả hai đều undefined)
  createQuiz: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    description: z.string().optional(),
    course_id: z.string().min(1, 'Course ID is required').optional().nullable(),
    section_id: z.string().min(1).optional().nullable(),
    duration_minutes: z.number().int().min(0).optional(),
    max_attempts: z.number().int().min(0).optional(), // 0 = unlimited attempts
    passing_score: z.number().min(0).max(100).optional(),
    shuffle_questions: z.boolean().default(false),
    show_correct_answers: z.boolean().default(true),
    available_from: z.string().datetime().optional(),
    available_until: z.string().datetime().optional(),
    is_published: z.boolean().default(false),
    is_practice: z.boolean().default(false) // true = Practice Quiz, false = Graded Quiz
  }).refine((data) => {
    // Cho phép cả hai đều undefined/null (khi tạo từ Section, sẽ được update sau)
    // Hoặc chỉ một trong hai có giá trị (XOR)
    const hasCourseId = !!data.course_id;
    const hasSectionId = !!data.section_id;
    return !hasCourseId && !hasSectionId || (hasCourseId !== hasSectionId);
  }, {
    message: 'Cần chọn course_id hoặc section_id (chỉ 1), hoặc cả hai đều undefined',
    path: ['course_id'],
  }),

  // Update quiz schema (still enforce XOR if both provided)
  updateQuiz: z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
    description: z.string().optional(),
    course_id: z.string().min(1, 'Course ID is required').optional().nullable(),
    section_id: z.string().min(1).optional().nullable(),
    duration_minutes: z.number().int().min(0).optional(),
    max_attempts: z.number().int().min(0).optional(), // 0 = unlimited attempts
    passing_score: z.number().min(0).max(100).optional(),
    shuffle_questions: z.boolean().optional(),
    show_correct_answers: z.boolean().optional(),
    available_from: z.string().datetime().optional(),
    available_until: z.string().datetime().optional(),
    is_published: z.boolean().optional(),
    is_practice: z.boolean().optional() // true = Practice Quiz, false = Graded Quiz
  }).refine((data) => {
    if (data.course_id && data.section_id) return false;
    return true;
  }, {
    message: 'Chỉ chọn course_id hoặc section_id (không chọn cả hai)',
    path: ['course_id'],
  }),

  // Create question schema
  createQuestion: z.object({
    question_text: z.string().min(1, 'Question text is required'),
    question_type: z.enum(['single_choice', 'multiple_choice', 'true_false']),
    points: z.number().min(0).optional(),
    order_index: z.number().int().min(0).optional(),
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