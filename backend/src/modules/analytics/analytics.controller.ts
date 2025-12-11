import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { responseUtils } from '../../utils/response.util';

export class AnalyticsController {
  private service: AnalyticsService;

  constructor() {
    this.service = new AnalyticsService();
  }

  courseStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const stats = await this.service.getCourseStats(courseId);
      return responseUtils.success(res, stats, 'Course statistics retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };

  userActivities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const activities = await this.service.getUserActivities(userId, limit);
      return responseUtils.success(res, activities, 'User activities retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Get comprehensive course analytics
   */
  getCourseAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const period = (req.query.period as 'daily' | 'weekly' | 'monthly') || 'daily';
      const days = parseInt((req.query.days as string) || '30', 10);

      const analytics = await this.service.getCourseAnalytics(courseId, period, days);
      return responseUtils.success(res, analytics, 'Course analytics retrieved successfully');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Get enrollment trends
   */
  getEnrollmentTrends = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const period = (req.query.period as 'daily' | 'weekly' | 'monthly') || 'daily';
      const days = parseInt((req.query.days as string) || '30', 10);

      const trends = await this.service.getEnrollmentTrends(courseId, period, days);
      return responseUtils.success(res, trends, 'Enrollment trends retrieved successfully');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Get student demographics
   */
  getStudentDemographics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const demographics = await this.service.getStudentDemographics(courseId);
      return responseUtils.success(res, demographics, 'Student demographics retrieved successfully');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Get engagement metrics
   */
  getEngagementMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const metrics = await this.service.getEngagementMetrics(courseId);
      return responseUtils.success(res, metrics, 'Engagement metrics retrieved successfully');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Content-level engagement overview
   */
  getContentEngagementOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const { type, days } = req.query as { type?: 'lesson' | 'quiz' | 'assignment' | 'all'; days?: string };

      const overview = await this.service.getContentEngagementOverview(
        courseId,
        type,
        days ? parseInt(days, 10) : undefined
      );
      return responseUtils.success(res, overview, 'Content engagement overview retrieved successfully');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Content-level engagement matrix (student x content)
   */
  getContentEngagementMatrix = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId } = req.params;
      const { type, days, search } = req.query as { type?: 'lesson' | 'quiz' | 'assignment'; days?: string; search?: string };

      const matrix = await this.service.getContentEngagementMatrix(
        courseId,
        (type as any) || 'quiz',
        days ? parseInt(days, 10) : undefined,
        search
      );
      return responseUtils.success(res, matrix, 'Content engagement matrix retrieved successfully');
    } catch (error: unknown) {
      next(error);
    }
  };
}































