const { body, param, query } = require('express-validator');

export const liveStreamValidation = {
  create: [
    body('course_id')
      .optional({ nullable: true, checkFalsy: true })
      .custom((value) => {
        if (!value || value === null) return true; // Allow null/empty
        // If provided, must be valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(value)) {
          return true;
        }
        throw new Error('course_id must be a valid UUID');
      }),
    body('title').isLength({ min: 3, max: 255 }),
    body('description').optional().isString(),
    body('scheduled_start').optional().isISO8601(),
    body('scheduled_end').optional().isISO8601(),
    body('duration_minutes').optional().isInt({ min: 1 }).toInt(),
    body('meeting_url')
      .optional()
      .custom((value) => {
        if (!value) return true; // Optional, allow empty
        // Chấp nhận HTTP/HTTPS URL hoặc RTMP URL
        const httpUrlPattern = /^https?:\/\/.+/i;
        const rtmpUrlPattern = /^rtmp:\/\/.+/i;
        if (httpUrlPattern.test(value) || rtmpUrlPattern.test(value)) {
          return true;
        }
        throw new Error('meeting_url must be a valid HTTP/HTTPS URL or RTMP URL');
      }),
    body('meeting_password').optional().isString(),
    body('platform').optional().isString().isLength({ max: 50 }),
    body('ingest_type').optional().isIn(['webrtc', 'rtmp']).default('webrtc'),
    body('webrtc_room_id').optional().isString().isLength({ max: 120 }),
    body('webrtc_config').optional().isObject(),
    body('playback_url')
      .optional()
      .custom((value, { req }) => {
        // Nếu ingest_type là rtmp và có playback_url, thì phải là URL hợp lệ
        // Nếu không có playback_url, backend sẽ tự generate (OK)
        if (req.body?.ingest_type === 'rtmp' && value) {
          const httpUrlPattern = /^https?:\/\/.+/i;
          if (!httpUrlPattern.test(value)) {
            throw new Error('playback_url must be a valid HTTP/HTTPS URL');
          }
        }
        return true;
      }),
    body('stream_key')
      .if(body('ingest_type').equals('rtmp'))
      .optional()
      .isString(),
    body('max_participants').optional().isInt({ min: 1 }).toInt(),
    body('is_public').optional().isBoolean().toBoolean(),
    body('category')
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .isLength({ max: 100 }),
    body('thumbnail_url')
      .optional({ nullable: true, checkFalsy: true })
      .custom((value) => {
        if (!value || value === null || value === '') return true; // Allow null/empty
        // If provided, must be valid URL
        const httpUrlPattern = /^https?:\/\/.+/i;
        if (httpUrlPattern.test(value)) {
          return true;
        }
        throw new Error('thumbnail_url must be a valid HTTP/HTTPS URL');
      }),
  ],

  update: [
    param('sessionId').isUUID(),
    body('status').isIn(['scheduled', 'live', 'ended', 'cancelled']),
    body('recording_url').optional().isURL(),
    body('actual_start').optional().isISO8601(),
    body('actual_end').optional().isISO8601(),
    body('viewer_count').optional().isInt({ min: 0 }).toInt(),
  ],

  list: [
    query('status').optional().isIn(['scheduled', 'live', 'ended', 'cancelled']),
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],

  sessionId: [param('sessionId').isUUID()],
};






