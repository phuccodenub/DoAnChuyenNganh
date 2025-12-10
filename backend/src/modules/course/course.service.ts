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
   * Normalize course data for frontend compatibility
   * Maps backend field names to frontend expected names
   */
  private async normalizeCourseForFrontend(course: CourseInstance | any, userId?: string): Promise<any> {
    if (!course) return null;
    
    const courseData = course.toJSON ? course.toJSON() : { ...course };
    
    // Map thumbnail to thumbnail_url for frontend compatibility
    if (courseData.thumbnail && !courseData.thumbnail_url) {
      courseData.thumbnail_url = courseData.thumbnail;
    }
    
    // Normalize instructor full_name from first_name and last_name
    if (courseData.instructor) {
      if (!courseData.instructor.full_name && (courseData.instructor.first_name || courseData.instructor.last_name)) {
        courseData.instructor.full_name = [
          courseData.instructor.first_name,
          courseData.instructor.last_name
        ].filter(Boolean).join(' ');
      }
    }
    
    // Calculate total_students from enrollments
    if (courseData.enrollments && Array.isArray(courseData.enrollments)) {
      // Count only active enrollments (not cancelled or suspended)
      courseData.total_students = courseData.enrollments.filter((enrollment: any) => 
        enrollment.status !== 'cancelled' && enrollment.status !== 'suspended'
      ).length;
      // Remove enrollments array from response (we only need the count)
      delete courseData.enrollments;
    } else if (courseData.total_students === undefined) {
      // If enrollments not included, try to get count from database
      try {
        const { Op } = await import('sequelize');
        const EnrollmentModel = Enrollment as unknown as any;
        const count = await EnrollmentModel.count({
          where: {
            course_id: courseData.id,
            status: { [Op.notIn]: ['cancelled', 'suspended'] }
          }
        });
        courseData.total_students = count;
      } catch (error) {
        logger.error('Error counting enrollments:', error);
        courseData.total_students = 0;
      }
    }
    
    // Check enrollment status if userId is provided
    if (userId) {
      try {
        const enrollment = await this.courseRepository.findEnrollment(courseData.id, userId);
        courseData.is_enrolled = !!enrollment && enrollment.status !== 'cancelled' && enrollment.status !== 'suspended';
      } catch (error) {
        logger.error('Error checking enrollment status:', error);
        courseData.is_enrolled = false;
      }
    } else {
      courseData.is_enrolled = false;
    }
    
    // Normalize sections if they exist
    if (courseData.sections && Array.isArray(courseData.sections)) {
      courseData.sections = courseData.sections.map((section: any) => {
        const sectionData = section.toJSON ? section.toJSON() : section;
        // Ensure lessons array is properly formatted
        if (sectionData.lessons && Array.isArray(sectionData.lessons)) {
          sectionData.lessons = sectionData.lessons.map((lesson: any) => {
            return lesson.toJSON ? lesson.toJSON() : lesson;
          });
        }
        return sectionData;
      });
    }
    
    return courseData;
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

      // Clean up data before creating
      const cleanedData = { ...courseData };
      
      // Handle category_id - only accept valid UUID, otherwise set to null
      if (cleanedData.category_id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(cleanedData.category_id)) {
          // Store category name in metadata if provided as string
          cleanedData.metadata = {
            ...(cleanedData.metadata || {}),
            category_name: cleanedData.category_id
          };
          cleanedData.category_id = undefined;
        }
      }

      // Handle thumbnail_url -> thumbnail mapping
      if (cleanedData.thumbnail_url && !cleanedData.thumbnail) {
        cleanedData.thumbnail = cleanedData.thumbnail_url;
      }

      // Create course
      const course = await this.courseRepository.create(cleanedData);
      
      logger.info('Course created successfully', { courseId: course.id });
      // Normalize for frontend compatibility
      return this.normalizeCourseForFrontend(course);
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
   * @param id Course ID
   * @param userId Optional user ID for access control
   */
  async getCourseById(id: string, userId?: string): Promise<any> {
    try {
      logger.info('Getting course by ID', { courseId: id, userId });

      // Include sections and lessons for public view
      const { Section, Lesson } = await import('../../models');
      const course = await this.courseRepository.findById(id, {
        include: [
          {
            model: User,
            as: 'instructor',
            attributes: ['id', 'first_name', 'last_name', 'email', 'avatar']
          },
          {
            model: Section,
            as: 'sections',
            attributes: ['id', 'title', 'description', 'order_index', 'is_published', 'course_id', 'created_at', 'updated_at'],
            include: [
              {
                model: Lesson,
                as: 'lessons',
                attributes: ['id', 'title', 'description', 'order_index', 'section_id', 'content_type', 'duration_minutes', 'is_published', 'is_free_preview', 'created_at', 'updated_at'],
                order: [['order_index', 'ASC']]
              }
            ],
            order: [['order_index', 'ASC']]
          }
        ]
      });
      
      if (!course) {
        logger.warn('Course not found', { courseId: id });
        return null;
      }

      // Check course status for access control
      const courseStatus = (course as any).status;
      logger.info('Course status check', { courseId: id, status: courseStatus, userId });

      // If course is published, anyone can access
      if (courseStatus === 'published') {
        logger.info('Course is published, access granted', { courseId: id });
        return await this.normalizeCourseForFrontend(course, userId);
      }

      // If course is draft, ONLY the instructor (owner) can access
      // Draft courses should NOT be accessible via public route /courses/:id
      // They should only be accessible via instructor management route
      if (courseStatus === 'draft') {
        // Check if user is the instructor (owner) of this course
        const instructorId = (course as any).instructor_id;
        
        // Only the instructor can access draft courses
        if (!userId || userId !== instructorId) {
          // Return 404 instead of 403 to hide the existence of draft courses
          // This prevents information disclosure - users shouldn't know draft courses exist
          logger.warn('Draft course access denied - returning 404', { 
            courseId: id, 
            userId, 
            status: courseStatus,
            instructorId,
            isInstructor: userId === instructorId
          });
          throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
        }

        // User is the instructor, grant access
        logger.info('User is instructor (owner) of draft course, access granted', { courseId: id, userId });
        return await this.normalizeCourseForFrontend(course, userId);
      }

      // If course is archived, check access (instructor, enrolled users, or admin)
      if (courseStatus === 'archived') {
        // If no userId provided, deny access
        if (!userId) {
          logger.warn('Course is archived and user is not authenticated', { 
            courseId: id, 
            status: courseStatus 
          });
          throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'This course is not available to the public');
        }

        // Check if user is the instructor
        const instructorId = (course as any).instructor_id;
        if (userId === instructorId) {
          logger.info('User is instructor, access granted', { courseId: id, userId });
          return await this.normalizeCourseForFrontend(course, userId);
        }

        // Check if user is enrolled in the course (archived courses can be viewed by enrolled users)
        const enrollment = await this.courseRepository.findEnrollment(id, userId);
        if (enrollment && enrollment.status !== 'cancelled' && enrollment.status !== 'suspended') {
          logger.info('User is enrolled, access granted', { courseId: id, userId, enrollmentStatus: enrollment.status });
          return await this.normalizeCourseForFrontend(course, userId);
        }

        // Check if user is admin or super_admin
        const user = await this.courseRepository.findUserById(userId);
        if (user && (user.role === 'admin' || user.role === 'super_admin')) {
          logger.info('User is admin, access granted', { courseId: id, userId, role: user.role });
          return await this.normalizeCourseForFrontend(course, userId);
        }

        // Deny access
        logger.warn('Access denied to archived course', { 
          courseId: id, 
          userId, 
          status: courseStatus,
          isInstructor: userId === instructorId,
          hasEnrollment: !!enrollment
        });
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'This course is not available to the public');
      }

      // For other statuses (e.g., 'suspended'), deny access unless instructor/admin
      if (courseStatus === 'suspended') {
        if (!userId) {
          throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'This course is not available');
        }
        const instructorId = (course as any).instructor_id;
        const user = await this.courseRepository.findUserById(userId);
        if (userId !== instructorId && user?.role !== 'admin' && user?.role !== 'super_admin') {
          throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'This course is not available');
        }
      }

      logger.info('Course retrieved successfully', { courseId: id });
      return await this.normalizeCourseForFrontend(course, userId);
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
      logger.info('Updating course', { courseId: id, userId, updateData });

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

      // Map frontend field names to backend model field names
      const mappedData: Record<string, unknown> = { ...updateData };
      
      // Handle category_id - only accept valid UUID, otherwise set to null and store in metadata
      if ('category_id' in mappedData && mappedData.category_id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(mappedData.category_id as string)) {
          // Store category name in metadata if provided as string
          const existingCourseData = existingCourse.toJSON ? existingCourse.toJSON() : existingCourse;
          const existingMetadata = (existingCourseData as any).metadata || {};
          mappedData.metadata = {
            ...existingMetadata,
            category_name: mappedData.category_id
          };
          mappedData.category_id = null;
        }
      }
      
      // Map thumbnail_url to thumbnail (backend model uses 'thumbnail')
      if ('thumbnail_url' in mappedData) {
        mappedData.thumbnail = mappedData.thumbnail_url;
        delete mappedData.thumbnail_url;
      }

      // Update course
      const updatedCourse = await this.courseRepository.update(id, mappedData);
      
      logger.info('Course updated successfully', { courseId: id });
      // Normalize for frontend compatibility
      return this.normalizeCourseForFrontend(updatedCourse);
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
      console.log('SERVICE: getEnrolledCourses called for user:', userId);

      const courses = await this.courseRepository.findEnrolledByUser(userId, options);
      
      logger.info('Enrolled courses retrieved successfully', { userId, count: courses.data.length });
      return courses;
    } catch (error: unknown) {
      logger.error('Error getting enrolled courses:', error);
      console.error('SERVICE ERROR:', error);
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

  /**
   * Get course statistics for instructor dashboard
   */
  async getCourseStats(courseId: string, userId: string): Promise<CourseTypes.CourseStatsResponse> {
    try {
      logger.info('Getting course stats', { courseId, userId });

      // Check if course exists and user has access
      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Course not found');
      }

      if (course.instructor_id !== userId) {
        const user = await this.courseRepository.findUserById(userId);
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
          throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Not authorized to view course stats');
        }
      }

      const stats = await this.courseRepository.getInstructorCourseStats(courseId);
      
      logger.info('Course stats retrieved successfully', { courseId });
      return stats;
    } catch (error: unknown) {
      logger.error('Error getting course stats:', error);
      throw error;
    }
  }

  /**
   * Get recommended courses for a student
   * Returns published courses that the user hasn't enrolled in, ordered by rating and enrollment count
   */
  async getRecommendedCourses(userId: string, limit: number = 6): Promise<any[]> {
    try {
      logger.info('Getting recommended courses', { userId, limit });

      const recommendedCourses = await this.courseRepository.findRecommendedCourses(userId, limit);
      
      // Normalize courses for frontend
      const normalizedCourses = recommendedCourses.map((course: any) => this.normalizeCourseForFrontend(course));
      
      logger.info('Recommended courses retrieved successfully', { count: normalizedCourses.length });
      return normalizedCourses;
    } catch (error: unknown) {
      logger.error('Error getting recommended courses:', error);
      throw error;
    }
  }
}

