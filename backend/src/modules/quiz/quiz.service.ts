import { QuizRepository } from './quiz.repository';
import { CreateOptionDto, CreateQuestionDto, CreateQuizDto, SubmitQuizDto, QuizAttemptDto } from './quiz.types';
import { ApiError } from '../../errors/api.error';
import { AuthorizationError } from '../../errors/authorization.error';
import logger from '../../utils/logger.util';
import { CourseInstance, QuizAttemptInstance } from '../../types/model.types';

export class QuizService {
  private repo: QuizRepository;

  constructor() {
    this.repo = new QuizRepository();
  }

  // ===================================
  // QUIZ MANAGEMENT
  // ===================================

  async createQuiz(userId: string, dto: CreateQuizDto) {
    try {
      // Verify user is instructor of the course
      await this.verifyInstructorAccess(dto.course_id, userId);
      
      const quiz = await this.repo.createQuiz(dto);
      logger.info(`Quiz created: ${quiz.id} by user ${userId}`);
      return quiz;
    } catch (error: unknown) {
      logger.error(`Error creating quiz: ${error}`);
      throw error;
    }
  }

  async getQuiz(quizId: string, userId?: string, includeAnswers: boolean = false) {
    try {
      const quiz = await this.repo.getQuizById(quizId, includeAnswers);
      if (!quiz) {
        throw new ApiError('Quiz not found', 404);
      }

      // Check if quiz is published or user is instructor
      if (!quiz.is_published && userId) {
        await this.verifyInstructorAccess(quiz.course_id, userId);
      }

      return quiz;
    } catch (error: unknown) {
      logger.error(`Error getting quiz: ${error}`);
      throw error;
    }
  }

  async updateQuiz(quizId: string, userId: string, data: Partial<CreateQuizDto>) {
    try {
      const quiz = await this.repo.getQuizById(quizId);
      if (!quiz) {
        throw new ApiError('Quiz not found', 404);
      }

      await this.verifyInstructorAccess(quiz.course_id, userId);

      const updated = await this.repo.updateQuiz(quizId, data);
      logger.info(`Quiz updated: ${quizId} by user ${userId}`);
      return updated;
    } catch (error: unknown) {
      logger.error(`Error updating quiz: ${error}`);
      throw error;
    }
  }

  async deleteQuiz(quizId: string, userId: string) {
    try {
      const quiz = await this.repo.getQuizById(quizId);
      if (!quiz) {
        throw new ApiError('Quiz not found', 404);
      }

      await this.verifyInstructorAccess(quiz.course_id, userId);

      await this.repo.deleteQuiz(quizId);
      logger.info(`Quiz deleted: ${quizId} by user ${userId}`);
      return true;
    } catch (error: unknown) {
      logger.error(`Error deleting quiz: ${error}`);
      throw error;
    }
  }

  // ===================================
  // QUESTION MANAGEMENT
  // ===================================

  async addQuestion(quizId: string, userId: string, dto: CreateQuestionDto) {
    try {
      const quiz = await this.repo.getQuizById(quizId);
      if (!quiz) {
        throw new ApiError('Quiz not found', 404);
      }

      await this.verifyInstructorAccess(quiz.course_id, userId);

      const question = await this.repo.addQuestion(quizId, dto);
      logger.info(`Question added to quiz ${quizId}: ${question.id}`);
      return question;
    } catch (error: unknown) {
      logger.error(`Error adding question: ${error}`);
      throw error;
    }
  }

  async updateQuestion(questionId: string, userId: string, data: Partial<CreateQuestionDto>) {
    try {
      const question = await this.repo.getQuestionById(questionId);
      if (!question) {
        throw new ApiError('Question not found', 404);
      }

      const quiz = await this.repo.getQuizById(question.quiz_id);
      await this.verifyInstructorAccess(quiz!.course_id, userId);

      const updated = await this.repo.updateQuestion(questionId, data);
      logger.info(`Question updated: ${questionId}`);
      return updated;
    } catch (error: unknown) {
      logger.error(`Error updating question: ${error}`);
      throw error;
    }
  }

  async deleteQuestion(questionId: string, userId: string) {
    try {
      const question = await this.repo.getQuestionById(questionId);
      if (!question) {
        throw new ApiError('Question not found', 404);
      }

      const quiz = await this.repo.getQuizById(question.quiz_id);
      await this.verifyInstructorAccess(quiz!.course_id, userId);

      await this.repo.deleteQuestion(questionId);
      logger.info(`Question deleted: ${questionId}`);
      return true;
    } catch (error: unknown) {
      logger.error(`Error deleting question: ${error}`);
      throw error;
    }
  }

