import { httpClient } from '@/services/http/client';
import { adminApi } from './admin.api';
import { courseAdminApi } from './course.admin.api';

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
    // Backend chưa có /admin/reports, tái sử dụng các API admin/analytics sẵn có
    const [dashboardStats, courseStats] = await Promise.all([
      adminApi.getDashboardStats(),
      courseAdminApi.getCourseStats().catch(() => null),
    ]);

    const stats: ReportStats = {
      total_users: dashboardStats.total_users ?? 0,
      total_courses: dashboardStats.total_courses ?? 0,
      total_enrollments: dashboardStats.total_enrollments ?? 0,
      total_revenue: dashboardStats.revenue_this_month ?? 0,
      active_users_today: 0,
      active_users_week: dashboardStats.users_by_status.active ?? 0,
      active_users_month: dashboardStats.users_by_status.active ?? 0,
      average_course_rating: 0,
      completion_rate: 0,
    };

    void courseStats;
    void period; // Giữ tham số cho tương lai nếu backend hỗ trợ theo kỳ
    return stats;
  },

  getUserGrowth: async (days: number = 30): Promise<UserGrowthData[]> => {
    const raw = await adminApi.getUserGrowth(days);
    let cumulative = 0;
    return raw.map((point) => {
      cumulative += point.count;
      return {
        date: point.date,
        count: point.count,
        cumulative,
      };
    });
  },

  getCoursePopularity: async (limit: number = 10): Promise<CoursePopularityData[]> => {
    // Sort by created_at since student_count is not a database column
    const { courses } = await courseAdminApi.getAllCourses({
      page: 1,
      per_page: limit,
      sort_by: 'created_at',
      sort_order: 'desc',
    });

    return courses.slice(0, limit).map((course) => ({
      course_name: course.title,
      enrollments: course.student_count,
      revenue: (course.price ?? 0) * course.student_count,
      rating: 0, // TODO: map khi backend expose rating
    }));
  },

  getUserActivity: async (days: number = 30): Promise<UserActivityData[]> => {
    // Chưa có endpoint riêng cho user activity, tạm thời tổng hợp đơn giản từ user growth
    const growth = await adminApi.getUserGrowth(days);
    return growth.map((point) => ({
      label: point.date,
      logins: point.count,
      registrations: point.count,
      course_enrollments: 0,
    }));
  },

  getEnrollmentTrends: async (months: number = 12): Promise<{ month: string; enrollments: number }[]> => {
    const trend = await adminApi.getEnrollmentTrend(months * 30);
    return trend.map((item) => ({
      month: item.date,
      enrollments: item.enrollments,
    }));
  },

  getRevenueReport: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    total: number;
    by_course: { course_name: string; revenue: number }[];
    by_payment_method: { method: string; revenue: number }[];
  }> => {
    const [dashboardStats, coursesResult] = await Promise.all([
      adminApi.getDashboardStats(),
      courseAdminApi
        .getAllCourses({
          page: 1,
          per_page: 100,
          sort_by: 'created_at',
          sort_order: 'desc',
        })
        .catch(() => ({ courses: [] } as any)),
    ]);

    const total = dashboardStats.revenue_this_month ?? 0;
    const by_course = coursesResult.courses.map((course: any) => ({
      course_name: course.title,
      revenue: (course.price ?? 0) * course.student_count,
    }));

    const by_payment_method = [{ method: 'online', revenue: total }];

    void period;
    return { total, by_course, by_payment_method };
  },

  exportReport: async (reportType: string, format: 'csv' | 'pdf' = 'csv'): Promise<Blob> => {
    // Backend chưa có endpoint export reports tổng hợp, tạm trả về Blob rỗng
    void reportType;
    void format;
    return new Blob([], { type: 'text/csv' });
  },
};
