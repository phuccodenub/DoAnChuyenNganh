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
  GenerateCourseOutlineRequest,
  SuggestCourseImprovementsRequest,
  AnalyzeStudentsRequest,
  GenerateFeedbackRequest,
  AutoGradeRequest,
  GenerateThumbnailRequest,
  GenerateLessonContentRequest,
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

  // ==================== INSTRUCTOR AI FEATURES ====================

  /**
   * Generate course outline
   * POST /ai/instructor/generate-outline
   */
  generateCourseOutline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { topic, description, duration, level, numberOfSections } = req.body;

      if (!topic) {
        return responseUtils.sendValidationError(res, 'topic is required');
      }

      const request: GenerateCourseOutlineRequest = {
        topic,
        description,
        duration,
        level,
        numberOfSections,
      };

      const response = await this.aiService.generateCourseOutline(request);
      return responseUtils.success(res, response, 'Course outline generated successfully');
    } catch (error) {
      logger.error('[AIController] Generate course outline error:', error);
      next(error);
    }
  };

  /**
   * Suggest course improvements
   * POST /ai/instructor/suggest-improvements
   */
  suggestCourseImprovements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId, courseData } = req.body;

      if (!courseId || !courseData) {
        return responseUtils.sendValidationError(res, 'courseId and courseData are required');
      }

      const request: SuggestCourseImprovementsRequest = {
        courseId,
        courseData,
      };

      const response = await this.aiService.suggestCourseImprovements(request);
      return responseUtils.success(res, response, 'Course improvements suggested successfully');
    } catch (error) {
      logger.error('[AIController] Suggest improvements error:', error);
      next(error);
    }
  };

  /**
   * Analyze student performance
   * POST /ai/instructor/analyze-students
   */
  analyzeStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId, studentIds } = req.body;

      if (!courseId) {
        return responseUtils.sendValidationError(res, 'courseId is required');
      }

      const request: AnalyzeStudentsRequest = {
        courseId,
        studentIds,
      };

      const response = await this.aiService.analyzeStudents(request);
      return responseUtils.success(res, response, 'Student analysis completed successfully');
    } catch (error) {
      logger.error('[AIController] Analyze students error:', error);
      next(error);
    }
  };

  /**
   * Generate feedback for assignment
   * POST /ai/instructor/generate-feedback
   */
  generateFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { assignmentId, submissionId, submissionContent, assignmentInstructions, rubric, maxScore } = req.body;

      if (!assignmentId || !submissionId || !submissionContent || !assignmentInstructions) {
        return responseUtils.sendValidationError(res, 'assignmentId, submissionId, submissionContent, and assignmentInstructions are required');
      }

      const request: GenerateFeedbackRequest = {
        assignmentId,
        submissionId,
        submissionContent,
        assignmentInstructions,
        rubric,
        maxScore,
      };

      const response = await this.aiService.generateFeedback(request);
      return responseUtils.success(res, response, 'Feedback generated successfully');
    } catch (error) {
      logger.error('[AIController] Generate feedback error:', error);
      next(error);
    }
  };

  /**
   * Auto-grade assignment
   * POST /ai/instructor/auto-grade
   */
  autoGrade = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { assignmentId, submissionId, submissionAnswers, assignmentQuestions } = req.body;

      if (!assignmentId || !submissionId || !submissionAnswers || !assignmentQuestions) {
        return responseUtils.sendValidationError(res, 'assignmentId, submissionId, submissionAnswers, and assignmentQuestions are required');
      }

      const request: AutoGradeRequest = {
        assignmentId,
        submissionId,
        submissionAnswers,
        assignmentQuestions,
      };

      const response = await this.aiService.autoGrade(request);
      return responseUtils.success(res, response, 'Assignment auto-graded successfully');
    } catch (error) {
      logger.error('[AIController] Auto-grade error:', error);
      next(error);
    }
  };

  /**
   * Generate thumbnail prompt for course
   * POST /ai/instructor/generate-thumbnail
   */
  generateThumbnail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseTitle, courseDescription, category, level } = req.body;
      if (!courseTitle) {
        return responseUtils.sendValidationError(res, 'courseTitle is required');
      }
      const response = await this.aiService.generateThumbnailPrompt({
        courseTitle,
        courseDescription,
        category,
        level,
      });
      return responseUtils.success(res, response, 'Thumbnail prompt generated successfully');
    } catch (error) {
      logger.error('[AIController] Generate thumbnail prompt error:', error);
      next(error);
    }
  };

  /**
   * Generate detailed content for a lesson
   * POST /ai/instructor/generate-lesson-content
   */
  generateLessonContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { lessonTitle, lessonDescription, courseTitle, courseDescription, sectionTitle, level } = req.body;
      
      if (!lessonTitle || !courseTitle) {
        return responseUtils.sendValidationError(res, 'lessonTitle and courseTitle are required');
      }

      const request: GenerateLessonContentRequest = {
        lessonTitle,
        lessonDescription,
        courseTitle,
        courseDescription,
        sectionTitle,
        level,
      };

      const response = await this.aiService.generateLessonContent(request);
      return responseUtils.success(res, response, 'Lesson content generated successfully');
    } catch (error) {
      logger.error('[AIController] Generate lesson content error:', error);
      next(error);
    }
  };
}



