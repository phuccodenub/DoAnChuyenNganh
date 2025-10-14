import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from './enrollment.service';
import { responseUtils } from '../../utils/response.util';
import logger from '../../utils/logger.util';
import { EnrollmentTypes } from './enrollment.types';

export class EnrollmentController {
  private enrollmentService: EnrollmentService;

  constructor() {
    this.enrollmentService = new EnrollmentService();
  }

  // ===== ENROLLMENT MANAGEMENT METHODS =====

  /**
   * Create new enrollment
   */
  async createEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload: EnrollmentTypes.CreateEnrollmentPayload = req.body;
      const enrollment = await this.enrollmentService.createEnrollment(payload);
      responseUtils.sendCreated(res, 'Enrollment created successfully', enrollment);
    } catch (error) {
      logger.error('Error creating enrollment:', error);
      next(error);
    }
  }

  /**
   * Get all enrollments with pagination and filtering
   */
  async getAllEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryData = (req as any).validatedQuery || req.query;
      const options: EnrollmentTypes.EnrollmentFilterOptions = {
        page: parseInt(queryData.page as string) || 1,
        limit: parseInt(queryData.limit as string) || 10,
        user_id: queryData.user_id as string,
        course_id: queryData.course_id as string,
        status: queryData.status as EnrollmentTypes.EnrollmentInstance['status'],
        search: queryData.search as string,
        sortBy: (queryData.sort as string) || 'created_at',
        sortOrder: (queryData.order as 'ASC' | 'DESC') || 'DESC',
      };
      const result = await this.enrollmentService.getAllEnrollments(options);
      responseUtils.sendPaginated(res, result.enrollments, result.pagination, 'Enrollments retrieved successfully');
    } catch (error) {
      logger.error('Error getting all enrollments:', error);
      next(error);
    }
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollmentId = req.params.id;
      const enrollment = await this.enrollmentService.getEnrollmentById(enrollmentId);
      responseUtils.sendSuccess(res, 'Enrollment retrieved successfully', enrollment);
    } catch (error) {
      logger.error('Error getting enrollment by ID:', error);
      next(error);
    }
  }

  /**
   * Update enrollment
   */
  async updateEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollmentId = req.params.id;
      const payload: EnrollmentTypes.UpdateEnrollmentPayload = req.body;
      const updatedEnrollment = await this.enrollmentService.updateEnrollment(enrollmentId, payload);
      responseUtils.sendSuccess(res, 'Enrollment updated successfully', updatedEnrollment);
    } catch (error) {
      logger.error('Error updating enrollment:', error);
      next(error);
    }
  }

  /**
   * Delete enrollment
   */
  async deleteEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollmentId = req.params.id;
      await this.enrollmentService.deleteEnrollment(enrollmentId);
      responseUtils.sendNoContent(res);
    } catch (error) {
      logger.error('Error deleting enrollment:', error);
      next(error);
    }
  }

  /**
   * Complete enrollment
   */
  async completeEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollmentId = req.params.id;
      const payload = req.body;
      const completedEnrollment = await this.enrollmentService.completeEnrollment(enrollmentId, payload);
      responseUtils.sendSuccess(res, 'Enrollment completed successfully', completedEnrollment);
    } catch (error) {
      logger.error('Error completing enrollment:', error);
      next(error);
    }
  }

  // ===== ENROLLMENT QUERY METHODS =====

  /**
   * Get enrollments by user ID
   */
  async getEnrollmentsByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const options = {
        status: req.query.status as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };
      const enrollments = await this.enrollmentService.getEnrollmentsByUserId(userId, options);
      responseUtils.sendSuccess(res, 'User enrollments retrieved successfully', enrollments);
    } catch (error) {
      logger.error('Error getting enrollments by user ID:', error);
      next(error);
    }
  }

  /**
   * Get enrollments by course ID
   */
  async getEnrollmentsByCourseId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.params.courseId;
      const options = {
        status: req.query.status as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };
      const enrollments = await this.enrollmentService.getEnrollmentsByCourseId(courseId, options);
      responseUtils.sendSuccess(res, 'Course enrollments retrieved successfully', enrollments);
    } catch (error) {
      logger.error('Error getting enrollments by course ID:', error);
      next(error);
    }
  }

  // ===== ENROLLMENT STATISTICS METHODS =====

  /**
   * Get enrollment statistics
   */
  async getEnrollmentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.enrollmentService.getEnrollmentStats();
      responseUtils.sendSuccess(res, 'Enrollment statistics retrieved successfully', stats);
    } catch (error) {
      logger.error('Error getting enrollment statistics:', error);
      next(error);
    }
  }

  /**
   * Get course enrollment statistics
   */
  async getCourseEnrollmentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = req.params.courseId;
      const stats = await this.enrollmentService.getCourseEnrollmentStats(courseId);
      responseUtils.sendSuccess(res, 'Course enrollment statistics retrieved successfully', stats);
    } catch (error) {
      logger.error('Error getting course enrollment statistics:', error);
      next(error);
    }
  }

  /**
   * Get user enrollment statistics
   */
  async getUserEnrollmentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const stats = await this.enrollmentService.getUserEnrollmentStats(userId);
      responseUtils.sendSuccess(res, 'User enrollment statistics retrieved successfully', stats);
    } catch (error) {
      logger.error('Error getting user enrollment statistics:', error);
      next(error);
    }
  }

  // ===== ENROLLMENT VALIDATION METHODS =====

  /**
   * Check if user is enrolled in course
   */
  async checkUserEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const courseId = req.params.courseId;
      const isEnrolled = await this.enrollmentService.isUserEnrolledInCourse(userId, courseId);
      responseUtils.sendSuccess(res, 'User enrollment status checked', { isEnrolled });
    } catch (error) {
      logger.error('Error checking user enrollment:', error);
      next(error);
    }
  }

  /**
   * Get enrollment by user and course
   */
  async getEnrollmentByUserAndCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const courseId = req.params.courseId;
      const enrollment = await this.enrollmentService.getEnrollmentByUserAndCourse(userId, courseId);
      
      if (enrollment) {
        responseUtils.sendSuccess(res, 'Enrollment retrieved successfully', enrollment);
      } else {
        responseUtils.sendSuccess(res, 'User is not enrolled in this course', null);
      }
    } catch (error) {
      logger.error('Error getting enrollment by user and course:', error);
      next(error);
    }
  }
}
