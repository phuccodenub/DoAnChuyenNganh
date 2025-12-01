/**
 * API v1 Routes
 * Centralized exports for v1 API routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import courseRoutes from './course.routes';
import enrollmentRoutes from './enrollment.routes';
import lessonRoutes from './lesson.routes';
import sectionRoutes from './section.routes';
import assignmentRoutes from './assignment.routes';
import quizRoutes from './quiz.routes';
import { userAdminRoutes, UserModuleController } from '../../../modules/user';
import { UserAdminController } from '../../../modules/user/user.admin.controller';
import { courseAdminRoutes } from '../../../modules/course/course.admin.routes';
import { AuthController } from '../../../modules/auth/auth.controller';
import { authMiddleware, authorizeRoles } from '../../../middlewares/auth.middleware';
import { UserRole } from '../../../constants/roles.enum';
import { validateBody } from '../../../middlewares/validate.middleware';
import { userValidation as userSchemas } from '../../../validates/user.validate';
import { authSchemas } from '../../../validates/auth.validate';
import { default as courseContentRoutes } from '../../../modules/course-content/course-content.routes';
import { default as notificationsRoutes } from '../../../modules/notifications/notifications.routes';
import { default as gradeRoutes } from '../../../modules/grade/grade.routes';
import { default as liveStreamRoutes } from '../../../modules/livestream/livestream.routes';
import { default as analyticsRoutes } from '../../../modules/analytics/analytics.routes';
import systemSettingsRoutes from '../../../modules/system-settings/system.settings.routes';
import categoryRoutes from '../../../modules/category/category.routes';
import { aiRoutes } from '../../../modules/ai';
import moderationRoutes from '../../../modules/moderation/moderation.routes';
import { default as reviewRoutes } from '../../../modules/review/review.routes';
import { filesRoutes, mediaRoutes } from '../../../modules/files';
import logger from '../../../utils/logger.util';

const router = Router();

// Mount v1 routes
router.use('/auth', authRoutes);

// Explicit self-service endpoints FIRST to avoid any ambiguity with admin alias
// This ensures tests for /api/users/profile and /api/users/change-password don't get shadowed by admin routes
const userController = new UserModuleController();
const authController = new AuthController();

router.get('/users/profile', authMiddleware, (req: Request, res: Response, next: NextFunction) => userController.getProfile(req, res, next));
router.put('/users/profile', authMiddleware, validateBody(userSchemas.updateProfile), (req: Request, res: Response, next: NextFunction) => userController.updateProfile(req, res, next));
router.put('/users/change-password', authMiddleware, validateBody(authSchemas.changePassword), (req: Request, res: Response, next: NextFunction) => authController.changePassword(req, res, next));

// User self-service routes should come BEFORE admin alias to avoid /users/profile matching admin dynamic routes
logger.info('Registering v1 user self-service at /users');
router.use('/users', userRoutes);  // User self-service routes

// Admin user management routes
logger.info('Registering v1 admin at /admin/users');
router.use('/admin/users', userAdminRoutes);

// Admin dashboard and analytics routes
logger.info('Registering v1 admin dashboard at /admin/dashboard');
const userAdminControllerInstance = new UserAdminController();
router.get('/admin/dashboard/stats', authMiddleware, authorizeRoles(['admin', 'super_admin']), (req: Request, res: Response, next: NextFunction) => userAdminControllerInstance.getDashboardStats(req, res, next));
router.get('/admin/activities/recent', authMiddleware, authorizeRoles(['admin', 'super_admin']), (req: Request, res: Response, next: NextFunction) => userAdminControllerInstance.getRecentActivities(req, res, next));
router.get('/admin/analytics/user-growth', authMiddleware, authorizeRoles(['admin', 'super_admin']), (req: Request, res: Response, next: NextFunction) => userAdminControllerInstance.getUserGrowth(req, res, next));
router.get('/admin/analytics/enrollment-trend', authMiddleware, authorizeRoles(['admin', 'super_admin']), (req: Request, res: Response, next: NextFunction) => userAdminControllerInstance.getEnrollmentTrend(req, res, next));
router.get('/admin/analytics/top-instructors', authMiddleware, authorizeRoles(['admin', 'super_admin']), (req: Request, res: Response, next: NextFunction) => userAdminControllerInstance.getTopInstructors(req, res, next));

// Admin course management routes
logger.info('Registering v1 admin courses at /admin/courses');
router.use('/admin/courses', courseAdminRoutes);

// Backward-compatible alias: some tests expect admin endpoints under /users (e.g., GET /api/users)
// Mount admin routes under /users as well (order after self-service to avoid conflicts)
logger.info('Registering v1 admin alias at /users (after self-service)');
router.use('/users', userAdminRoutes);

// Course and enrollment routes (from HEAD)
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/lessons', lessonRoutes);
router.use('/sections', sectionRoutes);
router.use('/categories', categoryRoutes);

// Module-based routes (from refactor)
router.use('/course-content', courseContentRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/grades', gradeRoutes);
router.use('/live-sessions', liveStreamRoutes);
router.use('/analytics', analyticsRoutes);

// Assignment and quiz routes
router.use('/assignments', assignmentRoutes);
router.use('/quizzes', quizRoutes);

// AI routes
router.use('/ai', aiRoutes);

// Moderation routes
router.use('/moderation', moderationRoutes);

// Review routes
router.use('/reviews', reviewRoutes);

// System settings routes (admin only)
router.use('/system-settings', systemSettingsRoutes);

// Files and media routes
router.use('/files', filesRoutes);
router.use('/media', mediaRoutes);

export default router;
