import { httpClient } from '../http/client';

/**
 * Review API Service
 * 
 * Tất cả endpoints liên quan đến course reviews/ratings
 */

// Types
export interface Review {
  id: string;
  course_id: string;
  user_id: string;
  rating: number; // 1-5
  comment: string | null;
  is_published: boolean;
  instructor_reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    [key: number]: number; // { 1: 0, 2: 5, 3: 10, 4: 20, 5: 15 }
  };
}

export interface CreateReviewPayload {
  course_id: string;
  rating: number; // 1-5
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}

export interface CourseReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const reviewApi = {
  /**
   * Get all reviews for a course
   */
  getCourseReviews: async (
    courseId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CourseReviewsResponse> => {
    const response = await httpClient.get(`/reviews/course/${courseId}`, {
      params: { page, limit },
    });
    return response.data.data;
  },

  /**
   * Get review statistics for a course
   */
  getCourseReviewStats: async (courseId: string): Promise<ReviewStats> => {
    const response = await httpClient.get(`/reviews/course/${courseId}/stats`);
    return response.data.data;
  },

  /**
   * Get current user's review for a course
   */
  getMyReview: async (courseId: string): Promise<Review | null> => {
    const response = await httpClient.get(`/reviews/course/${courseId}/my`);
    return response.data.data;
  },

  /**
   * Create a new review
   */
  createReview: async (payload: CreateReviewPayload): Promise<Review> => {
    const response = await httpClient.post('/reviews', payload);
    return response.data.data;
  },

  /**
   * Update a review
   */
  updateReview: async (
    reviewId: string,
    payload: UpdateReviewPayload
  ): Promise<Review> => {
    const response = await httpClient.put(`/reviews/${reviewId}`, payload);
    return response.data.data;
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    await httpClient.delete(`/reviews/${reviewId}`);
  },

  /**
   * Add instructor reply to a review
   */
  addInstructorReply: async (
    reviewId: string,
    reply: string
  ): Promise<Review> => {
    const response = await httpClient.post(`/reviews/${reviewId}/reply`, {
      reply,
    });
    return response.data.data;
  },
};

