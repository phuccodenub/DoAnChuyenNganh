const { body, param } = require('express-validator');

export const gradeValidation = {
  upsertGrade: [
    body('user_id').isUUID(),
    body('course_id').isUUID(),
    body('component_id').optional().isUUID(),
    body('score').isFloat({ min: 0 }),
    body('max_score').isFloat({ min: 0 })
  ],

  upsertFinal: [
    body('user_id').isUUID(),
    body('course_id').isUUID(),
    body('total_score').isFloat({ min: 0 }),
    body('letter_grade').optional().isLength({ min: 1, max: 2 })
  ],

  getUserGrades: [
    param('userId').isUUID(),
    param('courseId').isUUID()
  ]
};






