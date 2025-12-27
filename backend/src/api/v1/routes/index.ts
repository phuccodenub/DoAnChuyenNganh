/**
 * API v1 Routes
 * Centralized exports for v1 API routes
 */

console.log('[V1_ROUTES] Starting imports...');
import { Router, Request, Response, NextFunction } from 'express';
console.log('[V1_ROUTES] express imported');

import authRoutes from './auth.routes';
console.log('[V1_ROUTES] authRoutes imported');

import userRoutes from './user.routes';
console.log('[V1_ROUTES] userRoutes imported');

import courseRoutes from './course.routes';
console.log('[V1_ROUTES] courseRoutes imported');

import enrollmentRoutes from './enrollment.routes';
console.log('[V1_ROUTES] enrollmentRoutes imported');

import lessonRoutes from './lesson.routes';
console.log('[V1_ROUTES] lessonRoutes imported');

import sectionRoutes from './section.routes';
console.log('[V1_ROUTES] sectionRoutes imported');

import assignmentRoutes from './assignment.routes';
console.log('[V1_ROUTES] assignmentRoutes imported');

import quizRoutes from './quiz.routes';
console.log('[V1_ROUTES] quizRoutes imported');

console.log('[V1_ROUTES] Importing user module...');
import { userAdminRoutes, UserModuleController } from '../../../modules/user';
console.log('[V1_ROUTES] user module imported');

import { UserAdminController } from '../../../modules/user/user.admin.controller';
console.log('[V1_ROUTES] UserAdminController imported');

import { courseAdminRoutes } from '../../../modules/course/course.admin.routes';
console.log('[V1_ROUTES] courseAdminRoutes imported');

import { AuthController } from '../../../modules/auth/auth.controller';
console.log('[V1_ROUTES] AuthController imported');

import { authMiddleware, authorizeRoles } from '../../../middlewares/auth.middleware';
console.log('[V1_ROUTES] auth middleware imported');

import { UserRole } from '../../../constants/roles.enum';
console.log('[V1_ROUTES] UserRole imported');

import { validateBody } from '../../../middlewares/validate.middleware';
console.log('[V1_ROUTES] validateBody imported');

import { userValidation as userSchemas } from '../../../validates/user.validate';
console.log('[V1_ROUTES] userValidation imported');

import { authSchemas } from '../../../validates/auth.validate';
console.log('[V1_ROUTES] authSchemas imported');

console.log('[V1_ROUTES] Importing course-content...');
import { default as courseContentRoutes } from '../../../modules/course-content/course-content.routes';
console.log('[V1_ROUTES] courseContentRoutes imported');

import { default as notificationsRoutes } from '../../../modules/notifications/notifications.routes';
console.log('[V1_ROUTES] notificationsRoutes imported');

import { default as gradeRoutes } from '../../../modules/grade/grade.routes';
console.log('[V1_ROUTES] gradeRoutes imported');

import { default as liveStreamRoutes } from '../../../modules/livestream/livestream.routes';
console.log('[V1_ROUTES] liveStreamRoutes imported');

import { default as analyticsRoutes } from '../../../modules/analytics/analytics.routes';
console.log('[V1_ROUTES] analyticsRoutes imported');

import systemSettingsRoutes from '../../../modules/system-settings/system.settings.routes';
console.log('[V1_ROUTES] systemSettingsRoutes imported');

import categoryRoutes from '../../../modules/category/category.routes';
console.log('[V1_ROUTES] categoryRoutes imported');

console.log('[V1_ROUTES] Importing AI module...');
import { aiRoutes, aiRoutesV2 } from '../../../modules/ai';
console.log('[V1_ROUTES] AI module imported');

import moderationRoutes from '../../../modules/moderation/moderation.routes';
console.log('[V1_ROUTES] moderationRoutes imported');

import { default as reviewRoutes } from '../../../modules/review/review.routes';
console.log('[V1_ROUTES] reviewRoutes imported');

console.log('[V1_ROUTES] Importing files module...');
import { filesRoutes, mediaRoutes } from '../../../modules/files';
console.log('[V1_ROUTES] files module imported');

import { conversationRoutes, messageRoutes } from '../../../modules/conversation';
console.log('[V1_ROUTES] conversation module imported');

import certificateRoutes from '../../../modules/certificate/certificate.routes';
console.log('[V1_ROUTES] certificateRoutes imported');

import { chatRoutes } from '../../../modules/chat';
console.log('[V1_ROUTES] chatRoutes imported');

import logger from '../../../utils/logger.util';
console.log('[V1_ROUTES] logger imported');

