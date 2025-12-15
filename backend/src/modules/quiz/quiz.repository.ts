import { Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizAnswer, User } from '../../models';
import { Op } from 'sequelize';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto, UpdateQuestionDto } from './quiz.types';
import { QuizOptionCreationAttributes, QuizAnswerCreationAttributes } from '../../types/model.types';
import logger from '../../utils/logger.util';
type QuizOptionCreateDTO = Omit<QuizOptionCreationAttributes, 'id' | 'created_at' | 'updated_at' | 'question_id'>;
type QuizAnswerCreateDTO = Omit<QuizAnswerCreationAttributes, 'id' | 'created_at' | 'updated_at' | 'attempt_id'>;

export class QuizRepository {
  // ===================================
  // QUIZ CRUD
  // ===================================

  async createQuiz(data: CreateQuizDto) {
    const payload = {
      // XOR logic: nếu có section_id thì course_id = null, ngược lại
      // Nếu cả hai đều undefined (tạo từ Section), cả hai đều null (sẽ được update sau)
      course_id: data.section_id ? null : (data.course_id ?? null),
      section_id: data.section_id ?? null,
      title: data.title,
      description: data.description,
      duration_minutes: data.duration_minutes,
      passing_score: data.passing_score,
      max_attempts: data.max_attempts,
      shuffle_questions: data.shuffle_questions ?? false,
      show_correct_answers: data.show_correct_answers ?? true,
      available_from: data.available_from != null ? new Date(data.available_from) : undefined,
      available_until: data.available_until != null ? new Date(data.available_until) : undefined,
      is_published: data.is_published ?? false,
      is_practice: data.is_practice ?? false, // Mặc định là Graded Quiz
    };
    return await Quiz.create(payload);
  }

  async getQuizById(quizId: string, includeAnswers: boolean = false) {
    const includeOptions = includeAnswers ? [
      {
        model: QuizQuestion,
        as: 'questions',
        include: [
          {
            model: QuizOption,
            as: 'options'
          }
        ]
      }
    ] : [];

    return await Quiz.findByPk(quizId, {
      include: includeOptions
    });
  }

  async updateQuiz(quizId: string, data: UpdateQuizDto) {
    const payload: Partial<{
      course_id?: string | null;
      section_id?: string | null;
      title: string;
      description?: string;
      duration_minutes?: number;
      passing_score?: number;
      max_attempts?: number;
      shuffle_questions?: boolean;
      show_correct_answers?: boolean;
      available_from?: Date | null;
      available_until?: Date | null;
      is_published?: boolean;
      is_practice?: boolean;
    }> = {};

    if (data.course_id !== undefined || data.section_id !== undefined) {
      // Enforce XOR at update time
      if (data.section_id) {
        payload.section_id = data.section_id;
        payload.course_id = null;
      } else {
        payload.course_id = data.course_id ?? null;
        payload.section_id = null;
      }
    }

    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.duration_minutes !== undefined) payload.duration_minutes = data.duration_minutes;
    if (data.passing_score !== undefined) payload.passing_score = data.passing_score;
    if (data.max_attempts !== undefined) payload.max_attempts = data.max_attempts;
    if (data.shuffle_questions !== undefined) payload.shuffle_questions = data.shuffle_questions;
    if (data.show_correct_answers !== undefined) payload.show_correct_answers = data.show_correct_answers;
    if (data.available_from !== undefined) payload.available_from = data.available_from == null ? undefined : new Date(data.available_from);
    if (data.available_until !== undefined) payload.available_until = data.available_until == null ? undefined : new Date(data.available_until);
    if (data.is_published !== undefined) payload.is_published = data.is_published;
    if (data.is_practice !== undefined) payload.is_practice = data.is_practice;

