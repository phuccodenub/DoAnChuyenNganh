import { Router } from 'express';
import { EnrollmentController } from './enrollment.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validate.middleware';
import { enrollmentSchemas } from './enrollment.validate';

const router = Router();
const enrollmentController = new EnrollmentController();

// All routes require authentication
router.use(authMiddleware);

// ===== ENROLLMENT MANAGEMENT ROUTES =====

// Get all enrollments (Admin/Instructor only)
router.get(
  '/',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validateQuery(enrollmentSchemas.enrollmentQuery),
  (req, res, next) => enrollmentController.getAllEnrollments(req, res, next)
);

// Get enrollment by ID (All authenticated users)
router.get(
  '/:id',
  validateParams(enrollmentSchemas.enrollmentId),
  (req, res, next) => enrollmentController.getEnrollmentById(req, res, next)
);

// Create new enrollment (All authenticated users)
router.post(
  '/',
  validateBody(enrollmentSchemas.createEnrollment),
  (req, res, next) => enrollmentController.createEnrollment(req, res, next)
);

// Update enrollment (Admin/Instructor only)
router.put(
  '/:id',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validateParams(enrollmentSchemas.enrollmentId),
  validateBody(enrollmentSchemas.updateEnrollment),
  (req, res, next) => enrollmentController.updateEnrollment(req, res, next)
);

// Delete enrollment (Admin/Instructor only)
router.delete(
  '/:id',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validateParams(enrollmentSchemas.enrollmentId),
  (req, res, next) => enrollmentController.deleteEnrollment(req, res, next)
);

// Complete enrollment (Admin/Instructor only)
router.patch(
  '/:id/complete',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validateParams(enrollmentSchemas.enrollmentId),
  validateBody(enrollmentSchemas.completeEnrollment),
  (req, res, next) => enrollmentController.completeEnrollment(req, res, next)
);

// ===== ENROLLMENT QUERY ROUTES =====

// Get enrollments by user ID (All authenticated users)
router.get(
  '/user/:userId',
  validateParams(enrollmentSchemas.userId),
  (req, res, next) => enrollmentController.getEnrollmentsByUserId(req, res, next)
);

// Get enrollments by course ID (All authenticated users)
router.get(
  '/course/:courseId',
  validateParams(enrollmentSchemas.courseId),
  (req, res, next) => enrollmentController.getEnrollmentsByCourseId(req, res, next)
);

// Check if user is enrolled in course (All authenticated users)
router.get(
  '/user/:userId/course/:courseId',
  validateParams(enrollmentSchemas.userId),
  validateParams(enrollmentSchemas.courseId),
  (req, res, next) => enrollmentController.checkUserEnrollment(req, res, next)
);

// Get enrollment by user and course (All authenticated users)
router.get(
  '/user/:userId/course/:courseId/enrollment',
  validateParams(enrollmentSchemas.userId),
  validateParams(enrollmentSchemas.courseId),
  (req, res, next) => enrollmentController.getEnrollmentByUserAndCourse(req, res, next)
);

// ===== ENROLLMENT STATISTICS ROUTES =====

// Get enrollment statistics (Admin/Instructor only)
router.get(
  '/stats/overview',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  (req, res, next) => enrollmentController.getEnrollmentStats(req, res, next)
);

// Get course enrollment statistics (Admin/Instructor only)
router.get(
  '/stats/course/:courseId',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validateParams(enrollmentSchemas.courseId),
  (req, res, next) => enrollmentController.getCourseEnrollmentStats(req, res, next)
);

// Get user enrollment statistics (All authenticated users)
router.get(
  '/stats/user/:userId',
  validateParams(enrollmentSchemas.userId),
  (req, res, next) => enrollmentController.getUserEnrollmentStats(req, res, next)
);

export default router;

