import { ModelStatic, FindOptions } from 'sequelize';
import Enrollment from '../models/enrollment.model';
import { EnrollmentInstance, EnrollmentAttributes, EnrollmentStatus, EnrollmentCreationAttributes } from '../types/model.types';
import { BaseRepository } from './base.repository';
import logger from '../utils/logger.util';

export class EnrollmentRepository extends BaseRepository<EnrollmentInstance, EnrollmentCreationAttributes, Partial<EnrollmentAttributes>> {
  constructor() {
    super('Enrollment');
  }

  /**
   * Get the Enrollment model
   */
  protected getModel(): ModelStatic<EnrollmentInstance> {
    return Enrollment as unknown as ModelStatic<EnrollmentInstance>;
  }

  /**
   * Find enrollment by course and user
   */
  async findByCourseAndUser(courseId: string, userId: string): Promise<EnrollmentInstance | null> {
    try {
      logger.debug('Finding enrollment by course and user', { courseId, userId });
      
      const enrollment = await this.findOne({
        where: {
          course_id: courseId,
          user_id: userId
        }
      });
      
      if (enrollment) {
        logger.debug('Enrollment found', { courseId, userId });
      } else {
        logger.debug('Enrollment not found', { courseId, userId });
      }
      
      return enrollment;
    } catch (error: unknown) {
      logger.error('Error finding enrollment by course and user:', error);
      throw error;
    }
  }

  /**
   * Find enrollments by course
   */
  async findByCourse(courseId: string, options?: FindOptions<EnrollmentAttributes>): Promise<EnrollmentInstance[]> {
    try {
      logger.debug('Finding enrollments by course', { courseId });
      
      const enrollments = await this.findAll({
        where: { course_id: courseId },
        ...options
      });
      
      logger.debug('Enrollments found by course', { courseId, count: enrollments.length });
      return enrollments;
    } catch (error: unknown) {
      logger.error('Error finding enrollments by course:', error);
      throw error;
    }
  }

  /**
   * Find enrollments by user
   */
  async findByUser(userId: string, options?: FindOptions<EnrollmentAttributes>): Promise<EnrollmentInstance[]> {
    try {
      logger.debug('Finding enrollments by user', { userId });
      
      const enrollments = await this.findAll({
        where: { user_id: userId },
        ...options
      });
      
      logger.debug('Enrollments found by user', { userId, count: enrollments.length });
      return enrollments;
    } catch (error: unknown) {
      logger.error('Error finding enrollments by user:', error);
      throw error;
    }
  }

  /**
   * Get enrollment count for course
   */
  async getCourseEnrollmentCount(courseId: string): Promise<number> {
    try {
      logger.debug('Getting course enrollment count', { courseId });
      
      const count = await this.count({
        where: { course_id: courseId }
      });
      
      logger.debug('Course enrollment count retrieved', { courseId, count });
      return count;
    } catch (error: unknown) {
      logger.error('Error getting course enrollment count:', error);
      throw error;
    }
  }

  /**
   * Get user enrollment count
   */
  async getUserEnrollmentCount(userId: string): Promise<number> {
    try {
      logger.debug('Getting user enrollment count', { userId });
      
      const count = await this.count({
        where: { user_id: userId }
      });
      
      logger.debug('User enrollment count retrieved', { userId, count });
      return count;
    } catch (error: unknown) {
      logger.error('Error getting user enrollment count:', error);
      throw error;
    }
  }

  /**
   * Check if user is enrolled in course
   */
  async isUserEnrolled(courseId: string, userId: string): Promise<boolean> {
    try {
      logger.debug('Checking if user is enrolled', { courseId, userId });
      
      const enrollment = await this.findByCourseAndUser(courseId, userId);
      const isEnrolled = enrollment !== null;
      
      logger.debug('User enrollment check', { courseId, userId, isEnrolled });
      return isEnrolled;
    } catch (error: unknown) {
      logger.error('Error checking user enrollment:', error);
      throw error;
    }
  }

  /**
   * Get enrollments with course details
   */
  async findWithCourseDetails(userId: string, options?: FindOptions<EnrollmentAttributes>): Promise<EnrollmentInstance[]> {
    try {
      logger.debug('Finding enrollments with course details', { userId });
      
      const enrollments = await this.findAll({
        where: { user_id: userId },
        include: [
          {
            model: require('../models').Course,
            as: 'course',
            attributes: ['id', 'title', 'description', 'thumbnail', 'status']
          }
        ],
        ...options
      });
      
      logger.debug('Enrollments with course details found', { userId, count: enrollments.length });
      return enrollments;
    } catch (error: unknown) {
      logger.error('Error finding enrollments with course details:', error);
      throw error;
    }
  }

  /**
   * Get enrollments with user details
   */
  async findWithUserDetails(courseId: string, options?: FindOptions<EnrollmentAttributes>): Promise<EnrollmentInstance[]> {
    try {
      logger.debug('Finding enrollments with user details', { courseId });
      
      const enrollments = await this.findAll({
        where: { course_id: courseId },
        include: [
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email', 'student_id']
          }
        ],
        ...options
      });
      
      logger.debug('Enrollments with user details found', { courseId, count: enrollments.length });
      return enrollments;
    } catch (error: unknown) {
      logger.error('Error finding enrollments with user details:', error);
      throw error;
    }
  }

  /**
   * Update enrollment status
   */
  async updateStatus(enrollmentId: string, status: EnrollmentStatus): Promise<EnrollmentInstance> {
    try {
      logger.debug('Updating enrollment status', { enrollmentId, status });
      
      const enrollment = await this.update(enrollmentId, { status });
      
      logger.debug('Enrollment status updated', { enrollmentId, status });
      return enrollment;
    } catch (error: unknown) {
      logger.error('Error updating enrollment status:', error);
      throw error;
    }
  }

  /**
   * Get enrollment statistics
   */
  async getEnrollmentStats(courseId?: string): Promise<{
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    droppedEnrollments: number;
  }> {
    try {
      logger.debug('Getting enrollment statistics', { courseId });
      
      const whereClause = courseId ? { course_id: courseId } : {};
      
      const [total, active, completed, dropped] = await Promise.all([
        this.count({ where: whereClause }),
        this.count({ where: { ...whereClause, status: 'active' } }),
        this.count({ where: { ...whereClause, status: 'completed' } }),
        this.count({ where: { ...whereClause, status: 'cancelled' } })
      ]);
      
      const stats = {
        totalEnrollments: total,
        activeEnrollments: active,
        completedEnrollments: completed,
        droppedEnrollments: dropped
      };
      
      logger.debug('Enrollment statistics retrieved', { courseId, stats });
      return stats;
    } catch (error: unknown) {
      logger.error('Error getting enrollment statistics:', error);
      throw error;
    }
  }
}

