import { QuizRepository } from './quiz.repository';
import { ApiError } from '../../errors/api.error';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';

export class QuizService {
  private quizRepository: QuizRepository;

  constructor() {
    this.quizRepository = new QuizRepository();
  }

  /**
   * Get all quizzes with pagination and filtering
   */
  async getAllQuizzes(options: {
    page: number;
    limit: number;
    course_id?: string;
    lesson_id?: string;
    status?: string;
  }) {
    try {
      logger.info('Getting all quizzes', options);
      
      const result = await this.quizRepository.findAllWithPagination(options);
      
      logger.info('Quizzes retrieved successfully', { count: result.data.length });
      return result;
    } catch (error) {
      logger.error('Error getting all quizzes:', error);
      throw error;
    }
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(quizId: string) {
    try {
      logger.info('Getting quiz by ID', { quizId });
      
      const quiz = await this.quizRepository.findById(quizId);
      
      if (!quiz) {
        logger.error('Quiz not found', { quizId });
        throw new ApiError('Quiz not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      logger.info('Quiz retrieved successfully', { quizId });
      return quiz;
    } catch (error) {
      logger.error('Error getting quiz by ID:', error);
      throw error;
    }
  }

  /**
   * Create new quiz
   */
  async createQuiz(quizData: any) {
    try {
      logger.info('Creating new quiz', { title: quizData.title });
      
      const quiz = await this.quizRepository.create(quizData);
      
      logger.info('Quiz created successfully', { quizId: quiz.id });
      return quiz;
    } catch (error) {
      logger.error('Error creating quiz:', error);
      throw error;
    }
  }

  /**
   * Update quiz
   */
  async updateQuiz(quizId: string, updateData: any) {
    try {
      logger.info('Updating quiz', { quizId });
      
      const quiz = await this.quizRepository.update(quizId, updateData);
      
      if (!quiz) {
        logger.error('Quiz not found for update', { quizId });
        throw new ApiError('Quiz not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      logger.info('Quiz updated successfully', { quizId });
      return quiz;
    } catch (error) {
      logger.error('Error updating quiz:', error);
      throw error;
    }
  }

  /**
   * Delete quiz
   */
  async deleteQuiz(quizId: string) {
    try {
      logger.info('Deleting quiz', { quizId });
      
      const deleted = await this.quizRepository.delete(quizId);
      
      if (!deleted) {
        logger.warn('Quiz not found for deletion', { quizId });
        return false;
      }

      logger.info('Quiz deleted successfully', { quizId });
      return true;
    } catch (error) {
      logger.error('Error deleting quiz:', error);
      throw error;
    }
  }

  /**
   * Get all questions for a quiz
   */
  async getQuizQuestions(quizId: string) {
    try {
      logger.info('Getting quiz questions', { quizId });
      
      const questions = await this.quizRepository.getQuizQuestions(quizId);
      
      logger.info('Quiz questions retrieved successfully', { quizId, count: questions.length });
      return questions;
    } catch (error) {
      logger.error('Error getting quiz questions:', error);
      throw error;
    }
  }

  /**
   * Get question by ID
   */
  async getQuizQuestionById(quizId: string, questionId: string) {
    try {
      logger.info('Getting quiz question by ID', { quizId, questionId });
      
      const question = await this.quizRepository.getQuizQuestionById(quizId, questionId);
      
      if (!question) {
        logger.error('Question not found', { quizId, questionId });
        throw new ApiError('Question not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      logger.info('Question retrieved successfully', { quizId, questionId });
      return question;
    } catch (error) {
      logger.error('Error getting quiz question by ID:', error);
      throw error;
    }
  }

  /**
   * Create new question for quiz
   */
  async createQuizQuestion(quizId: string, questionData: any) {
    try {
      logger.info('Creating new quiz question', { quizId, questionText: questionData.question_text });
      
      const question = await this.quizRepository.createQuizQuestion(quizId, questionData);
      
      logger.info('Question created successfully', { quizId, questionId: question.id });
      return question;
    } catch (error) {
      logger.error('Error creating quiz question:', error);
      throw error;
    }
  }

  /**
   * Update question
   */
  async updateQuizQuestion(quizId: string, questionId: string, updateData: any) {
    try {
      logger.info('Updating quiz question', { quizId, questionId });
      
      const question = await this.quizRepository.updateQuizQuestion(quizId, questionId, updateData);
      
      if (!question) {
        logger.error('Question not found for update', { quizId, questionId });
        throw new ApiError('Question not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      logger.info('Question updated successfully', { quizId, questionId });
      return question;
    } catch (error) {
      logger.error('Error updating quiz question:', error);
      throw error;
    }
  }

  /**
   * Delete question
   */
  async deleteQuizQuestion(quizId: string, questionId: string) {
    try {
      logger.info('Deleting quiz question', { quizId, questionId });
      
      const deleted = await this.quizRepository.deleteQuizQuestion(quizId, questionId);
      
      if (!deleted) {
        logger.warn('Question not found for deletion', { quizId, questionId });
        return false;
      }

      logger.info('Question deleted successfully', { quizId, questionId });
      return true;
    } catch (error) {
      logger.error('Error deleting quiz question:', error);
      throw error;
    }
  }

  /**
   * Start quiz attempt
   */
  async startQuizAttempt(quizId: string, userId: string) {
    try {
      logger.info('Starting quiz attempt', { quizId, userId });
      
      const attempt = await this.quizRepository.startQuizAttempt(quizId, userId);
      
      logger.info('Quiz attempt started successfully', { quizId, userId, attemptId: attempt.id });
      return attempt;
    } catch (error) {
      logger.error('Error starting quiz attempt:', error);
      throw error;
    }
  }

  /**
   * Submit quiz attempt
   */
  async submitQuizAttempt(attemptId: string, userId: string, answers: any[]) {
    try {
      logger.info('Submitting quiz attempt', { attemptId, userId, answersCount: answers.length });
      
      const result = await this.quizRepository.submitQuizAttempt(attemptId, userId, answers);
      
      logger.info('Quiz attempt submitted successfully', { attemptId, userId, score: result.score });
      return result;
    } catch (error) {
      logger.error('Error submitting quiz attempt:', error);
      throw error;
    }
  }

  /**
   * Get quiz attempt by ID
   */
  async getQuizAttemptById(attemptId: string, userId: string) {
    try {
      logger.info('Getting quiz attempt by ID', { attemptId, userId });
      
      const attempt = await this.quizRepository.getQuizAttemptById(attemptId, userId);
      
      if (!attempt) {
        logger.error('Quiz attempt not found', { attemptId, userId });
        throw new ApiError('Quiz attempt not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      logger.info('Quiz attempt retrieved successfully', { attemptId, userId });
      return attempt;
    } catch (error) {
      logger.error('Error getting quiz attempt by ID:', error);
      throw error;
    }
  }

  /**
   * Get user's quiz attempts
   */
  async getUserQuizAttempts(quizId: string, userId: string) {
    try {
      logger.info('Getting user quiz attempts', { quizId, userId });
      
      const attempts = await this.quizRepository.getUserQuizAttempts(quizId, userId);
      
      logger.info('User quiz attempts retrieved successfully', { quizId, userId, count: attempts.length });
      return attempts;
    } catch (error) {
      logger.error('Error getting user quiz attempts:', error);
      throw error;
    }
  }
}