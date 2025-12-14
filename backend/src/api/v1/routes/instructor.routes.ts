/**
 * Instructor Routes
 * Centralized endpoints for instructor-specific functionality
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware, authorizeRoles } from '../../../middlewares/auth.middleware';
import { UserRole } from '../../../constants/roles.enum';
import { InstructorController } from './instructor.controller';

const router = Router();
const controller = new InstructorController();

// All routes require authentication and instructor role
router.use(authMiddleware);
router.use(authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]));

// ===================================
// DASHBOARD
// ===================================

/**
 * @route   GET /api/instructor/dashboard/stats
 * @desc    Get instructor dashboard statistics
 * @access  Instructor, Admin
 */
router.get('/dashboard/stats', (req: Request, res: Response, next: NextFunction) => 
  controller.getDashboardStats(req, res, next)
);

/**
 * @route   GET /api/instructor/activities/recent
 * @desc    Get recent activities (enrollments, submissions, reviews)
 * @access  Instructor, Admin
 */
router.get('/activities/recent', (req: Request, res: Response, next: NextFunction) => 
  controller.getRecentActivities(req, res, next)
);

// ===================================
// STUDENTS MANAGEMENT
// ===================================

/**
 * @route   GET /api/instructor/students
 * @desc    Get all students enrolled in instructor's courses
 * @access  Instructor, Admin
 */
router.get('/students', (req: Request, res: Response, next: NextFunction) => 
  controller.getAllStudents(req, res, next)
);

/**
 * @route   DELETE /api/instructor/enrollments/:enrollmentId
 * @desc    Unenroll a student from a course
 * @access  Instructor, Admin
 */
router.delete('/enrollments/:enrollmentId', (req: Request, res: Response, next: NextFunction) => 
  controller.unenrollStudent(req, res, next)
);

// ===================================
// ASSIGNMENTS & GRADING
// ===================================

/**
 * @route   GET /api/instructor/assignments/pending
 * @desc    Get all pending submissions across all courses
 * @access  Instructor, Admin
 */
router.get('/assignments/pending', (req: Request, res: Response, next: NextFunction) => 
  controller.getPendingSubmissions(req, res, next)
);

/**
 * @route   GET /api/instructor/courses/:courseId/assignments
 * @desc    Get all assignments for a specific course with submission stats
 * @access  Instructor, Admin
 */
router.get('/courses/:courseId/assignments', (req: Request, res: Response, next: NextFunction) => 
  controller.getCourseAssignments(req, res, next)
);

/**
 * @route   GET /api/instructor/assignments/:assignmentId/submissions
 * @desc    Get all submissions for an assignment with grading status
 * @access  Instructor, Admin
 */
router.get('/assignments/:assignmentId/submissions', (req: Request, res: Response, next: NextFunction) => 
  controller.getAssignmentSubmissions(req, res, next)
);

/**
 * @route   POST /api/instructor/submissions/:submissionId/grade
 * @desc    Grade a submission
 * @access  Instructor, Admin
 */
router.post('/submissions/:submissionId/grade', (req: Request, res: Response, next: NextFunction) => 
  controller.gradeSubmission(req, res, next)
);

// ===================================
// NOTIFICATIONS
// ===================================

/**
 * @route   POST /api/instructor/notifications/bulk
 * @desc    Send bulk notification to students
 * @access  Instructor, Admin
 */
router.post('/notifications/bulk', (req: Request, res: Response, next: NextFunction) => 
  controller.sendBulkNotification(req, res, next)
);

export default router;
