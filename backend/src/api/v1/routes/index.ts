/**
 * API v1 Routes
 * Centralized exports for v1 API routes
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import { userAdminRoutes, UserModuleController } from '../../../modules/user';
import { AuthController } from '../../../modules/auth/auth.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { validateBody } from '../../../middlewares/validate.middleware';
import { userValidation as userSchemas } from '../../../validates/user.validate';
import { authSchemas } from '../../../validates/auth.validate';
import { default as courseContentRoutes } from '../../../modules/course-content/course-content.routes';
import { default as notificationsRoutes } from '../../../modules/notifications/notifications.routes';
import { default as quizRoutes } from '../../../modules/quiz/quiz.routes';
import { default as assignmentRoutes } from '../../../modules/assignment/assignment.routes';
import { default as gradeRoutes } from '../../../modules/grade/grade.routes';
import { default as liveStreamRoutes } from '../../../modules/livestream/livestream.routes';
import { default as analyticsRoutes } from '../../../modules/analytics/analytics.routes';
import systemSettingsRoutes from '../../../modules/system-settings/system.settings.routes';
import { courseRoutes } from '../../../modules/course/course.routes';
import categoryRoutes from '../../../modules/category/category.routes';
import logger from '../../../utils/logger.util';

const router = Router();

// Mount v1 routes
router.use('/auth', authRoutes);

// Explicit self-service endpoints FIRST to avoid any ambiguity with admin alias
// This ensures tests for /api/users/profile and /api/users/change-password don't get shadowed by admin routes
const userController = new UserModuleController();
const authController = new AuthController();

router.get('/users/profile', authMiddleware, (req, res, next) => userController.getProfile(req, res, next));
router.put('/users/profile', authMiddleware, validateBody(userSchemas.updateProfile), (req, res, next) => userController.updateProfile(req, res, next));
router.put('/users/change-password', authMiddleware, validateBody(authSchemas.changePassword), (req, res, next) => authController.changePassword(req, res, next));

// User self-service routes should come BEFORE admin alias to avoid /users/profile matching admin dynamic routes
logger.info('Registering v1 user self-service at /users');
router.use('/users', userRoutes);  // User self-service routes

// Admin user management routes
logger.info('Registering v1 admin at /admin/users');
router.use('/admin/users', userAdminRoutes);

// Backward-compatible alias: some tests expect admin endpoints under /users (e.g., GET /api/users)
// Mount admin routes under /users as well (order after self-service to avoid conflicts)
logger.info('Registering v1 admin alias at /users (after self-service)');
router.use('/users', userAdminRoutes);
router.use('/courses', courseRoutes);
router.use('/categories', categoryRoutes);
router.use('/course-content', courseContentRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/quizzes', quizRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/grades', gradeRoutes);
router.use('/livestreams', liveStreamRoutes);
router.use('/analytics', analyticsRoutes);
// System settings (admin only)
router.use('/admin/settings', systemSettingsRoutes);

export default router;

