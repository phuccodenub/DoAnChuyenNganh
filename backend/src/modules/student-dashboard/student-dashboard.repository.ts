import { Op, Sequelize } from 'sequelize';
import Enrollment from '../../models/enrollment.model';
import Course from '../../models/course.model';
import User from '../../models/user.model';
import Lesson from '../../models/lesson.model';
import LessonProgress from '../../models/lesson-progress.model';
import Assignment from '../../models/assignment.model';
import AssignmentSubmission from '../../models/assignment-submission.model';
import Quiz from '../../models/quiz.model';
import QuizAttempt from '../../models/quiz-attempt.model';
import logger from '../../utils/logger.util';

/**
 * Student Dashboard Repository
 * 
 * Database queries for student dashboard data
 */
export class StudentDashboardRepository {
  
  /**
   * Get progress stats for lessons, assignments, and quizzes
   */
  async getProgressStats(userId: string) {
    try {
      // Get all enrolled course IDs
      const enrollments = await (Enrollment as any).findAll({
        where: { 
          user_id: userId,
          status: { [Op.in]: ['enrolled', 'active'] }
        },
        attributes: ['course_id']
      });
      
      const courseIds = enrollments.map((e: any) => e.course_id);
      
      if (courseIds.length === 0) {
        return {
          lessons: { completed: 0, total: 0 },
          assignments: { completed: 0, total: 0 },
          quizzes: { completed: 0, total: 0 }
        };
      }

      // Count lessons
      const totalLessons = await (Lesson as any).count({
        where: { course_id: { [Op.in]: courseIds } }
      });
      
      const completedLessons = await (LessonProgress as any).count({
        where: { 
          user_id: userId,
          is_completed: true 
        },
        include: [{
          model: Lesson,
          as: 'lesson',
          where: { course_id: { [Op.in]: courseIds } },
          required: true
        }]
      });

      // Count assignments
      const totalAssignments = await Assignment.count({
        where: { course_id: { [Op.in]: courseIds } }
      });
      
      const completedAssignments = await AssignmentSubmission.count({
        where: { 
          student_id: userId,
          status: { [Op.in]: ['submitted', 'graded'] }
        },
        include: [{
          model: Assignment,
          as: 'assignment',
          where: { course_id: { [Op.in]: courseIds } },
          required: true
        }]
      });

      // Count quizzes
      const totalQuizzes = await Quiz.count({
        where: { course_id: { [Op.in]: courseIds }, status: 'published' }
      });
      
      const completedQuizzes = await (QuizAttempt as any).count({
        where: { 
          user_id: userId,
          status: 'completed'
        },
        distinct: true,
        col: 'quiz_id'
      });

      return {
        lessons: { completed: completedLessons, total: totalLessons },
        assignments: { completed: completedAssignments, total: totalAssignments },
        quizzes: { completed: Math.min(completedQuizzes, totalQuizzes), total: totalQuizzes }
      };
    } catch (error) {
      logger.error('Error getting progress stats:', error);
      return {
        lessons: { completed: 0, total: 0 },
        assignments: { completed: 0, total: 0 },
        quizzes: { completed: 0, total: 0 }
      };
    }
  }

  /**
   * Get user's daily learning goal and streak
   */
  async getDailyGoal(userId: string) {
    try {
      // For now, return default values
      // TODO: Create a learning_goals table to store user preferences
      const user = await (User as any).findByPk(userId);
      
      // Calculate study time today (from activity logs if available)
      // For now, estimate from lesson progress
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayProgress = await (LessonProgress as any).count({
        where: {
          user_id: userId,
          updated_at: { [Op.gte]: today }
        }
      });
      
      // Estimate 5 minutes per lesson interaction
      const currentMinutes = todayProgress * 5;

      return {
        target_minutes: 30, // Default target
        current_minutes: currentMinutes,
        streak_days: 0, // TODO: Calculate from continuous daily activity
        longest_streak_days: 0
      };
    } catch (error) {
      logger.error('Error getting daily goal:', error);
      return {
        target_minutes: 30,
        current_minutes: 0,
        streak_days: 0,
        longest_streak_days: 0
      };
    }
  }

