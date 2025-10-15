const { body, param } = require('express-validator');

export const quizValidation = {
  createQuiz: [
    body('course_id').isUUID().withMessage('Course ID must be a valid UUID'),
    body('title').isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
    body('duration_minutes').optional().isInt({ min: 1 }).toInt().withMessage('Duration must be a positive integer'),
    body('passing_score').optional().isFloat({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
    body('max_attempts').optional().isInt({ min: 1 }).toInt().withMessage('Max attempts must be a positive integer'),
    body('shuffle_questions').optional().isBoolean().toBoolean(),
    body('show_correct_answers').optional().isBoolean().toBoolean(),
    body('available_from').optional().isISO8601().withMessage('Available from must be a valid date'),
    body('available_until').optional().isISO8601().withMessage('Available until must be a valid date'),
    body('is_published').optional().isBoolean().toBoolean(),
    body('auto_grade').optional().isBoolean().toBoolean(),
    body('time_limit_minutes').optional().isInt({ min: 1 }).toInt().withMessage('Time limit must be a positive integer')
  ],

  updateQuiz: [
    param('quizId').isUUID().withMessage('Quiz ID must be a valid UUID'),
    body('title').optional().isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
    body('duration_minutes').optional().isInt({ min: 1 }).toInt().withMessage('Duration must be a positive integer'),
    body('passing_score').optional().isFloat({ min: 0, max: 100 }).withMessage('Passing score must be between 0 and 100'),
    body('max_attempts').optional().isInt({ min: 1 }).toInt().withMessage('Max attempts must be a positive integer'),
    body('shuffle_questions').optional().isBoolean().toBoolean(),
    body('show_correct_answers').optional().isBoolean().toBoolean(),
    body('available_from').optional().isISO8601().withMessage('Available from must be a valid date'),
    body('available_until').optional().isISO8601().withMessage('Available until must be a valid date'),
    body('is_published').optional().isBoolean().toBoolean(),
    body('auto_grade').optional().isBoolean().toBoolean(),
    body('time_limit_minutes').optional().isInt({ min: 1 }).toInt().withMessage('Time limit must be a positive integer')
  ],

  addQuestion: [
    param('quizId').isUUID().withMessage('Quiz ID must be a valid UUID'),
    body('question_text').notEmpty().withMessage('Question text is required'),
    body('question_type').isIn(['single_choice', 'multiple_choice', 'true_false']).withMessage('Invalid question type'),
    body('points').optional().isFloat({ min: 0 }).withMessage('Points must be a non-negative number'),
    body('order_index').isInt({ min: 0 }).toInt().withMessage('Order index must be a non-negative integer'),
    body('explanation').optional().isLength({ max: 1000 }).withMessage('Explanation must not exceed 1000 characters'),
    body('correct_answer').optional().isString().withMessage('Correct answer must be a string')
  ],

  updateQuestion: [
    param('questionId').isUUID().withMessage('Question ID must be a valid UUID'),
    body('question_text').optional().notEmpty().withMessage('Question text cannot be empty'),
    body('question_type').optional().isIn(['single_choice', 'multiple_choice', 'true_false']).withMessage('Invalid question type'),
    body('points').optional().isFloat({ min: 0 }).withMessage('Points must be a non-negative number'),
    body('order_index').optional().isInt({ min: 0 }).toInt().withMessage('Order index must be a non-negative integer'),
    body('explanation').optional().isLength({ max: 1000 }).withMessage('Explanation must not exceed 1000 characters'),
    body('correct_answer').optional().isString().withMessage('Correct answer must be a string')
  ],

  addOption: [
    param('questionId').isUUID().withMessage('Question ID must be a valid UUID'),
    body('option_text').notEmpty().withMessage('Option text is required'),
    body('is_correct').optional().isBoolean().toBoolean(),
    body('order_index').isInt({ min: 0 }).toInt().withMessage('Order index must be a non-negative integer')
  ],

  submitQuiz: [
    param('attemptId').isUUID().withMessage('Attempt ID must be a valid UUID'),
    body('answers').isArray().withMessage('Answers must be an array'),
    body('answers.*.question_id').isUUID().withMessage('Question ID must be a valid UUID'),
    body('answers.*.selected_option_id').optional().isUUID().withMessage('Selected option ID must be a valid UUID'),
    body('answers.*.selected_option_ids').optional().isArray().withMessage('Selected option IDs must be an array'),
    body('answers.*.selected_option_ids.*').optional().isUUID().withMessage('Each selected option ID must be a valid UUID'),
    body('answers.*.text_answer').optional().isString().withMessage('Text answer must be a string')
  ],

  quizId: [param('quizId').isUUID().withMessage('Quiz ID must be a valid UUID')],
  questionId: [param('questionId').isUUID().withMessage('Question ID must be a valid UUID')],
  attemptId: [param('attemptId').isUUID().withMessage('Attempt ID must be a valid UUID')]
};






