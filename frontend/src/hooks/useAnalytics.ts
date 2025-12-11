import { useQuery } from '@tanstack/react-query';
import { analyticsApi, type CourseAnalytics, type EnrollmentTrend, type StudentDemographics } from '@/services/api/analytics.api';

const QUERY_KEYS = {
  courseAnalytics: (courseId: string, period: string, days: number) => 
    ['analytics', 'course', courseId, period, days],
  enrollmentTrends: (courseId: string, period: string, days: number) => 
    ['analytics', 'enrollments', courseId, period, days],
  demographics: (courseId: string) => ['analytics', 'demographics', courseId],
  engagement: (courseId: string) => ['analytics', 'engagement', courseId],
  contentEngagement: (courseId: string, type?: string, days?: number) => 
    ['analytics', 'content-engagement', courseId, type || 'all', days || 'default'],
  contentMatrix: (courseId: string, type: string, days?: number, search?: string) =>
    ['analytics', 'content-matrix', courseId, type, days || 'default', search || ''],
};

/**
 * Get comprehensive course analytics
 */
export function useCourseAnalytics(
  courseId: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  days: number = 30
) {
  return useQuery({
    queryKey: QUERY_KEYS.courseAnalytics(courseId, period, days),
    queryFn: () => analyticsApi.getCourseAnalytics(courseId, period, days),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get enrollment trends
 */
export function useEnrollmentTrends(
  courseId: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  days: number = 30
) {
  return useQuery({
    queryKey: QUERY_KEYS.enrollmentTrends(courseId, period, days),
    queryFn: () => analyticsApi.getEnrollmentTrends(courseId, period, days),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get student demographics
 */
export function useStudentDemographics(courseId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.demographics(courseId),
    queryFn: () => analyticsApi.getStudentDemographics(courseId),
    enabled: !!courseId,
    staleTime: 10 * 60 * 1000, // 10 minutes (demographics don't change often)
  });
}

/**
 * Get engagement metrics
 */
export function useEngagementMetrics(courseId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.engagement(courseId),
    queryFn: () => analyticsApi.getEngagementMetrics(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get content-level engagement overview
 */
export function useContentEngagementOverview(
  courseId: string,
  type: 'lesson' | 'quiz' | 'assignment' | 'all' = 'all',
  days?: number
) {
  return useQuery({
    queryKey: QUERY_KEYS.contentEngagement(courseId, type, days),
    queryFn: () => analyticsApi.getContentEngagementOverview(courseId, { type, days }),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get content-level engagement matrix (student x content)
 */
export function useContentEngagementMatrix(
  courseId: string,
  type: 'lesson' | 'quiz' | 'assignment' = 'quiz',
  days?: number,
  search?: string
) {
  return useQuery({
    queryKey: QUERY_KEYS.contentMatrix(courseId, type, days, search),
    queryFn: () => analyticsApi.getContentEngagementMatrix(courseId, { type, days, search }),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}

