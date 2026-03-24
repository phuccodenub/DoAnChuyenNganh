/**
 * Study Planner Service MVP-0
 * Xác định điểm yếu theo quiz/section và đề xuất kế hoạch học.
 * 
 * Based on: docs/AI/16_INSTRUCTOR_STUDENT_LEARNING_SUPPORT_PLAN_MVP.md
 * 
 * MVP deliverable (Student): trả lời 3 câu hỏi:
 * 1) "Mình đang yếu gì?"
 * 2) "Nên học gì trước?"
 * 3) "Khi nào kiểm tra lại?"
 * 
 * MVP deliverable (Instructor): xem nhanh lớp/nhóm đang yếu ở đâu (theo quiz/section)
 */

import { Op, Sequelize } from 'sequelize';
import logger from '../../../utils/logger.util';
import env from '../../../config/env.config';
import { AICacheService } from './ai-cache.service';
import QuizAttempt from '../../../models/quiz-attempt.model';
import QuizAnswer from '../../../models/quiz-answer.model';
import QuizQuestion from '../../../models/quiz-question.model';
import Quiz from '../../../models/quiz.model';
import Lesson from '../../../models/lesson.model';
import Section from '../../../models/section.model';
import Course from '../../../models/course.model';
import Enrollment from '../../../models/enrollment.model';

// ==================== TYPES ====================

export interface WeakArea {
  id: string;
  type: 'quiz' | 'section' | 'lesson';
  title: string;
  weaknessScore: number;       // 0-1, cao = yếu hơn
  performance: number;         // 0-1, điểm trung bình
  attemptCount: number;
  lastAttemptAt: Date | null;
  trend: 'improving' | 'declining' | 'stable';
  sectionId?: string;
  sectionTitle?: string;
}

export interface StudyAction {
  priority: number;            // 1 = cao nhất
  actionType: 'review_lesson' | 'retake_quiz' | 'practice';
  targetId: string;
  targetType: 'lesson' | 'quiz';
  targetTitle: string;
  suggestedTimeMinutes: number;
  reason: string;
}

export interface Checkpoint {
  scheduledDate: Date;
  type: 'mini_quiz' | 'review';
  targetId: string;
  targetTitle: string;
  description: string;
}

export interface StudentStudyPlan {
  userId: string;
  courseId: string;
  courseTitle: string;
  generatedAt: Date;
  weakAreas: WeakArea[];
  nextActions: StudyAction[];
  checkpoints: Checkpoint[];
  summary: {
    totalQuizzesTaken: number;
    averageScore: number;
    weakestArea: string;
    estimatedStudyTimeMinutes: number;
  };
  metadata: {
    calculationMethod: 'mvp0_quiz_section';
    cached: boolean;
    cacheExpiresAt?: Date;
  };
}

export interface InstructorInsights {
  courseId: string;
  courseTitle: string;
  generatedAt: Date;
  totalStudents: number;
  activeStudents: number;
  overallAverageScore: number;
  weakAreasAggregate: Array<{
    quizId: string;
    quizTitle: string;
    sectionId?: string;
    sectionTitle?: string;
    averageScore: number;
    attemptCount: number;
    studentCount: number;
    mostMissedQuestions: Array<{
      questionId: string;
      questionText: string;
      incorrectRate: number;
    }>;
  }>;
  recommendations: string[];
}

export interface StudyPlanRequest {
  userId: string;
  courseId: string;
}

export interface InstructorInsightsRequest {
  instructorId: string;
  courseId: string;
}

// ==================== CONSTANTS ====================

const HALF_LIFE_DAYS = 7;           // Recency decay half-life
const MIN_ATTEMPTS_FOR_TREND = 2;   // Need at least 2 attempts to calculate trend
const CACHE_TTL_STUDENT = 6 * 60 * 60;    // 6 hours for student plan
const CACHE_TTL_INSTRUCTOR = 1 * 60 * 60; // 1 hour for instructor insights

// ==================== SERVICE ====================

export class StudyPlannerService {
  private cacheService: AICacheService;

  constructor() {
    this.cacheService = new AICacheService();
  }

