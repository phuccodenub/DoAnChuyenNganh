/**
 * AI Controller
 * REST API endpoints cho AI features
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../../../utils/logger.util';
import { AITutorService } from '../services/ai-tutor.service';
import { AICacheService } from '../services/ai-cache.service';
import { responseUtils } from '../../../utils/response.util';

export class AIControllerV2 {
  private aiTutorService: AITutorService;
  private aiCacheService: AICacheService;

  constructor() {
    this.aiTutorService = new AITutorService();
    this.aiCacheService = new AICacheService();
  }

  /**
   * GET /api/v1/ai/status
   * Check AI service availability and provider status
   */
  getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const providers = this.aiTutorService.getAvailableProviders();
      const cacheStats = await this.aiCacheService.getStats();
      
      const availableCount = providers.filter(p => p.available).length;
      const isAvailable = availableCount > 0;

      logger.info(`[AIController] Status check: ${availableCount}/${providers.length} providers available`);

      return responseUtils.sendSuccess(
        res,
        'AI service status retrieved',
        {
          available: isAvailable,
          providers,
          cache: {
            available: this.aiCacheService.isAvailable(),
            stats: cacheStats,
          },
          features: {
            tutor: process.env.AI_TUTOR_ENABLED !== 'false',
            quizGenerator: process.env.AI_QUIZ_GENERATOR_ENABLED === 'true',
            grader: process.env.AI_GRADER_ENABLED === 'true',
            contentRepurposing: process.env.AI_CONTENT_REPURPOSING_ENABLED === 'true',
          },
        },
        200,
        { feature: 'ai-status' }
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/ai/chat/test
   * Test AI chat (non-WebSocket, for testing)
   */
  testChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, courseId, lessonId } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return responseUtils.error(res, 'User not authenticated', 401);
      }

      if (!message) {
        return responseUtils.error(res, 'Message is required', 400);
      }

      logger.info(`[AIController] Test chat request from user ${userId}`);

      const response = await this.aiTutorService.chat({
        message,
        userId,
        courseId,
        lessonId,
      });

      return responseUtils.sendSuccess(
        res,
        'AI response generated',
        {
          response: response.text,
          metadata: {
            model: response.model,
            provider: response.provider,
            tier: response.tier,
            latency: response.latency,
            usage: response.usage,
          },
        },
        200,
        { feature: 'ai-test-chat' }
      );
    } catch (error: any) {
      logger.error('[AIController] Error in test chat:', error);
      return responseUtils.error(res, error.message || 'Failed to generate AI response', 500);
    }
  };

  /**
   * DELETE /api/v1/ai/cache
   * Clear AI response cache (admin only)
   */
  clearCache = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.aiCacheService.clearAll();
      
      logger.info('[AIController] AI cache cleared');

      return responseUtils.sendSuccess(
        res,
        'AI cache cleared successfully',
        null,
        200,
        { feature: 'ai-cache' }
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/ai/providers
   * Get list of available AI providers
   */
  getProviders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const providers = this.aiTutorService.getAvailableProviders();

      return responseUtils.sendSuccess(
        res,
        'Providers retrieved',
        { providers },
        200,
        { feature: 'ai-providers' }
      );
    } catch (error) {
      next(error);
    }
  };
}
