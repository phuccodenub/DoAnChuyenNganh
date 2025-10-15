const { body, query } = require('express-validator');

export const notificationsValidation = {
  create: [
    body('notification_type').notEmpty().isLength({ max: 50 }),
    body('title').notEmpty().isLength({ min: 3, max: 255 }),
    body('message').notEmpty(),
    body('link_url').optional().isURL(),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    body('category').optional().isIn(['course', 'assignment', 'quiz', 'grade', 'message', 'system', 'announcement']),
    body('related_resource_type').optional().isLength({ max: 50 }),
    body('related_resource_id').optional().isUUID(),
    body('scheduled_at').optional().isISO8601(),
    body('expires_at').optional().isISO8601(),
    body('is_broadcast').optional().isBoolean().toBoolean(),
    body('recipient_ids').optional().isArray(),
    body('recipient_ids.*').optional().isUUID()
  ],

  queryList: [
    query('category').optional().isString(),
    query('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt()
  ]
};






