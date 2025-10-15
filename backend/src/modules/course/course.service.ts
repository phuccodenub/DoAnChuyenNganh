import { CourseRepository } from './course.repository';
import { CourseTypes } from './course.types';
type UserInstance = any;
const globalServices: any = {} as any;
const RESPONSE_CONSTANTS: any = { STATUS_CODE: { NOT_FOUND: 404, FORBIDDEN: 403, CONFLICT: 409 } };
class ApiError extends Error { constructor(public statusCode?: number, message?: string){ super(message); } }
import logger from '@utils/logger.util';
declare const require: any;

/**
 * Course Module Service
 * Handles course-related business logic
 */
export class CourseService {
  private courseRepository: CourseRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
  }

  // ===== COURSE MANAGEMENT METHODS =====

  /**
   * Get all courses with pagination and filtering
   */
  async getAllCourses(options: {
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
      logger.info('Getting all courses', options);

      const result = await this.courseRepository.findAllWithPagination(options);
      
      logger.info('All courses retrieved successfully', { 
        count: result.courses.length, 
        total: result.pagination.total 
      });
      
      return result;
    } catch (error) {
      logger.error('Error getting all courses:', error);
      throw error;
    }
  }

  /**
   * Get course by ID
   */
  async getCourseById(courseId: string): Promise<any> {
    try {
      logger.info('Getting course by ID', { courseId });

      const course = await this.courseRepository.findByIdWithInstructor(courseId);
      if (!course) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      // Get course statistics
      const stats = await this.courseRepository.getCourseStats(courseId);
      
      const courseWithStats = {
        ...course.toJSON(),
        stats
      };
      
      logger.info('Course retrieved successfully', { courseId });
      return courseWithStats;
    } catch (error) {
      logger.error('Error getting course by ID:', error);
      throw error;
    }
  }

  /**
   * Create new course
   */
  async createCourse(courseData: CourseTypes.CreateCourseRequest, instructorId: string): Promise<any> {
    try {
      logger.info('Creating new course', { instructorId, courseData });

      // Validate instructor exists
      const instructor = await globalServices.user.findById(instructorId);
      if (!instructor) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Instructor not found');
      }

      // Validate instructor role
      if (instructor.role !== 'instructor' && instructor.role !== 'admin' && instructor.role !== 'super_admin') {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Only instructors can create courses');
      }

      // Create course
      const course = await this.courseRepository.create({
        ...courseData,
        instructor_id: instructorId,
        status: 'draft',
        settings: {
          allow_enrollment: true,
          require_approval: false,
          enable_discussions: true,
          enable_assignments: true,
          enable_quizzes: true,
          enable_certificates: true,
          grading_policy: 'percentage',
          passing_score: 70,
          max_attempts: 3,
          ...courseData.settings
        }
      });

      // Clear cache
      await globalServices.cache.deleteWithPattern(`courses:*`);
      
      logger.info('Course created successfully', { courseId: course.id, instructorId });
      return course;
    } catch (error) {
      logger.error('Error creating course:', error);
      throw error;
    }
  }

  /**
   * Update course
   */
  async updateCourse(courseId: string, courseData: CourseTypes.UpdateCourseRequest, userId: string): Promise<any> {
    try {
      logger.info('Updating course', { courseId, userId, courseData });

      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      // Check permissions
      const user = await globalServices.user.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Only instructor, admin, or super_admin can update
      if (course.instructor_id !== userId && 
          user.role !== 'admin' && 
          user.role !== 'super_admin') {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Not authorized to update this course');
      }

      // Update course
      const updatedCourse = await this.courseRepository.update(courseId, courseData);
      
      // Clear cache
      await globalServices.cache.deleteWithPattern(`courses:*`);
      await globalServices.cache.deleteWithPattern(`course:${courseId}:*`);
      
      logger.info('Course updated successfully', { courseId, userId });
      return updatedCourse;
    } catch (error) {
      logger.error('Error updating course:', error);
      throw error;
    }
  }

  /**
   * Delete course
   */
  async deleteCourse(courseId: string, userId: string): Promise<void> {
    try {
      logger.info('Deleting course', { courseId, userId });

      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      // Check permissions
      const user = await globalServices.user.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Only instructor, admin, or super_admin can delete
      if (course.instructor_id !== userId && 
          user.role !== 'admin' && 
          user.role !== 'super_admin') {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Not authorized to delete this course');
      }

      // Check if course has enrollments
      const { Enrollment } = require('../../models');
      const enrollmentCount = await Enrollment.count({
        where: { course_id: courseId }
      });

      if (enrollmentCount > 0) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.CONFLICT, 'Cannot delete course with existing enrollments');
      }

      // Delete course
      await this.courseRepository.delete(courseId);
      
      // Clear cache
      await globalServices.cache.deleteWithPattern(`courses:*`);
      await globalServices.cache.deleteWithPattern(`course:${courseId}:*`);
      
      logger.info('Course deleted successfully', { courseId, userId });
    } catch (error) {
      logger.error('Error deleting course:', error);
      throw error;
    }
  }

  /**
   * Publish course
   */
  async publishCourse(courseId: string, userId: string): Promise<any> {
    try {
      logger.info('Publishing course', { courseId, userId });

      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      // Check permissions
      const user = await globalServices.user.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Only instructor, admin, or super_admin can publish
      if (course.instructor_id !== userId && 
          user.role !== 'admin' && 
          user.role !== 'super_admin') {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Not authorized to publish this course');
      }

      // Update status to published
      const updatedCourse = await this.courseRepository.updateStatus(courseId, 'published');
      
      // Clear cache
      await globalServices.cache.deleteWithPattern(`courses:*`);
      await globalServices.cache.deleteWithPattern(`course:${courseId}:*`);
      
      logger.info('Course published successfully', { courseId, userId });
      return updatedCourse;
    } catch (error) {
      logger.error('Error publishing course:', error);
      throw error;
    }
  }

  /**
   * Archive course
   */
  async archiveCourse(courseId: string, userId: string): Promise<any> {
    try {
      logger.info('Archiving course', { courseId, userId });

      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      // Check permissions
      const user = await globalServices.user.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Only instructor, admin, or super_admin can archive
      if (course.instructor_id !== userId && 
          user.role !== 'admin' && 
          user.role !== 'super_admin') {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Not authorized to archive this course');
      }

      // Update status to archived
      const updatedCourse = await this.courseRepository.updateStatus(courseId, 'archived');
      
      // Clear cache
      await globalServices.cache.deleteWithPattern(`courses:*`);
      await globalServices.cache.deleteWithPattern(`course:${courseId}:*`);
      
      logger.info('Course archived successfully', { courseId, userId });
      return updatedCourse;
    } catch (error) {
      logger.error('Error archiving course:', error);
      throw error;
    }
  }

  /**
   * Get courses by instructor
   */
  async getCoursesByInstructor(instructorId: string, options?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any[]> {
    try {
      logger.info('Getting courses by instructor', { instructorId, options });

      const courses = await this.courseRepository.findByInstructorId(instructorId, options);
      
      logger.info('Courses by instructor retrieved successfully', { 
        instructorId, 
        count: courses.length 
      });
      
      return courses;
    } catch (error) {
      logger.error('Error getting courses by instructor:', error);
      throw error;
    }
  }

  /**
   * Search courses
   */
  async searchCourses(filters: CourseTypes.CourseSearchFilters, options?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ courses: any[]; pagination: any }> {
    try {
      logger.info('Searching courses', { filters, options });

      const result = await this.courseRepository.searchCourses(filters, options);
      
      logger.info('Course search completed successfully', { 
        count: result.courses.length, 
        total: result.pagination.total 
      });
      
      return result;
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
      logger.info('Getting popular courses', { limit });

      const courses = await this.courseRepository.getPopularCourses(limit);
      
      logger.info('Popular courses retrieved successfully', { 
        count: courses.length 
      });
      
      return courses;
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
      logger.info('Getting courses by tags', { tags, limit });

      const courses = await this.courseRepository.getCoursesByTags(tags, limit);
      
      logger.info('Courses by tags retrieved successfully', { 
        tags, 
        count: courses.length 
      });
      
      return courses;
    } catch (error) {
      logger.error('Error getting courses by tags:', error);
      throw error;
    }
  }

  /**
   * Get course analytics
   */
  async getCourseAnalytics(courseId: string, userId: string): Promise<CourseTypes.CourseAnalytics> {
    try {
      logger.info('Getting course analytics', { courseId, userId });

      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      // Check permissions
      const user = await globalServices.user.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Only instructor, admin, or super_admin can view analytics
      if (course.instructor_id !== userId && 
          user.role !== 'admin' && 
          user.role !== 'super_admin') {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Not authorized to view course analytics');
      }

      const analytics = await this.courseRepository.getCourseAnalytics(courseId);
      
      logger.info('Course analytics retrieved successfully', { courseId, userId });
      return analytics;
    } catch (error) {
      logger.error('Error getting course analytics:', error);
      throw error;
    }
  }
}