  /**
   * Generate study plan for a student in a course
   */
  async generateStudyPlan(request: StudyPlanRequest): Promise<StudentStudyPlan> {
    logger.info(`[StudyPlanner] Generating plan for user ${request.userId} in course ${request.courseId}`);

    // Check cache
    const cacheKey = `studyplan:${request.userId}:${request.courseId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      logger.info('[StudyPlanner] Returning cached plan');
      const plan = JSON.parse(cached) as StudentStudyPlan;
      plan.metadata.cached = true;
      return plan;
    }

    // Fetch course info
    const course = await Course.findByPk(request.courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    const courseData = course.get({ plain: true }) as any;

    // Get all quiz attempts for this user in this course
    const attempts = await this.fetchUserAttempts(request.userId, request.courseId);

    // Calculate weak areas
    const weakAreas = this.calculateWeakAreas(attempts);

    // Generate next actions
    const nextActions = this.generateNextActions(weakAreas, attempts);

    // Generate checkpoints (spaced repetition level 0)
    const checkpoints = this.generateCheckpoints(weakAreas);

    // Calculate summary
    const summary = this.calculateSummary(attempts, weakAreas);

    const plan: StudentStudyPlan = {
      userId: request.userId,
      courseId: request.courseId,
      courseTitle: courseData.title || 'Unknown Course',
      generatedAt: new Date(),
      weakAreas,
      nextActions,
      checkpoints,
      summary,
      metadata: {
        calculationMethod: 'mvp0_quiz_section',
        cached: false,
        cacheExpiresAt: new Date(Date.now() + CACHE_TTL_STUDENT * 1000),
      },
    };

    // Cache result
    await this.cacheService.set(cacheKey, JSON.stringify(plan), CACHE_TTL_STUDENT);

    return plan;
  }

  /**
   * Generate aggregated insights for instructor
   */
  async generateInstructorInsights(request: InstructorInsightsRequest): Promise<InstructorInsights> {
    logger.info(`[StudyPlanner] Generating instructor insights for course ${request.courseId}`);

    // Check cache
    const cacheKey = `instructor-insights:${request.courseId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      logger.info('[StudyPlanner] Returning cached insights');
      return JSON.parse(cached);
    }

    // Verify instructor owns the course
    const course = await Course.findOne({
      where: { id: request.courseId, instructor_id: request.instructorId },
    });
    if (!course) {
      throw new Error('Course not found or access denied');
    }
    const courseData = course.get({ plain: true }) as any;

    // Get all enrollments
    const enrollments = await Enrollment.findAll({
      where: { course_id: request.courseId },
      attributes: ['user_id'],
    });
    const studentIds = enrollments.map((e: any) => e.get('user_id'));

    // Get all quiz attempts for all students
    const allAttempts = await this.fetchCourseAttempts(request.courseId);

    // Calculate aggregated weak areas
    const weakAreasAggregate = await this.calculateAggregatedWeakAreas(request.courseId, allAttempts);

    // Generate recommendations
    const recommendations = this.generateInstructorRecommendations(weakAreasAggregate);

    // Calculate overall stats
    const totalStudents = studentIds.length;
    const activeStudents = new Set(allAttempts.map((a: any) => a.user_id)).size;
    const overallAverageScore = allAttempts.length > 0
      ? allAttempts.reduce((sum: number, a: any) => sum + (Number(a.score) / Number(a.max_score) || 0), 0) / allAttempts.length
      : 0;

    const insights: InstructorInsights = {
      courseId: request.courseId,
      courseTitle: courseData.title,
      generatedAt: new Date(),
      totalStudents,
      activeStudents,
      overallAverageScore: Math.round(overallAverageScore * 100) / 100,
      weakAreasAggregate,
      recommendations,
    };

    // Cache result
    await this.cacheService.set(cacheKey, JSON.stringify(insights), CACHE_TTL_INSTRUCTOR);

    return insights;
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Fetch all quiz attempts for a user in a course
   */
  private async fetchUserAttempts(userId: string, courseId: string): Promise<any[]> {
    try {
      const attempts = await QuizAttempt.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Quiz,
            as: 'quiz',
            where: { course_id: courseId },
            include: [
              {
                model: Section,
                as: 'section',
              },
            ],
          },
        ],
        order: [['submitted_at', 'DESC']],
      });

      return attempts.map((a: any) => a.get({ plain: true }));
    } catch (error: any) {
      logger.error('[StudyPlanner] Error fetching user attempts:', error);
      return [];
    }
  }

  /**
   * Fetch all quiz attempts for a course (all students)
   */
  private async fetchCourseAttempts(courseId: string): Promise<any[]> {
    try {
      const attempts = await QuizAttempt.findAll({
        include: [
          {
            model: Quiz,
            as: 'quiz',
            where: { course_id: courseId },
            include: [
              {
                model: Section,
                as: 'section',
              },
            ],
          },
        ],
        order: [['submitted_at', 'DESC']],
      });

      return attempts.map((a: any) => a.get({ plain: true }));
    } catch (error: any) {
      logger.error('[StudyPlanner] Error fetching course attempts:', error);
      return [];
    }
  }

  /**
   * Calculate weak areas based on quiz performance
   * Formula: weaknessScore = (1 - performance) * recencyWeight
   */
  private calculateWeakAreas(attempts: any[]): WeakArea[] {
    // Group attempts by quiz
    const quizMap = new Map<string, any[]>();
    for (const attempt of attempts) {
      const quizId = attempt.quiz_id;
      if (!quizMap.has(quizId)) {
        quizMap.set(quizId, []);
      }
      quizMap.get(quizId)!.push(attempt);
    }

    const weakAreas: WeakArea[] = [];
    const now = new Date();

    for (const [quizId, quizAttempts] of quizMap) {
      // Sort by date descending
      quizAttempts.sort((a, b) => 
        new Date(b.submitted_at || b.started_at).getTime() - 
        new Date(a.submitted_at || a.started_at).getTime()
      );

      const latestAttempt = quizAttempts[0];
      const quiz = latestAttempt.quiz || {};
      const section = quiz.section || {};

      // Calculate average performance
      const avgPerformance = quizAttempts.reduce((sum, a) => {
        const score = Number(a.score) || 0;
        const maxScore = Number(a.max_score) || 1;
        return sum + (score / maxScore);
      }, 0) / quizAttempts.length;

      // Calculate recency weight
      const latestDate = new Date(latestAttempt.submitted_at || latestAttempt.started_at);
      const daysSince = (now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24);
      const recencyWeight = Math.exp(-daysSince / HALF_LIFE_DAYS);

      // Calculate weakness score
      const weaknessScore = (1 - avgPerformance) * recencyWeight;

      // Determine trend
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (quizAttempts.length >= MIN_ATTEMPTS_FOR_TREND) {
        const recentPerf = Number(quizAttempts[0].score) / Number(quizAttempts[0].max_score) || 0;
        const olderPerf = Number(quizAttempts[1].score) / Number(quizAttempts[1].max_score) || 0;
        const diff = recentPerf - olderPerf;
        if (diff > 0.1) trend = 'improving';
        else if (diff < -0.1) trend = 'declining';
      }

      weakAreas.push({
        id: quizId,
        type: 'quiz',
        title: quiz.title || 'Unknown Quiz',
        weaknessScore: Math.round(weaknessScore * 100) / 100,
        performance: Math.round(avgPerformance * 100) / 100,
        attemptCount: quizAttempts.length,
        lastAttemptAt: latestDate,
        trend,
        sectionId: section.id,
        sectionTitle: section.title,
      });
    }

    // Sort by weakness score descending
    weakAreas.sort((a, b) => b.weaknessScore - a.weaknessScore);

    return weakAreas;
  }

  /**
   * Generate actionable next steps based on weak areas
   */
  private generateNextActions(weakAreas: WeakArea[], attempts: any[]): StudyAction[] {
    const actions: StudyAction[] = [];
    const topWeakAreas = weakAreas.slice(0, 5); // Top 5 weak areas

    for (let i = 0; i < topWeakAreas.length; i++) {
      const area = topWeakAreas[i];
      const priority = i + 1;

      // Suggest time based on weakness score
      const suggestedTime = Math.round(30 + area.weaknessScore * 30); // 30-60 minutes

      // Determine action type based on trend and performance
      let actionType: StudyAction['actionType'];
      let reason: string;

      if (area.performance < 0.5) {
        actionType = 'review_lesson';
        reason = `Điểm quiz "${area.title}" còn thấp (${Math.round(area.performance * 100)}%). Nên ôn lại bài học trước khi làm lại quiz.`;
      } else if (area.trend === 'declining') {
        actionType = 'practice';
        reason = `Điểm quiz "${area.title}" đang giảm. Nên luyện tập thêm để củng cố kiến thức.`;
      } else {
        actionType = 'retake_quiz';
        reason = `Quiz "${area.title}" cần cải thiện. Thử làm lại để nâng cao điểm số.`;
      }

      actions.push({
        priority,
        actionType,
        targetId: area.id,
        targetType: 'quiz',
        targetTitle: area.title,
        suggestedTimeMinutes: suggestedTime,
        reason,
      });
    }

    return actions;
  }

  /**
   * Generate checkpoints for spaced repetition (level 0)
   */
  private generateCheckpoints(weakAreas: WeakArea[]): Checkpoint[] {
    const checkpoints: Checkpoint[] = [];
    const now = new Date();

    // Create checkpoint for top 3 weak areas
    const topAreas = weakAreas.slice(0, 3);

    for (let i = 0; i < topAreas.length; i++) {
      const area = topAreas[i];
      
      // Schedule at 2, 4, 7 days
      const daysLater = [2, 4, 7][i] || 7;
      const scheduledDate = new Date(now.getTime() + daysLater * 24 * 60 * 60 * 1000);

      checkpoints.push({
        scheduledDate,
        type: 'mini_quiz',
        targetId: area.id,
        targetTitle: area.title,
        description: `Kiểm tra lại quiz "${area.title}" để củng cố kiến thức.`,
      });
    }

    return checkpoints;
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(attempts: any[], weakAreas: WeakArea[]): StudentStudyPlan['summary'] {
    const uniqueQuizzes = new Set(attempts.map(a => a.quiz_id));
    const totalQuizzesTaken = uniqueQuizzes.size;

    const averageScore = attempts.length > 0
      ? attempts.reduce((sum, a) => sum + (Number(a.score) / Number(a.max_score) || 0), 0) / attempts.length
      : 0;

    const weakestArea = weakAreas.length > 0 ? weakAreas[0].title : 'N/A';

    // Estimate study time based on weak areas
    const estimatedStudyTimeMinutes = weakAreas
      .slice(0, 5)
      .reduce((sum, area) => sum + 30 + area.weaknessScore * 30, 0);

    return {
      totalQuizzesTaken,
      averageScore: Math.round(averageScore * 100) / 100,
      weakestArea,
      estimatedStudyTimeMinutes: Math.round(estimatedStudyTimeMinutes),
    };
  }

  /**
   * Calculate aggregated weak areas for all students in a course
   */
  private async calculateAggregatedWeakAreas(courseId: string, allAttempts: any[]): Promise<InstructorInsights['weakAreasAggregate']> {
    // Group by quiz
    const quizMap = new Map<string, any[]>();
    for (const attempt of allAttempts) {
      const quizId = attempt.quiz_id;
      if (!quizMap.has(quizId)) {
        quizMap.set(quizId, []);
      }
      quizMap.get(quizId)!.push(attempt);
    }

    const result: InstructorInsights['weakAreasAggregate'] = [];

    for (const [quizId, quizAttempts] of quizMap) {
      const firstAttempt = quizAttempts[0];
      const quiz = firstAttempt.quiz || {};
      const section = quiz.section || {};

      const studentIds = new Set(quizAttempts.map((a: any) => a.user_id));
      const avgScore = quizAttempts.reduce((sum: number, a: any) => {
        return sum + (Number(a.score) / Number(a.max_score) || 0);
      }, 0) / quizAttempts.length;

      // Get most missed questions for this quiz
      const mostMissedQuestions = await this.getMostMissedQuestions(quizId);

      result.push({
        quizId,
        quizTitle: quiz.title || 'Unknown Quiz',
        sectionId: section.id,
        sectionTitle: section.title,
        averageScore: Math.round(avgScore * 100) / 100,
        attemptCount: quizAttempts.length,
        studentCount: studentIds.size,
        mostMissedQuestions,
      });
    }

    // Sort by average score ascending (weakest first)
    result.sort((a, b) => a.averageScore - b.averageScore);

    return result.slice(0, 10); // Top 10 weakest quizzes
  }

  /**
   * Get most frequently missed questions for a quiz
   */
  private async getMostMissedQuestions(quizId: string): Promise<Array<{
    questionId: string;
    questionText: string;
    incorrectRate: number;
  }>> {
    try {
      // Get all attempts for this quiz
      const attempts = await QuizAttempt.findAll({
        where: { quiz_id: quizId },
        attributes: ['id'],
      });
      const attemptIds = attempts.map((a: any) => a.get('id'));

      if (attemptIds.length === 0) return [];

      // Get answers for these attempts
      const answers = await QuizAnswer.findAll({
        where: { attempt_id: { [Op.in]: attemptIds } },
        include: [
          {
            model: QuizQuestion,
            as: 'question',
          },
        ],
      });

      // Group by question
      const questionMap = new Map<string, { correct: number; total: number; text: string }>();
      for (const answer of answers) {
        const a = answer.toJSON() as any;
        const qId = a.question_id;
        const qText = a.question?.question_text || '';
        
        if (!questionMap.has(qId)) {
          questionMap.set(qId, { correct: 0, total: 0, text: qText });
        }
        
        const stats = questionMap.get(qId)!;
        stats.total++;
        if (a.is_correct) stats.correct++;
      }

      // Calculate incorrect rate and sort
      const result: Array<{ questionId: string; questionText: string; incorrectRate: number }> = [];
      for (const [qId, stats] of questionMap) {
        const incorrectRate = stats.total > 0 ? (stats.total - stats.correct) / stats.total : 0;
        result.push({
          questionId: qId,
          questionText: stats.text.substring(0, 100) + (stats.text.length > 100 ? '...' : ''),
          incorrectRate: Math.round(incorrectRate * 100) / 100,
        });
      }

      return result
        .sort((a, b) => b.incorrectRate - a.incorrectRate)
        .slice(0, 5); // Top 5 most missed
    } catch (error: any) {
      logger.error('[StudyPlanner] Error getting missed questions:', error);
      return [];
    }
  }

  /**
   * Generate recommendations for instructor based on aggregate data
   */
  private generateInstructorRecommendations(weakAreas: InstructorInsights['weakAreasAggregate']): string[] {
    const recommendations: string[] = [];

    if (weakAreas.length === 0) {
      recommendations.push('Chưa có đủ dữ liệu để đưa ra khuyến nghị. Hãy khuyến khích học sinh làm quiz.');
      return recommendations;
    }

    // Find quizzes with very low scores
    const veryWeakQuizzes = weakAreas.filter(q => q.averageScore < 0.5);
    if (veryWeakQuizzes.length > 0) {
      recommendations.push(
        `Có ${veryWeakQuizzes.length} quiz có điểm trung bình dưới 50%. Xem xét bổ sung bài giảng hoặc đơn giản hóa nội dung.`
      );
    }

    // Find commonly missed questions
    const allMissedQuestions = weakAreas.flatMap(q => q.mostMissedQuestions);
    const highMissRate = allMissedQuestions.filter(q => q.incorrectRate > 0.7);
    if (highMissRate.length > 0) {
      recommendations.push(
        `Có ${highMissRate.length} câu hỏi có tỷ lệ sai trên 70%. Xem xét giải thích thêm hoặc sửa câu hỏi nếu không rõ ràng.`
      );
    }

    // Check participation
    const lowParticipation = weakAreas.filter(q => q.studentCount < 5);
    if (lowParticipation.length > 0) {
      recommendations.push(
        `Có ${lowParticipation.length} quiz có ít hơn 5 học sinh tham gia. Hãy nhắc nhở học sinh hoàn thành quiz.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Lớp học đang hoạt động tốt! Tiếp tục theo dõi tiến độ học sinh.');
    }

    return recommendations;
  }

  /**
   * Clear cache for a specific user/course
   */
  async clearStudentCache(userId: string, courseId: string): Promise<void> {
    const cacheKey = `studyplan:${userId}:${courseId}`;
    await this.cacheService.delete(cacheKey);
  }

  /**
   * Clear instructor insights cache
   */
  async clearInstructorCache(courseId: string): Promise<void> {
    const cacheKey = `instructor-insights:${courseId}`;
    await this.cacheService.delete(cacheKey);
  }
}
