/**
 * Review Repository
 */

import { Review, User, Course } from '../../models';
import type { ModelStatic, WhereOptions } from '../../types/sequelize-types';
import type { ReviewInstance, ReviewAttributes, ReviewCreationAttributes } from '../../models/review.model';

export class ReviewRepository {
  private readonly ReviewModel = Review as unknown as ModelStatic<ReviewInstance>;

  /**
   * Create a new review
   */
  async create(data: ReviewCreationAttributes): Promise<ReviewInstance> {
    return this.ReviewModel.create(data as any);
  }

  /**
   * Get review by ID
   */
  async getById(id: string): Promise<ReviewInstance | null> {
    return this.ReviewModel.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'avatar']
        }
      ]
    });
  }

  /**
   * Get user's review for a course
   */
  async getUserReview(courseId: string, userId: string): Promise<ReviewInstance | null> {
    return this.ReviewModel.findOne({
      where: { course_id: courseId, user_id: userId } as WhereOptions<ReviewAttributes>
    });
  }

  /**
   * Get all reviews for a course with pagination
   */
  async getCourseReviews(
    courseId: string,
    page: number = 1,
    limit: number = 10,
    includeUnpublished: boolean = false
  ): Promise<{ rows: ReviewInstance[]; count: number }> {
    const offset = (page - 1) * limit;
    const whereClause: WhereOptions<ReviewAttributes> = { course_id: courseId };
    
    if (!includeUnpublished) {
      whereClause.is_published = true;
    }

    return (this.ReviewModel as any).findAndCountAll({
      where: whereClause,
      attributes: ['id', 'course_id', 'user_id', 'rating', 'comment', 'is_published', 'instructor_reply', 'replied_at', 'created_at', 'updated_at'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
  }

  /**
   * Update review
   */
  async update(id: string, data: Partial<ReviewAttributes>): Promise<ReviewInstance | null> {
    await this.ReviewModel.update(data as any, {
      where: { id } as WhereOptions<ReviewAttributes>
    });
    return this.getById(id);
  }

  /**
   * Delete review
   */
  async delete(id: string): Promise<number> {
    return this.ReviewModel.destroy({
      where: { id } as WhereOptions<ReviewAttributes>
    });
  }

  /**
   * Get course review statistics
   */
  async getCourseStats(courseId: string): Promise<{
    average_rating: number;
    total_reviews: number;
    rating_distribution: { [key: number]: number };
  }> {
    const reviews = await this.ReviewModel.findAll({
      where: { course_id: courseId, is_published: true } as WhereOptions<ReviewAttributes>,
      attributes: ['rating']
    });

    const totalReviews = reviews.length;
    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviews.forEach((review: any) => {
      const rating = review.rating;
      totalRating += rating;
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });

    return {
      average_rating: totalReviews > 0 ? totalRating / totalReviews : 0,
      total_reviews: totalReviews,
      rating_distribution: ratingDistribution
    };
  }

  /**
   * Add instructor reply to review
   */
  async addReply(id: string, reply: string): Promise<ReviewInstance | null> {
    await this.ReviewModel.update(
      { instructor_reply: reply, replied_at: new Date() } as any,
      { where: { id } as WhereOptions<ReviewAttributes> }
    );
    return this.getById(id);
  }
}
