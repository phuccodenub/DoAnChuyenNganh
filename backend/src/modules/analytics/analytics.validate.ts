const { param, query } = require('express-validator');

export const analyticsValidation = {
  courseId: [param('courseId').isUUID()],
  userActivities: [
    param('userId').isUUID(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ]
};






