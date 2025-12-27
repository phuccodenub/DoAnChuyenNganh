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
import env from '../../config/env.config';
import { CourseContentService } from '../course-content/course-content.service';
import { QuizGeneratorService } from './services/quiz-generator.service';
import { AIGraderService } from './services/ai-grader.service';
import { aiJobService } from './services/ai-job.service';
import { DebateOrchestratorService, DebateRequest } from './services/debate-orchestrator.service';
import multer from 'multer';



export class AIController {
  private aiService: AIService;
  private courseContentService: CourseContentService;
  private quizGeneratorService: QuizGeneratorService;
  private graderService: AIGraderService;
  private debateService: DebateOrchestratorService;
  private readonly aiUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  });
 
  constructor() {
    this.aiService = new AIService();
    this.courseContentService = new CourseContentService();
    this.quizGeneratorService = new QuizGeneratorService();
    this.graderService = new AIGraderService();
    this.debateService = new DebateOrchestratorService();
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
      return responseUtils.sendSuccess(
        res,
        'AI response generated successfully',
        response,
        200,
        { feature: 'ai-chat' }
      );
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

      return responseUtils.sendSuccess(
        res,
        'AI response generated with lesson context',
        response,
        200,
        { feature: 'ai-lesson-chat' }
      );
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

      return responseUtils.sendSuccess(
        res,
        'Lesson summarized successfully',
        response,
        200,
        { feature: 'ai-lesson-summary' }
      );
    } catch (error) {
      logger.error('[AIController] Lesson summary error:', error);
      next(error);
    }
  };

  /**
   * Generate quiz questions from course content
   * POST /ai/generate-quiz
   * Sử dụng QuizGeneratorService với 3-stage pipeline
   */
  generateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const {
        courseId,
        lessonId, // Add lessonId for lesson analysis context
        content,
        courseContent, // Backward compatibility
        contentType,
        numberOfQuestions,
        difficulty,
        questionType,
        questionTypes,
        topicFocus,
        bloomLevel,
        difficultyDistribution,
        questionTypeDistribution,
        bloomDistribution,
        isPremium,
        asyncJob,
      } = req.body;

      // Support both 'content' and 'courseContent' for backward compatibility
      const actualContent = content || courseContent;

      if (!courseId || !actualContent) {
        return responseUtils.sendValidationError(res, 'courseId và content là bắt buộc');
      }

      if (numberOfQuestions && (numberOfQuestions < 1 || numberOfQuestions > 50)) {
        return responseUtils.sendValidationError(res, 'Số câu hỏi phải từ 1 đến 50');
      }

      // Prepare request for new service
      const quizRequest = {
        courseId,
        lessonId, // Pass lessonId to enable lesson analysis context
        content: actualContent,
        contentType: contentType || 'text',
        numberOfQuestions: numberOfQuestions || 10,
        difficulty: difficulty || 'medium',
        questionTypes: questionTypes || [questionType || 'single_choice'],
        topicFocus,
        bloomLevel: bloomLevel || 'understand',
        difficultyDistribution,
        questionTypeDistribution,
        bloomDistribution,
        userId,
        // Validate isPremium: only instructor/admin can use premium features
        isPremium: isPremium && ['instructor', 'admin', 'super_admin'].includes(req.user!.role) ? true : false,
      };

      // Log warning if student tries to use premium
      if (isPremium && req.user!.role === 'student') {
        logger.warn(`[AIController] Student ${userId} attempted to use premium quiz generation - denied`);
      }

      logger.info(`[AIController] Generating quiz for course ${courseId}, ${quizRequest.numberOfQuestions} questions`);

      if (asyncJob) {
        const job = aiJobService.createJob({
          type: 'quiz-generation',
          courseId,
          userId,
        });

        aiJobService.startJob(job.id, async () => {
          const result = await this.quizGeneratorService.generate(quizRequest);
          return {
            quizId: result.quizId,
            questions: result.questions,
            totalQuestions: result.questions.length,
            metadata: result.metadata,
            fromCache: false,
          };
        });

        return responseUtils.sendSuccess(
          res,
          'Quiz generation started',
          {
            jobId: job.id,
            status: job.status,
            pollUrl: `/api/v1/ai/jobs/${job.id}`,
          },
          202
        );
      }

      const result = await this.quizGeneratorService.generate(quizRequest);

      return responseUtils.sendSuccess(
        res,
        'Quiz được tạo thành công',
        {
          quizId: result.quizId,
          questions: result.questions,
          totalQuestions: result.questions.length,
          metadata: result.metadata,
          fromCache: false, // TODO: Implement cache detection in response
        },
        200,
        { feature: 'quiz-generator' }
      );
    } catch (error: any) {
      logger.error('[AIController] Generate quiz error:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('ProxyPal')) {
        return responseUtils.error(res, 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.', 503);
      }
      
      if (error.message?.includes('parse')) {
        return responseUtils.error(res, 'Không thể xử lý nội dung. Vui lòng kiểm tra lại định dạng.', 400);
      }
      
      next(error);
    }
  };

  /**
   * Generate quiz questions from uploaded file
   * POST /ai/generate-quiz-file
   */
  generateQuizFromFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const {
        courseId,
        difficulty,
        bloomLevel,
        difficultyDistribution,
        questionTypeDistribution,
        bloomDistribution,
        asyncJob,
      } = req.body;

      if (!courseId) {
        return responseUtils.sendValidationError(res, 'courseId là bắt buộc');
      }

      const file = req.file;
      if (!file) {
        return responseUtils.sendValidationError(res, 'file là bắt buộc');
      }

      const numberOfQuestions = req.body.numberOfQuestions ? Number(req.body.numberOfQuestions) : undefined;
      if (numberOfQuestions && (numberOfQuestions < 1 || numberOfQuestions > 50)) {
        return responseUtils.sendValidationError(res, 'Số câu hỏi phải từ 1 đến 50');
      }

      const extracted = await this.aiService.readUploadedFileContent(file);
      if (!extracted || !extracted.content.trim()) {
        return responseUtils.sendValidationError(res, 'Không thể đọc nội dung từ file.');
      }

      const questionTypes = req.body.questionTypes
        ? JSON.parse(req.body.questionTypes)
        : undefined;
      const topicFocus = req.body.topicFocus
        ? JSON.parse(req.body.topicFocus)
        : undefined;

      const quizRequest = {
        courseId,
        content: extracted.content,
        contentType: 'text' as const,
        numberOfQuestions: numberOfQuestions || 10,
        difficulty: (difficulty || req.body.difficulty || 'medium') as 'easy' | 'medium' | 'hard' | 'mixed',
        questionTypes: questionTypes || [req.body.questionType || 'single_choice'],
        topicFocus,
        bloomLevel: (bloomLevel || req.body.bloomLevel || 'understand') as 'remember' | 'understand' | 'apply' | 'analyze' | 'mixed',
        difficultyDistribution: difficultyDistribution
          ? JSON.parse(difficultyDistribution)
          : undefined,
        questionTypeDistribution: questionTypeDistribution
          ? JSON.parse(questionTypeDistribution)
          : undefined,
        bloomDistribution: bloomDistribution
          ? JSON.parse(bloomDistribution)
          : undefined,
        userId,
        isPremium:
          req.body.isPremium === 'true' && ['instructor', 'admin', 'super_admin'].includes(req.user!.role),
      };

      logger.info(`[AIController] Generating quiz from file ${extracted.fileName}`);

      if (asyncJob) {
        const job = aiJobService.createJob({
          type: 'quiz-generation',
          courseId,
          userId,
        });

        aiJobService.startJob(job.id, async () => {
          const result = await this.quizGeneratorService.generate(quizRequest);
          return {
            quizId: result.quizId,
            questions: result.questions,
            totalQuestions: result.questions.length,
            metadata: result.metadata,
            fromCache: false,
          };
        });

        return responseUtils.sendSuccess(
          res,
          'Quiz generation started',
          {
            jobId: job.id,
            status: job.status,
            pollUrl: `/api/v1/ai/jobs/${job.id}`,
          },
          202
        );
      }

      const result = await this.quizGeneratorService.generate(quizRequest);

      return responseUtils.sendSuccess(
        res,
        'Quiz được tạo thành công',
        {
          quizId: result.quizId,
          questions: result.questions,
          totalQuestions: result.questions.length,
          metadata: result.metadata,
          fromCache: false,
        },
        200,
        { feature: 'quiz-generator' }
      );
    } catch (error: any) {
      logger.error('[AIController] Generate quiz from file error:', error);
      next(error);
    }
  };

  /**
   * Start a debate workflow
   * POST /ai/debate/start
   */
  startDebate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!env.ai.features.debateEnabled) {
        return responseUtils.sendServiceUnavailable(res, 'Debate workflow is disabled');
      }

      const userId = req.user!.userId;
      const { topic, context, debateType, maxRounds, courseId } = req.body;
    const normalizedDebateType = typeof debateType === 'string' ? debateType.trim() : debateType;

      if (!topic || !context || !normalizedDebateType) {
        return responseUtils.sendValidationError(res, 'topic, context, debateType là bắt buộc');
      }

      const allowedDebateTypes = ['project_design', 'curriculum', 'content_review', 'decision'];
      if (!allowedDebateTypes.includes(normalizedDebateType)) {
        return responseUtils.sendValidationError(res, 'debateType không hợp lệ');
      }

      const request: DebateRequest = {
        topic,
        context,
        debateType: normalizedDebateType,
        maxRounds: maxRounds ? Number(maxRounds) : undefined,
        initiatedBy: userId,
        courseId,
      };

      try {
        const result = await this.debateService.startDebate(request);

        return responseUtils.sendSuccess(
          res,
          'Debate completed',
          result,
          200,
          { feature: 'debate-workflow' }
        );
      } catch (serviceError: any) {
        if (serviceError?.message === 'Debate daily limit exceeded') {
          return responseUtils.sendTooManyRequests(res, 'Debate daily limit exceeded');
        }
        throw serviceError;
      }
    } catch (error) {
      logger.error('[AIController] Start debate error', {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      next(error);
    }
  };

  /**
   * Get debate result
   * GET /ai/debate/:debateId
   */
  getDebateResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!env.ai.features.debateEnabled) {
        return responseUtils.sendServiceUnavailable(res, 'Debate workflow is disabled');
      }

      const { debateId } = req.params;

      const result = await this.debateService.getDebateResult(debateId);

      if (!result) {
        return responseUtils.sendNotFound(res, 'Debate không tồn tại');
      }

      return responseUtils.sendSuccess(
        res,
        'Debate result retrieved',
        result,
        200,
        { feature: 'debate-workflow' }
      );

    } catch (error) {
      logger.error('[AIController] Get debate result error', {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      next(error);
    }
  };

  /**
   * Get debate history
   * GET /ai/debate/:debateId/history
   */
  getDebateHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!env.ai.features.debateEnabled) {
        return responseUtils.sendServiceUnavailable(res, 'Debate workflow is disabled');
      }

      const { debateId } = req.params;
      const history = await this.debateService.getDebateHistory(debateId);

      if (!history) {
        return responseUtils.sendNotFound(res, 'Debate không tồn tại');
      }

      return responseUtils.sendSuccess(
        res,
        'Debate history retrieved',
        history,
        200,
        { feature: 'debate-workflow' }
      );
    } catch (error) {
      logger.error('[AIController] Get debate history error', {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      next(error);
    }
  };

  /**
   * Arbitrate debate manually
   * POST /ai/debate/:debateId/arbitrate
   */
  arbitrateDebate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!env.ai.features.debateEnabled) {
        return responseUtils.sendServiceUnavailable(res, 'Debate workflow is disabled');
      }

      const { debateId } = req.params;
      const result = await this.debateService.arbitrateDebate(debateId);

      if (!result) {
        return responseUtils.sendNotFound(res, 'Debate không tồn tại');
      }

      return responseUtils.sendSuccess(
        res,
        'Judge arbitration completed',
        result,
        200,
        { feature: 'debate-workflow' }
      );
    } catch (error) {
      logger.error('[AIController] Arbitrate debate error', {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      next(error);
    }
  };

  /**
   * Generate assignment draft
   * POST /ai/instructor/generate-assignment
   */
  generateAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId, content, maxScore, submissionType, rubricItems, additionalNotes } = req.body;

      if (!courseId || !content) {
        return responseUtils.sendValidationError(res, 'courseId và content là bắt buộc');
      }

      const assignment = await this.aiService.generateAssignmentDraft({
        courseId,
        content,
        maxScore,
        submissionType,
        rubricItems,
        additionalNotes,
      });

      return responseUtils.sendSuccess(
        res,
        'Assignment được tạo thành công',
        assignment,
        200,
        { feature: 'assignment-generator' }
      );
    } catch (error) {
      logger.error('[AIController] Generate assignment error:', error);
      next(error);
    }
  };

  /**
   * Generate assignment draft from uploaded file
   * POST /ai/instructor/generate-assignment-file
   */
  generateAssignmentFromFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId, maxScore, submissionType, rubricItems, additionalNotes } = req.body;

      if (!courseId) {
        return responseUtils.sendValidationError(res, 'courseId là bắt buộc');
      }

      const file = req.file;
      if (!file) {
        return responseUtils.sendValidationError(res, 'file là bắt buộc');
      }

      const extracted = await this.aiService.readUploadedFileContent(file);
      if (!extracted || !extracted.content.trim()) {
        return responseUtils.sendValidationError(res, 'Không thể đọc nội dung từ file.');
      }

      const assignment = await this.aiService.generateAssignmentDraft({
        courseId,
        content: extracted.content,
        maxScore: maxScore ? Number(maxScore) : undefined,
        submissionType,
        rubricItems: rubricItems ? Number(rubricItems) : undefined,
        additionalNotes,
      });

      return responseUtils.sendSuccess(
        res,
        'Assignment được tạo thành công',
        assignment,
        200,
        { feature: 'assignment-generator' }
      );
    } catch (error) {
      logger.error('[AIController] Generate assignment from file error:', error);
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
      return responseUtils.sendSuccess(
        res,
        'Recommendations retrieved successfully',
        response,
        200,
        { feature: 'ai-recommendations' }
      );
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
      return responseUtils.sendSuccess(
        res,
        'Analytics retrieved successfully',
        response,
        200,
        { feature: 'ai-analytics' }
      );
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
      return responseUtils.sendSuccess(
        res,
        isAvailable ? 'AI service is available' : 'AI service is not available',
        { available: isAvailable },
        200,
        { service: 'ai', version: 'v1' }
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
      return responseUtils.sendSuccess(
        res,
        'Course outline generated successfully',
        response,
        200,
        { feature: 'ai-course-outline' }
      );
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
      return responseUtils.sendSuccess(
        res,
        'Course improvements suggested successfully',
        response,
        200,
        { feature: 'ai-course-improvements' }
      );
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
      return responseUtils.sendSuccess(
        res,
        'Student analysis completed successfully',
        response,
        200,
        { feature: 'ai-student-analysis' }
      );
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
      const { assignmentId, submissionId, submissionContent, fileUrls, studentName, assignmentInstructions, rubric, maxScore } = req.body;

      if (!assignmentId || !submissionId || !submissionContent || !assignmentInstructions) {
        return responseUtils.sendValidationError(res, 'assignmentId, submissionId, submissionContent, and assignmentInstructions are required');
      }

      logger.info(`[AIController] Generate feedback request - fileUrls: ${fileUrls ? JSON.stringify(fileUrls) : 'none'}, count: ${fileUrls?.length || 0}, studentName: ${studentName || 'none'}`);

      const request: GenerateFeedbackRequest = {
        assignmentId,
        submissionId,
        submissionContent,
        fileUrls: fileUrls || [], // Ensure it's an array
        studentName, // Tên học viên để AI sử dụng đúng
        assignmentInstructions,
        rubric,
        maxScore,
      };

      const response = await this.aiService.generateFeedback(request);
      return responseUtils.sendSuccess(
        res,
        'Feedback generated successfully',
        response,
        200,
        { feature: 'ai-feedback' }
      );
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
      return responseUtils.sendSuccess(
        res,
        'Assignment auto-graded successfully',
        response,
        200,
        { feature: 'ai-auto-grade' }
      );
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
      return responseUtils.sendSuccess(
        res,
        'Thumbnail prompt generated successfully',
        response,
        200,
        { feature: 'ai-thumbnail' }
      );
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
      return responseUtils.sendSuccess(
        res,
        'Lesson content generated successfully',
        response,
        200,
        { feature: 'ai-lesson-content' }
      );
    } catch (error) {
      logger.error('[AIController] Generate lesson content error:', error);
      next(error);
    }
  };

  /**
   * Test specific AI provider (for testing/debugging)
   * POST /ai/test-provider
   */
  testProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { message, provider } = req.body;

      if (!message || !provider) {
        return responseUtils.sendValidationError(res, 'message and provider are required');
      }

      // Test the specific provider
      const response = await this.aiService.testProvider(message, provider);
      
      return responseUtils.sendSuccess(
        res,
        `Provider ${provider} tested successfully`,
        {
          provider,
          model: response.model || 'unknown',
          latency: response.latency,
          answer: response.answer,
          metadata: response.metadata,
        },
        200,
        { feature: 'ai-test-provider' }
      );
    } catch (error) {
      logger.error(`[AIController] Test provider error:`, error);
      next(error);
    }
  };

  // ==================== AI GRADER ====================

  /**
   * Chấm điểm bài code
   * POST /ai/grader/code
   */
  gradeCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { submissionId, assignmentId, code, language, rubric, courseId } = req.body;

      if (!submissionId || !code || !language || !rubric || !courseId) {
        return responseUtils.sendValidationError(
          res,
          'submissionId, code, language, rubric và courseId là bắt buộc'
        );
      }

      if (!Array.isArray(rubric) || rubric.length === 0) {
        return responseUtils.sendValidationError(res, 'Rubric phải là mảng và không được rỗng');
      }

      logger.info(`[AIController] Grading code submission ${submissionId}`);

      const context = await this.graderService.getAssignmentContext(assignmentId, courseId);

      const result = await this.graderService.gradeCode({
        submissionId,
        assignmentId,
        code,
        language,
        rubric,
        courseId,
        userId,
        context,
      });

      return responseUtils.sendSuccess(
        res,
        'Chấm điểm code thành công',
        result,
        200,
        { feature: 'ai-grader-code' }
      );
    } catch (error: any) {
      logger.error('[AIController] Grade code error:', error);

      if (error.message?.includes('parse')) {
        return responseUtils.error(res, 'Không thể xử lý kết quả chấm điểm. Vui lòng thử lại.', 500);
      }

      next(error);
    }
  };


  /**
   * Chấm điểm bài luận
   * POST /ai/grader/essay
   */
  gradeEssay = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { submissionId, assignmentId, essay, topic, rubric, courseId } = req.body;

      if (!submissionId || !essay || !topic || !rubric || !courseId) {
        return responseUtils.sendValidationError(
          res,
          'submissionId, essay, topic, rubric và courseId là bắt buộc'
        );
      }

      if (!Array.isArray(rubric) || rubric.length === 0) {
        return responseUtils.sendValidationError(res, 'Rubric phải là mảng và không được rỗng');
      }

      logger.info(`[AIController] Grading essay submission ${submissionId}`);

      const context = await this.graderService.getAssignmentContext(assignmentId, courseId);

      const result = await this.graderService.gradeEssay({
        submissionId,
        assignmentId,
        essay,
        topic,
        rubric,
        courseId,
        userId,
        context,
      });

      return responseUtils.sendSuccess(
        res,
        'Chấm điểm bài luận thành công',
        result,
        200,
        { feature: 'ai-grader-essay' }
      );
    } catch (error: any) {
      logger.error('[AIController] Grade essay error:', error);

      if (error.message?.includes('parse')) {
        return responseUtils.error(res, 'Không thể xử lý kết quả chấm điểm. Vui lòng thử lại.', 500);
      }

      next(error);
    }
  };

  /**
   * Chấm điểm assignment (text/file/both)
   * POST /ai/grader/assignment
   */
  gradeAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { submissionId, assignmentId, rubric, courseId } = req.body;

      if (!submissionId || !assignmentId || !rubric || !courseId) {
        return responseUtils.sendValidationError(
          res,
          'submissionId, assignmentId, rubric và courseId là bắt buộc'
        );
      }

      if (!Array.isArray(rubric) || rubric.length === 0) {
        return responseUtils.sendValidationError(res, 'Rubric phải là mảng và không được rỗng');
      }

      logger.info(`[AIController] Grading assignment submission ${submissionId}`);

      const gradingRequest = await this.graderService.buildAssignmentGradeRequest({
        submissionId,
        assignmentId,
        rubric,
        courseId,
        userId,
      });

      const hasText = Boolean(gradingRequest.submissionText && gradingRequest.submissionText.trim());
      const hasFiles = Boolean(gradingRequest.fileUrls && gradingRequest.fileUrls.length > 0);

      if (!hasText && !hasFiles) {
        return responseUtils.sendValidationError(res, 'Bài nộp không có nội dung để chấm');
      }

      const result = await this.graderService.gradeAssignment(gradingRequest);

      return responseUtils.sendSuccess(
        res,
        'Chấm điểm assignment thành công',
        result,
        200,
        { feature: 'ai-grader-assignment' }
      );
    } catch (error: any) {
      logger.error('[AIController] Grade assignment error:', error);

      if (error.message?.includes('parse')) {
        return responseUtils.error(res, 'Không thể xử lý kết quả chấm điểm. Vui lòng thử lại.', 500);
      }

      next(error);
    }
  };

  /**
   * Generate rubric from instructor text
   * POST /ai/grader/rubric
   */
  generateRubric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { content, maxScore, rubricItems } = req.body;

      if (!content) {
        return responseUtils.sendValidationError(res, 'content là bắt buộc');
      }

      const scoreValue = Number(maxScore || 0);
      if (!scoreValue || scoreValue <= 0) {
        return responseUtils.sendValidationError(res, 'maxScore không hợp lệ');
      }

      const rubric = await this.aiService.generateRubricFromText({
        content,
        maxScore: scoreValue,
        rubricItems: rubricItems ? Number(rubricItems) : undefined,
      });

      return responseUtils.sendSuccess(
        res,
        'Rubric được tạo thành công',
        rubric,
        200,
        { feature: 'grader-rubric' }
      );
    } catch (error) {
      logger.error('[AIController] Generate rubric error:', error);
      next(error);
    }
  };

  /**
   * Generate rubric from uploaded file
   * POST /ai/grader/rubric-file
   */
  generateRubricFromFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { maxScore, rubricItems } = req.body;

      const file = req.file;
      if (!file) {
        return responseUtils.sendValidationError(res, 'file là bắt buộc');
      }

      const scoreValue = Number(maxScore || 0);
      if (!scoreValue || scoreValue <= 0) {
        return responseUtils.sendValidationError(res, 'maxScore không hợp lệ');
      }

      const extracted = await this.aiService.readUploadedFileContent(file);
      if (!extracted || !extracted.content.trim()) {
        return responseUtils.sendValidationError(res, 'Không thể đọc nội dung từ file.');
      }

      const rubric = await this.aiService.generateRubricFromText({
        content: extracted.content,
        maxScore: scoreValue,
        rubricItems: rubricItems ? Number(rubricItems) : undefined,
      });

      return responseUtils.sendSuccess(
        res,
        'Rubric được tạo thành công',
        rubric,
        200,
        { feature: 'grader-rubric' }
      );
    } catch (error) {
      logger.error('[AIController] Generate rubric file error:', error);
      next(error);
    }
  };

  getJobStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.params;
      const job = await aiJobService.getJob(jobId);
      if (!job) {
        return responseUtils.sendNotFound(res, 'Job không tồn tại');
      }

      return responseUtils.sendSuccess(
        res,
        'Job status retrieved',
        {
          jobId: job.id,
          status: job.status,
          result: job.result,
          error: job.error,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          meta: job.meta,
        },
        200,
        { feature: 'ai-job' }
      );
    } catch (error) {
      logger.error('[AIController] Get job status error:', error);
      next(error);
    }
  };

  /**
   * Multer middleware for AI file uploads
   */
  uploadAiFile = this.aiUpload.single('file');
}

