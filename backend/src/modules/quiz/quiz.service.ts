import { QuizRepository } from './quiz.repository';
import { CreateOptionDto, CreateQuestionDto, CreateQuizDto, SubmitQuizDto, QuizAttemptDto } from './quiz.types';
import { ApiError } from '../../errors/api.error';
import { AuthorizationError } from '../../errors/authorization.error';
import logger from '../../utils/logger.util';
import { CourseInstance, QuizAttemptInstance } from '../../types/model.types';
import { Op } from 'sequelize';

const QUIZ_TOTAL_POINTS = 100;

export class QuizService {
  private repo: QuizRepository;

  constructor() {
    this.repo = new QuizRepository();
  }

  // ===================================
  // QUIZ MANAGEMENT
  // ===================================

  // Controller compatibility wrappers
  async getAllQuizzes(options: { page: number; limit: number; course_id?: string; section_id?: string; status?: string; }) {
    const { default: Quiz } = await import('../../models/quiz.model');
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;
    const where: any = {};

    // Nếu filter theo course_id, bao gồm cả quiz cấp course và quiz cấp section thuộc course đó
    if (options.course_id) {
      const { default: Section } = await import('../../models/section.model');
      const sections = await (Section as any).findAll({
        where: { course_id: options.course_id },
        attributes: ['id'],
      });
      const sectionIds = sections.map((s: any) => s.id);

      where[Op.or] = [
        { course_id: options.course_id },
        ...(sectionIds.length ? [{ section_id: sectionIds }] : []),
      ];
    }

    if (options.section_id) {
      where.section_id = options.section_id;
    }

    // Map status → is_published (đơn giản hoá cho FE)
    if (options.status === 'published') {
      where.is_published = true;
    } else if (options.status === 'draft') {
      where.is_published = false;
    }

    logger.info('[QuizService] getAllQuizzes query:', {
      where,
      limit,
      offset,
      options,
    });

    const { rows, count } = await (Quiz as any).findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    logger.info('[QuizService] getAllQuizzes result:', {
      count,
      rowsCount: rows.length,
      firstQuiz: rows[0] ? {
        id: rows[0].id,
        title: rows[0].title,
        course_id: rows[0].course_id,
        section_id: rows[0].section_id,
      } : null,
    });

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getQuizById(id: string) {
    return this.getQuiz(id);
  }

  // Overloads to support controller calls with or without user context
  async createQuiz(userId: string, dto: CreateQuizDto): Promise<any>;
  async createQuiz(dto: CreateQuizDto): Promise<any>;
  async createQuiz(arg1: string | CreateQuizDto, arg2?: CreateQuizDto): Promise<any> {
    // If userId provided (string), enforce instructor access
    if (typeof arg1 === 'string' && arg2) {
      const userId = arg1;
      const dto = arg2;
      await this.verifyInstructorAccess(dto.course_id, userId, dto.section_id);
      const quiz = await this.repo.createQuiz(dto);
      logger.info(`Quiz created: ${quiz.id} by user ${userId}`);
      return quiz;
    }

    // Fallback: create directly without user context (used by some controllers/tests)
    const dto = arg1 as CreateQuizDto;
    return await this.repo.createQuiz(dto);
  }

  // Overloads for update/delete to match different controller call sites
  async updateQuiz(quizId: string, userId: string, data: Partial<CreateQuizDto>): Promise<any>;
  async updateQuiz(quizId: string, data: Partial<CreateQuizDto>): Promise<any>;
  async updateQuiz(quizId: string, arg2: string | Partial<CreateQuizDto>, arg3?: Partial<CreateQuizDto>) {
    if (typeof arg2 === 'string') {
      const userId = arg2;
      const data = arg3 || {};
      const quiz = await this.repo.getQuizById(quizId);
      if (!quiz) throw new ApiError('Quiz not found', 404);
      await this.verifyInstructorAccess(quiz.course_id, userId, (quiz as any)?.section_id);
      return this.repo.updateQuiz(quizId, data);
    }
    const data = arg2 as Partial<CreateQuizDto>;
    return this.repo.updateQuiz(quizId, data);
  }

  async deleteQuiz(quizId: string, userId: string): Promise<boolean>;
  async deleteQuiz(quizId: string): Promise<boolean>;
  async deleteQuiz(quizId: string, userId?: string): Promise<boolean> {
    if (userId) {
      const quiz = await this.repo.getQuizById(quizId);
      if (!quiz) throw new ApiError('Quiz not found', 404);
      await this.verifyInstructorAccess(quiz.course_id, userId, (quiz as any)?.section_id);
    }
    await this.repo.deleteQuiz(quizId);
    return true;
  }

  // Removed duplicate createQuiz implementation (handled by overload above)

  async getQuiz(quizId: string, userId?: string, includeAnswers: boolean = false) {
    try {
      const quiz = await this.repo.getQuizById(quizId, includeAnswers);
      if (!quiz) {
        throw new ApiError('Quiz not found', 404);
      }

      // Check if quiz is published or user is instructor
      if (!quiz.is_published && userId) {
        await this.verifyInstructorAccess(quiz.course_id, userId, (quiz as any)?.section_id);
      }

      return quiz;
    } catch (error: unknown) {
      logger.error(`Error getting quiz: ${error}`);
      throw error;
    }
  }

  async updateQuizStrict(quizId: string, userId: string, data: Partial<CreateQuizDto>) {
    try {
      const quiz = await this.repo.getQuizById(quizId);
      if (!quiz) {
        throw new ApiError('Quiz not found', 404);
      }

      await this.verifyInstructorAccess(quiz.course_id, userId, (quiz as any)?.section_id);

      const updated = await this.repo.updateQuiz(quizId, data);
      logger.info(`Quiz updated: ${quizId} by user ${userId}`);
      return updated;
    } catch (error: unknown) {
      logger.error(`Error updating quiz: ${error}`);
      throw error;
    }
  }

  async deleteQuizStrict(quizId: string, userId: string) {
    try {
      const quiz = await this.repo.getQuizById(quizId);
      if (!quiz) {
        throw new ApiError('Quiz not found', 404);
      }

      await this.verifyInstructorAccess(quiz.course_id, userId, (quiz as any)?.section_id);

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

      await this.verifyInstructorAccess(quiz.course_id, userId, (quiz as any)?.section_id);

      const question = await this.repo.addQuestion(quizId, dto);
      await this.rebalanceQuestionPoints(quizId);

      if (!question) {
        throw new ApiError('Failed to create question', 500);
      }

      logger.info(`Question added to quiz ${quizId}: ${question.id}`);
      return await this.repo.getQuestionById(question.id);
    } catch (error: unknown) {
      logger.error(`Error adding question: ${error}`);
      throw error;
    }
  }

  // Controller compatibility wrappers for questions
  async getQuizQuestionById(_quizId: string, questionId: string) {
    return this.repo.getQuestionById(questionId);
  }

  async createQuizQuestion(quizId: string, dto: CreateQuestionDto) {
    const question = await this.repo.addQuestion(quizId, dto);
    await this.rebalanceQuestionPoints(quizId);

    if (!question) {
      throw new ApiError('Failed to create question', 500);
    }

    return await this.repo.getQuestionById(question.id);
  }

  async updateQuizQuestion(_quizId: string, questionId: string, data: Partial<CreateQuestionDto>) {
    return this.repo.updateQuestion(questionId, data);
  }

  async deleteQuizQuestion(_quizId: string, questionId: string) {
    await this.repo.deleteQuestion(questionId);
    return true;
  }

  async updateQuestion(questionId: string, userId: string, data: Partial<CreateQuestionDto>) {
    try {
      const question = await this.repo.getQuestionById(questionId);
      if (!question) {
        throw new ApiError('Question not found', 404);
      }

      const quiz = await this.repo.getQuizById(question.quiz_id);
      await this.verifyInstructorAccess(quiz!.course_id, userId, (quiz as any)?.section_id);

      if (data.points !== undefined) {
        delete data.points;
      }

      const updated = await this.repo.updateQuestion(questionId, data);
      await this.rebalanceQuestionPoints(question.quiz_id);
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
      await this.verifyInstructorAccess(quiz!.course_id, userId, (quiz as any)?.section_id);

      await this.repo.deleteQuestion(questionId);
      await this.rebalanceQuestionPoints(question.quiz_id);
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
      await this.verifyInstructorAccess(quiz!.course_id, userId, (quiz as any)?.section_id);

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

      const quizSectionId = (quiz as any)?.section_id;
      logger.debug(`[QuizService] getQuizQuestions: quizId=${quizId}, course_id=${quiz.course_id}, section_id=${quizSectionId}, userId=${userId}, includeAnswers=${includeAnswers}, is_published=${quiz.is_published}`);

      // Check permissions for unpublished quiz or to see correct answers
      if ((!quiz.is_published || includeAnswers) && userId) {
        await this.verifyInstructorAccess(quiz.course_id, userId, quizSectionId);
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

  async getCurrentAttempt(quizId: string, userId: string): Promise<QuizAttemptDto | null> {
    try {
      const attempt = await this.repo.getActiveAttempt(quizId, userId);
      if (!attempt) {
        return null;
      }
      return this.mapAttemptToDto(attempt);
    } catch (error: unknown) {
      logger.error(`Error getting current quiz attempt: ${error}`);
      throw error;
    }
  }

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

      // Đếm tổng số lần làm để gán attempt_number cho bản ghi mới
      const attemptCount = await this.repo.getUserAttemptCount(quizId, userId);

      // Giới hạn số lần chỉ áp dụng cho Graded Quiz
      if (!quiz.is_practice) {
        if (quiz.max_attempts && quiz.max_attempts > 0 && attemptCount >= quiz.max_attempts) {
          throw new ApiError('Maximum attempts reached', 403);
        }
      }

      // Check if user has an active attempt
      const activeAttempt = await this.repo.getActiveAttempt(quizId, userId);
      if (activeAttempt) {
        return this.mapAttemptToDto(activeAttempt);
      }

      // Create new attempt với attempt_number = attemptCount + 1
      const attempt = await this.repo.startAttempt(quizId, userId, attemptCount + 1);
      logger.info(`Quiz attempt started: ${attempt.id} for user ${userId}`);
      
      return this.mapAttemptToDto(attempt);
    } catch (error: unknown) {
      logger.error(`Error starting quiz attempt: ${error}`);
      throw error;
    }
  }

  async submitQuizAnswer(
    attemptId: string,
    userId: string,
    dtoAnswers?: SubmitQuizDto['answers']
  ) {
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

      // Time limit check (tạm thời chỉ log cảnh báo, không chặn nộp bài để tránh kẹt user)
      if (quiz.duration_minutes && quiz.duration_minutes > 0) {
        const timeElapsed = (Date.now() - new Date(attempt.started_at).getTime()) / (1000 * 60);
        if (timeElapsed > quiz.duration_minutes) {
          // Chỉ log để debug, không throw lỗi
          logger.warn('Quiz time limit exceeded but allowing submission', {
            quizId: quiz.id,
            attemptId: attempt.id,
            durationMinutes: quiz.duration_minutes,
            timeElapsedMinutes: timeElapsed,
          });
        }
      }

      // Submit answers (nếu có). Nếu FE không gửi answers (hoặc rỗng) thì vẫn cho nộp,
      // coi như bài làm không có câu trả lời.
      const answersInput = dtoAnswers ?? [];
      const answers = answersInput.length
        ? await this.repo.submitAnswers(attemptId, answersInput)
        : [];
      
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

  // Controller compatibility wrappers for attempts
  async submitQuizAttempt(attemptId: string, userId: string, answers: SubmitQuizDto) {
    return this.submitQuizAnswer(attemptId, userId, answers.answers);
  }

  async getQuizAttemptById(attemptId: string, userId: string) {
    try {
      // Lấy attempt với đầy đủ thông tin (bao gồm quiz, answers, questions)
      const attempt = await this.repo.getAttemptWithDetails(attemptId);
      if (!attempt) {
        throw new ApiError('Quiz attempt not found', 404);
      }

      if (attempt.user_id !== userId) {
        throw new AuthorizationError('Not authorized to view this attempt');
      }

      // Tính toán thống kê từ answers (không dựa vào cột is_correct trong quiz_answers,
      // mà tính lại giống hàm calculateScore)
      const answersRaw = await this.repo.getAttemptAnswers(attemptId);
      // Normalize answers từ Sequelize models thành plain objects
      const answers = answersRaw.map((a: any) => {
        const answerData = a.toJSON ? a.toJSON() : a;
        return {
          ...answerData,
          question_id: String(answerData.question_id).trim(),
          selected_option_id: answerData.selected_option_id ? String(answerData.selected_option_id).trim() : null,
          selected_options: Array.isArray(answerData.selected_options) 
            ? answerData.selected_options.map((id: any) => String(id).trim())
            : null,
        };
      });
      
      const questions = await this.repo.listQuestions(attempt.quiz_id, true);
      
      let correctAnswers = 0;
      let incorrectAnswers = 0;
      let unanswered = 0;

      const questionsWithReview = await Promise.all(
        questions.map(async (q: any) => {
          const question = q.toJSON ? q.toJSON() : q;
          const questionId = String(question.id).trim();
          
          // Normalize answer.question_id để so sánh chính xác
          const answer = answers.find((a: any) => {
            const answerQuestionId = String(a.question_id).trim();
            return answerQuestionId === questionId;
          });

          if (!answer) {
            unanswered++;
            return {
              ...question,
              is_correct: false,
              student_answer: null,
              correct_answer: this.formatCorrectAnswer(question),
              points: parseFloat(question.points) || 0,
              explanation: question.explanation || null,
            };
          }

          const isCorrect = await this.isAnswerCorrect(question, answer);
          if (isCorrect) {
            correctAnswers++;
          } else {
            incorrectAnswers++;
          }

          return {
            ...question,
            is_correct: isCorrect,
            student_answer: this.formatStudentAnswer(question, answer),
            correct_answer: this.formatCorrectAnswer(question),
            points: parseFloat(question.points) || 0,
            explanation: question.explanation || null,
          };
        })
      );

      // Map attempt để include thống kê và quiz info
      const attemptData = attempt.toJSON ? attempt.toJSON() : attempt;
      return {
        ...attemptData,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        unanswered,
        questions: questionsWithReview,
      };
    } catch (error: unknown) {
      logger.error(`Error getting quiz attempt by ID: ${error}`);
      throw error;
    }
  }

  private formatStudentAnswer(question: any, answer: any): string {
    if (question.question_type === 'multiple_choice') {
      const selectedIds = Array.isArray(answer.selected_options) 
        ? answer.selected_options.map((id: any) => String(id).trim())
        : [];
      const options = question.options || [];
      const selectedOptions = options.filter((opt: any) => {
        const optId = String(opt.id).trim();
        return selectedIds.some((selectedId: string) => selectedId === optId);
      });
      return selectedOptions.map((opt: any) => opt.option_text).join(', ') || '';
    } else {
      const selectedId = answer.selected_option_id ? String(answer.selected_option_id).trim() : null;
      if (!selectedId) return '';
      const option = (question.options || []).find((opt: any) => {
        const optId = String(opt.id).trim();
        return optId === selectedId;
      });
      return option?.option_text || '';
    }
  }

  private formatCorrectAnswer(question: any): string {
    const correctOptions = (question.options || []).filter((opt: any) => opt.is_correct) || [];
    return correctOptions.map((opt: any) => opt.option_text).join(', ');
  }

  private async isAnswerCorrect(question: any, answer: any): Promise<boolean> {
    if (!question) return false;

    if (question.question_type === 'single_choice') {
      const options = question.options || [];
      const selectedId = answer.selected_option_id ? String(answer.selected_option_id).trim() : null;
      if (!selectedId) return false;
      const selected = options.find((opt: any) => {
        const optId = String(opt.id).trim();
        return optId === selectedId;
      });
      return !!selected?.is_correct;
    }

    if (question.question_type === 'multiple_choice') {
      const options = question.options || [];
      const selectedIds = Array.isArray(answer.selected_options) 
        ? answer.selected_options.map((id: any) => String(id).trim())
        : [];
      const selectedOptions = options.filter((opt: any) => {
        const optId = String(opt.id).trim();
        return selectedIds.some((selectedId: string) => selectedId === optId);
      });
      const correctOptions = options.filter((opt: any) => opt.is_correct);

      if (selectedOptions.length !== correctOptions.length) {
        return false;
      }

      return selectedOptions.every((opt: any) => {
        const optId = String(opt.id).trim();
        return correctOptions.some((c: any) => {
          const correctId = String(c.id).trim();
          return correctId === optId;
        });
      });
    }

    if (question.question_type === 'true_false') {
      const options = question.options || [];
      const correct = options.find((opt: any) => opt.is_correct);
      const selectedId = answer.selected_option_id ? String(answer.selected_option_id).trim() : null;
      if (!selectedId) return false;
      const selected = options.find((opt: any) => {
        const optId = String(opt.id).trim();
        return optId === selectedId;
      });
      const correctText = correct?.option_text?.toLowerCase();
      const selectedText = selected?.option_text?.toLowerCase();
      return !!correctText && !!selectedText && correctText === selectedText;
    }

    return false;
  }

  async getUserQuizAttempts(quizId: string, userId: string) {
    return this.getUserAttempts(quizId, userId);
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

      await this.verifyInstructorAccess(quiz.course_id, userId, (quiz as any)?.section_id);

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

      await this.verifyInstructorAccess(quiz.course_id, userId, (quiz as any)?.section_id);

      const attempts = await this.repo.getQuizAttempts(quizId, page, limit);
      return attempts;
    } catch (error: unknown) {
      logger.error(`Error getting quiz attempts: ${error}`);
      throw error;
    }
  }

  async getStudentQuizAttempts(quizId: string, studentId: string, instructorId: string) {
    try {
      const quiz = await this.repo.getQuizById(quizId);
      if (!quiz) {
        throw new ApiError('Quiz not found', 404);
      }

      await this.verifyInstructorAccess(quiz.course_id, instructorId, (quiz as any)?.section_id);

      const attempts = await this.repo.getStudentQuizAttempts(quizId, studentId);
      return attempts;
    } catch (error: unknown) {
      logger.error(`Error getting student quiz attempts: ${error}`);
      throw error;
    }
  }

  async deleteStudentQuizAttempts(quizId: string, studentId: string, instructorId: string) {
    try {
      const quiz = await this.repo.getQuizById(quizId);
      if (!quiz) {
        throw new ApiError('Quiz not found', 404);
      }

      await this.verifyInstructorAccess(quiz.course_id, instructorId, (quiz as any)?.section_id);

      const deletedCount = await this.repo.deleteStudentQuizAttempts(quizId, studentId);
      return { deletedCount };
    } catch (error: unknown) {
      logger.error(`Error deleting student quiz attempts: ${error}`);
      throw error;
    }
  }

  // ===================================
  // HELPER METHODS
  // ===================================

  private async resolveCourseIdFromSection(sectionId?: string | null): Promise<string | null> {
    if (!sectionId) {
      logger.debug(`[QuizService] resolveCourseIdFromSection: sectionId is null/undefined`);
      return null;
    }
    
    try {
      const { default: Section } = await import('../../models/section.model');
      
      logger.debug(`[QuizService] resolveCourseIdFromSection: Looking up section ${sectionId}`);
      const section = await (Section as any).findByPk(sectionId, { attributes: ['id', 'course_id'] });
      if (!section) {
        logger.error(`[QuizService] resolveCourseIdFromSection: Section ${sectionId} not found`);
        throw new ApiError('Section not found', 404);
      }
      
      logger.debug(`[QuizService] resolveCourseIdFromSection: Found section, course_id: ${section.course_id}`);
      return section.course_id;
    } catch (error: any) {
      logger.error(`[QuizService] resolveCourseIdFromSection: Error resolving course_id from section ${sectionId}:`, error);
      throw error;
    }
  }

  private async verifyInstructorAccess(courseId: string | null | undefined, userId: string, sectionId?: string | null) {
    logger.debug(`[QuizService] verifyInstructorAccess: courseId=${courseId}, sectionId=${sectionId}, userId=${userId}`);
    
    let resolvedCourseId: string | null | undefined = courseId;
    
    // Nếu courseId là null/undefined và có sectionId, thử resolve từ section
    if (!resolvedCourseId && sectionId) {
      try {
        resolvedCourseId = await this.resolveCourseIdFromSection(sectionId);
        logger.debug(`[QuizService] verifyInstructorAccess: Resolved courseId from section: ${resolvedCourseId}`);
      } catch (error: any) {
        logger.error(`[QuizService] verifyInstructorAccess: Failed to resolve courseId from section ${sectionId}:`, error);
        throw error;
      }
    }
    
    if (!resolvedCourseId) {
      logger.error(`[QuizService] verifyInstructorAccess: Course context not found (courseId=${courseId}, sectionId=${sectionId})`);
      throw new ApiError('Course context not found', 400);
    }
    
    const { Course } = await import('../../models');
    const course = await Course.findByPk(resolvedCourseId) as CourseInstance | null;
    
    if (!course) {
      logger.error(`[QuizService] verifyInstructorAccess: Course ${resolvedCourseId} not found`);
      throw new ApiError('Course not found', 404);
    }

    if (course.instructor_id !== userId) {
      logger.error(`[QuizService] verifyInstructorAccess: User ${userId} is not instructor of course ${resolvedCourseId} (instructor_id: ${course.instructor_id})`);
      throw new AuthorizationError('Only the course instructor can perform this action');
    }

    logger.debug(`[QuizService] verifyInstructorAccess: Access granted for user ${userId} to course ${resolvedCourseId}`);
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

  private calculatePointsPerQuestion(questionCount: number) {
    return questionCount > 0 ? QUIZ_TOTAL_POINTS / questionCount : QUIZ_TOTAL_POINTS;
  }

  private async rebalanceQuestionPoints(quizId: string) {
    const questionCount = await this.repo.countQuestions(quizId);
    if (questionCount === 0) {
      return;
    }

    const pointsPerQuestion = this.calculatePointsPerQuestion(questionCount);
    await this.repo.setAllQuestionPoints(quizId, pointsPerQuestion);
  }
}





