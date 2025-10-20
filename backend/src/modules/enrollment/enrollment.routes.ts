import express, { Request, Response, NextFunction } from 'express';
import { EnrollmentController } from './enrollment.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validate.middleware';
import { enrollmentSchemas } from './enrollment.validate';

const router = express.Router();
const enrollmentController = new EnrollmentController();

// All routes require authentication
router.use(authMiddleware);

// ===== ENROLLMENT MANAGEMENT ROUTES =====

// Get all enrollments (Admin/Instructor only)
router.get(
  '/',
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR]),
  validateQuery(enrollmentSchemas.enrollmentQuery),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.getAllEnrollments(req, res, next)
);

// Get enrollment by ID (All authenticated users)
router.get(
  '/:id',
  validateParams(enrollmentSchemas.enrollmentId),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.getEnrollmentById(req, res, next)
);

// Create new enrollment (All authenticated users)
router.post(
  '/',
  validateBody(enrollmentSchemas.createEnrollment),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.createEnrollment(req, res, next)
);

// Update enrollment (Admin/Instructor only)
router.put(
  '/:id',
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR]),
  validateParams(enrollmentSchemas.enrollmentId),
  validateBody(enrollmentSchemas.updateEnrollment),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.updateEnrollment(req, res, next)
);

// Update enrollment progress (All authenticated users)
router.put(
  '/:id/progress',
  validateParams(enrollmentSchemas.enrollmentId),
  validateBody(enrollmentSchemas.updateProgress),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.updateEnrollmentProgress(req, res, next)
);

// Delete enrollment (Admin/Instructor only)
router.delete(
  '/:id',
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR]),
  validateParams(enrollmentSchemas.enrollmentId),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.deleteEnrollment(req, res, next)
);

// Complete enrollment (Admin/Instructor only)
router.patch(
  '/:id/complete',
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR]),
  validateParams(enrollmentSchemas.enrollmentId),
  validateBody(enrollmentSchemas.completeEnrollment),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.completeEnrollment(req, res, next)
);

// Allow tests: PUT complete as used by test suite
router.put(
  '/:id/complete',
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR]),
  validateParams(enrollmentSchemas.enrollmentId),
  validateBody(enrollmentSchemas.completeEnrollment),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.completeEnrollment(req, res, next)
);

// ===== ENROLLMENT QUERY ROUTES =====

// Get enrollments by user ID (All authenticated users)
router.get(
  '/user/:userId',
  validateParams(enrollmentSchemas.userId),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.getEnrollmentsByUserId(req, res, next)
);

// Get enrollments by course ID (All authenticated users)
router.get(
  '/course/:courseId',
  validateParams(enrollmentSchemas.courseId),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.getEnrollmentsByCourseId(req, res, next)
);

// Check if user is enrolled in course (All authenticated users)
router.get(
  '/user/:userId/course/:courseId',
  validateParams(enrollmentSchemas.userId),
  validateParams(enrollmentSchemas.courseId),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.checkUserEnrollment(req, res, next)
);

// Get enrollment by user and course (All authenticated users)
router.get(
  '/user/:userId/course/:courseId/enrollment',
  validateParams(enrollmentSchemas.userId),
  validateParams(enrollmentSchemas.courseId),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.getEnrollmentByUserAndCourse(req, res, next)
);

// ===== ENROLLMENT STATISTICS ROUTES =====

// Get enrollment statistics (Admin/Instructor only)
router.get(
  '/stats/overview',
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR]),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.getEnrollmentStats(req, res, next)
);

// Get course enrollment statistics (Admin/Instructor only)
router.get(
  '/stats/course/:courseId',
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR]),
  validateParams(enrollmentSchemas.courseId),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.getCourseEnrollmentStats(req, res, next)
);

// Get user enrollment statistics (All authenticated users)
router.get(
  '/stats/user/:userId',
  validateParams(enrollmentSchemas.userId),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.getUserEnrollmentStats(req, res, next)
);

export default router;

