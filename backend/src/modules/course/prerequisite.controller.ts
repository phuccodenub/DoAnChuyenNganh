import { Request, Response, NextFunction } from 'express';
import { PrerequisiteService } from './prerequisite.service';
import { responseUtils } from '../../utils/response.util';

export class PrerequisiteController {
  private service: PrerequisiteService;

  constructor() {
    this.service = new PrerequisiteService();
  }

  /**
   * Get prerequisites for a course
   * GET /api/courses/:courseId/prerequisites
   */
  getPrerequisites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const prerequisites = await this.service.getPrerequisites(courseId, userId, userRole);
      responseUtils.sendSuccess(res, 'Prerequisites retrieved successfully', prerequisites);
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Create prerequisite
   * POST /api/courses/:courseId/prerequisites
   */
  createPrerequisite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        responseUtils.sendUnauthorized(res, 'Unauthorized');
        return;
      }

      const { prerequisite_course_id, is_required, order_index } = req.body;

      if (!prerequisite_course_id) {
        responseUtils.sendBadRequest(res, 'prerequisite_course_id is required');
        return;
      }

      const prerequisite = await this.service.createPrerequisite(
        courseId,
        { prerequisite_course_id, is_required, order_index },
        userId,
        userRole
      );

      responseUtils.sendSuccess(res, 'Prerequisite created successfully', prerequisite, 201);
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Bulk create prerequisites
   * POST /api/courses/:courseId/prerequisites/bulk
   */
  bulkCreatePrerequisites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        responseUtils.sendUnauthorized(res, 'Unauthorized');
        return;
      }

      const { prerequisites } = req.body;

      if (!Array.isArray(prerequisites) || prerequisites.length === 0) {
        responseUtils.sendBadRequest(res, 'prerequisites array is required');
        return;
      }

      const created = await this.service.bulkCreatePrerequisites(courseId, prerequisites, userId, userRole);
      responseUtils.sendSuccess(res, 'Prerequisites created successfully', created, 201);
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Delete prerequisite
   * DELETE /api/courses/:courseId/prerequisites/:prerequisiteId
   */
  deletePrerequisite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId, prerequisiteId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        responseUtils.sendUnauthorized(res, 'Unauthorized');
        return;
      }

      await this.service.deletePrerequisite(courseId, prerequisiteId, userId, userRole);
      responseUtils.sendSuccess(res, 'Prerequisite deleted successfully');
    } catch (error: unknown) {
      next(error);
    }
  };
}

