import Course from '../../models/course.model';
import User from '../../models/user.model';
import Enrollment from '../../models/enrollment.model';
import { CourseInstance, CourseAttributes } from '../../types/model.types';
import { UserInstance } from '../../types/model.types';
import { EnrollmentInstance } from '../../types/model.types';
import * as CourseTypes from './course.types';
import { CourseStatsResponse } from './course.types';
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

      const courseIds = rows.map((course: any) => course.id);
      const studentCounts = await this.getStudentCountsForCourses(courseIds);

      const rowsWithCounts = rows.map((course: any) => {
        const courseData = course.toJSON ? course.toJSON() : course;
        // Always use the real-time student count from enrollments table
        // instead of relying on potentially stale total_students field
        const actualStudentCount = studentCounts.get(courseData.id) ?? 0;
        return {
          ...courseData,
          total_students: actualStudentCount
        };
      });

      return {
        data: rowsWithCounts,
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
      const { Section, Lesson, Enrollment } = await import('../../models');
      
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
          },
          {
            model: Section,
            as: 'sections',
            attributes: ['id'],
            include: [{
              model: Lesson,
              as: 'lessons',
              attributes: ['id']
            }]
          },
          {
            model: Enrollment,
            as: 'enrollments',
            attributes: ['id']
          }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']],
        distinct: true // Important for correct count with includes
      });

      // Transform to include counts and map field names
      const coursesWithCounts = rows.map((course: any) => {
        const courseData = course.toJSON ? course.toJSON() : course;
        const totalLessons = courseData.sections?.reduce((sum: number, section: any) => 
          sum + (section.lessons?.length || 0), 0) || 0;
        const totalStudents = courseData.enrollments?.length || courseData.total_students || 0;
        
        // Remove nested data, keep only counts
        delete courseData.sections;
        delete courseData.enrollments;
        
        // Map thumbnail to thumbnail_url for frontend compatibility
        const thumbnailUrl = courseData.thumbnail || null;
        
        return {
          ...courseData,
          thumbnail_url: thumbnailUrl,
          total_lessons: totalLessons,
          total_students: totalStudents
        };
      });

      return {
        data: coursesWithCounts,
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
   * Supports filtering by enrollment progress status (in-progress, completed, not-started)
   */
  async findEnrolledByUser(userId: string, options: CourseTypes.GetEnrolledCoursesOptions): Promise<CourseTypes.CoursesResponse> {
    try {
      const { Course, Enrollment } = await import('../../models');
      const { Op } = await import('sequelize');
      
      const { page = 1, limit = 10, status, search, sort } = options;
      const offset = (page - 1) * limit;

      // Course where clause - only published courses
      const courseWhereClause: WhereOptions<CourseAttributes> = {
        status: 'published'
      };
      
      // Add search filter
      if (search) {
        (courseWhereClause as any)[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Enrollment where clause - filter by progress status
      const enrollmentWhere: any = { 
        user_id: userId,
        status: 'active' // Only active enrollments
      };
      
      // Filter by enrollment progress status (not course status)
      if (status && status !== 'all') {
        if (status === 'completed') {
          enrollmentWhere.progress_percentage = 100;
        } else if (status === 'in-progress') {
          enrollmentWhere.progress_percentage = { [Op.gt]: 0, [Op.lt]: 100 };
        } else if (status === 'not-started') {
          enrollmentWhere.progress_percentage = { [Op.lte]: 0 };
        }
      }

      // Build order clause based on sort option
      let orderClause: any[] = [['created_at', 'DESC']];
      if (sort === 'last_accessed') {
        orderClause = [[{ model: Enrollment, as: 'enrollments' }, 'last_accessed_at', 'DESC NULLS LAST']];
      } else if (sort === 'progress') {
        orderClause = [[{ model: Enrollment, as: 'enrollments' }, 'progress_percentage', 'DESC']];
      } else if (sort === 'title') {
        orderClause = [['title', 'ASC']];
      }

      const CourseModel = Course as unknown as ModelStatic<CourseInstance>;
      const { count, rows } = await (CourseModel as any).findAndCountAll({
        where: courseWhereClause,
        include: [
          {
            model: Enrollment,
            as: 'enrollments',
            where: enrollmentWhere,
            required: true,
            attributes: ['id', 'created_at', 'updated_at', 'status', 'progress_percentage', 'completed_lessons', 'total_lessons', 'last_accessed_at', 'completion_date']
          },
          {
            model: User,
            as: 'instructor',
            // Note: full_name is computed, not stored in DB
            attributes: ['id', 'first_name', 'last_name', 'email', 'avatar']
          }
        ],
        limit,
        offset,
        order: orderClause,
        distinct: true
      });

      // Get total students count for each course using a separate query
      const courseIds = rows.map((c: any) => c.id);
      const studentCounts = await this.getStudentCountsForCourses(courseIds);

      // Transform rows to include enrollment info at course level
      const transformedRows = rows.map((course: any) => {
        const courseData = course.toJSON ? course.toJSON() : { ...course };
        const enrollment = courseData.enrollments?.[0] || {};
        
        // Add enrollment info at course level for frontend convenience
        courseData.enrollment = {
          id: enrollment.id,
          status: enrollment.status,
          progress_percentage: Number(enrollment.progress_percentage) || 0,
          completed_lessons: enrollment.completed_lessons || 0,
          total_lessons: enrollment.total_lessons || 0,
          enrolled_at: enrollment.created_at,
          last_accessed_at: enrollment.last_accessed_at,
          completed_at: enrollment.completion_date
        };
        
        // Add total_students from separate query (this is the total enrolled, not just current user)
        courseData.total_students = studentCounts.get(courseData.id) || courseData.total_students || 0;
        
        // Ensure thumbnail_url exists
        if (courseData.thumbnail && !courseData.thumbnail_url) {
          courseData.thumbnail_url = courseData.thumbnail;
        }
        
        // Ensure instructor full_name exists
        if (courseData.instructor) {
          courseData.instructor.full_name = courseData.instructor.full_name || 
            `${courseData.instructor.first_name || ''} ${courseData.instructor.last_name || ''}`.trim();
          courseData.instructor.avatar_url = courseData.instructor.avatar;
        }
        
        return courseData;
      });

      return {
        data: transformedRows,
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
      const { User, Enrollment, Lesson, Section, LessonProgress } = await import('../../models');
      
      const { page, limit } = options;
      const offset = (page - 1) * limit;

      // Get total lessons count from course (real data)
      const SectionModel = Section as unknown as ModelStatic<any>;
      const sections = await SectionModel.findAll({
        where: { course_id: courseId },
        include: [
          {
            model: Lesson,
            as: 'lessons',
            attributes: ['id'],
            required: false
          }
        ]
      });
      const totalLessons = sections.reduce((sum: number, section: any) => {
        return sum + (section.lessons?.length || 0);
      }, 0);

      const UserModel = User as unknown as ModelStatic<UserInstance>;
      const { count, rows } = await (UserModel as any).findAndCountAll({
        include: [
          {
            model: Enrollment,
            as: 'enrollments',
            where: { course_id: courseId },
            required: true,
            attributes: [
              'id', 
              'created_at', 
              'status',
              'last_accessed_at'
            ]
          }
        ],
        attributes: ['id', 'first_name', 'last_name', 'email', 'student_id', 'avatar', 'created_at'],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      // Get all lesson IDs for this course
      const lessonIds = sections.flatMap((section: any) => 
        (section.lessons || []).map((lesson: any) => lesson.id)
      );

      // Normalize data for frontend with real progress data
      const normalizedData = await Promise.all(rows.map(async (user: any) => {
        const userData = user.toJSON ? user.toJSON() : user;
        const enrollment = userData.enrollments?.[0];
        const firstName = userData.first_name || '';
        const lastName = userData.last_name || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown';
        
        // Get real progress data from LessonProgress
        let completedLessons = 0;
        let progressPercent = 0;
        let lastActivityAt = enrollment?.last_accessed_at || enrollment?.created_at;

        if (lessonIds.length > 0) {
          const LessonProgressModel = LessonProgress as unknown as ModelStatic<any>;
          const progressRecords = await LessonProgressModel.findAll({
            where: {
              user_id: userData.id,
              lesson_id: lessonIds
            },
            attributes: ['lesson_id', 'completed', 'last_accessed_at']
          });

          completedLessons = progressRecords.filter((p: any) => p.completed).length;
          progressPercent = totalLessons > 0 
            ? Math.round((completedLessons / totalLessons) * 100 * 100) / 100 // Round to 2 decimal places
            : 0;

          // Get most recent activity
          const recentActivity = progressRecords
            .filter((p: any) => p.last_accessed_at)
            .sort((a: any, b: any) => 
              new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime()
            )[0];
          
          if (recentActivity?.last_accessed_at) {
            lastActivityAt = recentActivity.last_accessed_at;
          }
        }
        
        return {
          id: userData.id,
          name: fullName,
          email: userData.email,
          avatar_url: userData.avatar,
          student_id: userData.student_id,
          enrolled_at: enrollment?.created_at || userData.created_at,
          progress_percent: progressPercent,
          last_activity_at: lastActivityAt,
          completed_lessons: completedLessons,
          total_lessons: totalLessons,
        };
      }));

      return {
        data: normalizedData,
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

  /**
   * Find all courses with admin filters
   */
  async findAllAdminView(filters: any): Promise<any> {
    try {
      const { Op } = await import('sequelize');
      
      const page = filters.page || 1;
      const limit = filters.limit || 25;
      const offset = (page - 1) * limit;
      const sort_by = filters.sort_by || 'created_at';
      const sort_order = filters.sort_order || 'desc';

      // Build where clause
      const whereClause: WhereOptions<CourseAttributes> = {};
      
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      if (filters.search) {
        (whereClause as any)[Op.or] = [
          { title: { [Op.iLike]: `%${filters.search}%` } },
          { description: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }
      
      if (filters.category_id) {
        whereClause.category_id = filters.category_id;
      }

      const CourseModel = Course as unknown as ModelStatic<CourseInstance>;
      const { count, rows } = await (CourseModel as any).findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'instructor',
            // Backend chỉ có cột avatar, không có avatar_url
            attributes: ['id', 'first_name', 'last_name', 'email', 'avatar']
          }
        ],
        limit,
        offset,
        order: [[sort_by, sort_order.toUpperCase()]]
      });

      const courseIds = rows.map((course: any) => course.id);
      const studentCounts = await this.getStudentCountsForCourses(courseIds);

      // Add student_count to each course
      const coursesWithCount = rows.map((course: any) => {
        const courseData = course.toJSON ? course.toJSON() : course;
        // Always use the real-time student count from enrollments table
        const actualStudentCount = studentCounts.get(courseData.id) ?? 0;
        return {
          ...courseData,
          student_count: actualStudentCount,
          total_students: actualStudentCount
        };
      });

      return {
        data: coursesWithCount,
        pagination: {
          page,
          per_page: limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error: unknown) {
      logger.error('Error finding courses for admin view:', error);
      throw error;
    }
  }

  /**
   * Get admin course statistics
   */
  async getAdminStats(): Promise<any> {
    try {
      const CourseModel = Course as unknown as ModelStatic<CourseInstance>;
      
      const total_courses = await (CourseModel as any).count();
      const published_courses = await (CourseModel as any).count({ where: { status: 'published' } });
      const draft_courses = await (CourseModel as any).count({ where: { status: 'draft' } });
      const archived_courses = await (CourseModel as any).count({ where: { status: 'archived' } });

      // Get total students across all courses
      const EnrollmentModel = Enrollment as unknown as ModelStatic<EnrollmentInstance>;
      const total_students = await (EnrollmentModel as any).count({
        distinct: true,
        col: 'user_id'
      });

      return {
        total_courses,
        published_courses,
        draft_courses,
        archived_courses,
        total_students
      };
    } catch (error: unknown) {
      logger.error('Error getting admin course statistics:', error);
      throw error;
    }
  }

  /**
   * Get student counts for multiple courses
   * Returns a Map of courseId -> studentCount
   */
  async getStudentCountsForCourses(courseIds: string[]): Promise<Map<string, number>> {
    try {
      if (!courseIds.length) return new Map();
      
      const { Sequelize, Op } = await import('sequelize');
      const EnrollmentModel = Enrollment as unknown as ModelStatic<EnrollmentInstance>;
      
      const enrollmentCounts = await (EnrollmentModel as any).findAll({
        attributes: [
          'course_id',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: {
          course_id: { [Op.in]: courseIds }
        },
        group: ['course_id'],
        raw: true
      });

      const countMap = new Map<string, number>();
      enrollmentCounts.forEach((item: any) => {
        countMap.set(item.course_id, parseInt(item.count, 10) || 0);
      });

      return countMap;
    } catch (error: unknown) {
      logger.error('Error getting student counts for courses:', error);
      return new Map();
    }
  }

  /**
   * Bulk delete courses
   */
  async bulkDelete(courseIds: string[]): Promise<void> {
    try {
      const CourseModel = Course as unknown as ModelStatic<CourseInstance>;
      await (CourseModel as any).destroy({
        where: {
          id: { [await import('sequelize').then(m => m.Op.in)]: courseIds }
        }
      });
    } catch (error: unknown) {
      logger.error('Error bulk deleting courses:', error);
      throw error;
    }
  }

  /**
   * Bulk update course status/fields
   */
  async bulkUpdateCourses(courseIds: string[], updates: any): Promise<void> {
    try {
      const CourseModel = Course as unknown as ModelStatic<CourseInstance>;
      const { Op } = await import('sequelize');
      await (CourseModel as any).update(updates, {
        where: {
          id: { [Op.in]: courseIds }
        }
      });
    } catch (error: unknown) {
      logger.error('Error bulk updating courses:', error);
      throw error;
    }
  }

  /**
   * Get course students (enrollments)
   */
  async getCourseStudents(courseId: string, page: number, limit: number): Promise<any> {
    try {
      const offset = (page - 1) * limit;
      const EnrollmentModel = Enrollment as unknown as ModelStatic<EnrollmentInstance>;
      
      const { count, rows } = await (EnrollmentModel as any).findAndCountAll({
        where: { course_id: courseId },
        include: [
          {
            model: User,
            as: 'student', // Match the alias defined in associations.ts
            attributes: ['id', 'first_name', 'last_name', 'email', 'avatar']
          }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return {
        students: rows,
        total: count,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error: unknown) {
      logger.error('Error getting course students:', error);
      throw error;
    }
  }

  /**
   * Get instructor course statistics for dashboard
   */
  async getInstructorCourseStats(courseId: string): Promise<CourseStatsResponse> {
    try {
      const { Op } = await import('sequelize');
      const { getSequelize } = await import('../../config/db');
      const sequelize = getSequelize();
      const { LessonProgress, Assignment, AssignmentSubmission } = await import('../../models');
      
      const EnrollmentModel = Enrollment as unknown as ModelStatic<EnrollmentInstance>;
      const CourseModel = Course as unknown as ModelStatic<CourseInstance>;
      
      // Get course info
      const course = await CourseModel.findByPk(courseId);
      
      // Total students enrolled
      const totalStudents = await (EnrollmentModel as any).count({
        where: { course_id: courseId }
      });

      // New students this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newStudentsThisWeek = await (EnrollmentModel as any).count({
        where: {
          course_id: courseId,
          created_at: { [Op.gte]: oneWeekAgo }
        }
      });

      // Average progress - get from enrollments using raw SQL for aggregation
      const progressResult = await (EnrollmentModel as any).findAll({
        where: { course_id: courseId },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('progress_percentage')), 'avg_progress']
        ],
        raw: true
      });
      const avgProgress = progressResult[0]?.avg_progress ? Number(progressResult[0].avg_progress) : 0;

      // Completion rate - students who completed vs total
      const completedCount = await (EnrollmentModel as any).count({
        where: {
          course_id: courseId,
          status: 'completed'
        }
      });
      const completionRate = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;

      // Average score from assignment submissions
      let avgScore = 0;
      let pendingGrading = 0;
      try {
        if (AssignmentSubmission) {
          const scoreResult = await (AssignmentSubmission as any).findAll({
            include: [{
              model: Assignment,
              as: 'assignment',
              where: { course_id: courseId },
              required: true
            }],
            where: {
              score: { [Op.ne]: null }
            },
            attributes: [
              [sequelize.fn('AVG', sequelize.col('score')), 'avg_score']
            ],
            raw: true
          });
          avgScore = scoreResult[0]?.avg_score ? Number(scoreResult[0].avg_score) : 0;

          // Pending grading count
          pendingGrading = await (AssignmentSubmission as any).count({
            include: [{
              model: Assignment,
              as: 'assignment',
              where: { course_id: courseId },
              required: true
            }],
            where: {
              status: 'submitted'
            }
          });
        }
      } catch (e) {
        // AssignmentSubmission might not exist yet
        logger.warn('Could not get assignment stats:', e);
      }

      // Get rating from course
      const averageRating = course ? Number((course as any).rating || 0) : 0;
      const totalReviews = course ? Number((course as any).total_ratings || 0) : 0;

      // Calculate revenue (price * total_students for paid courses)
      const price = course ? Number((course as any).price || 0) : 0;
      const isFree = course ? (course as any).is_free : true;
      const totalRevenue = isFree ? 0 : price * totalStudents;

      return {
        total_students: totalStudents,
        total_revenue: totalRevenue,
        average_rating: averageRating,
        total_reviews: totalReviews,
        completion_rate: completionRate,
        avg_progress: Math.round(avgProgress),
        avg_score: Math.round(avgScore * 10) / 10, // 1 decimal place
        pending_grading: pendingGrading,
        max_students: 100, // Default max, could be from course settings
        new_students_this_week: newStudentsThisWeek
      };
    } catch (error: unknown) {
      logger.error('Error getting instructor course stats:', error);
      throw error;
    }
  }

  /**
   * Find recommended courses for a user
   * Returns published courses the user hasn't enrolled in, ordered by rating and enrollment count
   */
  async findRecommendedCourses(userId: string, limit: number = 6): Promise<CourseInstance[]> {
    try {
      const CourseModel = this.getModel();
      const EnrollmentModel = Enrollment as unknown as ModelStatic<EnrollmentInstance>;

      // Get user's enrolled course IDs
      const enrollments = await EnrollmentModel.findAll({
        where: { user_id: userId },
        attributes: ['course_id']
      });
      const enrolledCourseIds = enrollments.map((e: any) => e.course_id);

      // Build where clause
      const where: WhereOptions<CourseAttributes> = {
        status: 'published'
      };

      // Exclude enrolled courses if any
      if (enrolledCourseIds.length > 0) {
        (where as any).id = {
          [require('sequelize').Op.notIn]: enrolledCourseIds
        };
      }

      // Find recommended courses
      const courses = await CourseModel.findAll({
        where,
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'first_name', 'last_name', 'avatar']
          }
        ],
        order: [
          ['rating', 'DESC'],
          ['created_at', 'DESC']
        ],
        limit
      });

      return courses;
    } catch (error: unknown) {
      logger.error('Error finding recommended courses:', error);
      throw error;
    }
  }
}

