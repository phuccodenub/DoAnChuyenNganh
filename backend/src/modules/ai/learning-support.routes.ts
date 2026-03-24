/**
 * Learning Support Routes
 * API routes for Learning Support features (Remediation, Study Planner, Flashcards)
 * 
 * Based on: docs/AI/16_INSTRUCTOR_STUDENT_LEARNING_SUPPORT_PLAN_MVP.md
 */

import { Router } from 'express';
import { LearningSupportController } from './learning-support.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';

const router = Router();
const controller = new LearningSupportController();

// All routes require authentication
router.use(authMiddleware);

// ==================== STUDENT ENDPOINTS ====================

/**
 * @route   GET /learning-support/remediation
 * @desc    Get remediation cards for a quiz attempt
 * @query   attemptId (required), maxCards (optional, default 5)
 * @access  Private (Student)
 */
router.get('/remediation', controller.getRemediation);

/**
 * @route   DELETE /learning-support/remediation/:attemptId/cache
 * @desc    Clear remediation cache for an attempt
 * @access  Private (Student)
 */
router.delete('/remediation/:attemptId/cache', controller.clearRemediationCache);

/**
 * @route   GET /learning-support/plan
 * @desc    Get study plan for the current user in a course
 * @query   courseId (required)
 * @access  Private (Student)
 */
router.get('/plan', controller.getStudyPlan);

/**
 * @route   DELETE /learning-support/plan/cache
 * @desc    Clear study plan cache
 * @query   courseId (required)
 * @access  Private (Student)
 */
router.delete('/plan/cache', controller.clearStudyPlanCache);

/**
 * @route   GET /learning-support/flashcards
 * @desc    Get flashcards for a lesson
 * @query   lessonId (required)
 * @access  Private (Student)
 * @status  Coming soon (MVP-1)
 */
router.get('/flashcards', controller.getFlashcards);

/**
 * @route   POST /learning-support/practice
 * @desc    Generate practice questions
 * @body    { mode: 'retake' | 'concept', targetId: string }
 * @access  Private (Student)
 * @status  Coming soon (MVP-1)
 */
router.post('/practice', controller.generatePractice);

// ==================== INSTRUCTOR ENDPOINTS ====================

/**
 * @route   GET /learning-support/instructor/insights
 * @desc    Get aggregated insights for a course (weak areas, recommendations)
 * @query   courseId (required)
 * @access  Private (Instructor/Admin)
 */
router.get(
  '/instructor/insights',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  controller.getInstructorInsights
);

/**
 * @route   DELETE /learning-support/instructor/insights/cache
 * @desc    Clear instructor insights cache
 * @query   courseId (required)
 * @access  Private (Instructor/Admin)
 */
router.delete(
  '/instructor/insights/cache',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  controller.clearInstructorInsightsCache
);

export default router;
