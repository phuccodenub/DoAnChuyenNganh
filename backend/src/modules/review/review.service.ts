/**
 * Review Service
 */

import { ReviewRepository } from './review.repository';
import { ApiError } from '../../errors/api.error';
import logger from '../../utils/logger.util';
import { ModerationService } from '../moderation/moderation.service';
import type { ReviewCreationAttributes, ReviewAttributes } from '../../models/review.model';

export class ReviewService {
  private repo: ReviewRepository;
  private moderationService: ModerationService;

  constructor() {
    this.repo = new ReviewRepository();
    this.moderationService = new ModerationService();
  }

  /**
   * Normalize review data for frontend compatibility
   * Maps backend field names to frontend expected names
   */
  private normalizeReviewForFrontend(review: any): any {
    if (!review) return null;
    
    const reviewData = review.toJSON ? review.toJSON() : { ...review };
    
    // Map user.avatar to user.avatar_url for frontend compatibility
    if (reviewData.user) {
      if (reviewData.user.avatar && !reviewData.user.avatar_url) {
        reviewData.user.avatar_url = reviewData.user.avatar;
      }
    }
    
    // Handle created_at - Sequelize may return createdAt (camelCase) or created_at (snake_case)
    if (!reviewData.created_at && reviewData.createdAt) {
      reviewData.created_at = reviewData.createdAt;
    }
    
    // Ensure created_at is properly formatted
    if (reviewData.created_at) {
      // If it's a Date object, convert to ISO string
      if (reviewData.created_at instanceof Date) {
        reviewData.created_at = reviewData.created_at.toISOString();
      }
      // If it's already a string but invalid, try to parse it
      else if (typeof reviewData.created_at === 'string') {
        const date = new Date(reviewData.created_at);
        if (isNaN(date.getTime())) {
          // Invalid date, set to null
          reviewData.created_at = null;
        } else {
          // Valid date string, keep it as is
          reviewData.created_at = reviewData.created_at;
        }
      }
    }
    
    // Handle replied_at - Sequelize may return repliedAt (camelCase) or replied_at (snake_case)
    if (!reviewData.replied_at && reviewData.repliedAt) {
      reviewData.replied_at = reviewData.repliedAt;
    }
    
    // Ensure replied_at is properly formatted
    if (reviewData.replied_at) {
      if (reviewData.replied_at instanceof Date) {
        reviewData.replied_at = reviewData.replied_at.toISOString();
      }
      else if (typeof reviewData.replied_at === 'string') {
        const date = new Date(reviewData.replied_at);
        if (isNaN(date.getTime())) {
          reviewData.replied_at = null;
        }
      }
    }
    
    return reviewData;
  }

  /**
   * Update course rating and total_ratings based on all published reviews
   */
  private async updateCourseRating(courseId: string): Promise<void> {
    try {
      const stats = await this.repo.getCourseStats(courseId);
      const { Course } = await import('../../models');
      
      await Course.update(
        {
          rating: stats.average_rating,
          total_ratings: stats.total_reviews,
        },
        { where: { id: courseId } }
      );
      
      logger.info(`Updated course ${courseId} rating: ${stats.average_rating}, total: ${stats.total_reviews}`);
    } catch (error) {
      logger.error(`Error updating course rating for ${courseId}:`, error);
      // Don't throw - this is a background update
    }
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

      // Content moderation - check comment if provided
      if (data.comment && data.comment.trim().length > 0) {
        const moderationResult = await this.moderationService.moderateReview(
          data.comment,
          userId
        );

        if (!moderationResult.approved || moderationResult.shouldBlock) {
          logger.warn(`Review blocked by moderation for course ${data.course_id} by user ${userId}`, {
            riskScore: moderationResult.riskScore,
            riskCategories: moderationResult.riskCategories,
            reason: moderationResult.reason,
          });
          
          throw new ApiError(
            moderationResult.reason || 'Đánh giá của bạn không phù hợp với quy tắc cộng đồng. Vui lòng chỉnh sửa và thử lại.',
            400
          );
        }

        // Log warning if AI detected potential issues but approved
        if (moderationResult.shouldWarn) {
          logger.info(`Review approved with warning for course ${data.course_id} by user ${userId}`, {
            riskScore: moderationResult.riskScore,
            riskCategories: moderationResult.riskCategories,
          });
        }
      }

      const review = await this.repo.create({
        course_id: data.course_id,
        user_id: userId,
        rating: data.rating,
        comment: data.comment || null,
      });

      const normalized = this.normalizeReviewForFrontend(review);

      // Update course rating
      await this.updateCourseRating(data.course_id);

      logger.info(`Review created for course ${data.course_id} by user ${userId}`);
      return normalized;
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
      
      // Normalize reviews for frontend
      const normalizedReviews = rows.map(review => this.normalizeReviewForFrontend(review));
      
      return {
        reviews: normalizedReviews,
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

      if (String(review.user_id) !== String(userId)) {
        throw new ApiError('You can only update your own reviews', 403);
      }

      // Content moderation - check comment if provided and changed
      if (data.comment !== undefined && data.comment !== review.comment) {
        // If comment is being set to empty/null, allow it (user can remove their comment)
        if (data.comment && data.comment.trim().length > 0) {
          const moderationResult = await this.moderationService.moderateReview(
            data.comment,
            userId
          );

          if (!moderationResult.approved || moderationResult.shouldBlock) {
            logger.warn(`Review update blocked by moderation for review ${reviewId} by user ${userId}`, {
              riskScore: moderationResult.riskScore,
              riskCategories: moderationResult.riskCategories,
              reason: moderationResult.reason,
            });
            
            throw new ApiError(
              moderationResult.reason || 'Đánh giá của bạn không phù hợp với quy tắc cộng đồng. Vui lòng chỉnh sửa và thử lại.',
              400
            );
          }

          // Log warning if AI detected potential issues but approved
          if (moderationResult.shouldWarn) {
            logger.info(`Review update approved with warning for review ${reviewId} by user ${userId}`, {
              riskScore: moderationResult.riskScore,
              riskCategories: moderationResult.riskCategories,
            });
          }
        }
        // If comment is empty/null, allow it (no moderation needed)
      }

      if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
        throw new ApiError('Rating must be between 1 and 5', 400);
      }

      // Build partial update payload to avoid sending undefined (can null columns)
      const updatePayload: Partial<ReviewAttributes> = {};
      if (data.rating !== undefined) {
        updatePayload.rating = data.rating;
      }
      if (data.comment !== undefined) {
        updatePayload.comment = data.comment;
      }

      const updated = await this.repo.update(reviewId, updatePayload);

      if (!updated) {
        // Handle race condition where review was deleted between fetch and update
        throw new ApiError('Review not found', 404);
      }

      const normalized = this.normalizeReviewForFrontend(updated);

      // Always refresh course rating (in case publication/visibility changes)
      await this.updateCourseRating(updated.course_id);

      logger.info(`Review ${reviewId} updated by user ${userId}`);
      return normalized;
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

      if (!isAdmin && String(review.user_id) !== String(userId)) {
        throw new ApiError('You can only delete your own reviews', 403);
      }

      const courseId = review.course_id;
      await this.repo.delete(reviewId);
      
      // Update course rating
      await this.updateCourseRating(courseId);
      
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
      const review = await this.repo.getUserReview(courseId, userId);
      return review ? this.normalizeReviewForFrontend(review) : null;
    } catch (error) {
      logger.error('Error getting user review:', error);
      throw error;
    }
  }
}
