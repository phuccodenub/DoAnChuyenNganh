import { Request, Response, NextFunction } from 'express';
import { StudentDashboardService } from './student-dashboard.service';
import { RESPONSE_CONSTANTS } from '@constants/response.constants';

const studentDashboardService = new StudentDashboardService();

/**
 * Student Dashboard Controller
 * 
 * Handles dashboard-related endpoints for students
 */
export const StudentDashboardController = {
  /**
   * Get learning progress stats (lessons, assignments, quizzes)
   * GET /api/student/dashboard/progress
   */
  async getProgressStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const progressStats = await studentDashboardService.getProgressStats(userId);

      return res.status(RESPONSE_CONSTANTS.STATUS_CODE.OK).json({
        success: true,
        message: 'Progress stats retrieved successfully',
        data: progressStats
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get daily goal and streak data
   * GET /api/student/dashboard/daily-goal
   */
  async getDailyGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const dailyGoal = await studentDashboardService.getDailyGoal(userId);

      return res.status(RESPONSE_CONSTANTS.STATUS_CODE.OK).json({
        success: true,
        message: 'Daily goal retrieved successfully',
        data: dailyGoal
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update daily goal target
   * PUT /api/student/dashboard/daily-goal
   */
  async updateDailyGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { target_minutes } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const updatedGoal = await studentDashboardService.updateDailyGoal(userId, target_minutes);

      return res.status(RESPONSE_CONSTANTS.STATUS_CODE.OK).json({
        success: true,
        message: 'Daily goal updated successfully',
        data: updatedGoal
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get gamification stats (points, badges, achievements)
   * GET /api/student/dashboard/gamification
   */
  async getGamificationStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const gamificationStats = await studentDashboardService.getGamificationStats(userId);

      return res.status(RESPONSE_CONSTANTS.STATUS_CODE.OK).json({
        success: true,
        message: 'Gamification stats retrieved successfully',
        data: gamificationStats
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get recommended courses
   * GET /api/student/dashboard/recommended-courses
   */
  async getRecommendedCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 3;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const recommendedCourses = await studentDashboardService.getRecommendedCourses(userId, limit);

      return res.status(RESPONSE_CONSTANTS.STATUS_CODE.OK).json({
        success: true,
        message: 'Recommended courses retrieved successfully',
        data: recommendedCourses
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Log learning activity (for tracking study time)
   * POST /api/student/dashboard/activity
   */
  async logActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { course_id, lesson_id, duration_minutes, activity_type } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      await studentDashboardService.logActivity(userId, {
        course_id,
        lesson_id,
        duration_minutes,
        activity_type
      });

      return res.status(RESPONSE_CONSTANTS.STATUS_CODE.OK).json({
        success: true,
        message: 'Activity logged successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};
