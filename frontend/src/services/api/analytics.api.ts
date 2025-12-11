import { httpClient } from '../http/client';

/**
 * Analytics API Service
 * 
 * Tất cả endpoints liên quan đến analytics
 */

// Types
export interface EnrollmentTrend {
  date: string;
  count: number;
}

export interface GenderDistribution {
  gender: string;
  student_count: number;
}

export interface AgeDistribution {
  age_group: string;
  student_count: number;
}

export interface StudentDemographics {
  ageGroups: Record<string, number>; // Flexible age groups from DB
  locations: Record<string, number>;
  genderDistribution?: GenderDistribution[];
  total: number;
}

export interface CompletionTime {
  averageDays: number;
  medianDays: number;
  minDays: number;
  maxDays: number;
  totalCompleted: number;
}

export interface DropoutRate {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  cancelledEnrollments: number;
  dropoutRate: number;
  retentionRate: number;
  inactiveStudents: number;
}

export interface EngagedContent {
  topLessons: Array<{
    lessonId: string;
    lessonTitle: string;
    sectionTitle: string;
    completionCount: number;
    avgTimeSpent: number;
  }>;
  topSections: Array<{
    sectionId: string;
    sectionTitle: string;
    totalProgress: number;
    avgCompletion: number;
  }>;
}

export type ContentEngagementType = 'lesson' | 'quiz' | 'assignment';

export interface ContentEngagementItem {
  contentId: string;
  contentTitle: string;
  contentType: ContentEngagementType;
  sectionTitle?: string | null;
  participants: number;
  interactions: number;
  completions: number;
  completionRate: number;
  avgCompletionPct?: number | null;
  avgTimeSpentSeconds?: number | null;
  avgScore?: number | null;
  lastActivity?: string | null;
}

export interface ContentEngagementOverview {
  lessons: ContentEngagementItem[];
  quizzes: ContentEngagementItem[];
  assignments: ContentEngagementItem[];
}

export interface ContentMatrixStudent {
  id: string;
  name: string;
  email?: string | null;
}

export interface ContentMatrixContent {
  id: string;
  title: string;
  type: ContentEngagementType;
}

export interface ContentMatrixRecord {
  studentId: string;
  contentId: string;
  status: string | null;
  score?: number | null;
  completionPct?: number | null;
  lastActivity?: string | null;
}

export interface ContentEngagementMatrix {
  students: ContentMatrixStudent[];
  contents: ContentMatrixContent[];
  records: ContentMatrixRecord[];
}

export interface RatingAnalytics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    userName: string;
    createdAt: string;
  }>;
}

export interface PerformanceMetrics {
  quiz: {
    avgScore: number;
    maxScore: number;
    minScore: number;
    totalAttempts: number;
    passedCount: number;
    passRate: string;
  };
  assignment: {
    avgScore: number;
    maxScore: number;
    minScore: number;
    totalSubmissions: number;
    gradedCount: number;
    gradingRate: string;
  };
}

export interface CourseAnalytics {
  enrollmentTrends: EnrollmentTrend[];
  demographics: StudentDemographics;
  completionTime: CompletionTime | null;
  dropoutRate: DropoutRate;
  engagedContent: EngagedContent;
  ratingAnalytics: RatingAnalytics;
  performanceMetrics: PerformanceMetrics;
}

export const analyticsApi = {
  /**
   * Get comprehensive course analytics
   */
  getCourseAnalytics: async (
    courseId: string,
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    days: number = 30
  ): Promise<CourseAnalytics> => {
    const response = await httpClient.get(`/analytics/courses/${courseId}/analytics`, {
      params: { period, days },
    });
    return response.data.data;
  },

  /**
   * Get enrollment trends
   */
  getEnrollmentTrends: async (
    courseId: string,
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    days: number = 30
  ): Promise<EnrollmentTrend[]> => {
    const response = await httpClient.get(`/analytics/courses/${courseId}/analytics/enrollments`, {
      params: { period, days },
    });
    return response.data.data;
  },

  /**
   * Get student demographics
   */
  getStudentDemographics: async (courseId: string): Promise<StudentDemographics> => {
    const response = await httpClient.get(`/analytics/courses/${courseId}/analytics/demographics`);
    return response.data.data;
  },

  /**
   * Get engagement metrics
   */
  getEngagementMetrics: async (courseId: string): Promise<{
    completionTime: CompletionTime | null;
    dropoutRate: DropoutRate;
    engagedContent: EngagedContent;
  }> => {
    const response = await httpClient.get(`/analytics/courses/${courseId}/analytics/engagement`);
    return response.data.data;
  },

  /**
   * Get content-level engagement overview
   */
  getContentEngagementOverview: async (
    courseId: string,
    params?: { type?: 'lesson' | 'quiz' | 'assignment' | 'all'; days?: number }
  ): Promise<ContentEngagementOverview> => {
    const response = await httpClient.get(`/analytics/courses/${courseId}/analytics/content-engagement`, {
      params,
    });
    return response.data.data;
  },

  /**
   * Get content-level engagement matrix (student x content)
   */
  getContentEngagementMatrix: async (
    courseId: string,
    params?: { type?: 'lesson' | 'quiz' | 'assignment'; days?: number; search?: string }
  ): Promise<ContentEngagementMatrix> => {
    const response = await httpClient.get(`/analytics/courses/${courseId}/analytics/content-matrix`, {
      params,
    });
    return response.data.data;
  },
};

