import { Request, Response, NextFunction } from 'express';
import { LessonService } from './lesson.service';
import { ApiError } from '../../errors/api.error';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';

export class LessonController {
  private lessonService: LessonService;

  constructor() {
    this.lessonService = new LessonService();
  }

  /**
   * Get all lessons with pagination and filtering
   */
  async getAllLessons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, course_id, section_id, status } = req.query;
      
      const result = await this.lessonService.getAllLessons({
        page: Number(page),
        limit: Number(limit),
        course_id: course_id as string,
        section_id: section_id as string,
        status: status as string
      });

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Lessons retrieved successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error in getAllLessons controller:', error);
      next(error);
    }
  }

  /**
   * Get lesson by ID
   */
  async getLessonById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const lesson = await this.lessonService.getLessonById(id);
      
      if (!lesson) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Lesson not found');
      }

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Lesson retrieved successfully',
        data: lesson
      });
    } catch (error) {
      logger.error('Error in getLessonById controller:', error);
      next(error);
    }
  }

  /**
   * Create new lesson
   */
  async createLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lessonData = req.body;
      
      const lesson = await this.lessonService.createLesson(lessonData);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.CREATED).json({
        success: true,
        message: 'Lesson created successfully',
        data: lesson
      });
    } catch (error) {
      logger.error('Error in createLesson controller:', error);
      next(error);
    }
  }

  /**
   * Update lesson
   */
  async updateLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const lesson = await this.lessonService.updateLesson(id, updateData);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Lesson updated successfully',
        data: lesson
      });
    } catch (error) {
      logger.error('Error in updateLesson controller:', error);
      next(error);
    }
  }

  /**
   * Delete lesson
   */
  async deleteLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      await this.lessonService.deleteLesson(id);

      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Lesson deleted successfully',
        data: null
      });
    } catch (error) {
      logger.error('Error in deleteLesson controller:', error);
      next(error);
    }
  }
}
