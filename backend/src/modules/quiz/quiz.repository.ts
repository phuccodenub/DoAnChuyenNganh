import { BaseRepository } from '../../repositories/base.repository';
import Quiz from '../../models/quiz.model';
import logger from '../../utils/logger.util';

export class QuizRepository extends BaseRepository<Quiz> {
  constructor() {
    super(Quiz);
  }

  /**
   * Find all quizzes with pagination and filtering
   */
  async findAllWithPagination(options: {
    page: number;
    limit: number;
    course_id?: string;
    lesson_id?: string;
    status?: string;
  }) {
    try {
      const { page, limit, course_id, lesson_id, status } = options;
      const offset = (page - 1) * limit;

      const whereClause: any = {};
      if (course_id) whereClause.course_id = course_id;
      if (lesson_id) whereClause.lesson_id = lesson_id;
      if (status) whereClause.status = status;

      const { count, rows } = await this.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Error finding quizzes with pagination:', error);
      throw error;
    }
  }

  /**
   * Get all questions for a quiz
   */
  async getQuizQuestions(quizId: string) {
    try {
      const { QuizQuestion, QuizOption } = require('../../models');
      const questions = await (QuizQuestion as any).findAll({
        where: { quiz_id: quizId },
        order: [['order_index', 'ASC'], ['created_at', 'ASC']],
        include: [{
          model: QuizOption,
          as: 'options',
          order: [['order_index', 'ASC']]
        }]
      });
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
      const { QuizQuestion } = require('../../models');
      const question = await (QuizQuestion as any).findOne({
        where: { 
          id: questionId,
          quiz_id: quizId 
        }
      });
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
      const { QuizQuestion, QuizOption } = require('../../models');
      
      // Extract options from questionData
      const { options, ...questionFields } = questionData;
      
      // Create question
      const question = await (QuizQuestion as any).create({
        ...questionFields,
        quiz_id: quizId
      });
      
      // Create options if provided
      if (options && Array.isArray(options)) {
        for (let i = 0; i < options.length; i++) {
          await (QuizOption as any).create({
            question_id: question.id,
            option_text: options[i].option_text,
            is_correct: options[i].is_correct || false,
            order_index: i + 1
          });
        }
      }
      
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
      const { QuizQuestion } = require('../../models');
      const [affectedCount] = await (QuizQuestion as any).update(updateData, {
        where: { 
          id: questionId,
          quiz_id: quizId 
        }
      });
      
      if (affectedCount === 0) {
        return null;
      }
      
      const question = await (QuizQuestion as any).findByPk(questionId);
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
      const { QuizQuestion } = require('../../models');
      const deletedCount = await (QuizQuestion as any).destroy({
        where: { 
          id: questionId,
          quiz_id: quizId 
        }
      });
      
      return deletedCount > 0;
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
      const { QuizAttempt } = require('../../models');
      
      // Check if user has reached max attempts
      const existingAttempts = await (QuizAttempt as any).count({
        where: { quiz_id: quizId, user_id: userId }
      });
      
      logger.info('Existing attempts count', { existingAttempts });
      
      const quiz = await this.findById(quizId);
      if (!quiz) {
        logger.error('Quiz not found', { quizId });
        throw new Error('Quiz not found');
      }
      
      logger.info('Quiz found', { quizId, maxAttempts: quiz.max_attempts });
      
      // Allow unlimited attempts if max_attempts is 0, otherwise check limit
      if (quiz.max_attempts > 0 && existingAttempts >= quiz.max_attempts) {
        logger.warn('Maximum attempts reached', { existingAttempts, maxAttempts: quiz.max_attempts });
        throw new Error('Maximum attempts reached');
      }
      
      logger.info('Creating quiz attempt', { quizId, userId, attemptNumber: existingAttempts + 1 });
      
      const attempt = await (QuizAttempt as any).create({
        quiz_id: quizId,
        user_id: userId,
        attempt_number: existingAttempts + 1,
        started_at: new Date()
      });
      
      logger.info('Quiz attempt created successfully', { attemptId: attempt.id });
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
      const { QuizAttempt, QuizAnswer } = require('../../models');
      
      // Find the attempt by ID
      const attempt = await (QuizAttempt as any).findOne({
        where: { 
          id: attemptId,
          user_id: userId,
          submitted_at: null
        }
      });
      
      if (!attempt) {
        throw new Error('No active quiz attempt found');
      }
      
      // Save answers
      for (const [questionId, answerValue] of Object.entries(answers)) {
        await (QuizAnswer as any).create({
          attempt_id: attempt.id,
          question_id: questionId,
          answer_text: answerValue
        });
      }
      
      // Get quiz details to calculate max_score and passing criteria
      const quiz = await this.findById(attempt.quiz_id);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Calculate time spent
      const timeSpentMs = new Date().getTime() - new Date(attempt.started_at).getTime();
      const timeSpentMinutes = Math.round(timeSpentMs / (1000 * 60));

      // Calculate max_score (total points from all questions)
      const questions = await this.getQuizQuestions(attempt.quiz_id);
      const maxScore = questions.reduce((total, q) => total + parseFloat(q.points || 0), 0);
      
      // Calculate actual score based on correct answers
      let earnedScore = 0;
      for (const [questionId, answerValue] of Object.entries(answers)) {
        const question = questions.find(q => q.id === questionId);
        if (question) {
          // For now, give full points for any answer (simplified scoring)
          earnedScore += parseFloat(question.points || 0);
        }
      }
      
      // Calculate score on 10-point scale
      const scoreOn10Scale = maxScore > 0 ? Math.round((earnedScore / maxScore) * 10 * 10) / 10 : 0; // Round to 1 decimal place
      
      // Determine if passed (passing_score is percentage, convert to 10-point scale for comparison)
      const passingScoreOn10Scale = quiz.passing_score ? (quiz.passing_score / 100) * 10 : null;
      const isPassed = passingScoreOn10Scale ? scoreOn10Scale >= passingScoreOn10Scale : null;
      
      logger.info('Score calculation', { 
        earnedScore, 
        maxScore, 
        scoreOn10Scale, 
        timeSpentMinutes, 
        isPassed,
        quizPassingScore: quiz.passing_score,
        passingScoreOn10Scale
      });
      
      // Update attempt - store score on 10-point scale
      await (QuizAttempt as any).update({
        submitted_at: new Date(),
        score: scoreOn10Scale, // Store as score on 10-point scale
        max_score: 10, // Max score is always 10 for 10-point scale
        time_spent_minutes: timeSpentMinutes,
        is_passed: isPassed
      }, {
        where: { id: attempt.id }
      });
      
      return {
        attempt_id: attempt.id,
        score: scoreOn10Scale,
        max_score: 10,
        total_questions: Object.keys(answers).length,
        time_spent_minutes: timeSpentMinutes,
        is_passed: isPassed,
        earned_points: earnedScore,
        total_points: maxScore
      };
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
      const { QuizAttempt } = require('../../models');
      const attempt = await (QuizAttempt as any).findOne({
        where: { 
          id: attemptId,
          user_id: userId
        }
      });
      
      // If attempt exists but missing calculated fields, recalculate them
      if (attempt && attempt.submitted_at && (!attempt.max_score || !attempt.time_spent_minutes || attempt.is_passed === null)) {
        await this.recalculateAttemptScore(attemptId);
        // Fetch updated attempt
        return await (QuizAttempt as any).findOne({
          where: { 
            id: attemptId,
            user_id: userId
          }
        });
      }
      
      return attempt;
    } catch (error) {
      logger.error('Error getting quiz attempt by ID:', error);
      throw error;
    }
  }

