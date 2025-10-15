import Course from '../../models/course.model';
import User from '../../models/user.model';
import Enrollment from '../../models/enrollment.model';
import { CourseInstance, UserInstance, EnrollmentInstance } from '../../types/model.types';
import { CourseRepository } from './course.repository';
import * as CourseTypes from './course.types';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import { ApiError } from '../../middlewares/error.middleware';
import logger from '../../utils/logger.util';

export class CourseService {
  private courseRepository: CourseRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
  }

  /**
   * Create a new course
   */
  async createCourse(courseData: CourseTypes.CreateCourseData): Promise<CourseInstance> {
    try {
      logger.info('Creating new course', { instructorId: courseData.instructor_id });

      // Validate instructor exists
      const instructor = await this.courseRepository.findInstructorById(courseData.instructor_id);
      if (!instructor) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Instructor not found');
      }

      // Create course
      const course = await this.courseRepository.create(courseData);
      
      logger.info('Course created successfully', { courseId: course.id });
      return course;
    } catch (error: unknown) {
      logger.error('Error creating course:', error);
      throw error;
    }
  }

  /**
   * Get all courses with pagination and filters
   */
  async getAllCourses(options: CourseTypes.GetCoursesOptions): Promise<CourseTypes.CoursesResponse> {
    try {
      logger.info('Getting all courses', { options });

      const courses = await this.courseRepository.findAllWithPagination(options);
      
      logger.info('Courses retrieved successfully', { count: courses.data.length });
      return courses;
    } catch (error: unknown) {
      logger.error('Error getting courses:', error);
      throw error;
    }
  }

  /**
   * Get course by ID
   */
  async getCourseById(id: string): Promise<CourseInstance | null> {
    try {
      logger.info('Getting course by ID', { courseId: id });

      const course = await this.courseRepository.findById(id);
      
      if (course) {
        logger.info('Course retrieved successfully', { courseId: id });
      } else {
        logger.warn('Course not found', { courseId: id });
      }
      
      return course;
    } catch (error: unknown) {
      logger.error('Error getting course by ID:', error);
      throw error;
    }
  }

  /**
   * Update course
   */
  async updateCourse(id: string, updateData: CourseTypes.UpdateCourseData, userId: string): Promise<CourseInstance> {
    try {
      logger.info('Updating course', { courseId: id, userId });

      // Check if course exists
      const existingCourse = await this.courseRepository.findById(id);
      if (!existingCourse) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      // Check if user is the instructor or admin
      if (existingCourse.instructor_id !== userId) {
        const user = await this.courseRepository.findUserById(userId);
        if (!user || user.role !== 'admin' && user.role !== 'super_admin') {
          throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Not authorized to update this course');
        }
      }

      // Update course
      const updatedCourse = await this.courseRepository.update(id, updateData);
      
      logger.info('Course updated successfully', { courseId: id });
      return updatedCourse;
    } catch (error: unknown) {
      logger.error('Error updating course:', error);
      throw error;
    }
  }

  /**
   * Delete course
   */
  async deleteCourse(id: string, userId: string): Promise<void> {
    try {
      logger.info('Deleting course', { courseId: id, userId });

      // Check if course exists
      const existingCourse = await this.courseRepository.findById(id);
      if (!existingCourse) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      // Check if user is the instructor or admin
      if (existingCourse.instructor_id !== userId) {
        const user = await this.courseRepository.findUserById(userId);
        if (!user || user.role !== 'admin' && user.role !== 'super_admin') {
          throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Not authorized to delete this course');
        }
      }

      // Delete course
      await this.courseRepository.delete(id);
      
      logger.info('Course deleted successfully', { courseId: id });
    } catch (error: unknown) {
      logger.error('Error deleting course:', error);
      throw error;
    }
  }

  /**
   * Get courses by instructor
   */
  async getCoursesByInstructor(instructorId: string, options: CourseTypes.GetCoursesByInstructorOptions): Promise<CourseTypes.CoursesResponse> {
    try {
      logger.info('Getting courses by instructor', { instructorId, options });

      const courses = await this.courseRepository.findByInstructor(instructorId, options);
      
      logger.info('Instructor courses retrieved successfully', { instructorId, count: courses.data.length });
      return courses;
    } catch (error: unknown) {
      logger.error('Error getting courses by instructor:', error);
      throw error;
    }
  }

  /**
   * Get enrolled courses for user
   */
  async getEnrolledCourses(userId: string, options: CourseTypes.GetEnrolledCoursesOptions): Promise<CourseTypes.CoursesResponse> {
    try {
      logger.info('Getting enrolled courses', { userId, options });

      const courses = await this.courseRepository.findEnrolledByUser(userId, options);
      
      logger.info('Enrolled courses retrieved successfully', { userId, count: courses.data.length });
      return courses;
    } catch (error: unknown) {
      logger.error('Error getting enrolled courses:', error);
      throw error;
    }
  }

  /**
   * Enroll in course
   */
  async enrollInCourse(courseId: string, userId: string): Promise<EnrollmentInstance> {
    try {
      logger.info('Enrolling in course', { courseId, userId });

      // Check if course exists
      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      // Check if user is already enrolled
      const existingEnrollment = await this.courseRepository.findEnrollment(courseId, userId);
      if (existingEnrollment) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.CONFLICT, 'User is already enrolled in this course');
      }

      // Create enrollment
      const enrollment = await this.courseRepository.createEnrollment(courseId, userId);
      
      logger.info('User enrolled in course successfully', { courseId, userId });
      return enrollment;
    } catch (error: unknown) {
      logger.error('Error enrolling in course:', error);
      throw error;
    }
  }

  /**
   * Unenroll from course
   */
  async unenrollFromCourse(courseId: string, userId: string): Promise<void> {
    try {
      logger.info('Unenrolling from course', { courseId, userId });

      // Check if enrollment exists
      const enrollment = await this.courseRepository.findEnrollment(courseId, userId);
      if (!enrollment) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Enrollment not found');
      }

      // Delete enrollment
      await this.courseRepository.deleteEnrollment(enrollment.id);
      
      logger.info('User unenrolled from course successfully', { courseId, userId });
    } catch (error: unknown) {
      logger.error('Error unenrolling from course:', error);
      throw error;
    }
  }

  /**
   * Get course students
   */
  async getCourseStudents(courseId: string, instructorId: string, options: CourseTypes.GetCourseStudentsOptions): Promise<CourseTypes.StudentsResponse> {
    try {
      logger.info('Getting course students', { courseId, instructorId, options });

      // Check if course exists and user is the instructor
      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      if (course.instructor_id !== instructorId) {
        const user = await this.courseRepository.findUserById(instructorId);
        if (!user || user.role !== 'admin' && user.role !== 'super_admin') {
          throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Not authorized to view course students');
        }
      }

      const students = await this.courseRepository.findStudentsByCourse(courseId, options);
      
      logger.info('Course students retrieved successfully', { courseId, count: students.data.length });
      return students;
    } catch (error: unknown) {
      logger.error('Error getting course students:', error);
      throw error;
    }
  }
}

