/**
 * AI Routes
 * API routes for AI features
 */

import { Router } from 'express';
import { AIController } from './ai.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';


const router = Router();
const controller = new AIController();

// All AI routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /ai/status
 * @desc    Check AI service status
 * @access  Private
 */
router.get('/status', controller.getStatus);

/**
 * @route   POST /ai/chat
 * @desc    Chat with AI assistant
 * @access  Private
 */
router.post('/chat', controller.chat);

router.post('/lesson-chat', controller.lessonChat);
router.post('/lesson-summary', controller.lessonSummary);

/**
 * @route   POST /ai/generate-quiz
 * @desc    Generate quiz questions from course content
 * @access  Private (Instructor/Admin only - TODO: add role check)
 */
router.post('/generate-quiz', controller.generateQuiz);

/**
 * @route   GET /ai/recommendations
 * @desc    Get content recommendations
 * @access  Private
 */
router.get('/recommendations', controller.getRecommendations);

/**
 * @route   GET /ai/analytics
 * @desc    Get learning analytics
 * @access  Private
 */
router.get('/analytics', controller.getAnalytics);

// ==================== INSTRUCTOR AI FEATURES ====================

/**
 * @route   POST /ai/instructor/generate-outline
 * @desc    Generate course outline from topic
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/generate-outline', controller.generateCourseOutline);

/**
 * @route   POST /ai/instructor/suggest-improvements
 * @desc    Suggest course improvements
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/suggest-improvements', controller.suggestCourseImprovements);

/**
 * @route   POST /ai/instructor/analyze-students
 * @desc    Analyze student performance
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/analyze-students', controller.analyzeStudents);

/**
 * @route   POST /ai/instructor/generate-feedback
 * @desc    Generate feedback for assignment submission
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/generate-feedback', controller.generateFeedback);

/**
 * @route   POST /ai/instructor/auto-grade
 * @desc    Auto-grade assignment (objective questions)
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/auto-grade', controller.autoGrade);

/**
 * @route   POST /ai/instructor/generate-thumbnail
 * @desc    Generate thumbnail prompt for course
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/generate-thumbnail', controller.generateThumbnail);

/**
 * @route   POST /ai/instructor/generate-lesson-content
 * @desc    Generate detailed content for a lesson
 * @access  Private (Instructor/Admin only)
 */
router.post('/instructor/generate-lesson-content', controller.generateLessonContent);

// ==================== AI GRADER ====================

/**
 * @route   POST /ai/grader/code
 * @desc    Chấm điểm bài code
 * @access  Private (Instructor/Admin only)
 */
router.post(
  '/grader/code',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  controller.gradeCode
);

/**
 * @route   POST /ai/grader/essay
 * @desc    Chấm điểm bài luận
 * @access  Private (Instructor/Admin only)
 */
router.post(
  '/grader/essay',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  controller.gradeEssay
);

// ==================== TESTING ====================

/**
 * @route   POST /ai/test-provider
 * @desc    Test specific AI provider (for debugging)
 * @access  Private
 */
router.post('/test-provider', controller.testProvider);

export default router;



