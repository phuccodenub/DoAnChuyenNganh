import { Request, Response, NextFunction } from 'express';
import { CourseService } from './course.service';
import { responseUtils } from '../../utils/response.util';
import logger from '../../utils/logger.util';

/**
 * Course Module Controller
 * Handles HTTP requests for course-related operations
 */
export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  // ===== COURSE MANAGEMENT METHODS =====

  /**
   * Get all courses with pagination and filtering
   */
  async getAllCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryData = (req as any).validatedQuery || req.query;
      const options = {
        page: parseInt(queryData.page as string) || 1,
        limit: parseInt(queryData.limit as string) || 10,
        search: queryData.search as string,
        status: queryData.status as string,
        instructor_id: queryData.instructor_id as string,
        category: queryData.category as string,
        level: queryData.level as string,
        tags: queryData.tags ? (queryData.tags as string).split(',') : undefined,
        sortBy: (queryData.sort as string) || 'created_at',
        sortOrder: (queryData.order as string) || 'DESC'
      };
      
      const result = await this.courseService.getAllCourses(options);
      responseUtils.sendPaginated(res, result.courses, result.pagination, 'Courses retrieved successfully');
    } catch (error) {
      logger.error('Error getting all courses:', error);
      next(error);
    }
  }

  /**
   * Get course by ID
   */
  async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.params.id;
      const course = await this.courseService.getCourseById(courseId);
      responseUtils.sendSuccess(res, 'Course retrieved successfully', course);
    } catch (error) {
      logger.error('Error getting course by ID:', error);
      next(error);
    }
  }

  /**
   * Create new course
   */
  async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseData = req.body;
      const instructorId = (req as any).user.userId;
      
      const course = await this.courseService.createCourse(courseData, instructorId);
      responseUtils.sendCreated(res, 'Course created successfully', course);
    } catch (error) {
      logger.error('Error creating course:', error);
      next(error);
    }
  }

  /**
   * Update course
   */
  async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.params.id;
      const courseData = req.body;
      const userId = (req as any).user.userId;
      
      const course = await this.courseService.updateCourse(courseId, courseData, userId);
      responseUtils.sendSuccess(res, 'Course updated successfully', course);
    } catch (error) {
      logger.error('Error updating course:', error);
      next(error);
    }
  }

  /**
   * Delete course
   */
  async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.params.id;
      const userId = (req as any).user.userId;
      
      await this.courseService.deleteCourse(courseId, userId);
      responseUtils.sendSuccess(res, 'Course deleted successfully');
    } catch (error) {
      logger.error('Error deleting course:', error);
      next(error);
    }
  }

  /**
   * Publish course
   */
  async publishCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.params.id;
      const userId = (req as any).user.userId;
      
      const course = await this.courseService.publishCourse(courseId, userId);
      responseUtils.sendSuccess(res, 'Course published successfully', course);
    } catch (error) {
      logger.error('Error publishing course:', error);
      next(error);
    }
  }

  /**
   * Archive course
   */
  async archiveCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.params.id;
      const userId = (req as any).user.userId;
      
      const course = await this.courseService.archiveCourse(courseId, userId);
      responseUtils.sendSuccess(res, 'Course archived successfully', course);
    } catch (error) {
      logger.error('Error archiving course:', error);
      next(error);
    }
  }

  /**
   * Unpublish course
   */
  async unpublishCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.params.id;
      const userId = (req as any).user.userId;
      
      // Update course status to draft
      const course = await this.courseService.updateCourse(courseId, { status: 'draft' } as any, userId);
      responseUtils.sendSuccess(res, 'Course unpublished successfully', course);
    } catch (error) {
      logger.error('Error unpublishing course:', error);
      next(error);
    }
  }

  /**
   * Get courses by instructor
   */
  async getCoursesByInstructor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = req.params.instructorId;
      const queryData = (req as any).validatedQuery || req.query;
      const options = {
        status: queryData.status as string,
        page: parseInt(queryData.page as string) || 1,
        limit: parseInt(queryData.limit as string) || 10
      };
      
      const courses = await this.courseService.getCoursesByInstructor(instructorId, options);
      responseUtils.sendSuccess(res, 'Instructor courses retrieved successfully', courses);
    } catch (error) {
      logger.error('Error getting courses by instructor:', error);
      next(error);
    }
  }

  /**
   * Search courses
   */
  async searchCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = req.body;
      const queryData = (req as any).validatedQuery || req.query;
      const options = {
        page: parseInt(queryData.page as string) || 1,
        limit: parseInt(queryData.limit as string) || 10,
        sortBy: (queryData.sort as string) || 'created_at',
        sortOrder: (queryData.order as string) || 'DESC'
      };
      
      const result = await this.courseService.searchCourses(filters, options);
      responseUtils.sendPaginated(res, result.courses, result.pagination, 'Course search completed successfully');
    } catch (error) {
      logger.error('Error searching courses:', error);
      next(error);
    }
  }

  /**
   * Get popular courses
   */
  async getPopularCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryData = (req as any).validatedQuery || req.query;
      const limit = parseInt(queryData.limit as string) || 10;
      
      const courses = await this.courseService.getPopularCourses(limit);
      responseUtils.sendSuccess(res, 'Popular courses retrieved successfully', courses);
    } catch (error) {
      logger.error('Error getting popular courses:', error);
      next(error);
    }
  }

  /**
   * Get courses by tags
   */
  async getCoursesByTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tags = (req.query.tags as string)?.split(',') || [];
      const queryData = (req as any).validatedQuery || req.query;
      const limit = parseInt(queryData.limit as string) || 10;
      
      const courses = await this.courseService.getCoursesByTags(tags, limit);
      responseUtils.sendSuccess(res, 'Courses by tags retrieved successfully', courses);
    } catch (error) {
      logger.error('Error getting courses by tags:', error);
      next(error);
    }
  }

  /**
   * Get course analytics
   */
  async getCourseAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.params.id;
      const userId = (req as any).user.userId;
      
      const analytics = await this.courseService.getCourseAnalytics(courseId, userId);
      responseUtils.sendSuccess(res, 'Course analytics retrieved successfully', analytics);
    } catch (error) {
      logger.error('Error getting course analytics:', error);
      next(error);
    }
  }

  /**
   * Get course progress (for enrolled students)
   */
  async getCourseProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.params.id;
      const userId = (req as any).user.userId;
      
      // TODO: Implement course progress logic
      const progress = {
        course_id: courseId,
        user_id: userId,
        progress_percentage: 0,
        completed_lessons: 0,
        total_lessons: 0,
        time_spent: 0,
        last_accessed: new Date()
      };
      
      responseUtils.sendSuccess(res, 'Course progress retrieved successfully', progress);
    } catch (error) {
      logger.error('Error getting course progress:', error);
      next(error);
    }
  }
}