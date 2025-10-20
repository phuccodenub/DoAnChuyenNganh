const { body, param } = require('express-validator');

export const liveStreamValidation = {
  create: [
    body('course_id').isUUID(),
    body('instructor_id').isUUID(),
    body('title').isLength({ min: 3, max: 255 }),
    body('scheduled_at').isISO8601(),
    body('duration_minutes').optional().isInt({ min: 1 }).toInt(),
    body('meeting_url').optional().isURL()
  ],

  update: [
    param('sessionId').isUUID(),
    body('status').isIn(['scheduled', 'live', 'ended', 'cancelled']),
    body('recording_url').optional().isURL(),
    body('started_at').optional().isISO8601(),
    body('ended_at').optional().isISO8601()
  ],

  sessionId: [param('sessionId').isUUID()]
};






