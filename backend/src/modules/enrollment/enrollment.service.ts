import { EnrollmentRepository } from './enrollment.repository';
import * as EnrollmentTypes from '../../types/enrollment.types';
// Local lightweight ApiError to avoid pulling full middleware tree during isolated lint
class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
import { RESPONSE_CONSTANTS } from '@constants/response.constants';
declare const require: any;
import logger from '../../utils/logger.util';
import Course from '../../models/course.model';
import User from '../../models/user.model';

export class EnrollmentService {
  private enrollmentRepository: EnrollmentRepository;

  constructor() {
    this.enrollmentRepository = new EnrollmentRepository();
  }

  // ===== ENROLLMENT MANAGEMENT METHODS =====

  /**
   * Create new enrollment
   */
  async createEnrollment(payload: EnrollmentTypes.CreateEnrollmentPayload): Promise<EnrollmentTypes.EnrollmentWithDetails> {
    try {
      // Map camelCase keys to snake_case if tests send camelCase
      const normalizedPayload: any = {
        user_id: (payload as any).user_id || (payload as any).userId,
        course_id: (payload as any).course_id || (payload as any).courseId,
        status: 'enrolled', // Always set to enrolled when creating
        enrollment_type: (payload as any).enrollment_type || (payload as any).enrollmentType || 'free',
        payment_status: (payload as any).payment_status || (payload as any).paymentStatus || 'pending',
        payment_method: (payload as any).payment_method || (payload as any).paymentMethod,
        payment_id: (payload as any).payment_id || (payload as any).paymentId,
        amount_paid: (payload as any).amount_paid,
        currency: (payload as any).currency,
        total_lessons: (payload as any).total_lessons || 0,
      };
      
      logger.info('Creating new enrollment', {
        userId: normalizedPayload.user_id,
        courseId: normalizedPayload.course_id,
        status: normalizedPayload.status,
        enrollment_type: normalizedPayload.enrollment_type,
        payment_status: normalizedPayload.payment_status,
        total_lessons: normalizedPayload.total_lessons
      });

      // Validate course exists
      const course = await Course.findByPk(normalizedPayload.course_id);
      if (!course) {
        throw new ApiError(
          RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND,
          'Course not found'
        );
      }

      // Validate user exists
      const user = await User.findByPk(normalizedPayload.user_id);
      if (!user) {
        throw new ApiError(
          RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND,
          'User not found'
        );
      }

      // Check if enrollment already exists
      const existingEnrollment = await this.enrollmentRepository.findByUserAndCourse(
        normalizedPayload.user_id,
        normalizedPayload.course_id
      );

      if (existingEnrollment) {
        throw new ApiError(
          RESPONSE_CONSTANTS.STATUS_CODE.CONFLICT,
          'User is already enrolled in this course'
        );
      }

      const enrollment = await this.enrollmentRepository.create(normalizedPayload);
      const enrollmentWithDetails = await this.enrollmentRepository.findByIdWithDetails(enrollment.id);

      if (!enrollmentWithDetails) {
        throw new ApiError(
          RESPONSE_CONSTANTS.STATUS_CODE.INTERNAL_SERVER_ERROR,
          'Failed to retrieve enrollment details'
        );
      }

      // Add camelCase aliases for compatibility with tests
      const enrollmentResponse = this.addCamelCaseAliases(enrollmentWithDetails);

      logger.info('Enrollment created successfully', { enrollmentId: enrollment.id });
      return enrollmentResponse;
    } catch (error) {
      logger.error('Error creating enrollment:', error);
      throw error;
    }
  }