  async addOption(questionId: string, userId: string, dto: CreateOptionDto) {
    try {
      const question = await this.repo.getQuestionById(questionId);
      if (!question) {
        throw new ApiError('Question not found', 404);
      }

      const quiz = await this.repo.getQuizById(question.quiz_id);
      await this.verifyInstructorAccess(quiz!.course_id, userId);

      const option = await this.repo.addOption(questionId, dto);
      logger.info(`Option added to question ${questionId}: ${option.id}`);
      return option;
    } catch (error: unknown) {
      logger.error(`Error adding option: ${error}`);
      throw error;
    }
  }

  async getQuizQuestions(quizId: string, userId?: string, includeAnswers: boolean = false) {
    try {
      const quiz = await this.repo.getQuizById(quizId);
      if (!quiz) {
        throw new ApiError('Quiz not found', 404);
      }

      // Check permissions for unpublished quiz or to see correct answers
      if ((!quiz.is_published || includeAnswers) && userId) {
        await this.verifyInstructorAccess(quiz.course_id, userId);
      }

      const questions = await this.repo.listQuestions(quizId, includeAnswers);
      
      // Shuffle questions if enabled and not instructor view
      if (quiz.shuffle_questions && !includeAnswers) {
        return this.shuffleArray(questions);
      }

      return questions;
    } catch (error: unknown) {
      logger.error(`Error getting quiz questions: ${error}`);
      throw error;
    }
  }

  // ===================================
  // QUIZ ATTEMPTS
  // ===================================

  async startQuizAttempt(quizId: string, userId: string): Promise<QuizAttemptDto> {
    try {
      const quiz = await this.repo.getQuizById(quizId);
      if (!quiz) {
        throw new ApiError('Quiz not found', 404);
      }

      // Check if quiz is available
      if (!quiz.is_published) {
        throw new ApiError('Quiz is not published', 403);
      }

      const now = new Date();
      if (quiz.available_from && new Date(quiz.available_from) > now) {
        throw new ApiError('Quiz is not yet available', 403);
      }

      if (quiz.available_until && new Date(quiz.available_until) < now) {
        throw new ApiError('Quiz is no longer available', 403);
      }

      // Check attempt limits
      const attemptCount = await this.repo.getUserAttemptCount(quizId, userId);
      if (quiz.max_attempts && attemptCount >= quiz.max_attempts) {
        throw new ApiError('Maximum attempts reached', 403);
      }

      // Check if user has an active attempt
      const activeAttempt = await this.repo.getActiveAttempt(quizId, userId);
      if (activeAttempt) {
        return this.mapAttemptToDto(activeAttempt);
      }

      // Create new attempt
      const attempt = await this.repo.startAttempt(quizId, userId, attemptCount + 1);
      logger.info(`Quiz attempt started: ${attempt.id} for user ${userId}`);
      
      return this.mapAttemptToDto(attempt);
    } catch (error: unknown) {
      logger.error(`Error starting quiz attempt: ${error}`);
      throw error;
    }
  }

  async submitQuizAnswer(attemptId: string, userId: string, dto: SubmitQuizDto) {
    try {
      const attempt = await this.repo.getAttemptById(attemptId);
      if (!attempt) {
        throw new ApiError('Quiz attempt not found', 404);
      }

      if (attempt.user_id !== userId) {
        throw new AuthorizationError('Not authorized to submit answers for this attempt');
      }

      if (attempt.submitted_at) {
        throw new ApiError('Quiz attempt already submitted', 400);
      }

      // Check time limit
      const quiz = await this.repo.getQuizById(attempt.quiz_id);
      if (!quiz) {
        throw new ApiError('Quiz not found', 404);
      }

      if (quiz.duration_minutes) {
        const timeElapsed = (Date.now() - new Date(attempt.started_at).getTime()) / (1000 * 60);
        if (timeElapsed > quiz.duration_minutes) {
          throw new ApiError('Time limit exceeded', 400);
        }
      }

      // Submit answers
      const answers = await this.repo.submitAnswers(attemptId, dto.answers);
      
      // Calculate score (always auto-grade for now)
      const score = await this.calculateScore(attemptId);
      await this.repo.updateAttemptScore(attemptId, score);

      // Mark attempt as submitted
      await this.repo.submitAttempt(attemptId);
      
      logger.info(`Quiz attempt submitted: ${attemptId} by user ${userId}`);
      
      return {
        attempt_id: attemptId,
        submitted_at: new Date(),
        score,
        answers
      };
    } catch (error: unknown) {
      logger.error(`Error submitting quiz answer: ${error}`);
      throw error;
    }
  }

