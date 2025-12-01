const { body, query, param } = require('express-validator');

// Custom UUID validator that accepts any valid UUID format (v1-v5) 
// Also accepts placeholder UUIDs used in seeded data
const isValidUUID = (value: string) => {
  if (!value) return true; // optional field
  // Regex that matches UUID v1-v5 and placeholder formats
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const notificationsValidation = {
  create: [
    body('notification_type').notEmpty().isLength({ max: 50 }),
    body('title').notEmpty().isLength({ min: 3, max: 255 }),
    body('message').notEmpty(),
    body('link_url').optional().isURL(),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    body('category').optional().isIn(['course', 'assignment', 'quiz', 'grade', 'message', 'system', 'announcement', 'achievement']),
    body('related_resource_type').optional().isLength({ max: 50 }),
    body('related_resource_id').optional().custom(isValidUUID).withMessage('Related resource ID không hợp lệ'),
    body('scheduled_at').optional().isISO8601(),
    body('expires_at').optional().isISO8601(),
    body('is_broadcast').optional().isBoolean().toBoolean(),
    body('recipient_ids').optional().isArray(),
    body('recipient_ids.*').optional().custom(isValidUUID).withMessage('Recipient ID không hợp lệ')
  ],

  /**
   * Validation cho bulk notification (Admin/Instructor)
   */
  sendBulk: [
    body('notification_type').notEmpty().isLength({ max: 50 })
      .withMessage('Loại thông báo là bắt buộc'),
    body('title').notEmpty().isLength({ min: 3, max: 255 })
      .withMessage('Tiêu đề phải từ 3-255 ký tự'),
    body('message').notEmpty()
      .withMessage('Nội dung thông báo là bắt buộc'),
    body('link_url').optional().isURL()
      .withMessage('URL không hợp lệ'),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    body('category').optional().isIn(['course', 'assignment', 'quiz', 'grade', 'message', 'system', 'announcement', 'achievement']),
    body('related_resource_type').optional().isLength({ max: 50 }),
    body('related_resource_id').optional().custom(isValidUUID).withMessage('Related resource ID không hợp lệ'),
    body('scheduled_at').optional().isISO8601(),
    body('expires_at').optional().isISO8601(),
    body('target_audience').notEmpty()
      .withMessage('Đối tượng nhận là bắt buộc'),
    body('target_audience.type').notEmpty().isIn(['all', 'role', 'course', 'users'])
      .withMessage('Loại đối tượng phải là: all, role, course, hoặc users'),
    body('target_audience.role').optional().isIn(['student', 'instructor', 'STUDENT', 'INSTRUCTOR', 'admin', 'ADMIN'])
      .withMessage('Role phải là student hoặc instructor'),
    body('target_audience.course_id').optional().custom(isValidUUID)
      .withMessage('Course ID không hợp lệ'),
    body('target_audience.user_ids').optional().isArray()
      .withMessage('User IDs phải là mảng'),
    body('target_audience.user_ids.*').optional().custom(isValidUUID)
      .withMessage('User ID không hợp lệ')
  ],

  /**
   * Validation cho query list notifications
   */
  queryList: [
    query('category').optional().isString(),
    query('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt()
  ],

  /**
   * Validation cho query sent notifications
   */
  querySent: [
    query('notification_type').optional().isString(),
    query('category').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt()
  ],

  /**
   * Validation cho notification ID param
   */
  notificationId: [
    param('id').isUUID().withMessage('Notification ID không hợp lệ')
  ]
};






