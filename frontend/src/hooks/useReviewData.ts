import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi, type Review, type ReviewStats, type CreateReviewPayload, type UpdateReviewPayload } from '@/services/api/review.api';
import { toast } from 'react-hot-toast';

const QUERY_KEYS = {
  courseReviews: (courseId: string) => ['reviews', 'course', courseId],
  courseReviewStats: (courseId: string) => ['reviews', 'stats', courseId],
  myReview: (courseId: string) => ['reviews', 'my', courseId],
};

/**
 * Get reviews for a course
 */
export function useCourseReviews(courseId: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: [...QUERY_KEYS.courseReviews(courseId), page, limit],
    queryFn: () => reviewApi.getCourseReviews(courseId, page, limit),
    enabled: !!courseId,
  });
}

/**
 * Get review statistics for a course
 */
export function useCourseReviewStats(courseId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.courseReviewStats(courseId),
    queryFn: () => reviewApi.getCourseReviewStats(courseId),
    enabled: !!courseId,
  });
}

/**
 * Get current user's review for a course
 */
export function useMyReview(courseId: string, userId?: string, isAuthenticated?: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.myReview(courseId),
    queryFn: () => reviewApi.getMyReview(courseId),
    enabled: !!courseId && !!userId && !!isAuthenticated,
    retry: false, // Don't retry on 404 (user hasn't reviewed yet)
  });
}

/**
 * Create a review
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewApi.createReview(payload),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courseReviews(variables.course_id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courseReviewStats(variables.course_id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myReview(variables.course_id) });
      
      // Also invalidate course data to update rating
      queryClient.invalidateQueries({ queryKey: ['course', variables.course_id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/**
 * Update a review
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: UpdateReviewPayload }) =>
      reviewApi.updateReview(reviewId, payload),
    onSuccess: (data) => {
      const courseId = data.course_id;
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courseReviews(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courseReviewStats(courseId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myReview(courseId) });
      
      // Also invalidate course data to update rating
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/**
 * Delete a review
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewApi.deleteReview(reviewId),
    onSuccess: (_, reviewId) => {
      // We need to get the courseId from the cache or make another call
      // For now, invalidate all review queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

