const { body, param } = require('express-validator');

export const assignmentValidation = {
  create: [
    body('course_id').isUUID(),
    body('title').isLength({ min: 3, max: 255 }),
    body('max_score').optional().isFloat({ min: 0 }),
    body('due_date').optional().isISO8601(),
    body('allow_late_submission').optional().isBoolean().toBoolean(),
    body('submission_type').isIn(['file', 'text', 'both']),
    body('is_published').optional().isBoolean().toBoolean()
  ],

  submit: [
    param('assignmentId').isUUID(),
    body('submission_text').optional().isString(),
    body('file_url').optional().isURL(),
    body('file_name').optional().isLength({ max: 255 })
  ],

  grade: [
    param('submissionId').isUUID(),
    body('score').optional().isFloat({ min: 0 }),
    body('feedback').optional().isString()
  ],

  assignmentId: [param('assignmentId').isUUID()]
};




