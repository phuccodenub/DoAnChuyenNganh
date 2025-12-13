import { apiClient } from '../http/client';
import type {
  AdminCourse,
  AdminCourseDetail,
  CourseAdminFilters,
  CourseListResponse,
  CourseStats,
  UpdateCoursePayload,
  BulkCourseActionPayload,
  EnrollmentInfo,
} from '@/types/course.admin.types';

interface BackendApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

interface BackendCourse {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  instructor?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    avatar_url?: string;
    avatar?: string;
  };
  // Backend association uses alias 'courseCategory'
  category?: { id: string; name: string };
  courseCategory?: { id: string; name: string };
  status: 'draft' | 'published' | 'archived' | 'suspended';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  price?: number;
  is_free?: boolean;
  total_students?: number;
  student_count?: number;
  duration_hours?: number;
  sections_count?: number;
  lessons_count?: number;
  completion_rate?: number;
  average_rating?: number;
  total_revenue?: number;
  created_at?: string | Date;
  updated_at?: string | Date;
}

interface BackendCoursesPaginated {
  data: BackendCourse[];
  pagination: {
    page: number;
    per_page?: number;
    limit?: number;
    total: number;
    totalPages?: number;
    total_pages?: number;
  };
}

function mapBackendCourseToAdminCourse(raw: BackendCourse): AdminCourse {
  const createdAt =
    raw.created_at instanceof Date
      ? raw.created_at.toISOString()
      : (raw.created_at as string | undefined) ?? new Date().toISOString();

  const updatedAt =
    raw.updated_at instanceof Date
      ? raw.updated_at.toISOString()
      : (raw.updated_at as string | undefined) ?? createdAt;

  const instructorFullName =
    `${raw.instructor?.first_name || ''} ${raw.instructor?.last_name || ''}`.trim() ||
    raw.instructor?.email ||
    'Giảng viên';

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || '',
    thumbnail_url: raw.thumbnail_url ?? raw.thumbnail ?? undefined,
    instructor: {
      id: raw.instructor?.id || '',
      full_name: instructorFullName,
      avatar_url: raw.instructor?.avatar_url ?? raw.instructor?.avatar ?? undefined,
      email: raw.instructor?.email,
    },
    category: raw.category
      ? {
          id: raw.category.id,
          name: raw.category.name,
        }
      : raw.courseCategory
      ? {
          id: raw.courseCategory.id,
          name: raw.courseCategory.name,
        }
      : undefined,
    status: (raw.status === 'suspended' ? 'archived' : raw.status) as AdminCourse['status'],
    difficulty:
      (raw.level === 'expert' ? 'advanced' : raw.level) as AdminCourse['difficulty'],
    price: raw.price,
    is_free: Boolean(raw.is_free),
    student_count: raw.student_count ?? raw.total_students ?? 0,
    duration_hours: raw.duration_hours,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

function mapCoursePagination(
  backend: BackendCoursesPaginated['pagination'],
): CourseListResponse['pagination'] {
  const page = backend.page ?? 1;
  const perPage = backend.per_page ?? backend.limit ?? 25;
  const total = backend.total ?? 0;
  const totalPages =
    backend.total_pages ?? backend.totalPages ?? (perPage ? Math.ceil(total / perPage) : 1);

  return {
    page,
    per_page: perPage,
    total,
    total_pages: totalPages,
  };
}

/**
 * Course Admin API Service
 * 
 * Handles all admin course management API calls:
 * - View all courses (cross-instructor)
 * - CRUD operations
 * - Status management
 * - Bulk operations
 * - Statistics & analytics
 */
export const courseAdminApi = {
  // ============================================================================
  // Course Management
  // ============================================================================

  /**
   * Get all courses (admin can see all courses from all instructors)
   */
  getAllCourses: async (filters: CourseAdminFilters = {}): Promise<CourseListResponse> => {
    const params: Record<string, unknown> = {
      page: filters.page,
      limit: filters.per_page,
      search: filters.search,
      status: filters.status && filters.status !== 'all' ? filters.status : undefined,
      instructor_id: filters.instructor_id,
      category_id: filters.category_id,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
    };

    const response = await apiClient.get<BackendApiResponse<any>>('/admin/courses', { params });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Không thể tải danh sách khóa học');
    }

    const body: any = response.data;

    // Hai dạng response có thể có:
    // 1) { success, data: Course[], pagination }
    // 2) { success, data: { courses: Course[], pagination } }
    let rawCourses: BackendCourse[] = [];
    let rawPagination: any = body.pagination;

    if (Array.isArray(body.data)) {
      rawCourses = body.data as BackendCourse[];
    } else if (body.data && Array.isArray(body.data.courses)) {
      rawCourses = body.data.courses as BackendCourse[];
      rawPagination = body.data.pagination ?? rawPagination;
    }

    if (!rawPagination) {
      rawPagination = {
        page: filters.page ?? 1,
        limit: filters.per_page ?? rawCourses.length ?? 0,
        total: rawCourses.length,
        totalPages: 1,
      };
    }

    const courses = rawCourses.map(mapBackendCourseToAdminCourse);

    return {
      courses,
      pagination: mapCoursePagination(rawPagination),
    };
  },

  /**
   * Get course by ID (with admin-level details)
   */
  getCourseById: async (courseId: string): Promise<AdminCourseDetail> => {
    const response = await apiClient.get<BackendApiResponse<BackendCourse>>(
      `/admin/courses/${courseId}`,
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Không tìm thấy khóa học');
    }

    const base = mapBackendCourseToAdminCourse(response.data.data);
    const detail: AdminCourseDetail = {
      ...base,
      sections_count: response.data.data.sections_count ?? 0,
      lessons_count: response.data.data.lessons_count ?? 0,
      total_duration_minutes: (base.duration_hours ?? 0) * 60,
      enrolled_students_count: response.data.data.student_count ?? base.student_count,
      completion_rate: response.data.data.completion_rate ?? 0,
      average_rating: response.data.data.average_rating,
      total_revenue: response.data.data.total_revenue ?? 0,
      sections: [],
      recent_enrollments: [],
    };

    return detail;
  },

  /**
   * Update course
   */
  updateCourse: async (courseId: string, data: UpdateCoursePayload): Promise<AdminCourse> => {
    const response = await apiClient.put<AdminCourse>(`/admin/courses/${courseId}`, data);
    return response.data;
  },

  /**
   * Delete course
   */
  deleteCourse: async (courseId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/admin/courses/${courseId}`
    );
    return response.data;
  },

  /**
   * Change course status
   */
  changeCourseStatus: async (
    courseId: string,
    status: 'draft' | 'published' | 'archived'
  ): Promise<AdminCourse> => {
    const response = await apiClient.patch<BackendApiResponse<BackendCourse>>(
      `/admin/courses/${courseId}/status`,
      { status },
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Thay đổi trạng thái khóa học thất bại');
    }
    return mapBackendCourseToAdminCourse(response.data.data);
  },

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  /**
   * Bulk delete courses
   */
  bulkDeleteCourses: async (
    courseIds: string[]
  ): Promise<{ success: boolean; message: string; affected: number }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      affected: number;
    }>('/admin/courses/bulk-delete', { course_ids: courseIds });
    return response.data;
  },

  /**
   * Bulk update course status
   */
  bulkUpdateStatus: async (
    courseIds: string[],
    status: 'draft' | 'published' | 'archived'
  ): Promise<{ success: boolean; message: string; affected: number }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      affected: number;
    }>('/admin/courses/bulk-status', { course_ids: courseIds, status });
    return response.data;
  },

  /**
   * Perform bulk action on courses
   */
  bulkAction: async (
    payload: BulkCourseActionPayload
  ): Promise<{ success: boolean; message: string; affected: number }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      affected: number;
    }>('/admin/courses/bulk-action', payload);
    return response.data;
  },

  // ============================================================================
  // Statistics & Analytics
  // ============================================================================

  /**
   * Get course statistics (admin overview)
   */
  getCourseStats: async (): Promise<CourseStats> => {
    const response = await apiClient.get<BackendApiResponse<any>>('/admin/courses/stats');
    const data = response.data.data || {};

    const stats: CourseStats = {
      total_courses: data.total_courses ?? 0,
      published_courses: data.published_courses ?? 0,
      draft_courses: data.draft_courses ?? 0,
      archived_courses: data.archived_courses ?? 0,
      total_students: data.total_students ?? 0,
      courses_this_month: data.courses_this_month ?? 0,
      total_revenue: data.total_revenue ?? 0,
    };

    return stats;
  },

  /**
   * Get course students (enrollments)
   */
  getCourseStudents: async (
    courseId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ students: EnrollmentInfo[]; total: number }> => {
    const response = await apiClient.get<BackendApiResponse<any>>(
      `/admin/courses/${courseId}/students`,
      { params },
    );
    const data = response.data.data || {};

    const students: EnrollmentInfo[] = Array.isArray(data.students)
      ? data.students.map((enrollment: any) => ({
          id: enrollment.id,
          student: {
            id: enrollment.user?.id ?? '',
            full_name:
              `${enrollment.user?.first_name || ''} ${enrollment.user?.last_name || ''}`.trim() ||
              enrollment.user?.email ||
              'Học viên',
            avatar_url: enrollment.user?.avatar_url ?? enrollment.user?.avatar ?? undefined,
            email: enrollment.user?.email ?? '',
          },
          enrolled_at:
            enrollment.created_at instanceof Date
              ? enrollment.created_at.toISOString()
              : enrollment.created_at,
          progress: enrollment.progress ?? enrollment.progress_percentage ?? 0,
          status: (enrollment.status as EnrollmentInfo['status']) ?? 'active',
        }))
      : [];

    const total = data.total ?? students.length;

    return { students, total };
  },

  /**
   * Get course analytics
   */
  getCourseAnalytics: async (courseId: string): Promise<{
    total_enrollments: number;
    active_students: number;
    completed_students: number;
    completion_rate: number;
    average_progress: number;
    total_revenue: number;
  }> => {
    // Use real enrollment stats + course detail revenue
    const [enrollmentStatsRes, courseDetailRes] = await Promise.all([
      apiClient.get<BackendApiResponse<any>>(`/enrollments/stats/course/${courseId}`),
      apiClient.get<BackendApiResponse<BackendCourse>>(`/admin/courses/${courseId}`),
    ]);

    const enrollmentStats = enrollmentStatsRes.data?.data ?? {};
    const courseDetail = courseDetailRes.data?.data;

    const totalEnrollments = Number(enrollmentStats.total_enrollments ?? 0);
    const totalRevenue =
      Number((courseDetail as any)?.total_revenue ?? 0) ||
      (Number((courseDetail as any)?.price ?? 0) || 0) * totalEnrollments;

    return {
      total_enrollments: totalEnrollments,
      active_students: Number(enrollmentStats.active_enrollments ?? 0),
      completed_students: Number(enrollmentStats.completed_enrollments ?? 0),
      // Backend enrollment stats returns percentage (0-100)
      completion_rate: Number(enrollmentStats.completion_rate ?? 0),
      average_progress: Number(enrollmentStats.average_progress ?? 0),
      total_revenue: totalRevenue,
    };
  },

  // ============================================================================
  // Export
  // ============================================================================

  /**
   * Export courses to CSV
   */
  exportCoursesToCSV: async (filters: CourseAdminFilters = {}): Promise<Blob> => {
    const csvEscape = (value: unknown): string => {
      const s = String(value ?? '');
      if (/[\n\r,"]/g.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const perPage = Math.min(Math.max(filters.per_page ?? 1000, 1), 5000);
    let page = 1;
    const allCourses: AdminCourse[] = [];

    // Fetch all pages (bounded for safety)
    for (let i = 0; i < 50; i++) {
      const result = await courseAdminApi.getAllCourses({
        ...filters,
        page,
        per_page: perPage,
      });
      allCourses.push(...(result.courses ?? []));
      if (!result.pagination || result.pagination.page >= result.pagination.total_pages) break;
      page += 1;
    }

    const lines: string[] = [];
    lines.push(`Generated At,${csvEscape(new Date().toISOString())}`);
    lines.push('');
    lines.push(
      [
        'ID',
        'Title',
        'Instructor',
        'Instructor Email',
        'Category',
        'Status',
        'Difficulty',
        'Students',
        'Price',
        'Is Free',
        'Created At',
      ].join(','),
    );

    for (const course of allCourses) {
      lines.push(
        [
          csvEscape(course.id),
          csvEscape(course.title),
          csvEscape(course.instructor?.full_name ?? ''),
          csvEscape(course.instructor?.email ?? ''),
          csvEscape(course.category?.name ?? ''),
          csvEscape(course.status),
          csvEscape(course.difficulty),
          csvEscape(course.student_count ?? 0),
          csvEscape(course.price ?? 0),
          csvEscape(course.is_free ? 'yes' : 'no'),
          csvEscape(course.created_at),
        ].join(','),
      );
    }

    const csv = lines.join('\n');
    return new Blob([csv], { type: 'text/csv;charset=utf-8' });
  },
};

export default courseAdminApi;