  /**
   * Get all enrollments with pagination and filtering
   */
  async getAllEnrollments(options: EnrollmentTypes.EnrollmentFilterOptions): Promise<{ enrollments: EnrollmentTypes.EnrollmentWithDetails[]; pagination: any }> {
    try {
      logger.info('Getting all enrollments', options);
      const result = await this.enrollmentRepository.findAllWithPagination(options);
      logger.info('All enrollments retrieved successfully', { count: result.enrollments.length, total: result.pagination.total });
      return {
        enrollments: result.enrollments.map(e => this.addCamelCaseAliases(e)),
        pagination: result.pagination
      };
    } catch (error) {
      logger.error('Error getting all enrollments:', error);
      throw error;
    }
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollmentById(enrollmentId: string): Promise<EnrollmentTypes.EnrollmentWithDetails> {
    try {
      logger.info('Getting enrollment by ID', { enrollmentId });
      const enrollment = await this.enrollmentRepository.findByIdWithDetails(enrollmentId);
      if (!enrollment) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Enrollment not found');
      }
      logger.info('Enrollment retrieved successfully', { enrollmentId });
      return this.addCamelCaseAliases(enrollment);
    } catch (error) {
      logger.error('Error getting enrollment by ID:', error);
      throw error;
    }
  }

