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
}















