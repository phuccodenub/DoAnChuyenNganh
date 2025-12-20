/**
 * AI Routes V2
 * REST API routes cho AI features (mới)
 */

import { Router } from 'express';
import { AIControllerV2 } from '../controllers/ai-v2.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';

const router = Router();
const aiController = new AIControllerV2();

/**
 * @route   GET /api/v1/ai/status
 * @desc    Check AI service status and available providers
 * @access  Public
 */
router.get('/status', aiController.getStatus);

/**
 * @route   GET /api/v1/ai/providers
 * @desc    Get list of available AI providers
 * @access  Private
 */
router.get('/providers', authMiddleware, aiController.getProviders);

/**
 * @route   POST /api/v1/ai/chat/test
 * @desc    Test AI chat (non-WebSocket)
 * @access  Private
 */
router.post('/chat/test', authMiddleware, aiController.testChat);

/**
 * @route   DELETE /api/v1/ai/cache
 * @desc    Clear AI response cache
 * @access  Private (Admin only)
 */
router.delete('/cache', authMiddleware, aiController.clearCache);

export default router;
