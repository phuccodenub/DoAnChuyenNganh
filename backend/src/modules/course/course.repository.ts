import { CourseInstance } from '../../types/course.types';
import { BaseRepository } from '@repositories/base.repository';
import { CourseTypes } from './course.types';
import logger from '@utils/logger.util';
import { Op } from 'sequelize';
import Course from '../../models/course.model';

export class CourseRepository extends BaseRepository {
  constructor() {
    super(Course);
  }

  // ===== COURSE MANAGEMENT METHODS =====

  /**
   * Find all courses with pagination and filtering
   */
  async findAllWithPagination(options: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    instructor_id?: string;
    category?: string;
    level?: string;
    tags?: string[];
    sortBy: string;
    sortOrder: string;
  }): Promise<{ courses: any[]; pagination: any }> {
    try {
      logger.debug('Finding all courses with pagination', options);

      const { page, limit, search, status, instructor_id, category, level, tags, sortBy, sortOrder } = options;
      const offset = (page - 1) * limit;

      // Build where clause
      const whereClause: any = {};
      if (status) whereClause.status = status;
      if (instructor_id) whereClause.instructor_id = instructor_id;
      if (category) whereClause.category = category;
      if (level) whereClause.level = level;
      if (tags && tags.length > 0) {
        whereClause.tags = {
          [Op.contains]: tags
        };
      }
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Get total count
      const total = await this.count({ where: whereClause });

      // Get courses with instructor details
      const { User } = require('../../models');
      const courses = await this.findAll({
        where: whereClause,
        limit,
        offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'username', 'first_name', 'last_name', 'avatar', 'bio']
          }
        ]
      });

      const pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      };

      logger.debug('Courses with pagination retrieved', { 
        count: courses.length, 
        total, 
        page, 
        limit 
      });

      return { courses, pagination };
    } catch (error) {
      logger.error('Error finding all courses with pagination:', error);
      throw error;
    }
  }

  /**
   * Find course by ID with instructor details
   */
  async findByIdWithInstructor(courseId: string): Promise<CourseInstance | null> {
    try {
      logger.debug('Finding course by ID with instructor', { courseId });
      
      const { User } = require('../../models');
      const course = await this.findOne({
        where: { id: courseId },
        include: [
          {
            model: User as any,
            as: 'instructor',
            attributes: ['id', 'username', 'first_name', 'last_name', 'avatar', 'bio'],
            required: false
          }
        ]
      });
      
      if (course) {
        logger.debug('Course with instructor found', { courseId });
      } else {
        logger.debug('Course with instructor not found', { courseId });
      }
      
      return course;
    } catch (error) {
      logger.error('Error finding course by ID with instructor:', error);
      throw error;
    }
  }

  /**
   * Find courses by instructor ID
   */
  async findByInstructorId(instructorId: string, options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      logger.debug('Finding courses by instructor ID', { instructorId, options });
      
      const whereClause: any = { instructor_id: instructorId };
      if (options?.status) whereClause.status = options.status;

      const { User } = require('../../models');
      const courses = await this.findAll({
        where: whereClause,
        limit: options?.limit,
        offset: options?.offset,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'username', 'first_name', 'last_name', 'avatar']
          }
        ]
      });
      
      logger.debug('Courses by instructor retrieved', { instructorId, count: courses.length });
      return courses;
    } catch (error) {
      logger.error('Error finding courses by instructor ID:', error);
      throw error;
    }
  }

  /**
   * Get course statistics
   */
  async getCourseStats(courseId: string): Promise<CourseTypes.CourseStats> {
    try {
      logger.debug('Getting course statistics', { courseId });
      
      // Enrollment model is already imported
      
      // Get enrollment statistics
      const { Enrollment } = require('../../models');
      const totalEnrollments = await Enrollment.count({
        where: { course_id: courseId }
      });
      
      const activeEnrollments = await Enrollment.count({
        where: { 
          course_id: courseId,
          status: 'active'
        }
      });
      
      const completedEnrollments = await Enrollment.count({
        where: { 
          course_id: courseId,
          status: 'completed'
        }
      });
      
      // Calculate completion rate
      const completionRate = totalEnrollments > 0 
        ? Math.round((completedEnrollments / totalEnrollments) * 100) 
        : 0;
      
      // Get last activity (simplified - using course updated_at)
      const course = await this.findById(courseId);
      const lastActivity = course?.updated_at || new Date();
      
      const stats: CourseTypes.CourseStats = {
        total_enrollments: totalEnrollments,
        active_enrollments: activeEnrollments,
        completed_enrollments: completedEnrollments,
        average_rating: 0, // TODO: Implement rating system
        total_ratings: 0, // TODO: Implement rating system
        completion_rate: completionRate,
        last_activity: lastActivity
      };
      
      logger.debug('Course statistics retrieved', { courseId, stats });
      return stats;
    } catch (error) {
      logger.error('Error getting course statistics:', error);
      throw error;
    }
  }

  /**
   * Search courses with advanced filters
   */
  async searchCourses(filters: CourseTypes.CourseSearchFilters, options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ courses: any[]; pagination: any }> {
    try {
      logger.debug('Searching courses with filters', { filters, options });
      
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const offset = (page - 1) * limit;
      
      // Build where clause from filters
      const whereClause: any = {};
      
      if (filters.query) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${filters.query}%` } },
          { description: { [Op.iLike]: `%${filters.query}%` } }
        ];
      }
      
      if (filters.status && filters.status.length > 0) {
        whereClause.status = { [Op.in]: filters.status };
      }
      
      if (filters.instructor_id && filters.instructor_id.length > 0) {
        whereClause.instructor_id = { [Op.in]: filters.instructor_id };
      }
      
      if (filters.category && filters.category.length > 0) {
        whereClause.category = { [Op.in]: filters.category };
      }
      
      if (filters.level && filters.level.length > 0) {
        whereClause.level = { [Op.in]: filters.level };
      }
      
      if (filters.tags && filters.tags.length > 0) {
        whereClause.tags = {
          [Op.contains]: filters.tags
        };
      }
      
      // Get total count
      const total = await this.count({ where: whereClause });
      
      // Get courses
      const { User } = require('../../models');
      const courses = await this.findAll({
        where: whereClause,
        limit,
        offset,
        order: [[options?.sortBy || 'created_at', (options?.sortOrder || 'DESC').toUpperCase()]],
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'username', 'first_name', 'last_name', 'avatar']
          }
        ]
      });
      
      const pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      };
      
      logger.debug('Course search completed', { 
        filters, 
        count: courses.length, 
        total, 
        page, 
        limit 
      });
      
      return { courses, pagination };
    } catch (error) {
      logger.error('Error searching courses:', error);
      throw error;
    }
  }

  /**
   * Get popular courses
   */
  async getPopularCourses(limit: number = 10): Promise<any[]> {
    try {
      logger.debug('Getting popular courses', { limit });
      
      // Enrollment model is already imported
      
      // Get courses ordered by enrollment count
      const { User, Enrollment } = require('../../models');
      const courses = await this.findAll({
        limit,
        order: [['created_at', 'DESC']], // Fallback ordering
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'username', 'first_name', 'last_name', 'avatar']
          },
          {
            model: Enrollment,
            as: 'enrollments',
            attributes: ['id'],
            required: false
          }
        ]
      });
      
      // Sort by enrollment count
      const sortedCourses = courses.sort((a: any, b: any) => {
        const aCount = a.enrollments?.length || 0;
        const bCount = b.enrollments?.length || 0;
        return bCount - aCount;
      });
      
      logger.debug('Popular courses retrieved', { count: sortedCourses.length });
      return sortedCourses;
    } catch (error) {
      logger.error('Error getting popular courses:', error);
      throw error;
    }
  }

  /**
   * Get courses by tags
   */
  async getCoursesByTags(tags: string[], limit: number = 10): Promise<any[]> {
    try {
      logger.debug('Getting courses by tags', { tags, limit });
      
      const { User } = require('../../models');
      const courses = await this.findAll({
        where: {
          tags: {
            [Op.overlap]: tags
          }
        },
        limit,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'username', 'first_name', 'last_name', 'avatar']
          }
        ]
      });
      
      logger.debug('Courses by tags retrieved', { tags, count: courses.length });
      return courses;
    } catch (error) {
      logger.error('Error getting courses by tags:', error);
      throw error;
    }
  }

  /**
   * Update course status
   */
  async updateStatus(courseId: string, status: CourseTypes.CourseStatus): Promise<any> {
    try {
      logger.debug('Updating course status', { courseId, status });
      
      const course = await this.update(courseId, { status });
      
      logger.debug('Course status updated', { courseId, status });
      return course;
    } catch (error) {
      logger.error('Error updating course status:', error);
      throw error;
    }
  }

  /**
   * Get course analytics
   */
  async getCourseAnalytics(courseId: string): Promise<CourseTypes.CourseAnalytics> {
    try {
      logger.debug('Getting course analytics', { courseId });
      
      // TODO: Implement detailed analytics
      // For now, return basic structure
      const analytics: CourseTypes.CourseAnalytics = {
        enrollment_trends: [],
        completion_rates: [],
        student_engagement: [],
        popular_content: []
      };
      
      logger.debug('Course analytics retrieved', { courseId });
      return analytics;
    } catch (error) {
      logger.error('Error getting course analytics:', error);
      throw error;
    }
  }
}