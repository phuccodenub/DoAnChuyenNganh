/**
 * AI Routes
 * API routes for AI features
 */

import { Router } from 'express';
import { AIController } from './ai.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

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

export default router;



