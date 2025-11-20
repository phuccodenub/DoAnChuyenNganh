import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { analyticsValidation } from './analytics.validate';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();
const controller = new AnalyticsController();

router.use(authMiddleware);

router.get('/courses/:courseId/stats', validate(analyticsValidation.courseId), controller.courseStats);
router.get('/users/:userId/activities', validate(analyticsValidation.userActivities), controller.userActivities);

export default router;































