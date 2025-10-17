import express, { Request, Response, NextFunction } from 'express';
import { CourseController } from './course.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validate.middleware';
import { courseSchemas } from './course.validate';

const router = express.Router();
const courseController = new CourseController();

// All routes require authentication
router.use(authMiddleware);

// ===== COURSE MANAGEMENT ROUTES =====

// Get all courses (All authenticated users)
router.get(
  '/',
  validateQuery(courseSchemas.courseQuery),
  (req: Request, res: Response, next: NextFunction) => courseController.getAllCourses(req, res, next)
);

// Get course by ID (All authenticated users)
router.get(
  '/:id',
  validateParams(courseSchemas.courseId),
  (req: Request, res: Response, next: NextFunction) => courseController.getCourseById(req, res, next)
);

// Create new course (Instructor/Admin only)
router.post(
  '/',
  authorizeRoles(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateBody(courseSchemas.createCourse),
  (req: Request, res: Response, next: NextFunction) => courseController.createCourse(req, res, next)
);

// Update course (Instructor/Admin only)
router.put(
  '/:id',
  authorizeRoles(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateParams(courseSchemas.courseId),
  validateBody(courseSchemas.updateCourse),
  (req: Request, res: Response, next: NextFunction) => courseController.updateCourse(req, res, next)
);

// Delete course (Instructor/Admin only)
router.delete(
  '/:id',
  authorizeRoles(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateParams(courseSchemas.courseId),
  (req: Request, res: Response, next: NextFunction) => courseController.deleteCourse(req, res, next)
);

// ===== COURSE STATUS MANAGEMENT =====

// Publish course (Instructor/Admin only)
router.patch(
  '/:id/publish',
  authorizeRoles(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateParams(courseSchemas.courseId),
  (req: Request, res: Response, next: NextFunction) => courseController.publishCourse(req, res, next)
);

// Archive course (Instructor/Admin only)
router.patch(
  '/:id/archive',
  authorizeRoles(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateParams(courseSchemas.courseId),
  (req: Request, res: Response, next: NextFunction) => courseController.archiveCourse(req, res, next)
);

// Unpublish course (Instructor/Admin only)
router.patch(
  '/:id/unpublish',
  authorizeRoles(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateParams(courseSchemas.courseId),
  (req: Request, res: Response, next: NextFunction) => courseController.unpublishCourse(req, res, next)
);

// ===== COURSE DISCOVERY ROUTES =====

// Get courses by instructor (All authenticated users)
router.get(
  '/instructor/:instructorId',
  validateParams(courseSchemas.instructorId),
  validateQuery(courseSchemas.courseQuery),
  (req: Request, res: Response, next: NextFunction) => courseController.getCoursesByInstructor(req, res, next)
);

// Search courses (All authenticated users)
router.post(
  '/search',
  validateBody(courseSchemas.courseSearch),
  validateQuery(courseSchemas.courseQuery),
  (req: Request, res: Response, next: NextFunction) => courseController.searchCourses(req, res, next)
);

// Get popular courses (All authenticated users)
router.get(
  '/popular',
  validateQuery(courseSchemas.courseQuery),
  (req: Request, res: Response, next: NextFunction) => courseController.getPopularCourses(req, res, next)
);

// Get courses by tags (All authenticated users)
router.get(
  '/tags',
  validateQuery(courseSchemas.courseQuery),
  (req: Request, res: Response, next: NextFunction) => courseController.getCoursesByTags(req, res, next)
);

// For tests: get course enrollments (All authenticated users)
router.get(
  '/:id/enrollments',
  validateParams(courseSchemas.courseId),
  (req: Request, res: Response, next: NextFunction) => courseController.getCourseEnrollments(req, res, next)
);

// ===== COURSE ANALYTICS ROUTES =====

// Get course analytics (Instructor/Admin only)
router.get(
  '/:id/analytics',
  authorizeRoles(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateParams(courseSchemas.courseId),
  validateQuery(courseSchemas.courseAnalyticsQuery),
  (req: Request, res: Response, next: NextFunction) => courseController.getCourseAnalytics(req, res, next)
);

// Get course progress (Enrolled students only)
router.get(
  '/:id/progress',
  validateParams(courseSchemas.courseId),
  (req: Request, res: Response, next: NextFunction) => courseController.getCourseProgress(req, res, next)
);

export default router;