  /**
   * Get gamification stats
   */
  async getGamificationStats(userId: string) {
    try {
      // Get enrollment and completion data
      const enrollments = await (Enrollment as any).findAll({
        where: { user_id: userId }
      });
      
      const completedCourses = enrollments.filter(
        (e: any) => e.status === 'completed' || e.progress_percentage === 100
      ).length;

      // Calculate points based on activity
      // Simple formula: 10 points per completed lesson, 50 per completed course
      const completedLessons = await (LessonProgress as any).count({
        where: { user_id: userId, is_completed: true }
      });

      const totalPoints = (completedLessons * 10) + (completedCourses * 50);

      // Simple badge system based on progress
      const badges = [];
      if (completedLessons >= 1) badges.push({ id: 'first_lesson', name: 'Bắt đầu hành trình', icon: '🎯' });
      if (completedLessons >= 10) badges.push({ id: 'lesson_10', name: 'Người học chăm chỉ', icon: '📚' });
      if (completedLessons >= 50) badges.push({ id: 'lesson_50', name: 'Thành thạo', icon: '🏆' });
      if (completedCourses >= 1) badges.push({ id: 'first_course', name: 'Hoàn thành khóa đầu tiên', icon: '🎓' });
      if (enrollments.length >= 5) badges.push({ id: 'explorer', name: 'Nhà thám hiểm', icon: '🔍' });

      return {
        total_points: totalPoints,
        level: Math.floor(totalPoints / 100) + 1, // Level up every 100 points
        badges,
        achievements: badges.length
      };
    } catch (error) {
      logger.error('Error getting gamification stats:', error);
      return {
        total_points: 0,
        level: 1,
        badges: [],
        achievements: 0
      };
    }
  }

  /**
   * Get recommended courses - chỉ trả về các khóa học mà user CHƯA enroll
   */
  async getRecommendedCourses(userId: string, limit: number = 3) {
    try {
      logger.info('Getting recommended courses', { userId, limit });

      // Get user's enrolled course IDs to exclude
      const enrollments = await (Enrollment as any).findAll({
        where: { user_id: userId },
        attributes: ['course_id']
      });
      
      const enrolledCourseIds = enrollments.map((e: any) => e.course_id);
      logger.debug('User enrolled course IDs', { userId, enrolledCourseIds, count: enrolledCourseIds.length });

      // Build where clause - LUÔN exclude các course đã enroll
      const whereClause: any = {
        status: 'published'
      };

      // Nếu user đã enroll courses, exclude chúng
      // Nếu user chưa enroll course nào, vẫn chỉ lấy published courses (không cần exclude)
      if (enrolledCourseIds.length > 0) {
        whereClause.id = { [Op.notIn]: enrolledCourseIds };
      }

      logger.debug('Query where clause for recommended courses', { whereClause });

      // Get popular published courses that user hasn't enrolled in
      const courses = await (Course as any).findAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'instructor',
          attributes: ['id', 'first_name', 'last_name', 'avatar_url'],
          required: false // Left join để không bỏ sót courses không có instructor
        }],
        order: [
          ['rating', 'DESC NULLS LAST'], // Ưu tiên courses có rating cao, sau đó mới đến courses không có rating
          ['total_enrollments', 'DESC'],
          ['created_at', 'DESC'] // Mới nhất nếu rating và enrollments bằng nhau
        ],
        limit
      });

      logger.info('Found recommended courses', { userId, count: courses.length, courseIds: courses.map((c: any) => c.id) });

      // Map và filter để đảm bảo chỉ trả về courses hợp lệ (có title)
      const recommendedCourses = courses
        .filter((course: any) => course && course.id && course.title) // Chỉ lấy courses có id và title
        .map((course: any) => ({
          id: course.id,
          title: course.title,
          short_description: course.short_description,
          thumbnail_url: course.thumbnail_url,
          level: course.level,
          materials_count: course.total_lessons || 0,
          tags: course.tags || [],
          instructor: course.instructor ? {
            id: course.instructor.id,
            full_name: `${course.instructor.first_name || ''} ${course.instructor.last_name || ''}`.trim(),
            avatar_url: course.instructor.avatar_url
          } : null,
          rating: course.rating || 0,
          total_ratings: course.total_ratings || 0,
          price: course.price,
          is_free: course.is_free
        }));

      logger.info('Returning recommended courses', { userId, count: recommendedCourses.length });
      return recommendedCourses;
    } catch (error) {
      logger.error('Error getting recommended courses:', error);
      return [];
    }
  }
}