  /**
   * Update enrollment
   */
  async updateEnrollment(enrollmentId: string, payload: EnrollmentTypes.UpdateEnrollmentPayload): Promise<EnrollmentTypes.EnrollmentWithDetails> {
    try {
      logger.info('Updating enrollment', { enrollmentId, payload });
      
      const enrollment = await this.enrollmentRepository.findById(enrollmentId);
      if (!enrollment) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Enrollment not found');
      }

      // If status is being changed to completed, set completion_date if not provided
      if (payload.status === 'completed' && !payload.completion_date) {
        payload.completion_date = new Date();
      }

      // If status is being changed to completed, set progress_percentage to 100 if not provided
      if (payload.status === 'completed' && payload.progress_percentage === undefined) {
        payload.progress_percentage = 100;
      }

      const updatedEnrollment = await this.enrollmentRepository.update(enrollmentId, payload);
      const enrollmentWithDetails = await this.enrollmentRepository.findByIdWithDetails(updatedEnrollment.id);

      if (!enrollmentWithDetails) {
        throw new ApiError(
          RESPONSE_CONSTANTS.STATUS_CODE.INTERNAL_SERVER_ERROR,
          'Failed to retrieve updated enrollment details'
        );
      }

      logger.info('Enrollment updated successfully', { enrollmentId: updatedEnrollment.id });
      return this.addCamelCaseAliases(enrollmentWithDetails);
    } catch (error) {
      logger.error('Error updating enrollment:', error);
      throw error;
    }
  }

  /**
   * Delete enrollment
   */
  async deleteEnrollment(enrollmentId: string): Promise<void> {
    try {
      logger.info('Deleting enrollment', { enrollmentId });
      const enrollment = await this.enrollmentRepository.findById(enrollmentId);
      if (!enrollment) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Enrollment not found');
      }
      await this.enrollmentRepository.delete(enrollmentId);
      logger.info('Enrollment deleted successfully', { enrollmentId });
    } catch (error) {
      logger.error('Error deleting enrollment:', error);
      throw error;
    }
  }

  /**
   * Complete enrollment
   */
  async completeEnrollment(enrollmentId: string, payload: { rating?: number; completion_date?: Date }): Promise<EnrollmentTypes.EnrollmentWithDetails> {
    try {
      logger.info('Completing enrollment', { enrollmentId, payload });
      
      const enrollment = await this.enrollmentRepository.findById(enrollmentId);
      if (!enrollment) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'Enrollment not found');
      }

      const updatePayload: EnrollmentTypes.UpdateEnrollmentPayload = {
        status: 'completed',
        progress_percentage: 100,
        completion_date: payload.completion_date || new Date(),
        rating: payload.rating
      };

      return await this.updateEnrollment(enrollmentId, updatePayload);
    } catch (error) {
      logger.error('Error completing enrollment:', error);
      throw error;
    }
  }

  // ===== ENROLLMENT QUERY METHODS =====

  /**
   * Get enrollments by user ID
   */
  async getEnrollmentsByUserId(userId: string, options?: { status?: string; limit?: number }): Promise<EnrollmentTypes.EnrollmentWithDetails[]> {
    try {
      logger.info('Getting enrollments by user ID', { userId, options });
      const enrollments = await this.enrollmentRepository.findByUserId(userId, options);
      logger.info('Enrollments by user ID retrieved successfully', { userId, count: enrollments.length });
      return enrollments.map(e => this.addCamelCaseAliases(e));
    } catch (error) {
      logger.error('Error getting enrollments by user ID:', error);
      throw error;
    }
  }

  /**
   * Get enrollments by course ID
   */
  async getEnrollmentsByCourseId(courseId: string, options?: { status?: string; limit?: number }): Promise<EnrollmentTypes.EnrollmentWithDetails[]> {
    try {
      logger.info('Getting enrollments by course ID', { courseId, options });
      const enrollments = await this.enrollmentRepository.findByCourseId(courseId, options);
      logger.info('Enrollments by course ID retrieved successfully', { courseId, count: enrollments.length });
      return enrollments.map(e => this.addCamelCaseAliases(e));
    } catch (error) {
      logger.error('Error getting enrollments by course ID:', error);
      throw error;
    }
  }

  // ===== ENROLLMENT STATISTICS METHODS =====

  /**
   * Get enrollment statistics
   */
  async getEnrollmentStats(): Promise<EnrollmentTypes.EnrollmentStats> {
    try {
      logger.info('Getting enrollment statistics');
      const stats = await this.enrollmentRepository.getEnrollmentStats();
      logger.info('Enrollment statistics retrieved successfully', stats);
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
      logger.info('Getting course enrollment statistics', { courseId });
      const stats = await this.enrollmentRepository.getCourseEnrollmentStats(courseId);
      logger.info('Course enrollment statistics retrieved successfully', stats);
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
      logger.info('Getting user enrollment statistics', { userId });
      const stats = await this.enrollmentRepository.getUserEnrollmentStats(userId);
      logger.info('User enrollment statistics retrieved successfully', stats);
      return stats;
    } catch (error) {
      logger.error('Error getting user enrollment statistics:', error);
      throw error;
    }
  }

  // ===== ENROLLMENT VALIDATION METHODS =====

  /**
   * Check if user is enrolled in course
   */
  async isUserEnrolledInCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      logger.debug('Checking if user is enrolled in course', { userId, courseId });
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
      const isEnrolled = enrollment !== null;
      logger.debug('User enrollment status checked', { userId, courseId, isEnrolled });
      return isEnrolled;
    } catch (error) {
      logger.error('Error checking user enrollment status:', error);
      throw error;
    }
  }

  /**
   * Get enrollment by user and course
   */
  async getEnrollmentByUserAndCourse(userId: string, courseId: string): Promise<EnrollmentTypes.EnrollmentWithDetails | null> {
    try {
      logger.debug('Getting enrollment by user and course', { userId, courseId });
      const enrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
      if (enrollment) {
        const enrollmentWithDetails = await this.enrollmentRepository.findByIdWithDetails(enrollment.id);
        logger.debug('Enrollment by user and course retrieved', { userId, courseId });
        return enrollmentWithDetails ? this.addCamelCaseAliases(enrollmentWithDetails) : null;
      }
      logger.debug('Enrollment by user and course not found', { userId, courseId });
      return null;
    } catch (error) {
      logger.error('Error getting enrollment by user and course:', error);
      throw error;
    }
  }

  /**
   * Add camelCase aliases for snake_case fields (for API compatibility)
   */
  private addCamelCaseAliases(enrollment: any): any {
    if (!enrollment) return enrollment;
    
    return {
      ...enrollment,
      userId: enrollment.user_id,
      courseId: enrollment.course_id,
      enrollmentType: enrollment.enrollment_type,
      paymentStatus: enrollment.payment_status,
      paymentMethod: enrollment.payment_method,
      paymentId: enrollment.payment_id,
      amountPaid: enrollment.amount_paid ? parseFloat(enrollment.amount_paid) : enrollment.amount_paid,
      progressPercentage: enrollment.progress_percentage ? parseFloat(enrollment.progress_percentage) : 0,
      completedLessons: enrollment.completed_lessons,
      totalLessons: enrollment.total_lessons,
      lastAccessedAt: enrollment.last_accessed_at,
      completionDate: enrollment.completion_date,
      certificateIssued: enrollment.certificate_issued,
      certificateUrl: enrollment.certificate_url,
      reviewDate: enrollment.review_date,
      accessExpiresAt: enrollment.access_expires_at,
      createdAt: enrollment.created_at,
      updatedAt: enrollment.updated_at
    };
  }
}
