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
    // Prefer backend aggregated reports endpoint
    try {
      const response = await httpClient.get<{ success: boolean; data: ReportStats }>(
        '/admin/reports/stats',
        { params: { period } },
      );
      if (response?.data?.data) return response.data.data;
    } catch {
      // fallback below
    }

    // Fallback: reuse existing endpoints
    const [dashboardStats, courseStats] = await Promise.all([
      adminApi.getDashboardStats(),
      courseAdminApi.getCourseStats().catch(() => null),
    ]);

    void courseStats;
    void period;

    return {
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
    // Prefer backend report endpoint to include rating & revenue aggregates
    try {
      const response = await httpClient.get<{ success: boolean; data: CoursePopularityData[] }>(
        '/admin/reports/top-courses',
        { params: { limit } },
      );
      return response.data.data ?? [];
    } catch {
      // fallback
    }

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
      rating: 0,
    }));
  },

  getUserActivity: async (days: number = 30): Promise<UserActivityData[]> => {
    // Aggregate from multiple real sources:
    // - registrations: user growth (users created)
    // - logins: login trend (users last_login)
    // - course_enrollments: enrollment trend
    const [registrations, logins, enrollments] = await Promise.all([
      adminApi.getUserGrowth(days),
      httpClient
        .get<{ success: boolean; data: { date: string; count: number }[] }>('/admin/analytics/login-trend', {
          params: { days },
        })
        .then((r) => r.data.data ?? [])
        .catch(() => []),
      adminApi.getEnrollmentTrend(days),
    ]);

    const byDate = new Map<string, UserActivityData>();

    for (const r of registrations) {
      byDate.set(r.date, {
        label: r.date,
        logins: 0,
        registrations: r.count ?? 0,
        course_enrollments: 0,
      });
    }
    for (const l of logins) {
      const existing = byDate.get(l.date) ?? {
        label: l.date,
        logins: 0,
        registrations: 0,
        course_enrollments: 0,
      };
      existing.logins = l.count ?? 0;
      byDate.set(l.date, existing);
    }
    for (const e of enrollments) {
      const existing = byDate.get(e.date) ?? {
        label: e.date,
        logins: 0,
        registrations: 0,
        course_enrollments: 0,
      };
      existing.course_enrollments = e.enrollments ?? 0;
      byDate.set(e.date, existing);
    }

    return Array.from(byDate.values()).sort((a, b) => a.label.localeCompare(b.label));
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
    if (format === 'pdf') {
      // PDF export chưa được triển khai trong backend hiện tại
      // Fallback: export CSV
    }

    const csvEscape = (value: unknown): string => {
      const s = String(value ?? '');
      if (/[\n\r,"]/g.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const [stats, userGrowth, userActivity, topCourses] = await Promise.all([
      reportsApi.getStats('month'),
      reportsApi.getUserGrowth(30),
      reportsApi.getUserActivity(30),
      reportsApi.getCoursePopularity(10),
    ]);

    const lines: string[] = [];
    lines.push(`Report Type,${csvEscape(reportType)}`);
    lines.push(`Generated At,${csvEscape(new Date().toISOString())}`);
    lines.push('');

    lines.push('Summary');
    lines.push('Metric,Value');
    lines.push(`Total Users,${stats.total_users}`);
    lines.push(`Total Courses,${stats.total_courses}`);
    lines.push(`Total Enrollments,${stats.total_enrollments}`);
    lines.push(`Total Revenue,${stats.total_revenue}`);
    lines.push(`Active Users Today,${stats.active_users_today}`);
    lines.push(`Active Users Week,${stats.active_users_week}`);
    lines.push(`Active Users Month,${stats.active_users_month}`);
    lines.push(`Average Course Rating,${stats.average_course_rating}`);
    lines.push(`Completion Rate,${stats.completion_rate}`);
    lines.push('');

    lines.push('User Growth (last 30 days)');
    lines.push('Date,New Users,Cumulative');
    for (const p of userGrowth) {
      lines.push(`${csvEscape(p.date)},${p.count},${p.cumulative}`);
    }
    lines.push('');

    lines.push('User Activity (last 30 days)');
    lines.push('Date,Logins,Registrations,Course Enrollments');
    for (const p of userActivity) {
      lines.push(`${csvEscape(p.label)},${p.logins},${p.registrations},${p.course_enrollments}`);
    }
    lines.push('');

    lines.push('Top Courses');
    lines.push('Course,Enrollments,Rating,Revenue');
    for (const c of topCourses) {
      lines.push(`${csvEscape(c.course_name)},${c.enrollments},${c.rating},${c.revenue}`);
    }

    const csv = lines.join('\n');
    return new Blob([csv], { type: 'text/csv;charset=utf-8' });
  },
};
