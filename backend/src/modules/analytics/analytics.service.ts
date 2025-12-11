import { AnalyticsRepository } from './analytics.repository';
import logger from '../../utils/logger.util';

export class AnalyticsService {
  private repo: AnalyticsRepository;

  constructor() {
    this.repo = new AnalyticsRepository();
  }

  async getCourseStats(courseId: string) {
    return await this.repo.getCourseStats(courseId);
  }

  async getUserActivities(userId: string, limit?: number) {
    return await this.repo.getUserActivities(userId, limit ?? 20);
  }

  /**
   * Get comprehensive course analytics
   */
  async getCourseAnalytics(courseId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily', days: number = 30) {
    try {
      const [
        enrollmentTrends,
        demographics,
        completionTime,
        dropoutRate,
        engagedContent,
        ratingAnalytics,
        performanceMetrics
      ] = await Promise.all([
        this.repo.getEnrollmentTrends(courseId, period, days),
        this.repo.getStudentDemographics(courseId),
        this.repo.getAverageCompletionTime(courseId),
        this.repo.getDropoutRate(courseId),
        this.repo.getMostEngagedContent(courseId, 10),
        this.repo.getRatingAnalytics(courseId),
        this.repo.getPerformanceMetrics(courseId)
      ]);

      return {
        enrollmentTrends,
        demographics,
        completionTime,
        dropoutRate,
        engagedContent,
        ratingAnalytics,
        performanceMetrics
      };
    } catch (error: unknown) {
      logger.error('Error getting course analytics:', error);
      throw error;
    }
  }

  /**
   * Get enrollment trends only
   */
  async getEnrollmentTrends(courseId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily', days: number = 30) {
    return await this.repo.getEnrollmentTrends(courseId, period, days);
  }

  /**
   * Get student demographics
   */
  async getStudentDemographics(courseId: string) {
    return await this.repo.getStudentDemographics(courseId);
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(courseId: string) {
    const [completionTime, dropoutRate, engagedContent] = await Promise.all([
      this.repo.getAverageCompletionTime(courseId),
      this.repo.getDropoutRate(courseId),
      this.repo.getMostEngagedContent(courseId, 10)
    ]);

    return {
      completionTime,
      dropoutRate,
      engagedContent
    };
  }

  /**
   * Content-level engagement overview
   */
  async getContentEngagementOverview(
    courseId: string,
    type?: 'lesson' | 'quiz' | 'assignment' | 'all',
    days?: number
  ) {
    return this.repo.getContentEngagementOverview(courseId, { type, days });
  }

  /**
   * Content-level engagement matrix by student x content
   */
  async getContentEngagementMatrix(
    courseId: string,
    type: 'lesson' | 'quiz' | 'assignment' = 'quiz',
    days?: number,
    search?: string
  ) {
    return this.repo.getContentEngagementMatrix(courseId, { type, days, search });
  }
}































