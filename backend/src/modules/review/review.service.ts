/**
 * Review Service
 */

import { ReviewRepository } from './review.repository';
import { ApiError } from '../../errors/api.error';
import logger from '../../utils/logger.util';
import type { ReviewCreationAttributes, ReviewAttributes } from '../../models/review.model';

export class ReviewService {
  private repo: ReviewRepository;

  constructor() {
    this.repo = new ReviewRepository();
  }

  /**
   * Create a new review
   */
  async createReview(userId: string, data: { course_id: string; rating: number; comment?: string }) {
    try {
      // Check if user already reviewed this course
      const existingReview = await this.repo.getUserReview(data.course_id, userId);
      if (existingReview) {
        throw new ApiError('You have already reviewed this course', 400);
      }

      // Validate rating
      if (data.rating < 1 || data.rating > 5) {
        throw new ApiError('Rating must be between 1 and 5', 400);
      }

      // Check if user is enrolled in the course
      const { Enrollment } = await import('../../models');
      const enrollment = await Enrollment.findOne({
        where: { user_id: userId, course_id: data.course_id }
      });
      
      if (!enrollment) {
        throw new ApiError('You must be enrolled in the course to leave a review', 403);
      }

      const review = await this.repo.create({
        course_id: data.course_id,
        user_id: userId,
        rating: data.rating,
        comment: data.comment || null,
      });

      logger.info(`Review created for course ${data.course_id} by user ${userId}`);
      return review;
    } catch (error) {
      logger.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a course
   */
  async getCourseReviews(courseId: string, page: number = 1, limit: number = 10) {
    try {
      const { rows, count } = await this.repo.getCourseReviews(courseId, page, limit);
      
      return {
        reviews: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting course reviews:', error);
      throw error;
    }
  }

  /**
   * Get course review statistics
   */
  async getCourseReviewStats(courseId: string) {
    try {
      return await this.repo.getCourseStats(courseId);
    } catch (error) {
      logger.error('Error getting course review stats:', error);
      throw error;
    }
  }

  /**
   * Update a review
   */
  async updateReview(reviewId: string, userId: string, data: { rating?: number; comment?: string }) {
    try {
      const review = await this.repo.getById(reviewId);
      if (!review) {
        throw new ApiError('Review not found', 404);
      }

      if (review.user_id !== userId) {
        throw new ApiError('You can only update your own reviews', 403);
      }

      if (data.rating && (data.rating < 1 || data.rating > 5)) {
        throw new ApiError('Rating must be between 1 and 5', 400);
      }

      const updated = await this.repo.update(reviewId, {
        rating: data.rating,
        comment: data.comment,
      });

      logger.info(`Review ${reviewId} updated by user ${userId}`);
      return updated;
    } catch (error) {
      logger.error('Error updating review:', error);
      throw error;
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string, userId: string, isAdmin: boolean = false) {
    try {
      const review = await this.repo.getById(reviewId);
      if (!review) {
        throw new ApiError('Review not found', 404);
      }

      if (!isAdmin && review.user_id !== userId) {
        throw new ApiError('You can only delete your own reviews', 403);
      }

      await this.repo.delete(reviewId);
      logger.info(`Review ${reviewId} deleted`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Add instructor reply to a review
   */
  async addInstructorReply(reviewId: string, instructorId: string, reply: string) {
    try {
      const review = await this.repo.getById(reviewId);
      if (!review) {
        throw new ApiError('Review not found', 404);
      }

      // Verify instructor owns the course
      const { Course } = await import('../../models');
      const course = await Course.findByPk(review.course_id);
      if (!course || (course as any).instructor_id !== instructorId) {
        throw new ApiError('You can only reply to reviews on your own courses', 403);
      }

      const updated = await this.repo.addReply(reviewId, reply);
      logger.info(`Instructor ${instructorId} replied to review ${reviewId}`);
      return updated;
    } catch (error) {
      logger.error('Error adding instructor reply:', error);
      throw error;
    }
  }

  /**
   * Get user's review for a course
   */
  async getUserReview(courseId: string, userId: string) {
    try {
      return await this.repo.getUserReview(courseId, userId);
    } catch (error) {
      logger.error('Error getting user review:', error);
      throw error;
    }
  }
}
