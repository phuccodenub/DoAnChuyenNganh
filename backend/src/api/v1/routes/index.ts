/**
 * API v1 Routes
 * Centralized exports for v1 API routes
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import { default as courseContentRoutes } from '../../../modules/course-content/course-content.routes';
import { default as notificationsRoutes } from '../../../modules/notifications/notifications.routes';
import { default as quizRoutes } from '../../../modules/quiz/quiz.routes';
import { default as assignmentRoutes } from '../../../modules/assignment/assignment.routes';
import { default as gradeRoutes } from '../../../modules/grade/grade.routes';
import { default as liveStreamRoutes } from '../../../modules/livestream/livestream.routes';
import { default as analyticsRoutes } from '../../../modules/analytics/analytics.routes';

const router = Router();

// Mount v1 routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/course-content', courseContentRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/quizzes', quizRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/grades', gradeRoutes);
router.use('/livestreams', liveStreamRoutes);
router.use('/analytics', analyticsRoutes);

export default router;