  async getUserAttempts(quizId: string, userId: string) {
    return await this.repo.getUserAttempts(quizId, userId);
  }

  async getAttemptDetails(attemptId: string, userId: string) {
    try {
      const attempt = await this.repo.getAttemptWithDetails(attemptId);
      if (!attempt) {
        throw new ApiError('Quiz attempt not found', 404);
      }

      if (attempt.user_id !== userId) {
        throw new AuthorizationError('Not authorized to view this attempt');
      }

      return attempt;
    } catch (error: unknown) {
      logger.error(`Error getting attempt details: ${error}`);
      throw error;
    }
  }

  // ===================================
  // INSTRUCTOR FEATURES
  // ===================================

  async getQuizStatistics(quizId: string, userId: string) {
    try {
      const quiz = await this.repo.getQuizById(quizId);
      if (!quiz) {
        throw new ApiError('Quiz not found', 404);
      }

      await this.verifyInstructorAccess(quiz.course_id, userId);

      const stats = await this.repo.getQuizStatistics(quizId);
      return stats;
    } catch (error: unknown) {
      logger.error(`Error getting quiz statistics: ${error}`);
      throw error;
    }
  }

  async getQuizAttempts(quizId: string, userId: string, page: number = 1, limit: number = 20) {
    try {
      const quiz = await this.repo.getQuizById(quizId);
      if (!quiz) {
        throw new ApiError('Quiz not found', 404);
      }

      await this.verifyInstructorAccess(quiz.course_id, userId);

      const attempts = await this.repo.getQuizAttempts(quizId, page, limit);
      return attempts;
    } catch (error: unknown) {
      logger.error(`Error getting quiz attempts: ${error}`);
      throw error;
    }
  }

  // ===================================
  // HELPER METHODS
  // ===================================

  private async verifyInstructorAccess(courseId: string, userId: string) {
    const { Course } = await import('../../models');
    const course = await Course.findByPk(courseId) as CourseInstance | null;
    
    if (!course) {
      throw new ApiError('Course not found', 404);
    }

    if (course.instructor_id !== userId) {
      throw new AuthorizationError('Only the course instructor can perform this action');
    }

    return course;
  }

  private async calculateScore(attemptId: string): Promise<number> {
    const answers = await this.repo.getAttemptAnswers(attemptId);
    let correctAnswers = 0;
    let totalQuestions = 0;

    for (const answer of answers) {
      totalQuestions++;
      const question = await this.repo.getQuestionById(answer.question_id);
      
      if (question?.question_type === 'single_choice') {
        const selectedOption = await this.repo.getOptionById(answer.selected_option_id!);
        if (selectedOption?.is_correct) {
          correctAnswers++;
        }
      } else if (question?.question_type === 'multiple_choice') {
        const selectedIds = Array.isArray(answer.selected_options) ? answer.selected_options : [];
        const selectedOptions = await this.repo.getOptionsByIds(selectedIds);
        const correctOptions = await this.repo.getCorrectOptions(question.id);
        if (selectedOptions.length === correctOptions.length &&
            selectedOptions.every(opt => correctOptions.some(correct => correct.id === opt.id))) {
          correctAnswers++;
        }
      } else if (question?.question_type === 'true_false') {
        const correctOptions = await this.repo.getCorrectOptions(question.id);
        const selected = answer.selected_option_id ? await this.repo.getOptionById(answer.selected_option_id) : null;
        const correctText = correctOptions[0]?.option_text?.toLowerCase();
        const selectedText = selected?.option_text?.toLowerCase();
        if (correctText && selectedText && correctText === selectedText) {
          correctAnswers++;
        }
      }
    }

    return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private mapAttemptToDto(attempt: QuizAttemptInstance): QuizAttemptDto {
    return {
      id: attempt.id,
      quiz_id: attempt.quiz_id,
      user_id: attempt.user_id,
      attempt_number: attempt.attempt_number,
      started_at: attempt.started_at,
      submitted_at: attempt.submitted_at || undefined,
      score: attempt.score || undefined,
      status: attempt.submitted_at 
        ? (attempt.score !== null && attempt.score !== undefined ? 'graded' : 'submitted')
        : 'in_progress'
    };
  }
}