    await Quiz.update(payload, { where: { id: quizId } });
    return await this.getQuizById(quizId);
  }

  async deleteQuiz(quizId: string) {
    return await Quiz.destroy({ where: { id: quizId } });
  }

  // ===================================
  // QUESTION CRUD
  // ===================================

  async addQuestion(quizId: string, data: CreateQuestionDto) {
    // Tính order_index an toàn ở backend để tránh trùng (quiz_id, order_index)
    const existingCount = await QuizQuestion.count({
      where: { quiz_id: quizId }
    });
    const nextOrderIndex = existingCount; // bỏ qua order_index từ client

    const payload = {
      quiz_id: quizId,
      question_text: data.question_text,
      question_type: data.question_type,
      points: data.points ?? 1.0,
      order_index: nextOrderIndex,
      explanation: data.explanation,
    };
    const question = await QuizQuestion.create(payload);

    // Tạo options nếu có
    if (data.options && data.options.length > 0) {
      const optionsToCreate = data.options.map((opt, idx) => ({
        question_id: question.id,
        option_text: opt.option_text,
        is_correct: opt.is_correct ?? false,
        // Luôn set order_index ở backend để đảm bảo không null và tuần tự
        order_index: idx,
      }));

      await QuizOption.bulkCreate(optionsToCreate);
    }

    // Trả về question với options included
    return await QuizQuestion.findByPk(question.id, {
      include: [
        {
          model: QuizOption,
          as: 'options',
          attributes: ['id', 'option_text', 'is_correct', 'order_index'],
          order: [['order_index', 'ASC']]
        }
      ]
    });
  }

  async getQuestionById(questionId: string) {
    return await QuizQuestion.findByPk(questionId, {
      include: [
        {
          model: QuizOption,
          as: 'options',
          attributes: ['id', 'option_text', 'is_correct', 'order_index'],
          order: [['order_index', 'ASC']]
        }
      ]
    });
  }

  async updateQuestion(questionId: string, data: UpdateQuestionDto) {
    const payload: Partial<{
      question_text: string;
      question_type: 'single_choice' | 'multiple_choice' | 'true_false';
      points: number;
      order_index: number;
      explanation?: string;
    }> = {};

    if (data.question_text !== undefined) payload.question_text = data.question_text;
    if (data.question_type !== undefined) payload.question_type = data.question_type;
    if (data.points !== undefined) payload.points = data.points;
    if (data.order_index !== undefined) payload.order_index = data.order_index;
    if (data.explanation !== undefined) payload.explanation = data.explanation;

    await QuizQuestion.update(payload, { where: { id: questionId } });
    return await this.getQuestionById(questionId);
  }

  async deleteQuestion(questionId: string) {
    return await QuizQuestion.destroy({ where: { id: questionId } });
  }

  async listQuestions(quizId: string, includeAnswers: boolean = false) {
    const optionAttributes = includeAnswers 
      ? ['id', 'option_text', 'is_correct', 'order_index']
      : ['id', 'option_text', 'order_index'];

    return await QuizQuestion.findAll({
      where: { quiz_id: quizId },
      order: [['order_index', 'ASC']],
      include: [
        {
          model: QuizOption,
          as: 'options',
          attributes: optionAttributes
        }
      ]
    });
  }

  async countQuestions(quizId: string) {
    return await QuizQuestion.count({
      where: { quiz_id: quizId }
    });
  }

  async setAllQuestionPoints(quizId: string, points: number) {
    await QuizQuestion.update(
      { points },
      { where: { quiz_id: quizId } }
    );
  }

  // ===================================
  // OPTION CRUD
  // ===================================

  async addOption(questionId: string, data: QuizOptionCreateDTO) {
    const payload: QuizOptionCreationAttributes = {
      question_id: questionId,
      option_text: data.option_text,
      order_index: data.order_index,
      is_correct: data.is_correct ?? false
    };
    return await QuizOption.create(payload);
  }

  async getOptionById(optionId: string) {
    return await QuizOption.findByPk(optionId);
  }

  async getOptionsByIds(optionIds: string[]) {
    return await QuizOption.findAll({
      where: { id: { [Op.in]: optionIds } }
    });
  }

  async getCorrectOptions(questionId: string) {
    return await QuizOption.findAll({
      where: { 
        question_id: questionId,
        is_correct: true
      }
    });
  }

  // ===================================
  // QUIZ ATTEMPTS
  // ===================================

  async startAttempt(quizId: string, userId: string, attemptNumber: number) {
    return await QuizAttempt.create({ 
      quiz_id: quizId, 
      user_id: userId, 
      attempt_number: attemptNumber,
      started_at: new Date()
    });
  }

  async getAttemptById(attemptId: string) {
    return await QuizAttempt.findByPk(attemptId);
  }

  async getActiveAttempt(quizId: string, userId: string) {
    return await QuizAttempt.findOne({
      where: {
        quiz_id: quizId,
        user_id: userId,
        [Op.and]: (QuizAttempt as any).sequelize!.where(
          (QuizAttempt as any).sequelize!.col('submitted_at'),
          { [Op.is]: null }
        )
      }
    });
  }

  async getUserAttemptCount(quizId: string, userId: string) {
    return await QuizAttempt.count({
      where: {
        quiz_id: quizId,
        user_id: userId
      }
    });
  }

  async getUserAttempts(quizId: string, userId: string) {
    return await QuizAttempt.findAll({
      where: {
        quiz_id: quizId,
        user_id: userId
      },
      order: [['started_at', 'DESC']]
    });
  }

  async getAttemptWithDetails(attemptId: string) {
    return await QuizAttempt.findByPk(attemptId, {
      include: [
        {
          model: QuizAnswer,
          as: 'answers',
          include: [
            {
              model: QuizQuestion,
              as: 'question',
              include: [
                {
                  model: QuizOption,
                  as: 'options'
                }
              ]
            }
          ]
        },
        {
          model: Quiz,
          as: 'quiz'
        }
      ]
    });
  }

  async submitAttempt(attemptId: string) {
    return await QuizAttempt.update(
      { submitted_at: new Date() },
      { where: { id: attemptId } }
    );
  }

  async updateAttemptScore(attemptId: string, score: number) {
    return await QuizAttempt.update(
      { score },
      { where: { id: attemptId } }
    );
  }

  // ===================================
  // QUIZ ANSWERS
  // ===================================

  async submitAnswer(attemptId: string, data: QuizAnswerCreateDTO) {
    const payload: QuizAnswerCreationAttributes = {
      attempt_id: attemptId,
      question_id: data.question_id,
      selected_option_id: data.selected_option_id,
      selected_options: data.selected_options,
      is_correct: data.is_correct,
      points_earned: data.points_earned
    };
    return await QuizAnswer.create(payload);
  }

  async submitAnswers(attemptId: string, answers: ReadonlyArray<QuizAnswerCreateDTO>) {
    // Normalize question_id và option IDs để đảm bảo consistency
    const answerData: QuizAnswerCreationAttributes[] = answers.map(answer => ({
      attempt_id: attemptId,
      question_id: String(answer.question_id).trim(),
      selected_option_id: answer.selected_option_id ? String(answer.selected_option_id).trim() : undefined,
      selected_options: Array.isArray(answer.selected_options) 
        ? answer.selected_options.map((id: any) => String(id).trim())
        : undefined,
      is_correct: answer.is_correct,
      points_earned: answer.points_earned
    }));
    
    return await QuizAnswer.bulkCreate(answerData);
  }

  async getAttemptAnswers(attemptId: string) {
    return await QuizAnswer.findAll({
      where: { attempt_id: attemptId }
    });
  }

  // ===================================
  // STATISTICS & REPORTING
  // ===================================

  async getQuizStatistics(quizId: string) {
    const totalAttempts = await QuizAttempt.count({
      where: {
        quiz_id: quizId,
        [Op.and]: (QuizAttempt as any).sequelize!.where(
          (QuizAttempt as any).sequelize!.col('submitted_at'),
          { [Op.not]: null }
        )
      }
    });

    const averageScoreRow = await QuizAttempt.findOne({
      where: {
        quiz_id: quizId,
        [Op.and]: [
          (QuizAttempt as any).sequelize!.where(
            (QuizAttempt as any).sequelize!.col('submitted_at'),
            { [Op.not]: null }
          ),
          (QuizAttempt as any).sequelize!.where(
            (QuizAttempt as any).sequelize!.col('score'),
            { [Op.not]: null }
          )
        ]
      },
      attributes: [
        [(Quiz as any).sequelize!.fn('AVG', (Quiz as any).sequelize!.col('score')), 'average_score']
      ],
      raw: true
    });

    type AvgScoreRow = { average_score: string | number | null };
    const avgVal = (averageScoreRow as unknown as AvgScoreRow | null)?.average_score;
    const average_score = avgVal == null ? 0 : (typeof avgVal === 'string' ? parseFloat(avgVal) : avgVal);

    const completionRow = await QuizAttempt.findOne({
      where: { quiz_id: quizId },
      attributes: [
        [(Quiz as any).sequelize!.fn('COUNT', (Quiz as any).sequelize!.col('id')), 'total_started'],
        [
          (Quiz as any).sequelize!.fn('COUNT',
            (Quiz as any).sequelize!.where(
              (Quiz as any).sequelize!.col('submitted_at'),
              { [Op.not]: null }
            )
          ),
          'total_completed'
        ]
      ],
      raw: true
    });

    type CompletionRow = { total_started: string | number; total_completed: string | number };
    const totals = (completionRow as unknown as CompletionRow | null) ?? { total_started: 0, total_completed: 0 };
    const total_started = typeof totals.total_started === 'string' ? parseInt(totals.total_started, 10) : (totals.total_started || 0);
    const total_completed = typeof totals.total_completed === 'string' ? parseInt(totals.total_completed, 10) : (totals.total_completed || 0);
    const completion_rate = total_started > 0 ? (total_completed / total_started) * 100 : 0;

    return {
      total_attempts: totalAttempts,
      average_score,
      completion_rate
    };
  }

  async getQuizAttempts(quizId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    return await (QuizAttempt as any).findAndCountAll({
      where: { quiz_id: quizId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['started_at', 'DESC']],
      limit,
      offset
    });
  }

  async getStudentQuizAttempts(quizId: string, studentId: string) {
    return await (QuizAttempt as any).findAll({
      where: { 
        quiz_id: quizId,
        user_id: studentId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['started_at', 'DESC']]
    });
  }

  async deleteStudentQuizAttempts(quizId: string, studentId: string) {
    return await (QuizAttempt as any).destroy({
      where: { 
        quiz_id: quizId,
        user_id: studentId
      }
    });
  }
}