import activityLogsAdminRoutes from '../../../modules/activity-logs/activity-logs.admin.routes';
console.log('[V1_ROUTES] activityLogsAdminRoutes imported');

import { ReportsAdminController } from '../../../modules/reports/reports.admin.controller';
console.log('[V1_ROUTES] ReportsAdminController imported');

import instructorRoutes from './instructor.routes';
console.log('[V1_ROUTES] instructorRoutes imported');

console.log('[V1_ROUTES] All imports complete, creating router...');

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
const reportsAdminControllerInstance = new ReportsAdminController();
router.get('/admin/dashboard/stats', authMiddleware, authorizeRoles(['admin', 'super_admin']), (req: Request, res: Response, next: NextFunction) => userAdminControllerInstance.getDashboardStats(req, res, next));
router.get('/admin/activities/recent', authMiddleware, authorizeRoles(['admin', 'super_admin']), (req: Request, res: Response, next: NextFunction) => userAdminControllerInstance.getRecentActivities(req, res, next));
router.get('/admin/analytics/user-growth', authMiddleware, authorizeRoles(['admin', 'super_admin']), (req: Request, res: Response, next: NextFunction) => userAdminControllerInstance.getUserGrowth(req, res, next));
router.get('/admin/analytics/enrollment-trend', authMiddleware, authorizeRoles(['admin', 'super_admin']), (req: Request, res: Response, next: NextFunction) => userAdminControllerInstance.getEnrollmentTrend(req, res, next));
router.get('/admin/analytics/top-instructors', authMiddleware, authorizeRoles(['admin', 'super_admin']), (req: Request, res: Response, next: NextFunction) => userAdminControllerInstance.getTopInstructors(req, res, next));

// Admin reports endpoints (used by Reports page)
router.get('/admin/reports/stats', authMiddleware, authorizeRoles(['admin', 'super_admin']), (req: Request, res: Response, next: NextFunction) => reportsAdminControllerInstance.getStats(req, res, next));
router.get('/admin/reports/top-courses', authMiddleware, authorizeRoles(['admin', 'super_admin']), (req: Request, res: Response, next: NextFunction) => reportsAdminControllerInstance.getTopCourses(req, res, next));
router.get('/admin/analytics/login-trend', authMiddleware, authorizeRoles(['admin', 'super_admin']), (req: Request, res: Response, next: NextFunction) => reportsAdminControllerInstance.getLoginTrend(req, res, next));

// Admin course management routes
logger.info('Registering v1 admin courses at /admin/courses');
router.use('/admin/courses', courseAdminRoutes);

// Admin activity logs routes
logger.info('Registering v1 admin activity logs at /admin/activity-logs');
router.use('/admin/activity-logs', activityLogsAdminRoutes);

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

// Instructor-specific routes
logger.info('Registering v1 instructor at /instructor');
router.use('/instructor', instructorRoutes);

// Student dashboard routes
import studentDashboardRoutes from '../../../modules/student-dashboard/student-dashboard.routes';
logger.info('Registering v1 student dashboard at /student/dashboard');
router.use('/student/dashboard', studentDashboardRoutes);

// Module-based routes (from refactor)
router.use('/course-content', courseContentRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/grades', gradeRoutes);
router.use('/live-sessions', liveStreamRoutes);
router.use('/analytics', analyticsRoutes);

// Assignment and quiz routes
router.use('/assignments', assignmentRoutes);
router.use('/quizzes', quizRoutes);

// AI Analysis routes - Register BEFORE other /ai routes to avoid route conflicts
// More specific routes should be registered before generic ones
import aiAnalysisRoutes from '../../../modules/ai/routes/ai-analysis.routes';
logger.info('Registering v1 AI Analysis at /ai/analysis');
router.use('/ai/analysis', aiAnalysisRoutes);

// AI routes (legacy + new) - Register after /ai/analysis to avoid conflicts
router.use('/ai', aiRoutes);
router.use('/ai', aiRoutesV2); // New AI system routes

// Moderation routes
router.use('/moderation', moderationRoutes);

// Review routes
router.use('/reviews', reviewRoutes);

// System settings routes (admin only)
router.use('/system-settings', systemSettingsRoutes);

// Files and media routes
router.use('/files', filesRoutes);
router.use('/media', mediaRoutes);

// DM Chat routes
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);

// Certificate routes
router.use('/certificates', certificateRoutes);

// Course Chat routes (Socket.IO fallback)
router.use('/chat', chatRoutes);

export default router;
