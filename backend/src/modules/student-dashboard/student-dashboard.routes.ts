import { Router } from 'express';
import { StudentDashboardController } from './student-dashboard.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * Student Dashboard Routes
 * 
 * All routes require authentication and student role
 */

// Apply authentication to all routes
router.use(authMiddleware);

// Only allow students (and admins for testing)
router.use(authorizeRoles(['student', 'admin', 'super_admin']));

/**
 * @route GET /api/student/dashboard/progress
 * @desc Get learning progress stats (lessons, assignments, quizzes)
 * @access Student
 */
router.get('/progress', StudentDashboardController.getProgressStats);

/**
 * @route GET /api/student/dashboard/daily-goal
 * @desc Get daily learning goal and streak
 * @access Student
 */
router.get('/daily-goal', StudentDashboardController.getDailyGoal);

/**
 * @route PUT /api/student/dashboard/daily-goal
 * @desc Update daily learning goal target
 * @access Student
 */
router.put('/daily-goal', StudentDashboardController.updateDailyGoal);

/**
 * @route GET /api/student/dashboard/gamification
 * @desc Get gamification stats (points, badges, achievements)
 * @access Student
 */
router.get('/gamification', StudentDashboardController.getGamificationStats);

/**
 * @route GET /api/student/dashboard/recommended-courses
 * @desc Get recommended courses for the student
 * @access Student
 */
router.get('/recommended-courses', StudentDashboardController.getRecommendedCourses);

/**
 * @route POST /api/student/dashboard/activity
 * @desc Log learning activity (for tracking study time)
 * @access Student
 */
router.post('/activity', StudentDashboardController.logActivity);

export default router;
