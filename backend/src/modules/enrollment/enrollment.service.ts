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
const logger: any = require('../../utils/logger.util');

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
      logger.info('Creating new enrollment', payload);

      // Check if enrollment already exists
      const existingEnrollment = await this.enrollmentRepository.findByUserAndCourse(
        payload.user_id, 
        payload.course_id
      );

      if (existingEnrollment) {
        throw new ApiError(
          RESPONSE_CONSTANTS.STATUS_CODE.CONFLICT,
          'User is already enrolled in this course'
        );
      }

      const enrollment = await this.enrollmentRepository.create(payload);
      const enrollmentWithDetails = await this.enrollmentRepository.findByIdWithDetails(enrollment.id);

      if (!enrollmentWithDetails) {
        throw new ApiError(
          RESPONSE_CONSTANTS.STATUS_CODE.INTERNAL_SERVER_ERROR,
          'Failed to retrieve enrollment details'
        );
      }

      logger.info('Enrollment created successfully', { enrollmentId: enrollment.id });
      return enrollmentWithDetails;
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
      return result;
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
      return enrollment;
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
      return enrollmentWithDetails;
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
      return enrollments;
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
      return enrollments;
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
        return enrollmentWithDetails;
      }
      logger.debug('Enrollment by user and course not found', { userId, courseId });
      return null;
    } catch (error) {
      logger.error('Error getting enrollment by user and course:', error);
      throw error;
    }
  }
}
