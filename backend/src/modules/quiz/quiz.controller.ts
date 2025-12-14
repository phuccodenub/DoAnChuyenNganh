import { Request, Response, NextFunction } from 'express';
import { QuizService } from './quiz.service';
import { ApiError } from '../../errors/api.error';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';

export class QuizController {
  private quizService: QuizService;

  constructor() {
    this.quizService = new QuizService();
  }

  /**
   * Get all quizzes with pagination and filtering
   */
  async getAllQuizzes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, course_id, section_id, status } = req.query;
      
      const result = await this.quizService.getAllQuizzes({
        page: Number(page),
        limit: Number(limit),
        course_id: course_id as string,
        section_id: section_id as string,
        status: status as string
      });

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Quizzes retrieved successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error in getAllQuizzes controller:', error);
      next(error);
    }
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const quiz = await this.quizService.getQuizById(id);
      
      if (!quiz) {
        throw new ApiError('Quiz not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Quiz retrieved successfully',
        data: quiz
      });
    } catch (error) {
      logger.error('Error in getQuizById controller:', error);
      next(error);
    }
  }

  /**
   * Create new quiz
   */
  async createQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quizData = req.body;
      
      const quiz = await this.quizService.createQuiz(quizData);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.CREATED).json({
        success: true,
        message: 'Quiz created successfully',
        data: quiz
      });
    } catch (error) {
      logger.error('Error in createQuiz controller:', error);
      next(error);
    }
  }

  /**
   * Update quiz
   */
  async updateQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const quiz = await this.quizService.updateQuiz(id, updateData);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Quiz updated successfully',
        data: quiz
      });
    } catch (error) {
      logger.error('Error in updateQuiz controller:', error);
      next(error);
    }
  }

  /**
   * Delete quiz
   */
  async deleteQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      logger.info('Deleting quiz', { quizId: id });
      const deleted = await this.quizService.deleteQuiz(id);

      if (!deleted) {
        res.status(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND).json({
          success: false,
          message: 'Quiz not found',
          data: null
        });
        return;
      }

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Quiz deleted successfully',
        data: null
      });
    } catch (error) {
      logger.error('Error in deleteQuiz controller:', error);
      logger.error('Error details:', { 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        quizId: req.params.id 
      });
      next(error);
    }
  }

  /**
   * Get all questions for a quiz
   */
  async getQuizQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      // Endpoint chung cho học viên làm bài → KHÔNG trả đáp án đúng
      // includeAnswers = false để tránh lộ is_correct
      const questions = await this.quizService.getQuizQuestions(id, undefined, false);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Quiz questions retrieved successfully',
        data: questions
      });
    } catch (error) {
      logger.error('Error in getQuizQuestions controller:', error);
      next(error);
    }
  }

  /**
   * Get all questions for a quiz WITH correct answers (instructor-only)
   * Dùng cho trang builder/quản lý quiz
   */
  async getQuizQuestionsWithAnswers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId || (req as any).user?.id;

      const questions = await this.quizService.getQuizQuestions(id, userId, true);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Quiz questions (with answers) retrieved successfully',
        data: questions
      });
    } catch (error) {
      logger.error('Error in getQuizQuestionsWithAnswers controller:', error);
      next(error);
    }
  }

  /**
   * Get question by ID
   */
  async getQuizQuestionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quizId, questionId } = req.params;
      
      const question = await this.quizService.getQuizQuestionById(quizId, questionId);
      
      if (!question) {
        throw new ApiError('Question not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Question retrieved successfully',
        data: question
      });
    } catch (error) {
      logger.error('Error in getQuizQuestionById controller:', error);
      next(error);
    }
  }

  /**
   * Create new question for quiz
   */
  async createQuizQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const questionData = req.body;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized: User ID not found'
        });
        return;
      }
      
      const question = await this.quizService.addQuestion(id, userId, questionData);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.CREATED).json({
        success: true,
        message: 'Question created successfully',
        data: question
      });
    } catch (error) {
      logger.error('Error in createQuizQuestion controller:', error);
      next(error);
    }
  }

  /**
   * Update question
   */
  async updateQuizQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quizId, questionId } = req.params;
      const updateData = req.body;
      
      const question = await this.quizService.updateQuizQuestion(quizId, questionId, updateData);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Question updated successfully',
        data: question
      });
    } catch (error) {
      logger.error('Error in updateQuizQuestion controller:', error);
      next(error);
    }
  }

  /**
   * Delete question
   */
  async deleteQuizQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quizId, questionId } = req.params;
      
      const deleted = await this.quizService.deleteQuizQuestion(quizId, questionId);

      if (!deleted) {
        res.status(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND).json({
          success: false,
          message: 'Question not found',
          data: null
        });
        return;
      }

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Question deleted successfully',
        data: null
      });
    } catch (error) {
      logger.error('Error in deleteQuizQuestion controller:', error);
      next(error);
    }
  }

  /**
   * Start quiz attempt
   */
  async startQuizAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      
      if (!userId) {
        throw new ApiError('User not authenticated', RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED);
      }

      const attempt = await this.quizService.startQuizAttempt(id, userId);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.CREATED).json({
        success: true,
        message: 'Quiz attempt started successfully',
        data: attempt
      });
    } catch (error) {
      logger.error('Error in startQuizAttempt controller:', error);
      next(error);
    }
  }

  /**
   * Submit quiz attempt
   */
  async submitQuizAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { attemptId } = req.params;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const { answers } = req.body;
      
      if (!userId) {
        throw new ApiError('User not authenticated', RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED);
      }

      // Frontend gửi answers là array, nhưng service expect SubmitQuizDto { answers: [...] }
      const submitDto = Array.isArray(answers) ? { answers } : answers;
      const result = await this.quizService.submitQuizAttempt(attemptId, userId, submitDto);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Quiz attempt submitted successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error in submitQuizAttempt controller:', error);
      next(error);
    }
  }

  /**
   * Get quiz attempt by ID
   */
  async getQuizAttemptById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { attemptId } = req.params;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      
      if (!userId) {
        throw new ApiError('User not authenticated', RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED);
      }

      const attempt = await this.quizService.getQuizAttemptById(attemptId, userId);
      
      if (!attempt) {
        throw new ApiError('Quiz attempt not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Quiz attempt retrieved successfully',
        data: attempt
      });
    } catch (error) {
      logger.error('Error in getQuizAttemptById controller:', error);
      next(error);
    }
  }

  /**
   * Get user's quiz attempts
   */
  async getUserQuizAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      
      if (!userId) {
        throw new ApiError('User not authenticated', RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED);
      }

      const attempts = await this.quizService.getUserQuizAttempts(id, userId);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Quiz attempts retrieved successfully',
        data: attempts
      });
    } catch (error) {
      logger.error('Error in getUserQuizAttempts controller:', error);
      next(error);
    }
  }

  /**
   * Get quiz attempts for a specific student (Instructor only)
   */
  async getStudentQuizAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: quizId, studentId } = req.params;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      
      if (!userId) {
        throw new ApiError('User not authenticated', RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED);
      }

      if (!studentId) {
        throw new ApiError('Student ID is required', RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST);
      }

      const attempts = await this.quizService.getStudentQuizAttempts(quizId, studentId, userId);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Student quiz attempts retrieved successfully',
        data: attempts
      });
    } catch (error) {
      logger.error('Error in getStudentQuizAttempts controller:', error);
      next(error);
    }
  }

  /**
   * Get current/active quiz attempt for a quiz by current user
   */
  async getCurrentAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId || (req as any).user?.id;

      if (!userId) {
        throw new ApiError('User not authenticated', RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED);
      }

      const attempt = await this.quizService.getCurrentAttempt(id, userId);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Current quiz attempt retrieved successfully',
        data: attempt
      });
    } catch (error) {
      logger.error('Error in getCurrentAttempt controller:', error);
      next(error);
    }
  }

  /**
   * Delete all quiz attempts for a specific student (Instructor/Admin only)
   * Reset lượt làm bài cho học viên
   */
  async deleteStudentQuizAttempts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: quizId, studentId } = req.params;
      const userId = (req as any).user?.userId || (req as any).user?.id;
      
      if (!userId) {
        throw new ApiError('User not authenticated', RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED);
      }

      if (!studentId) {
        throw new ApiError('Student ID is required', RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST);
      }

      const result = await this.quizService.deleteStudentQuizAttempts(quizId, studentId, userId);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Student quiz attempts deleted successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error in deleteStudentQuizAttempts controller:', error);
      next(error);
    }
  }
}