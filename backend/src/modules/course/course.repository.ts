import Course from '../../models/course.model';
import User from '../../models/user.model';
import Enrollment from '../../models/enrollment.model';
import { CourseInstance, CourseAttributes } from '../../types/model.types';
import { UserInstance } from '../../types/model.types';
import { EnrollmentInstance } from '../../types/model.types';
import * as CourseTypes from './course.types';
import { BaseRepository } from '../../repositories/base.repository';
import logger from '../../utils/logger.util';
import type { ModelStatic, WhereOptions } from '../../types/sequelize-types';

export class CourseRepository extends BaseRepository<CourseInstance> {
  constructor() {
    super('Course');
  }

  /**
   * Get the Course model
   */
  protected getModel(): ModelStatic<CourseInstance> {
    return Course as unknown as ModelStatic<CourseInstance>;
  }

  /**
   * Find instructor by ID
   */
  async findInstructorById(instructorId: string): Promise<UserInstance | null> {
    try {
      const UserModel = User as unknown as ModelStatic<UserInstance>;
      return await UserModel.findByPk(instructorId);
    } catch (error: unknown) {
      logger.error('Error finding instructor by ID:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findUserById(userId: string): Promise<UserInstance | null> {
    try {
      const UserModel = User as unknown as ModelStatic<UserInstance>;
      return await UserModel.findByPk(userId);
    } catch (error: unknown) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find all courses with pagination and filters
   */
  async findAllWithPagination(options: CourseTypes.GetCoursesOptions): Promise<CourseTypes.CoursesResponse> {
    try {
      const { Op } = await import('sequelize');
      
      const { page, limit, status, instructor_id, search } = options;
      const offset = (page - 1) * limit;

      // Build where clause
      const whereClause: WhereOptions<CourseAttributes> = {};
      
      if (status) {
        whereClause.status = status;
      }
      
      if (instructor_id) {
        whereClause.instructor_id = instructor_id;
      }
      
      if (search) {
        // Use Op.or for search - requires type assertion for Sequelize operator
        (whereClause as any)[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const CourseModel = Course as unknown as ModelStatic<CourseInstance>;
      const { count, rows } = await (CourseModel as any).findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error: unknown) {
      logger.error('Error finding courses with pagination:', error);
      throw error;
    }
  }

  /**
   * Find courses by instructor
   */
  async findByInstructor(instructorId: string, options: CourseTypes.GetCoursesByInstructorOptions): Promise<CourseTypes.CoursesResponse> {
    try {
      
      const { page, limit, status } = options;
      const offset = (page - 1) * limit;

      const whereClause: WhereOptions<CourseAttributes> = { instructor_id: instructorId };
      
      if (status) {
        whereClause.status = status;
      }

      const CourseModel = Course as unknown as ModelStatic<CourseInstance>;
      const { count, rows } = await (CourseModel as any).findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error: unknown) {
      logger.error('Error finding courses by instructor:', error);
      throw error;
    }
  }

  /**
   * Find enrolled courses by user
   */
  async findEnrolledByUser(userId: string, options: CourseTypes.GetEnrolledCoursesOptions): Promise<CourseTypes.CoursesResponse> {
    try {
      const { Course, Enrollment } = await import('../../models');
      
      const { page, limit, status } = options;
      const offset = (page - 1) * limit;

      const whereClause: WhereOptions<CourseAttributes> = {};
      
      if (status) {
        whereClause.status = status;
      }

      const CourseModel = Course as unknown as ModelStatic<CourseInstance>;
      const { count, rows } = await (CourseModel as any).findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Enrollment,
            as: 'enrollments',
            where: { user_id: userId },
            required: true,
            attributes: ['id', 'created_at', 'status']
          },
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error: unknown) {
      logger.error('Error finding enrolled courses by user:', error);
      throw error;
    }
  }

  /**
   * Find enrollment by course and user
   */
  async findEnrollment(courseId: string, userId: string): Promise<EnrollmentInstance | null> {
    try {
      const EnrollmentModel: ModelStatic<EnrollmentInstance> = Enrollment as unknown as ModelStatic<EnrollmentInstance>;
      return await EnrollmentModel.findOne({
        where: {
          course_id: courseId,
          user_id: userId
        }
      });
    } catch (error: unknown) {
      logger.error('Error finding enrollment:', error);
      throw error;
    }
  }

  /**
   * Create enrollment
   */
  async createEnrollment(courseId: string, userId: string): Promise<EnrollmentInstance> {
    try {
      const EnrollmentModel: ModelStatic<EnrollmentInstance> = Enrollment as unknown as ModelStatic<EnrollmentInstance>;
      return await EnrollmentModel.create({
        course_id: courseId,
        user_id: userId,
        status: 'active'
      });
    } catch (error: unknown) {
      logger.error('Error creating enrollment:', error);
      throw error;
    }
  }

  /**
   * Delete enrollment
   */
  async deleteEnrollment(enrollmentId: string): Promise<void> {
    try {
      const EnrollmentModel: ModelStatic<EnrollmentInstance> = Enrollment as unknown as ModelStatic<EnrollmentInstance>;
      await EnrollmentModel.destroy({
        where: { id: enrollmentId }
      });
    } catch (error: unknown) {
      logger.error('Error deleting enrollment:', error);
      throw error;
    }
  }

  /**
   * Find students by course
   */
  async findStudentsByCourse(courseId: string, options: CourseTypes.GetCourseStudentsOptions): Promise<CourseTypes.StudentsResponse> {
    try {
      const { User, Enrollment } = await import('../../models');
      
      const { page, limit } = options;
      const offset = (page - 1) * limit;

      const UserModel = User as unknown as ModelStatic<UserInstance>;
      const { count, rows } = await (UserModel as any).findAndCountAll({
        include: [
          {
            model: Enrollment,
            as: 'enrollments',
            where: { course_id: courseId },
            required: true,
            attributes: ['id', 'created_at', 'status']
          }
        ],
        attributes: ['id', 'first_name', 'last_name', 'email', 'student_id', 'created_at'],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error: unknown) {
      logger.error('Error finding students by course:', error);
      throw error;
    }
  }

  // ===== Additional helpers expected by CourseService =====

  async getCourseStats(courseId: string): Promise<any> {
    try {
      const { CourseStatistics } = await import('../../models');
      return await (CourseStatistics as any).findOne({ where: { course_id: courseId } });
    } catch (_e) {
      return null;
    }
  }

  async updateStatus(courseId: string, status: string): Promise<CourseInstance | null> {
    const CourseModel = Course as unknown as ModelStatic<CourseInstance>;
    await CourseModel.update({ status } as Partial<CourseAttributes>, { where: { id: courseId } as WhereOptions<CourseAttributes> });
    return CourseModel.findByPk(courseId);
  }

  async findByInstructorId(instructorId: string, options?: { status?: string; page?: number; limit?: number; }): Promise<CourseInstance[]> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const result = await this.findByInstructor(instructorId, { page, limit, status: options?.status as any });
    return result.data as unknown as CourseInstance[];
  }

  async searchCourses(filters: CourseTypes.CourseSearchFilters, options?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string; }): Promise<{ courses: any[]; pagination: any }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;
    const where: any = {};
    if (filters.query) where.title = { [(await import('sequelize')).Op.iLike]: `%${filters.query}%` };
    if (filters.status && filters.status.length) where.status = filters.status[0];
    const CourseModel = Course as unknown as ModelStatic<CourseInstance>;
    const { count, rows } = await (CourseModel as any).findAndCountAll({ where, limit, offset, order: [[options?.sortBy || 'created_at', (options?.sortOrder || 'DESC').toUpperCase()]] });
    return { courses: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } };
  }

  async getPopularCourses(limit: number = 10): Promise<CourseInstance[]> {
    const CourseModel = Course as unknown as ModelStatic<CourseInstance>;
    const rows = await CourseModel.findAll({ limit, order: [['created_at', 'DESC']] } as any);
    return rows as unknown as CourseInstance[];
  }

  async getCoursesByTags(tags: string[], limit: number = 10): Promise<CourseInstance[]> {
    const { Op } = await import('sequelize');
    const CourseModel = Course as unknown as ModelStatic<CourseInstance>;
    const rows = await CourseModel.findAll({
      where: { tags: { [Op.overlap as any]: tags } } as any,
      limit,
      order: [['created_at', 'DESC']]
    } as any);
    return rows as unknown as CourseInstance[];
  }

  async getCourseAnalytics(courseId: string): Promise<any> {
    return {
      enrollment_trends: [],
      completion_rates: [],
      student_engagement: [],
      popular_content: []
    };
  }
}

