import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { analyticsValidation } from './analytics.validate';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();
const controller = new AnalyticsController();

router.use(authMiddleware);

// Basic stats (available to all authenticated users)
router.get('/courses/:courseId/stats', validate(analyticsValidation.courseId), controller.courseStats);
router.get('/users/:userId/activities', validate(analyticsValidation.userActivities), controller.userActivities);

// Comprehensive analytics (instructor/admin only)
router.get(
  '/courses/:courseId/analytics',
  authorizeRoles(['instructor', 'admin', 'super_admin']),
  validate(analyticsValidation.courseAnalytics),
  controller.getCourseAnalytics
);

router.get(
  '/courses/:courseId/analytics/enrollments',
  authorizeRoles(['instructor', 'admin', 'super_admin']),
  validate(analyticsValidation.courseAnalytics),
  controller.getEnrollmentTrends
);

router.get(
  '/courses/:courseId/analytics/demographics',
  authorizeRoles(['instructor', 'admin', 'super_admin']),
  validate(analyticsValidation.courseId),
  controller.getStudentDemographics
);

router.get(
  '/courses/:courseId/analytics/engagement',
  authorizeRoles(['instructor', 'admin', 'super_admin']),
  validate(analyticsValidation.courseId),
  controller.getEngagementMetrics
);

router.get(
  '/courses/:courseId/analytics/content-engagement',
  authorizeRoles(['instructor', 'admin', 'super_admin']),
  validate(analyticsValidation.contentEngagement),
  controller.getContentEngagementOverview
);

router.get(
  '/courses/:courseId/analytics/content-matrix',
  authorizeRoles(['instructor', 'admin', 'super_admin']),
  validate(analyticsValidation.contentMatrix),
  controller.getContentEngagementMatrix
);

export default router;

































