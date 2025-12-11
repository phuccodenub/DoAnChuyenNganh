import { Sequelize, Op, QueryTypes } from 'sequelize';
import { 
  CourseStatistics, 
  UserActivityLog, 
  Enrollment, 
  LessonProgress, 
  User, 
  Lesson, 
  Section, 
  QuizAttempt, 
  AssignmentSubmission, 
  Review,
  Quiz,
  Assignment
} from '../../models';
import { getModelSequelize } from '../../utils/model-extension.util';
import logger from '../../utils/logger.util';

const sequelize = getModelSequelize();

export class AnalyticsRepository {
  async getCourseStats(courseId: string) {
    return await CourseStatistics.findOne({ where: { course_id: courseId } });
  }

  async getUserActivities(userId: string, limit = 20) {
    return await UserActivityLog.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit
    });
  }

  /**
   * Get enrollment trends (daily/weekly/monthly)
   */
  async getEnrollmentTrends(courseId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily', days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let dateTrunc: string;
    if (period === 'daily') {
      dateTrunc = 'day';
    } else if (period === 'weekly') {
      dateTrunc = 'week';
    } else {
      dateTrunc = 'month';
    }

    const query = `
      SELECT 
        DATE_TRUNC(:dateTrunc, created_at)::date as date,
        COUNT(*)::integer as count
      FROM enrollments
      WHERE course_id = :courseId
        AND created_at BETWEEN :startDate AND :endDate
      GROUP BY DATE_TRUNC(:dateTrunc, created_at)
      ORDER BY date ASC
    `;

    const results = await sequelize.query(query, {
      replacements: {
        courseId,
        startDate,
        endDate,
        dateTrunc
      },
      type: QueryTypes.SELECT
    });

    return results;
  }

  /**
   * Get student demographics
   * Note: Uses raw SQL to avoid Sequelize ORM issues with non-existent columns
   */
  async getStudentDemographics(courseId: string) {
    const { QueryTypes } = await import('sequelize');

    // Get gender distribution (if gender column exists)
    let genderDistribution: any[] = [];
    try {
      // First check if gender column exists by trying a simple query
      const checkColumnQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'gender';
      `;
      const columnExists = await sequelize.query(checkColumnQuery, {
        type: QueryTypes.SELECT
      }) as any[];

      if (columnExists.length > 0) {
        // Gender column exists, get distribution
        const genderQuery = `
          SELECT
            COALESCE(u.gender::text, 'Không xác định') AS gender,
            COUNT(DISTINCT u.id)::integer AS student_count
          FROM enrollments e
          JOIN users u ON e.user_id = u.id
          WHERE e.course_id = :courseId AND e.status IN ('active', 'completed')
            AND u.gender IS NOT NULL
          GROUP BY u.gender
          ORDER BY student_count DESC;
        `;
        genderDistribution = await sequelize.query(genderQuery, {
          replacements: { courseId },
          type: QueryTypes.SELECT
        });
      }
    } catch (error) {
      // Gender column might not exist or query failed, ignore
      logger.warn('Could not get gender distribution:', error);
    }

    // Get age groups (if date_of_birth exists)
    let ageDistribution: any[] = [];
    try {
      const ageQuery = `
        SELECT
          CASE
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) < 18 THEN 'Under 18'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 18 AND 24 THEN '18-24'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 25 AND 34 THEN '25-34'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 35 AND 44 THEN '35-44'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 45 AND 54 THEN '45-54'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) >= 55 THEN '55+'
            ELSE 'Unknown'
          END AS age_group,
          COUNT(DISTINCT u.id)::integer AS student_count
        FROM enrollments e
        JOIN users u ON e.user_id = u.id
        WHERE e.course_id = :courseId 
          AND e.status IN ('active', 'completed')
          AND u.date_of_birth IS NOT NULL
        GROUP BY age_group
        ORDER BY age_group;
      `;
      ageDistribution = await sequelize.query(ageQuery, {
        replacements: { courseId },
        type: QueryTypes.SELECT
      });
    } catch (error) {
      // date_of_birth column might not exist, ignore
      logger.warn('Could not get age distribution:', error);
    }

    // Get total count
    const totalQuery = `
      SELECT COUNT(DISTINCT e.user_id)::integer AS total
      FROM enrollments e
      WHERE e.course_id = :courseId AND e.status IN ('active', 'completed');
    `;
    const totalResult = await sequelize.query(totalQuery, {
      replacements: { courseId },
      type: QueryTypes.SELECT
    }) as any[];

    // Convert to frontend format
    const ageGroups: Record<string, number> = {};
    ageDistribution.forEach((item: any) => {
      ageGroups[item.age_group] = item.student_count;
    });

    // For now, locations will be empty since we don't have country/city columns
    // This can be extended later if location data is added to the users table
    const locations: Record<string, number> = {};

    return {
      ageGroups,
      locations,
      genderDistribution,
      total: totalResult[0]?.total || 0
    };
  }

  /**
   * Get average completion time
   */
  async getAverageCompletionTime(courseId: string) {
    const completedEnrollments = await Enrollment.findAll({
      where: {
        course_id: courseId,
        status: 'completed',
        completion_date: { [Op.ne]: null }
      },
      attributes: ['created_at', 'completion_date']
    });

    if (completedEnrollments.length === 0) {
      return null;
    }

    const completionTimes = completedEnrollments.map((enrollment: any) => {
      const start = new Date(enrollment.created_at).getTime();
      const end = new Date(enrollment.completion_date).getTime();
      return (end - start) / (1000 * 60 * 60 * 24); // Convert to days
    });

    const average = completionTimes.reduce((a: number, b: number) => a + b, 0) / completionTimes.length;
    const sorted = [...completionTimes].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    return {
      averageDays: Math.round(average * 10) / 10,
      medianDays: Math.round(median * 10) / 10,
      minDays: Math.round(Math.min(...completionTimes) * 10) / 10,
      maxDays: Math.round(Math.max(...completionTimes) * 10) / 10,
      totalCompleted: completedEnrollments.length
    };
  }

  /**
   * Get dropout rate & retention analysis
   */
  async getDropoutRate(courseId: string) {
    const totalEnrollments = await Enrollment.count({
      where: { course_id: courseId }
    });

    const activeEnrollments = await Enrollment.count({
      where: {
        course_id: courseId,
        status: 'active'
      }
    });

    const completedEnrollments = await Enrollment.count({
      where: {
        course_id: courseId,
        status: 'completed'
      }
    });

    const cancelledEnrollments = await Enrollment.count({
      where: {
        course_id: courseId,
        status: 'cancelled'
      }
    });

    const dropoutRate = totalEnrollments > 0 
      ? parseFloat(((cancelledEnrollments / totalEnrollments) * 100).toFixed(2))
      : 0;

    const retentionRate = totalEnrollments > 0
      ? parseFloat((((activeEnrollments + completedEnrollments) / totalEnrollments) * 100).toFixed(2))
      : 0;

    // Get last activity for active enrollments
    const activeWithLastActivity = await Enrollment.findAll({
      where: {
        course_id: courseId,
        status: 'active'
      },
      attributes: ['last_accessed_at', 'created_at']
    });

    const inactiveStudents = activeWithLastActivity.filter((enrollment: any) => {
      if (!enrollment.last_accessed_at) return true;
      const daysSinceLastAccess = (new Date().getTime() - new Date(enrollment.last_accessed_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLastAccess > 30; // Inactive if no access in 30 days
    }).length;

    return {
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      cancelledEnrollments,
      dropoutRate,
      retentionRate,
      inactiveStudents
    };
  }

  /**
   * Get most engaged sections/lessons
   */
  async getMostEngagedContent(courseId: string, limit: number = 10) {
    // Get section IDs for this course
    const sections = await Section.findAll({
      where: { course_id: courseId },
      attributes: ['id']
    });
    const sectionIds = sections.map((s: any) => s.id);

    if (sectionIds.length === 0) {
      return { topLessons: [], topSections: [] };
    }

    // Get lessons with most completions using raw SQL
    const lessonCompletionsQuery = `
      SELECT 
        lp.lesson_id,
        l.id as lesson_id,
        l.title as lesson_title,
        s.id as section_id,
        s.title as section_title,
        COUNT(lp.id)::integer as completion_count,
        AVG(lp.time_spent_seconds)::numeric(10,2) as avg_time_spent
      FROM lesson_progress lp
      INNER JOIN lessons l ON l.id = lp.lesson_id
      INNER JOIN sections s ON s.id = l.section_id
      WHERE s.course_id = :courseId
        AND lp.completed = true
      GROUP BY lp.lesson_id, l.id, l.title, s.id, s.title
      ORDER BY completion_count DESC
      LIMIT :limit
    `;

    const lessonCompletions = await sequelize.query(lessonCompletionsQuery, {
      replacements: { courseId, limit: limit.toString() },
      type: QueryTypes.SELECT
    });

    // Get sections with most progress
    const sectionProgressQuery = `
      SELECT 
        s.id as section_id,
        s.title as section_title,
        COUNT(lp.id)::integer as total_progress,
        AVG(lp.completion_percentage)::numeric(5,2) as avg_completion
      FROM sections s
      INNER JOIN lessons l ON l.section_id = s.id
      INNER JOIN lesson_progress lp ON lp.lesson_id = l.id
      WHERE s.course_id = :courseId
      GROUP BY s.id, s.title
      ORDER BY total_progress DESC
      LIMIT :limit
    `;

    const sectionProgress = await sequelize.query(sectionProgressQuery, {
      replacements: { courseId, limit: limit.toString() },
      type: QueryTypes.SELECT
    });

    return {
      topLessons: (lessonCompletions as any[]).map((item: any) => ({
        lessonId: item.lesson_id,
        lessonTitle: item.lesson_title,
        sectionTitle: item.section_title,
        completionCount: parseInt(item.completion_count || 0),
        avgTimeSpent: parseFloat(item.avg_time_spent || 0)
      })),
      topSections: sectionProgress.map((item: any) => ({
        sectionId: item.section_id,
        sectionTitle: item.section_title,
        totalProgress: parseInt(item.total_progress || 0),
        avgCompletion: parseFloat(item.avg_completion || 0)
      }))
    };
  }

  /**
   * Content-level engagement overview (lessons / quizzes / assignments)
   */
  async getContentEngagementOverview(
    courseId: string,
    options?: { type?: 'lesson' | 'quiz' | 'assignment' | 'all'; days?: number }
  ) {
    const startDate =
      options?.days && options.days > 0
        ? new Date(Date.now() - options.days * 24 * 60 * 60 * 1000)
        : null;

    const lessonQuery = `
      SELECT 
        l.id AS content_id,
        l.title AS content_title,
        'lesson' AS content_type,
        s.title AS section_title,
        COUNT(DISTINCT lp.user_id)::integer AS participants,
        COUNT(lp.id)::integer AS interactions,
        COUNT(*) FILTER (WHERE lp.completed = true)::integer AS completions,
        CASE 
          WHEN COUNT(DISTINCT lp.user_id) > 0 
            THEN ROUND((COUNT(*) FILTER (WHERE lp.completed = true)::decimal / COUNT(DISTINCT lp.user_id)) * 100, 1)
          ELSE 0
        END AS completion_rate,
        COALESCE(AVG(lp.completion_percentage), 0)::numeric(5,2) AS avg_completion_pct,
        COALESCE(AVG(lp.time_spent_seconds), 0)::numeric(10,2) AS avg_time_spent_seconds,
        MAX(lp.updated_at) AS last_activity
      FROM lessons l
      INNER JOIN sections s ON s.id = l.section_id
      LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id
      LEFT JOIN enrollments e ON e.user_id = lp.user_id AND e.course_id = s.course_id
      WHERE s.course_id = :courseId
        AND (:startDate IS NULL OR lp.updated_at >= :startDate)
        AND (e.status IS NULL OR e.status NOT IN ('cancelled', 'suspended'))
      GROUP BY l.id, l.title, s.title
      ORDER BY interactions DESC, completion_rate DESC
    `;

    const quizQuery = `
      SELECT 
        q.id AS content_id,
        q.title AS content_title,
        'quiz' AS content_type,
        COALESCE(s.title, '') AS section_title,
        COUNT(DISTINCT qa.user_id)::integer AS participants,
        COUNT(qa.id)::integer AS interactions,
        COUNT(*) FILTER (WHERE qa.is_passed = true)::integer AS completions,
        CASE 
          WHEN COUNT(DISTINCT qa.user_id) > 0 
            THEN ROUND((COUNT(*) FILTER (WHERE qa.is_passed = true)::decimal / COUNT(DISTINCT qa.user_id)) * 100, 1)
          ELSE 0
        END AS completion_rate,
        COALESCE(AVG(qa.score), 0)::numeric(5,2) AS avg_score,
        MAX(qa.updated_at) AS last_activity
      FROM quizzes q
      LEFT JOIN sections s ON s.id = q.section_id
      LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id
      LEFT JOIN enrollments e ON e.user_id = qa.user_id AND e.course_id = COALESCE(q.course_id, s.course_id)
      WHERE (q.course_id = :courseId OR s.course_id = :courseId)
        AND (:startDate IS NULL OR qa.updated_at >= :startDate)
        AND (e.status IS NULL OR e.status NOT IN ('cancelled', 'suspended'))
      GROUP BY q.id, q.title, s.title
      ORDER BY interactions DESC, completion_rate DESC
    `;

    const assignmentQuery = `
      SELECT 
        a.id AS content_id,
        a.title AS content_title,
        'assignment' AS content_type,
        COALESCE(s.title, '') AS section_title,
        COUNT(DISTINCT sub.user_id)::integer AS participants,
        COUNT(sub.id)::integer AS interactions,
        COUNT(*) FILTER (WHERE sub.status = 'graded')::integer AS completions,
        CASE 
          WHEN COUNT(DISTINCT sub.user_id) > 0 
            THEN ROUND((COUNT(*) FILTER (WHERE sub.status = 'graded')::decimal / COUNT(DISTINCT sub.user_id)) * 100, 1)
          ELSE 0
        END AS completion_rate,
        COALESCE(AVG(sub.score), 0)::numeric(5,2) AS avg_score,
        MAX(sub.updated_at) AS last_activity
      FROM assignments a
      LEFT JOIN sections s ON s.id = a.section_id
      LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id
      LEFT JOIN enrollments e ON e.user_id = sub.user_id AND e.course_id = COALESCE(a.course_id, s.course_id)
      WHERE (a.course_id = :courseId OR s.course_id = :courseId)
        AND (:startDate IS NULL OR sub.updated_at >= :startDate)
        AND (e.status IS NULL OR e.status NOT IN ('cancelled', 'suspended'))
      GROUP BY a.id, a.title, s.title
      ORDER BY interactions DESC, completion_rate DESC
    `;

    const [lessons, quizzes, assignments] = await Promise.all([
      sequelize.query(lessonQuery, {
        replacements: { courseId, startDate },
        type: QueryTypes.SELECT
      }),
      sequelize.query(quizQuery, {
        replacements: { courseId, startDate },
        type: QueryTypes.SELECT
      }),
      sequelize.query(assignmentQuery, {
        replacements: { courseId, startDate },
        type: QueryTypes.SELECT
      }),
    ]);

    const mapItem = (item: any) => ({
      contentId: item.content_id,
      contentTitle: item.content_title,
      contentType: item.content_type,
      sectionTitle: item.section_title || null,
      participants: Number(item.participants || 0),
      interactions: Number(item.interactions || 0),
      completions: Number(item.completions || 0),
      completionRate: Number(item.completion_rate || 0),
      avgCompletionPct: item.avg_completion_pct !== undefined ? Number(item.avg_completion_pct) : null,
      avgTimeSpentSeconds: item.avg_time_spent_seconds !== undefined ? Number(item.avg_time_spent_seconds) : null,
      avgScore: item.avg_score !== undefined ? Number(item.avg_score) : null,
      lastActivity: item.last_activity || null
    });

    const result = {
      lessons: (lessons as any[]).map(mapItem),
      quizzes: (quizzes as any[]).map(mapItem),
      assignments: (assignments as any[]).map(mapItem)
    };

    if (options?.type && options.type !== 'all') {
      return {
        lessons: options.type === 'lesson' ? result.lessons : [],
        quizzes: options.type === 'quiz' ? result.quizzes : [],
        assignments: options.type === 'assignment' ? result.assignments : [],
      };
    }

    return result;
  }

  /**
   * Content-level engagement matrix (student x content)
   */
  async getContentEngagementMatrix(
    courseId: string,
    options: { type: 'lesson' | 'quiz' | 'assignment'; days?: number; search?: string }
  ) {
    const startDate =
      options.days && options.days > 0
        ? new Date(Date.now() - options.days * 24 * 60 * 60 * 1000)
        : null;
    const searchPattern = options.search ? `%${options.search.toLowerCase()}%` : null;

    if (options.type === 'lesson') {
      const lessonMatrixQuery = `
        SELECT 
          u.id AS user_id,
          COALESCE(
            NULLIF(CONCAT(u.first_name, ' ', u.last_name), ' '),
            u.email,
            'Không tên'
          ) AS user_name,
          u.email,
          l.id AS content_id,
          l.title AS content_title,
          'lesson' AS content_type,
          lp.completed,
          lp.completion_percentage,
          lp.updated_at AS last_activity
        FROM lesson_progress lp
        INNER JOIN users u ON u.id = lp.user_id
        INNER JOIN lessons l ON l.id = lp.lesson_id
        INNER JOIN sections s ON s.id = l.section_id
        WHERE s.course_id = :courseId
          AND (:startDate IS NULL OR lp.updated_at >= :startDate)
          AND (
            :searchPattern IS NULL OR
            LOWER(u.email) LIKE :searchPattern OR
            LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE :searchPattern
          )
      `;

      const rows = await sequelize.query(lessonMatrixQuery, {
        replacements: { courseId, startDate, searchPattern },
        type: QueryTypes.SELECT
      });

      return this.transformMatrixRows(rows as any[], 'lesson');
    }

    if (options.type === 'quiz') {
      const quizMatrixQuery = `
        WITH latest_attempt AS (
          SELECT 
            qa.*,
            ROW_NUMBER() OVER (PARTITION BY qa.user_id, qa.quiz_id ORDER BY qa.submitted_at DESC NULLS LAST, qa.updated_at DESC) AS rn
          FROM quiz_attempts qa
          INNER JOIN quizzes q ON q.id = qa.quiz_id
          LEFT JOIN sections s ON s.id = q.section_id
          WHERE (q.course_id = :courseId OR s.course_id = :courseId)
            AND (:startDate IS NULL OR qa.updated_at >= :startDate)
        )
        SELECT 
          u.id AS user_id,
          COALESCE(
            NULLIF(CONCAT(u.first_name, ' ', u.last_name), ' '),
            u.email,
            'Không tên'
          ) AS user_name,
          u.email,
          q.id AS content_id,
          q.title AS content_title,
          'quiz' AS content_type,
          la.score,
          q.passing_score,
          la.is_passed,
          la.updated_at AS last_activity
        FROM latest_attempt la
        INNER JOIN users u ON u.id = la.user_id
        INNER JOIN quizzes q ON q.id = la.quiz_id
        WHERE la.rn = 1
          AND (
            :searchPattern IS NULL OR
            LOWER(u.email) LIKE :searchPattern OR
            LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE :searchPattern
          )
      `;

      const rows = await sequelize.query(quizMatrixQuery, {
        replacements: { courseId, startDate, searchPattern },
        type: QueryTypes.SELECT
      });

      return this.transformMatrixRows(rows as any[], 'quiz');
    }

    const assignmentMatrixQuery = `
      WITH latest_submission AS (
        SELECT 
          sub.*,
          ROW_NUMBER() OVER (PARTITION BY sub.user_id, sub.assignment_id ORDER BY sub.updated_at DESC, sub.submitted_at DESC) AS rn
        FROM assignment_submissions sub
        INNER JOIN assignments a ON a.id = sub.assignment_id
        LEFT JOIN sections s ON s.id = a.section_id
        WHERE (a.course_id = :courseId OR s.course_id = :courseId)
          AND (:startDate IS NULL OR sub.updated_at >= :startDate)
      )
      SELECT 
        u.id AS user_id,
        COALESCE(
          NULLIF(CONCAT(u.first_name, ' ', u.last_name), ' '),
          u.email,
          'Không tên'
        ) AS user_name,
        u.email,
        a.id AS content_id,
        a.title AS content_title,
        'assignment' AS content_type,
        ls.score,
        ls.status,
        ls.updated_at AS last_activity
      FROM latest_submission ls
      INNER JOIN users u ON u.id = ls.user_id
      INNER JOIN assignments a ON a.id = ls.assignment_id
      WHERE ls.rn = 1
        AND (
          :searchPattern IS NULL OR
          LOWER(u.email) LIKE :searchPattern OR
          LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE :searchPattern
        )
    `;

    const rows = await sequelize.query(assignmentMatrixQuery, {
      replacements: { courseId, startDate, searchPattern },
      type: QueryTypes.SELECT
    });

    return this.transformMatrixRows(rows as any[], 'assignment');
  }

  /**
   * Normalize matrix rows to structured response
   */
  private transformMatrixRows(
    rows: any[],
    type: 'lesson' | 'quiz' | 'assignment'
  ) {
    const studentsMap = new Map<string, { id: string; name: string; email: string | null }>();
    const contentsMap = new Map<string, { id: string; title: string; type: string }>();
    const records: any[] = [];

    rows.forEach((row) => {
      if (!studentsMap.has(row.user_id)) {
        studentsMap.set(row.user_id, {
          id: row.user_id,
          name: row.user_name || 'Không tên',
          email: row.email || null
        });
      }

      if (!contentsMap.has(row.content_id)) {
        contentsMap.set(row.content_id, {
          id: row.content_id,
          title: row.content_title,
          type: row.content_type
        });
      }

      let status: string | null = null;
      let score: number | null = null;
      let completionPct: number | null = null;

      if (type === 'lesson') {
        status = row.completed ? 'completed' : (row.completion_percentage || 0) > 0 ? 'in_progress' : 'not_started';
        completionPct = row.completion_percentage !== null ? Number(row.completion_percentage) : null;
      } else if (type === 'quiz') {
        score = row.score !== null ? Number(row.score) : null;
        let passFlag = row.is_passed;
        if ((passFlag === null || passFlag === undefined) && score !== null && row.passing_score !== null && row.passing_score !== undefined) {
          const passing = Number(row.passing_score);
          passFlag = score >= passing;
        }
        status = passFlag === true ? 'passed' : score !== null ? 'failed' : 'in_progress';
      } else if (type === 'assignment') {
        status = row.status || 'submitted';
        score = row.score !== null ? Number(row.score) : null;
      }

      records.push({
        studentId: row.user_id,
        contentId: row.content_id,
        status,
        score,
        completionPct,
        lastActivity: row.last_activity || null
      });
    });

    return {
      students: Array.from(studentsMap.values()),
      contents: Array.from(contentsMap.values()),
      records
    };
  }

  /**
   * Get rating & review analytics
   */
  async getRatingAnalytics(courseId: string) {
    const reviews = await Review.findAll({
      where: {
        course_id: courseId,
        is_published: true
      }
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recentReviews: []
      };
    }

    const ratings = reviews.map((r: any) => r.rating);
    const averageRating = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;

    const ratingDistribution = {
      1: ratings.filter(r => r === 1).length,
      2: ratings.filter(r => r === 2).length,
      3: ratings.filter(r => r === 3).length,
      4: ratings.filter(r => r === 4).length,
      5: ratings.filter(r => r === 5).length
    };

    const recentReviews = await Review.findAll({
      where: {
        course_id: courseId,
        is_published: true
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
      recentReviews: recentReviews.map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        userName: `${r.user?.first_name || ''} ${r.user?.last_name || ''}`.trim(),
        createdAt: r.created_at
      }))
    };
  }

  /**
   * Get quiz/assignment performance metrics
   */
  async getPerformanceMetrics(courseId: string) {
    // Get section IDs for this course
    const sections = await Section.findAll({
      where: { course_id: courseId },
      attributes: ['id']
    });
    const sectionIds = sections.map((s: any) => s.id);

    if (sectionIds.length === 0) {
      return {
        quiz: {
          avgScore: 0,
          maxScore: 0,
          minScore: 0,
          totalAttempts: 0,
          passedCount: 0,
          passRate: '0.00'
        },
        assignment: {
          avgScore: 0,
          maxScore: 0,
          minScore: 0,
          totalSubmissions: 0,
          gradedCount: 0,
          gradingRate: '0.00'
        }
      };
    }

    // Quiz performance - use IN clause instead of ANY for better compatibility
    const quizQuery = `
      SELECT 
        AVG(qa.score)::numeric(5,2) as avg_score,
        MAX(qa.score)::numeric(5,2) as max_score,
        MIN(qa.score)::numeric(5,2) as min_score,
        COUNT(qa.id)::integer as total_attempts,
        COUNT(CASE WHEN qa.is_passed = true THEN 1 END)::integer as passed_count
      FROM quiz_attempts qa
      INNER JOIN quizzes q ON q.id = qa.quiz_id
      WHERE q.section_id IN (:sectionIds)
    `;

    const quizResult = await sequelize.query(quizQuery, {
      replacements: { sectionIds },
      type: QueryTypes.SELECT
    }) as any[];

    // Assignment performance - use IN clause instead of ANY
    const assignmentQuery = `
      SELECT 
        AVG(asub.score)::numeric(5,2) as avg_score,
        MAX(asub.score)::numeric(5,2) as max_score,
        MIN(asub.score)::numeric(5,2) as min_score,
        COUNT(asub.id)::integer as total_submissions,
        COUNT(CASE WHEN asub.status = 'graded' THEN 1 END)::integer as graded_count
      FROM assignment_submissions asub
      INNER JOIN assignments a ON a.id = asub.assignment_id
      WHERE a.section_id IN (:sectionIds)
    `;

    const assignmentResult = await sequelize.query(assignmentQuery, {
      replacements: { sectionIds },
      type: QueryTypes.SELECT
    }) as any[];

    const quizData = quizResult[0] || {};
    const assignmentData = assignmentResult[0] || {};

    const totalAttempts = parseInt(quizData.total_attempts || 0);
    const passedCount = parseInt(quizData.passed_count || 0);
    const totalSubmissions = parseInt(assignmentData.total_submissions || 0);
    const gradedCount = parseInt(assignmentData.graded_count || 0);

    return {
      quiz: {
        avgScore: parseFloat(quizData.avg_score || 0),
        maxScore: parseFloat(quizData.max_score || 0),
        minScore: parseFloat(quizData.min_score || 0),
        totalAttempts,
        passedCount,
        passRate: totalAttempts > 0 
          ? ((passedCount / totalAttempts) * 100).toFixed(2)
          : '0.00'
      },
      assignment: {
        avgScore: parseFloat(assignmentData.avg_score || 0),
        maxScore: parseFloat(assignmentData.max_score || 0),
        minScore: parseFloat(assignmentData.min_score || 0),
        totalSubmissions,
        gradedCount,
        gradingRate: totalSubmissions > 0
          ? ((gradedCount / totalSubmissions) * 100).toFixed(2)
          : '0.00'
      }
    };
  }
}
