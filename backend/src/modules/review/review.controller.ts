/**
 * Review Controller
 */

import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';

export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  /**
   * Create a new review
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id as string;
      const review = await this.reviewService.createReview(userId, req.body);
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.CREATED).json({
        success: true,
        message: 'Review created successfully',
        data: review
      });
    } catch (error) {
      logger.error('Error in create review controller:', error);
      next(error);
    }
  };

  /**
   * Get reviews for a course
   */
  getCourseReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const result = await this.reviewService.getCourseReviews(
        courseId,
        Number(page),
        Number(limit)
      );
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Reviews retrieved successfully',
        data: result
      });
    } catch (error) {
      logger.error('Error in getCourseReviews controller:', error);
      next(error);
    }
  };

  /**
   * Get course review statistics
   */
  getCourseReviewStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const stats = await this.reviewService.getCourseReviewStats(courseId);
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Review statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      logger.error('Error in getCourseReviewStats controller:', error);
      next(error);
    }
  };

  /**
   * Update a review
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id as string;
      const { reviewId } = req.params;
      
      const review = await this.reviewService.updateReview(reviewId, userId, req.body);
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Review updated successfully',
        data: review
      });
    } catch (error) {
      logger.error('Error in update review controller:', error);
      next(error);
    }
  };

  /**
   * Delete a review
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id as string;
      const userRole = (req as any).user?.role as string;
      const { reviewId } = req.params;
      
      const isAdmin = ['admin', 'super_admin'].includes(userRole);
      await this.reviewService.deleteReview(reviewId, userId, isAdmin);
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Review deleted successfully',
        data: null
      });
    } catch (error) {
      logger.error('Error in delete review controller:', error);
      next(error);
    }
  };

  /**
   * Add instructor reply to a review
   */
  addReply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const instructorId = (req as any).user?.id as string;
      const { reviewId } = req.params;
      const { reply } = req.body;
      
      const review = await this.reviewService.addInstructorReply(reviewId, instructorId, reply);
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Reply added successfully',
        data: review
      });
    } catch (error) {
      logger.error('Error in addReply controller:', error);
      next(error);
    }
  };

  /**
   * Get user's review for a course
   */
  getMyReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id as string;
      const { courseId } = req.params;
      
      const review = await this.reviewService.getUserReview(courseId, userId);
      
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.SUCCESS).json({
        success: true,
        message: 'Review retrieved successfully',
        data: review
      });
    } catch (error) {
      logger.error('Error in getMyReview controller:', error);
      next(error);
    }
  };
}
