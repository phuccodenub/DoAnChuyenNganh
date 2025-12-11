/**
 * AI Controller
 * HTTP endpoints for AI features
 */

import { Request, Response, NextFunction } from 'express';
import { AIService } from './ai.service';
import {
  ChatRequest,
  GenerateQuizRequest,
  ContentRecommendationRequest,
  LearningAnalyticsRequest,
} from './ai.types';
import { responseUtils } from '../../utils/response.util';
import logger from '../../utils/logger.util';
import { CourseContentService } from '../course-content/course-content.service';

export class AIController {
  private aiService: AIService;
  private courseContentService: CourseContentService;

  constructor() {
    this.aiService = new AIService();
    this.courseContentService = new CourseContentService();
  }

  /**
   * Chat with AI assistant
   * POST /ai/chat
   */
  chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { message, conversationHistory, context, options } = req.body;

      if (!message || typeof message !== 'string') {
        return responseUtils.sendValidationError(res, 'Message is required and must be a string');
      }

      const chatRequest: ChatRequest = {
        message,
        conversationHistory,
        context: {
          userId,
          ...context,
        },
        options,
      };

      const response = await this.aiService.chat(chatRequest);
      return responseUtils.success(res, response, 'AI response generated successfully');
    } catch (error) {
      logger.error('[AIController] Chat error:', error);
      next(error);
    }
  };

  /**
   * Lesson-aware chat (RAG-lite): fetch lesson content then ask
   * POST /ai/lesson-chat
   */
  lessonChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { lessonId, message, conversationHistory, options } = req.body;

      if (!lessonId || !message) {
        return responseUtils.sendValidationError(res, 'lessonId and message are required');
      }

      // Fetch lesson with access control
      const lesson = await this.courseContentService.getLesson(lessonId, userId);

      const response = await this.aiService.chatWithLessonContext({
        lesson,
        message,
        conversationHistory,
        options,
      });

      return responseUtils.success(res, response, 'AI response generated with lesson context');
    } catch (error) {
      logger.error('[AIController] Lesson chat error:', error);
      next(error);
    }
  };

  /**
   * Summarize a lesson
   * POST /ai/lesson-summary
   */
  lessonSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { lessonId } = req.body;

      if (!lessonId) {
        return responseUtils.sendValidationError(res, 'lessonId is required');
      }

      const lesson = await this.courseContentService.getLesson(lessonId, userId);
      const response = await this.aiService.summarizeLesson(lesson);

      return responseUtils.success(res, response, 'Lesson summarized successfully');
    } catch (error) {
      logger.error('[AIController] Lesson summary error:', error);
      next(error);
    }
  };

  /**
   * Generate quiz questions from course content
   * POST /ai/generate-quiz
   */
  generateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId, courseContent, numberOfQuestions, difficulty, questionType } = req.body;

      if (!courseId || !courseContent) {
        return responseUtils.sendValidationError(res, 'courseId and courseContent are required');
      }

      const quizRequest: GenerateQuizRequest = {
        courseId,
        courseContent,
        numberOfQuestions: numberOfQuestions || 5,
        difficulty: difficulty || 'medium',
        questionType: questionType || 'multiple_choice',
      };

      const response = await this.aiService.generateQuiz(quizRequest);
      return responseUtils.success(res, response, 'Quiz generated successfully');
    } catch (error) {
      logger.error('[AIController] Generate quiz error:', error);
      next(error);
    }
  };

  /**
   * Get content recommendations
   * GET /ai/recommendations
   */
  getRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { limit } = req.query;

      const request: ContentRecommendationRequest = {
        userId,
        limit: limit ? Number(limit) : 10,
      };

      const response = await this.aiService.getContentRecommendations(request);
      return responseUtils.success(res, response, 'Recommendations retrieved successfully');
    } catch (error) {
      logger.error('[AIController] Get recommendations error:', error);
      next(error);
    }
  };

  /**
   * Get learning analytics
   * GET /ai/analytics
   */
  getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { courseId } = req.query;

      const request: LearningAnalyticsRequest = {
        userId,
        courseId: courseId as string | undefined,
      };

      const response = await this.aiService.getLearningAnalytics(request);
      return responseUtils.success(res, response, 'Analytics retrieved successfully');
    } catch (error) {
      logger.error('[AIController] Get analytics error:', error);
      next(error);
    }
  };

  /**
   * Check AI service status
   * GET /ai/status
   */
  getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isAvailable = this.aiService.isAvailable();
      return responseUtils.success(
        res,
        { available: isAvailable },
        isAvailable ? 'AI service is available' : 'AI service is not available'
      );
    } catch (error) {
      logger.error('[AIController] Get status error:', error);
      next(error);
    }
  };
}



