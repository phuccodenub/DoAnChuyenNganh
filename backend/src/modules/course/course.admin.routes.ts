import { Router, Request, Response, NextFunction } from 'express';
import { CourseAdminController } from './course.admin.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';

const router = Router();
const courseAdminController = new CourseAdminController();

// All routes require authentication
router.use(authMiddleware);

// All routes require admin or super_admin role
router.use(authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN]));

// ===== IMPORTANT: SPECIFIC ROUTES MUST COME BEFORE DYNAMIC ROUTES =====

/**
 * Get course statistics
 * GET /admin/courses/stats
 * MUST BE BEFORE /:id route
 */
router.get(
  '/stats',
  (req: Request, res: Response, next: NextFunction) => courseAdminController.getCourseStats(req, res, next)
);

/**
 * Bulk delete courses
 * POST /admin/courses/bulk-delete
 */
router.post(
  '/bulk-delete',
  (req: Request, res: Response, next: NextFunction) => courseAdminController.bulkDeleteCourses(req, res, next)
);

/**
 * Bulk update course status
 * POST /admin/courses/bulk-status
 */
router.post(
  '/bulk-status',
  (req: Request, res: Response, next: NextFunction) => courseAdminController.bulkUpdateStatus(req, res, next)
);

/**
 * Bulk action on courses
 * POST /admin/courses/bulk-action
 */
router.post(
  '/bulk-action',
  (req: Request, res: Response, next: NextFunction) => courseAdminController.bulkAction(req, res, next)
);

// ===== GENERIC ROUTES =====

/**
 * Get all courses
 * GET /admin/courses
 */
router.get(
  '/',
  (req: Request, res: Response, next: NextFunction) => courseAdminController.getAllCourses(req, res, next)
);

/**
 * Get course by ID
 * GET /admin/courses/:id
 */
router.get(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => courseAdminController.getCourseById(req, res, next)
);

/**
 * Update course
 * PUT /admin/courses/:id
 */
router.put(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => courseAdminController.updateCourse(req, res, next)
);

/**
 * Delete course
 * DELETE /admin/courses/:id
 */
router.delete(
  '/:id',
  (req: Request, res: Response, next: NextFunction) => courseAdminController.deleteCourse(req, res, next)
);

/**
 * Change course status
 * PATCH /admin/courses/:id/status
 */
router.patch(
  '/:id/status',
  (req: Request, res: Response, next: NextFunction) => courseAdminController.changeCourseStatus(req, res, next)
);

/**
 * Get course students
 * GET /admin/courses/:id/students
 */
router.get(
  '/:id/students',
  (req: Request, res: Response, next: NextFunction) => courseAdminController.getCourseStudents(req, res, next)
);

export { router as courseAdminRoutes };
export default router;
