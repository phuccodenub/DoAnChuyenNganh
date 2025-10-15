import { Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizAnswer, User, Course } from '../../models';
import { Op } from 'sequelize';

export class QuizRepository {
  // ===================================
  // QUIZ CRUD
  // ===================================

  async createQuiz(data: any) {
    return await Quiz.create(data);
  }

  async getQuizById(quizId: string, includeAnswers: boolean = false) {
    const includeOptions = includeAnswers ? [
      {
        model: QuizQuestion,
        as: 'questions',
        include: [
          {
            model: QuizOption,
            as: 'options',
            order: [['order_index', 'ASC']]
          }
        ],
        order: [['order_index', 'ASC']]
      }
    ] : [];

    return await Quiz.findByPk(quizId, {
      include: includeOptions
    });
  }

  async updateQuiz(quizId: string, data: any) {
    await Quiz.update(data, { where: { id: quizId } });
    return await this.getQuizById(quizId);
  }

  async deleteQuiz(quizId: string) {
    return await Quiz.destroy({ where: { id: quizId } });
  }

  // ===================================
  // QUESTION CRUD
  // ===================================

  async addQuestion(quizId: string, data: any) {
    return await QuizQuestion.create({ quiz_id: quizId, ...data });
  }

  async getQuestionById(questionId: string) {
    return await QuizQuestion.findByPk(questionId);
  }

  async updateQuestion(questionId: string, data: any) {
    await QuizQuestion.update(data, { where: { id: questionId } });
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
          attributes: optionAttributes,
          order: [['order_index', 'ASC']]
        }
      ]
    });
  }

  // ===================================
  // OPTION CRUD
  // ===================================

  async addOption(questionId: string, data: any) {
    return await QuizOption.create({ question_id: questionId, ...data });
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
        submitted_at: null
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

  async submitAnswer(attemptId: string, data: any) {
    return await QuizAnswer.create({ attempt_id: attemptId, ...data });
  }

  async submitAnswers(attemptId: string, answers: any[]) {
    const answerData = answers.map(answer => ({
      attempt_id: attemptId,
      ...answer
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
      where: { quiz_id: quizId, submitted_at: { [Op.not]: null } }
    });

    const averageScore = await QuizAttempt.findOne({
      where: { 
        quiz_id: quizId, 
        submitted_at: { [Op.not]: null },
        score: { [Op.not]: null }
      },
      attributes: [
        [Quiz.sequelize!.fn('AVG', Quiz.sequelize!.col('score')), 'average_score']
      ],
      raw: true
    });

    const completionRate = await QuizAttempt.findOne({
      where: { quiz_id: quizId },
      attributes: [
        [Quiz.sequelize!.fn('COUNT', Quiz.sequelize!.col('id')), 'total_started'],
        [
          Quiz.sequelize!.fn('COUNT', 
            Quiz.sequelize!.where(
              Quiz.sequelize!.col('submitted_at'), 
              { [Op.not]: null }
            )
          ), 
          'total_completed'
        ]
      ],
      raw: true
    });

    return {
      total_attempts: totalAttempts,
      average_score: parseFloat((averageScore as any)?.average_score || '0'),
      completion_rate: (completionRate as any)?.total_completed / (completionRate as any)?.total_started * 100 || 0
    };
  }

  async getQuizAttempts(quizId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    return await QuizAttempt.findAndCountAll({
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
}