  /**
   * Recalculate attempt score and related fields
   */
  async recalculateAttemptScore(attemptId: string) {
    try {
      const { QuizAttempt } = require('../../models');
      
      const attempt = await (QuizAttempt as any).findOne({
        where: { id: attemptId }
      });
      
      if (!attempt || !attempt.submitted_at) {
        throw new Error('Attempt not found or not submitted');
      }
      
      // Get quiz details
      const quiz = await this.findById(attempt.quiz_id);
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      
      // Calculate time spent
      const timeSpentMs = new Date(attempt.submitted_at).getTime() - new Date(attempt.started_at).getTime();
      const timeSpentMinutes = Math.round(timeSpentMs / (1000 * 60));
      
      // Calculate max_score (total points from all questions)
      const questions = await this.getQuizQuestions(attempt.quiz_id);
      const maxScore = questions.reduce((total, q) => total + parseFloat(q.points || 0), 0);
      
      // Determine if passed (score is on 10-point scale, convert passing_score from percentage)
      const passingScoreOn10Scale = quiz.passing_score ? (quiz.passing_score / 100) * 10 : null;
      const isPassed = passingScoreOn10Scale ? parseFloat(attempt.score) >= passingScoreOn10Scale : null;
      
      // Update attempt with calculated fields
      await (QuizAttempt as any).update({
        max_score: 10, // Max score is always 10 for 10-point scale
        time_spent_minutes: timeSpentMinutes,
        is_passed: isPassed
      }, {
        where: { id: attemptId }
      });
      
      logger.info('Recalculated attempt score', { attemptId, maxScore, timeSpentMinutes, isPassed });
      
    } catch (error) {
      logger.error('Error recalculating attempt score:', error);
      throw error;
    }
  }

  /**
   * Get user's quiz attempts
   */
  async getUserQuizAttempts(quizId: string, userId: string) {
    try {
      const { QuizAttempt } = require('../../models');
      const attempts = await (QuizAttempt as any).findAll({
        where: { 
          quiz_id: quizId,
          user_id: userId
        },
        order: [['created_at', 'DESC']]
      });
      return attempts;
    } catch (error) {
      logger.error('Error getting user quiz attempts:', error);
      throw error;
    }
  }
}