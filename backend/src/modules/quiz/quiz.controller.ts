import { Request, Response, NextFunction } from 'express';
import { QuizService } from './quiz.service';
import { responseUtils } from '../../utils/response.util';

export class QuizController {
  private service: QuizService;

  constructor() {
    this.service = new QuizService();
  }

  // ===================================
  // QUIZ MANAGEMENT
  // ===================================

  createQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const quiz = await this.service.createQuiz(userId, req.body);
      return responseUtils.success(res, quiz, 'Quiz created', 201);
    } catch (error: unknown) {
      next(error);
    }
  };

  getQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizId } = req.params;
      const userId = req.user?.userId;
      const includeAnswers = req.query.include_answers === 'true';
      
      const quiz = await this.service.getQuiz(quizId, userId, includeAnswers);
      return responseUtils.success(res, quiz, 'Quiz retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };

  updateQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.userId;
      
      const quiz = await this.service.updateQuiz(quizId, userId, req.body);
      return responseUtils.success(res, quiz, 'Quiz updated');
    } catch (error: unknown) {
      next(error);
    }
  };

  deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.userId;
      
      await this.service.deleteQuiz(quizId, userId);
      return responseUtils.success(res, null, 'Quiz deleted');
    } catch (error: unknown) {
      next(error);
    }
  };

  // ===================================
  // QUESTION MANAGEMENT
  // ===================================

  addQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.userId;
      
      const question = await this.service.addQuestion(quizId, userId, req.body);
      return responseUtils.success(res, question, 'Question added', 201);
    } catch (error: unknown) {
      next(error);
    }
  };

  updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { questionId } = req.params;
      const userId = req.user!.userId;
      
      const question = await this.service.updateQuestion(questionId, userId, req.body);
      return responseUtils.success(res, question, 'Question updated');
    } catch (error: unknown) {
      next(error);
    }
  };

  deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { questionId } = req.params;
      const userId = req.user!.userId;
      
      await this.service.deleteQuestion(questionId, userId);
      return responseUtils.success(res, null, 'Question deleted');
    } catch (error: unknown) {
      next(error);
    }
  };

  addOption = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { questionId } = req.params;
      const userId = req.user!.userId;
      
      const option = await this.service.addOption(questionId, userId, req.body);
      return responseUtils.success(res, option, 'Option added', 201);
    } catch (error: unknown) {
      next(error);
    }
  };

  getQuizQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizId } = req.params;
      const userId = req.user?.userId;
      const includeAnswers = req.query.include_answers === 'true';
      
      const questions = await this.service.getQuizQuestions(quizId, userId, includeAnswers);
      return responseUtils.success(res, questions, 'Questions retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };

  // ===================================
  // QUIZ ATTEMPTS (STUDENT)
  // ===================================

  startAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.userId;
      
      const attempt = await this.service.startQuizAttempt(quizId, userId);
      return responseUtils.success(res, attempt, 'Quiz attempt started', 201);
    } catch (error: unknown) {
      next(error);
    }
  };

  submitAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { attemptId } = req.params;
      const userId = req.user!.userId;
      
      const result = await this.service.submitQuizAnswer(attemptId, userId, req.body);
      return responseUtils.success(res, result, 'Quiz attempt submitted');
    } catch (error: unknown) {
      next(error);
    }
  };

  getMyAttempts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.userId;
      
      const attempts = await this.service.getUserAttempts(quizId, userId);
      return responseUtils.success(res, attempts, 'User attempts retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };

  getAttemptDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { attemptId } = req.params;
      const userId = req.user!.userId;
      
      const attempt = await this.service.getAttemptDetails(attemptId, userId);
      return responseUtils.success(res, attempt, 'Attempt details retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };

  // ===================================
  // INSTRUCTOR FEATURES
  // ===================================

  getQuizStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.userId;
      
      const stats = await this.service.getQuizStatistics(quizId, userId);
      return responseUtils.success(res, stats, 'Quiz statistics retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };

  getQuizAttempts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const attempts = await this.service.getQuizAttempts(quizId, userId, page, limit);
      return responseUtils.success(res, attempts, 'Quiz attempts retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };
}





