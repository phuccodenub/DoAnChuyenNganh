import { Request, Response, NextFunction } from 'express';
import { CourseService } from './course.service';
import { CourseRepository } from './course.repository';
import { responseUtils } from '../../utils/response.util';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import { AuthenticatedRequest } from '../../types/common.types';
import logger from '../../utils/logger.util';
import { paginationUtils } from '../../utils/pagination.util';

/**
 * Course Admin Controller
 * Handles admin-level course management operations
 * 
 * This controller allows admins to:
 * - View all courses from all instructors
 * - Manage course status and metadata
 * - Get course statistics and analytics
 * - Perform bulk operations
 */
export class CourseAdminController {
  private courseService: CourseService;
  private courseRepository: CourseRepository;

  constructor() {
    this.courseService = new CourseService();
    this.courseRepository = new CourseRepository();
  }

  /**
   * Get all courses (admin view - see all courses from all instructors)
   * GET /admin/courses
   */
  async getAllCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paginationOptions = paginationUtils.parsePaginationOptions(req.query, {
        defaultLimit: 25,
        maxLimit: 100
      });

      const filters = {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        status: req.query.status as string,
        search: req.query.search as string,
        category_id: req.query.category_id as string,
        sort_by: (req.query.sort_by || 'created_at') as string,
        sort_order: (req.query.sort_order || 'desc') as 'asc' | 'desc',
      };

      const result = await this.courseRepository.findAllAdminView(filters);

      responseUtils.sendSuccess(res, 'Courses retrieved successfully', {
        courses: result.data,
        pagination: result.pagination,
      });
    } catch (error: unknown) {
      logger.error('Error getting courses for admin:', error);
      next(error);
    }
  }

  /**
   * Get course by ID (admin view with additional details)
   * GET /admin/courses/:id
   */
  async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const course = await this.courseRepository.findById(id);

      if (!course) {
        return responseUtils.sendNotFound(res, 'Course not found');
      }

      responseUtils.sendSuccess(res, 'Course retrieved successfully', course);
    } catch (error: unknown) {
      logger.error('Error getting course by ID:', error);
      next(error);
    }
  }

  /**
   * Update course (admin can update any course)
   * PUT /admin/courses/:id
   */
  async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const course = await this.courseRepository.findById(id);
      if (!course) {
        return responseUtils.sendNotFound(res, 'Course not found');
      }

      const updatedCourse = await this.courseRepository.update(id, req.body);
      responseUtils.sendSuccess(res, 'Course updated successfully', updatedCourse);
    } catch (error: unknown) {
      logger.error('Error updating course:', error);
      next(error);
    }
  }

  /**
   * Delete course (admin can delete any course)
   * DELETE /admin/courses/:id
   */
  async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const course = await this.courseRepository.findById(id);
      if (!course) {
        return responseUtils.sendNotFound(res, 'Course not found');
      }

      await this.courseRepository.delete(id);
      responseUtils.sendSuccess(res, 'Course deleted successfully', { success: true });
    } catch (error: unknown) {
      logger.error('Error deleting course:', error);
      next(error);
    }
  }

  /**
   * Change course status
   * PATCH /admin/courses/:id/status
   */
  async changeCourseStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['draft', 'published', 'archived'].includes(status)) {
        return responseUtils.sendError(res, 'Invalid status', RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST);
      }

      const updatedCourse = await this.courseRepository.update(id, { status });
      responseUtils.sendSuccess(res, 'Course status updated successfully', updatedCourse);
    } catch (error: unknown) {
      logger.error('Error changing course status:', error);
      next(error);
    }
  }

  /**
   * Get course statistics (admin overview)
   * GET /admin/courses/stats
   */
  async getCourseStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.courseRepository.getAdminStats();

      responseUtils.sendSuccess(res, 'Course statistics retrieved successfully', stats);
    } catch (error: unknown) {
      logger.error('Error getting course statistics:', error);
      next(error);
    }
  }

  /**
   * Bulk delete courses
   * POST /admin/courses/bulk-delete
   */
  async bulkDeleteCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { course_ids } = req.body;

      if (!Array.isArray(course_ids) || course_ids.length === 0) {
        return responseUtils.sendError(res, 'Invalid course_ids', RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST);
      }

      await this.courseRepository.bulkDelete(course_ids);

      responseUtils.sendSuccess(res, 'Courses deleted successfully', {
        success: true,
        affected: course_ids.length,
      });
    } catch (error: unknown) {
      logger.error('Error bulk deleting courses:', error);
      next(error);
    }
  }

  /**
   * Bulk update course status
   * POST /admin/courses/bulk-status
   */
  async bulkUpdateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { course_ids, status } = req.body;

      if (!Array.isArray(course_ids) || course_ids.length === 0) {
        return responseUtils.sendError(res, 'Invalid course_ids', RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST);
      }

      if (!['draft', 'published', 'archived'].includes(status)) {
        return responseUtils.sendError(res, 'Invalid status', RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST);
      }

      await this.courseRepository.bulkUpdateCourses(course_ids, { status });

      responseUtils.sendSuccess(res, 'Course statuses updated successfully', {
        success: true,
        affected: course_ids.length,
      });
    } catch (error: unknown) {
      logger.error('Error bulk updating course status:', error);
      next(error);
    }
  }

  /**
   * Bulk action on courses
   * POST /admin/courses/bulk-action
   */
  async bulkAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { course_ids, action } = req.body;

      if (!Array.isArray(course_ids) || course_ids.length === 0) {
        return responseUtils.sendError(res, 'Invalid course_ids', RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST);
      }

      let affected = 0;

      switch (action) {
        case 'delete':
          await this.courseRepository.bulkDelete(course_ids);
          affected = course_ids.length;
          break;
        case 'publish':
          await this.courseRepository.bulkUpdateCourses(course_ids, { status: 'published' });
          affected = course_ids.length;
          break;
        case 'archive':
          await this.courseRepository.bulkUpdateCourses(course_ids, { status: 'archived' });
          affected = course_ids.length;
          break;
        case 'draft':
          await this.courseRepository.bulkUpdateCourses(course_ids, { status: 'draft' });
          affected = course_ids.length;
          break;
        default:
          return responseUtils.sendError(res, 'Invalid action', RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST);
      }

      responseUtils.sendSuccess(res, 'Bulk action completed successfully', {
        success: true,
        affected,
      });
    } catch (error: unknown) {
      logger.error('Error performing bulk action:', error);
      next(error);
    }
  }

  /**
   * Get course students (enrollments)
   * GET /admin/courses/:id/students
   */
  async getCourseStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const course = await this.courseRepository.findById(id);
      if (!course) {
        return responseUtils.sendNotFound(res, 'Course not found');
      }

      const result = await this.courseRepository.getCourseStudents(id, page, limit);

      responseUtils.sendSuccess(res, 'Course students retrieved successfully', result);
    } catch (error: unknown) {
      logger.error('Error getting course students:', error);
      next(error);
    }
  }
}

export default CourseAdminController;
