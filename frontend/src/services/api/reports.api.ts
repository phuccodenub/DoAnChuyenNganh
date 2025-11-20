import { httpClient } from '@/services/http/client';

export interface ReportStats {
  total_users: number;
  total_courses: number;
  total_enrollments: number;
  total_revenue: number;
  active_users_today: number;
  active_users_week: number;
  active_users_month: number;
  average_course_rating: number;
  completion_rate: number;
}

export interface UserGrowthData {
  date: string;
  count: number;
  cumulative: number;
}

export interface CoursePopularityData {
  course_name: string;
  enrollments: number;
  revenue: number;
  rating: number;
}

export interface UserActivityData {
  label: string;
  logins: number;
  registrations: number;
  course_enrollments: number;
}

export interface ReportResponse {
  success: boolean;
  data: unknown;
}

export const reportsApi = {
  getStats: async (period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<ReportStats> => {
    const response = await httpClient.get<ReportResponse>(`/admin/reports/stats?period=${period}`);
    return response.data.data as ReportStats;
  },

  getUserGrowth: async (days: number = 30): Promise<UserGrowthData[]> => {
    const response = await httpClient.get<ReportResponse>(`/admin/reports/user-growth?days=${days}`);
    return response.data.data as UserGrowthData[];
  },

  getCoursePopularity: async (limit: number = 10): Promise<CoursePopularityData[]> => {
    const response = await httpClient.get<ReportResponse>(`/admin/reports/course-popularity?limit=${limit}`);
    return response.data.data as CoursePopularityData[];
  },

  getUserActivity: async (days: number = 30): Promise<UserActivityData[]> => {
    const response = await httpClient.get<ReportResponse>(`/admin/reports/user-activity?days=${days}`);
    return response.data.data as UserActivityData[];
  },

  getEnrollmentTrends: async (months: number = 12): Promise<{ month: string; enrollments: number }[]> => {
    const response = await httpClient.get<ReportResponse>(`/admin/reports/enrollment-trends?months=${months}`);
    return response.data.data as { month: string; enrollments: number }[];
  },

  getRevenueReport: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    total: number;
    by_course: { course_name: string; revenue: number }[];
    by_payment_method: { method: string; revenue: number }[];
  }> => {
    const response = await httpClient.get<ReportResponse>(`/admin/reports/revenue?period=${period}`);
    return response.data.data as any;
  },

  exportReport: async (reportType: string, format: 'csv' | 'pdf' = 'csv'): Promise<Blob> => {
    const response = await httpClient.get(`/admin/reports/export?type=${reportType}&format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
