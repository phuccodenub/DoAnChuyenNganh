const { param, query } = require('express-validator');

export const analyticsValidation = {
  courseId: [param('courseId').isUUID('all')],

  userActivities: [
    param('userId').isUUID(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  courseAnalytics: [
    param('courseId').isUUID('all'),

    query('period').optional().isIn(['daily', 'weekly', 'monthly']),
    query('days').optional().isInt({ min: 1, max: 365 }).toInt()
  ],
  contentEngagement: [
    param('courseId').isUUID('all'),

    query('type').optional().isIn(['lesson', 'quiz', 'assignment', 'all']),
    query('days').optional().isInt({ min: 1, max: 365 }).toInt()
  ],
  contentMatrix: [
    param('courseId').isUUID('all'),

    query('type').optional().isIn(['lesson', 'quiz', 'assignment']).default('quiz'),
    query('days').optional().isInt({ min: 1, max: 365 }).toInt(),
    query('search').optional().isString().trim()
  ]
};






