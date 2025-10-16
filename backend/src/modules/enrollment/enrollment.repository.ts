import { EnrollmentInstance } from '../../types/enrollment.types';
import { BaseRepository } from '@repositories/base.repository';
import * as EnrollmentTypes from '../../types/enrollment.types';
declare const require: any;
const logger: any = require('../../utils/logger.util');
import { Op } from 'sequelize';
// Avoid pulling full models graph during isolated lint; use loose declarations
declare const User: any;
declare const Course: any;
declare const Enrollment: any;

export class EnrollmentRepository extends BaseRepository {
  constructor() {
    super('Enrollment');
  }

  /**
   * Get the Enrollment model instance
   */
  protected getModel(): any {
    return Enrollment;
  }

  // ===== ENROLLMENT MANAGEMENT METHODS =====

  /**
   * Find all enrollments with pagination and filtering
   */
  async findAllWithPagination(options: EnrollmentTypes.EnrollmentFilterOptions): Promise<{ enrollments: EnrollmentTypes.EnrollmentWithDetails[]; pagination: any }> {
    try {
      logger.debug('Finding all enrollments with pagination', options);

      const { page = 1, limit = 10, user_id, course_id, status, search, sortBy = 'created_at', sortOrder = 'DESC' } = options;
      const offset = (page - 1) * limit;

      const whereClause: any = {};
      if (user_id) whereClause.user_id = user_id;
      if (course_id) whereClause.course_id = course_id;
      if (status) whereClause.status = status;

      // Get total count
      const total = await this.count({ where: whereClause });

      // Get enrollments with student and course details
      const enrollments = await this.findAll({
        where: whereClause,
        limit,
        offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'username', 'first_name', 'last_name', 'email', 'avatar']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'description', 'instructor_id', 'status', 'thumbnail', 'price', 'currency']
          }
        ]
      });

      const pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      };

      logger.debug('Enrollments with pagination retrieved', { count: enrollments.length, total, page, limit });

      return { enrollments: enrollments.map((enrollment: any) => enrollment.toJSON()), pagination };
    } catch (error) {
      logger.error('Error finding all enrollments with pagination:', error);
      throw error;
    }
  }

  /**
   * Find enrollment by ID with details
   */
  async findByIdWithDetails(enrollmentId: string): Promise<EnrollmentTypes.EnrollmentWithDetails | null> {
    try {
      logger.debug('Finding enrollment by ID with details', { enrollmentId });
      
      const enrollment = await this.findOne({
        where: { id: enrollmentId },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'username', 'first_name', 'last_name', 'email', 'avatar']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'description', 'instructor_id', 'status', 'thumbnail', 'price', 'currency']
          }
        ]
      });
      
      if (enrollment) {
        logger.debug('Enrollment with details found', { enrollmentId });
      } else {
        logger.debug('Enrollment with details not found', { enrollmentId });
      }
      
      return enrollment;
    } catch (error) {
      logger.error('Error finding enrollment by ID with details:', error);
      throw error;
    }
  }

  /**
   * Find enrollment by user and course
   */
  async findByUserAndCourse(userId: string, courseId: string): Promise<EnrollmentInstance | null> {
    try {
      logger.debug('Finding enrollment by user and course', { userId, courseId });
      
      const enrollment = await this.findOne({
        where: { user_id: userId, course_id: courseId }
      });
      
      if (enrollment) {
        logger.debug('Enrollment found', { userId, courseId });
      } else {
        logger.debug('Enrollment not found', { userId, courseId });
      }
      
      return enrollment;
    } catch (error) {
      logger.error('Error finding enrollment by user and course:', error);
      throw error;
    }
  }

  /**
   * Get enrollments by user ID
   */
  async findByUserId(userId: string, options?: { status?: string; limit?: number }): Promise<EnrollmentTypes.EnrollmentWithDetails[]> {
    try {
      logger.debug('Finding enrollments by user ID', { userId, options });
      
      const whereClause: any = { user_id: userId };
      if (options?.status) whereClause.status = options.status;
      
      const enrollments = await this.findAll({
        where: whereClause,
        limit: options?.limit,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'description', 'instructor_id', 'status', 'thumbnail', 'price', 'currency']
          }
        ]
      });
      
      logger.debug('Enrollments by user ID retrieved', { userId, count: enrollments.length });
      
      return enrollments.map((enrollment: any) => enrollment.toJSON());
    } catch (error) {
      logger.error('Error finding enrollments by user ID:', error);
      throw error;
    }
  }

  /**
   * Get enrollments by course ID
   */
  async findByCourseId(courseId: string, options?: { status?: string; limit?: number }): Promise<EnrollmentTypes.EnrollmentWithDetails[]> {
    try {
      logger.debug('Finding enrollments by course ID', { courseId, options });
      
      const whereClause: any = { course_id: courseId };
      if (options?.status) whereClause.status = options.status;
      
      const enrollments = await this.findAll({
        where: whereClause,
        limit: options?.limit,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'username', 'first_name', 'last_name', 'email', 'avatar']
          }
        ]
      });
      
      logger.debug('Enrollments by course ID retrieved', { courseId, count: enrollments.length });
      
      return enrollments.map((enrollment: any) => enrollment.toJSON());
    } catch (error) {
      logger.error('Error finding enrollments by course ID:', error);
      throw error;
    }
  }

  // ===== ENROLLMENT STATISTICS METHODS =====

  /**
   * Get enrollment statistics
   */
  async getEnrollmentStats(): Promise<EnrollmentTypes.EnrollmentStats> {
    try {
      logger.debug('Getting enrollment statistics');
      
      const total = await this.count();
      const active = await this.count({ where: { status: 'enrolled' } });
      const completed = await this.count({ where: { status: 'completed' } });
      const dropped = await this.count({ where: { status: 'dropped' } });
      
      // Get average progress and grade
      const enrollments = await this.findAll({
        attributes: ['progress', 'grade'],
        where: { status: 'completed' }
      });
      
      const averageProgress = enrollments.length > 0 
        ? enrollments.reduce((sum: number, e: any) => sum + e.progress, 0) / enrollments.length 
        : 0;
      
      const grades = enrollments.filter((e: any) => e.grade !== null).map((e: any) => e.grade);
      const averageGrade = grades.length > 0 
        ? grades.reduce((sum: number, grade: number) => sum + grade, 0) / grades.length 
        : 0;
      
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      
      const stats: EnrollmentTypes.EnrollmentStats = {
        total_enrollments: total,
        active_enrollments: active,
        completed_enrollments: completed,
        dropped_enrollments: dropped,
        average_progress: Math.round(averageProgress * 100) / 100,
        average_grade: Math.round(averageGrade * 100) / 100,
        completion_rate: Math.round(completionRate * 100) / 100
      };
      
      logger.debug('Enrollment statistics retrieved', stats);
      
      return stats;
    } catch (error) {
      logger.error('Error getting enrollment statistics:', error);
      throw error;
    }
  }

  /**
   * Get course enrollment statistics
   */
  async getCourseEnrollmentStats(courseId: string): Promise<EnrollmentTypes.CourseEnrollmentStats> {
    try {
      logger.debug('Getting course enrollment statistics', { courseId });
      
      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new Error('Course not found');
      }
      
      const total = await this.count({ where: { course_id: courseId } });
      const active = await this.count({ where: { course_id: courseId, status: 'enrolled' } });
      const completed = await this.count({ where: { course_id: courseId, status: 'completed' } });
      
      // Get average progress and grade for this course
      const enrollments = await this.findAll({
        attributes: ['progress', 'grade'],
        where: { course_id: courseId, status: 'completed' }
      });
      
      const averageProgress = enrollments.length > 0 
        ? enrollments.reduce((sum: number, e: any) => sum + e.progress, 0) / enrollments.length 
        : 0;
      
      const grades = enrollments.filter((e: any) => e.grade !== null).map((e: any) => e.grade);
      const averageGrade = grades.length > 0 
        ? grades.reduce((sum: number, grade: number) => sum + grade, 0) / grades.length 
        : 0;
      
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      
      const stats: EnrollmentTypes.CourseEnrollmentStats = {
        course_id: courseId,
        course_title: course.title,
        total_enrollments: total,
        active_enrollments: active,
        completed_enrollments: completed,
        average_progress: Math.round(averageProgress * 100) / 100,
        average_grade: Math.round(averageGrade * 100) / 100,
        completion_rate: Math.round(completionRate * 100) / 100
      };
      
      logger.debug('Course enrollment statistics retrieved', stats);
      
      return stats;
    } catch (error) {
      logger.error('Error getting course enrollment statistics:', error);
      throw error;
    }
  }

  /**
   * Get user enrollment statistics
   */
  async getUserEnrollmentStats(userId: string): Promise<EnrollmentTypes.UserEnrollmentStats> {
    try {
      logger.debug('Getting user enrollment statistics', { userId });
      
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const total = await this.count({ where: { user_id: userId } });
      const active = await this.count({ where: { user_id: userId, status: 'enrolled' } });
      const completed = await this.count({ where: { user_id: userId, status: 'completed' } });
      
      // Get average progress and grade for this user
      const enrollments = await this.findAll({
        attributes: ['progress', 'grade'],
        where: { user_id: userId, status: 'completed' }
      });
      
      const averageProgress = enrollments.length > 0 
        ? enrollments.reduce((sum: number, e: any) => sum + e.progress, 0) / enrollments.length 
        : 0;
      
      const grades = enrollments.filter((e: any) => e.grade !== null).map((e: any) => e.grade);
      const averageGrade = grades.length > 0 
        ? grades.reduce((sum: number, grade: number) => sum + grade, 0) / grades.length 
        : 0;
      
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      
      const stats: EnrollmentTypes.UserEnrollmentStats = {
        user_id: userId,
        username: user.username,
        total_enrollments: total,
        active_enrollments: active,
        completed_enrollments: completed,
        average_progress: Math.round(averageProgress * 100) / 100,
        average_grade: Math.round(averageGrade * 100) / 100,
        completion_rate: Math.round(completionRate * 100) / 100
      };
      
      logger.debug('User enrollment statistics retrieved', stats);
      
      return stats;
    } catch (error) {
      logger.error('Error getting user enrollment statistics:', error);
      throw error;
    }
  }
}
