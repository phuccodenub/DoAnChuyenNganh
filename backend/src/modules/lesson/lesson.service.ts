import { LessonRepository } from './lesson.repository';
import { ApiError } from '../../errors/api.error';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';

export class LessonService {
  private lessonRepository: LessonRepository;

  constructor() {
    this.lessonRepository = new LessonRepository();
  }

  /**
   * Get all lessons with pagination and filtering
   */
  async getAllLessons(options: {
    page: number;
    limit: number;
    course_id?: string;
    section_id?: string;
    status?: string;
  }) {
    try {
      logger.info('Getting all lessons', options);
      
      const result = await this.lessonRepository.findAllWithPagination(options);
      
      logger.info('Lessons retrieved successfully', { count: result.data.length });
      return result;
    } catch (error) {
      logger.error('Error getting all lessons:', error);
      throw error;
    }
  }

  /**
   * Get lesson by ID
   */
  async getLessonById(lessonId: string) {
    try {
      logger.info('Getting lesson by ID', { lessonId });
      
      const lesson = await this.lessonRepository.findById(lessonId);
      
      if (!lesson) {
        logger.error('Lesson not found', { lessonId });
        throw new ApiError('Lesson not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      logger.info('Lesson retrieved successfully', { lessonId });
      return lesson;
    } catch (error) {
      logger.error('Error getting lesson by ID:', error);
      throw error;
    }
  }

  /**
   * Create new lesson
   */
  async createLesson(lessonData: any) {
    try {
      logger.info('Creating new lesson', { title: lessonData.title });
      
      const lesson = await this.lessonRepository.create(lessonData);
      
      logger.info('Lesson created successfully', { lessonId: lesson.id });
      return lesson;
    } catch (error) {
      logger.error('Error creating lesson:', error);
      throw error;
    }
  }

  /**
   * Update lesson
   */
  async updateLesson(lessonId: string, updateData: any) {
    try {
      logger.info('Updating lesson', { lessonId });
      
      const lesson = await this.lessonRepository.update(lessonId, updateData);
      
      if (!lesson) {
        logger.error('Lesson not found for update', { lessonId });
        throw new ApiError('Lesson not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      logger.info('Lesson updated successfully', { lessonId });
      return lesson;
    } catch (error) {
      logger.error('Error updating lesson:', error);
      throw error;
    }
  }

  /**
   * Delete lesson
   */
  async deleteLesson(lessonId: string) {
    try {
      logger.info('Deleting lesson', { lessonId });
      
      await this.lessonRepository.delete(lessonId);
      
      if (false) {
        logger.error('Lesson not found for deletion', { lessonId });
        throw new ApiError('Lesson not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      logger.info('Lesson deleted successfully', { lessonId });
      return true;
    } catch (error) {
      logger.error('Error deleting lesson:', error);
      throw error;
    }
  }
}
