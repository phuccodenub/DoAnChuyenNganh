import { StudentDashboardRepository } from './student-dashboard.repository';
import logger from '../../utils/logger.util';

/**
 * Student Dashboard Service
 * 
 * Business logic for student dashboard features
 */
export class StudentDashboardService {
  private repository: StudentDashboardRepository;

  constructor() {
    this.repository = new StudentDashboardRepository();
  }

  /**
   * Get progress stats for lessons, assignments, and quizzes
   */
  async getProgressStats(userId: string) {
    logger.info('Getting progress stats for user', { userId });
    return this.repository.getProgressStats(userId);
  }

  /**
   * Get daily goal and streak data
   */
  async getDailyGoal(userId: string) {
    logger.info('Getting daily goal for user', { userId });
    return this.repository.getDailyGoal(userId);
  }

  /**
   * Update daily goal target
   */
  async updateDailyGoal(userId: string, targetMinutes: number) {
    logger.info('Updating daily goal for user', { userId, targetMinutes });
    
    // Validate target minutes
    if (targetMinutes < 5) {
      targetMinutes = 5; // Minimum 5 minutes
    }
    if (targetMinutes > 480) {
      targetMinutes = 480; // Maximum 8 hours
    }

    // For now, just return the updated value
    // TODO: Store in database when learning_goals table is created
    const currentGoal = await this.repository.getDailyGoal(userId);
    
    return {
      ...currentGoal,
      target_minutes: targetMinutes
    };
  }

  /**
   * Get gamification stats
   */
  async getGamificationStats(userId: string) {
    logger.info('Getting gamification stats for user', { userId });
    return this.repository.getGamificationStats(userId);
  }

  /**
   * Get recommended courses
   */
  async getRecommendedCourses(userId: string, limit: number = 3) {
    logger.info('Getting recommended courses for user', { userId, limit });
    return this.repository.getRecommendedCourses(userId, limit);
  }

  /**
   * Log learning activity
   */
  async logActivity(userId: string, activity: {
    course_id?: string;
    lesson_id?: string;
    duration_minutes: number;
    activity_type: 'lesson' | 'quiz' | 'assignment' | 'video';
  }) {
    logger.info('Logging activity for user', { userId, activity });
    
    // TODO: Implement activity logging when activity_logs table is enhanced
    // For now, this is a placeholder
    return true;
  }
}
