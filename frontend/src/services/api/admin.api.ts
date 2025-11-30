import { apiClient } from '../http/client';
import { courseAdminApi } from './course.admin.api';
import type {
  AdminUser,
  AdminDashboardStats,
  UserListResponse,
  UserListFilters,
  CreateUserPayload,
  UpdateUserPayload,
  BulkActionPayload,
  UserStats,
  UserGrowthData,
  EnrollmentTrendData,
  TopInstructor,
  RecentActivity,
} from '@/types/admin.types';

/**
 * Backend generic API response (mirrors backend/src/types/common.types.ts)
 */
interface BackendApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit?: number;
    per_page?: number;
    total: number;
    totalPages?: number;
    total_pages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
    nextPage?: number;
    prevPage?: number;
  };
}

/**
 * Backend user shape from Sequelize (simplified)
 */
interface BackendUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  avatar_url?: string;
  role: AdminUser['role'];
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  email_verified?: boolean;
  two_factor_enabled?: boolean;
  preferences?: Record<string, unknown>;
  created_at?: string | Date;
  updated_at?: string | Date;
  last_login?: string | Date | null;
}

interface BackendUsersPaginated {
  data: BackendUser[];
  pagination: {
    page: number;
    limit?: number;
    per_page?: number;
    total: number;
    totalPages?: number;
    total_pages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
    nextPage?: number;
    prevPage?: number;
  };
}

/**
 * Map backend User model -> AdminUser (UI contract)
 */
function mapBackendUserToAdminUser(raw: BackendUser): AdminUser {
  const firstName = raw.first_name ?? '';
  const lastName = raw.last_name ?? '';
  const fullName =
    `${firstName} ${lastName}`.trim() ||
    raw.username ||
    (raw.email ? raw.email.split('@')[0] : 'Người dùng');

  const createdAt =
    raw.created_at instanceof Date
      ? raw.created_at.toISOString()
      : (raw.created_at as string | undefined) ?? new Date().toISOString();

  const updatedAt =
    raw.updated_at instanceof Date
      ? raw.updated_at.toISOString()
      : (raw.updated_at as string | undefined) ?? createdAt;

  const lastLogin =
    raw.last_login instanceof Date
      ? raw.last_login.toISOString()
      : (raw.last_login as string | undefined) ?? undefined;

  const status = (raw.status as AdminUser['status'] | undefined) ?? 'active';

  return {
    id: raw.id,
    email: raw.email,
    full_name: fullName,
    role: raw.role,
    avatar_url: raw.avatar_url ?? raw.avatar,
    bio: raw.bio,
    is_active: status === 'active',
    email_verified: Boolean(raw.email_verified),
    two_factor_enabled: Boolean(raw.two_factor_enabled),
    preferences: raw.preferences,
    created_at: createdAt,
    updated_at: updatedAt,
    last_login: lastLogin,
    status,
  };
}

/**
 * Normalize backend pagination object to frontend shape
 */
function mapBackendPaginationToUserList(
  backend: BackendUsersPaginated['pagination'],
): UserListResponse['pagination'] {
  const page = backend.page ?? 1;
  const perPage = backend.per_page ?? backend.limit ?? 10;
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
 * Admin API Service
 * 
 * Handles all admin-related API calls:
 * - User management (CRUD)
 * - Dashboard statistics
 * - Analytics data
 * - Bulk operations
 */
export const adminApi = {
  // ============================================================================
  // Dashboard & Statistics
  // ============================================================================

  /**
   * Get admin dashboard statistics
   */
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await apiClient.get<BackendApiResponse<any>>('/admin/dashboard/stats');
    const payload = response.data.data || {};

    const totalUsers = payload.total_users ?? 0;
    const activeUsers = payload.active_users ?? payload.activeUsers ?? 0;
    const students = payload.students ?? 0;
    const instructors = payload.instructors ?? 0;

    // Lấy thống kê khóa học từ courseAdminApi để đảm bảo đồng bộ với trang Quản lý khóa học
    const courseStats = await courseAdminApi.getCourseStats().catch(() => null);

    const stats: AdminDashboardStats = {
      total_users: totalUsers,
      users_by_role: {
        student: students,
        instructor: instructors,
        admin: payload.admins ?? 0,
        super_admin: payload.superAdmins ?? payload.super_admins ?? 0,
        total: totalUsers,
      },
      users_by_status: {
        active: activeUsers,
        suspended: (payload.suspended_users as number | undefined) ?? 0,
        total: totalUsers,
      },
      total_courses: courseStats?.total_courses ?? 0,
      courses_published: courseStats?.published_courses ?? 0,
      courses_draft: courseStats?.draft_courses ?? 0,
      courses_archived: courseStats?.archived_courses ?? 0,
      total_enrollments: courseStats?.total_students ?? 0,
      active_enrollments: courseStats?.total_students ?? 0,
      completed_enrollments: 0,
      revenue_this_month: payload.revenue_this_month ?? 0,
    };

    return stats;
  },

  /**
   * Get user growth data (last 30 days)
   */
  getUserGrowth: async (days: number = 30): Promise<UserGrowthData[]> => {
    const response = await apiClient.get<BackendApiResponse<UserGrowthData[]>>(
      '/admin/analytics/user-growth',
      { params: { days } },
    );
    return response.data.data ?? [];
  },

  /**
   * Get course enrollment trend data
   */
  getEnrollmentTrend: async (days: number = 30): Promise<EnrollmentTrendData[]> => {
    const response = await apiClient.get<BackendApiResponse<EnrollmentTrendData[]>>(
      '/admin/analytics/enrollment-trend',
      { params: { days } },
    );
    return response.data.data ?? [];
  },

  /**
   * Get top instructors by enrollments
   */
  getTopInstructors: async (limit: number = 5): Promise<TopInstructor[]> => {
    const response = await apiClient.get<BackendApiResponse<TopInstructor[]>>(
      '/admin/analytics/top-instructors',
      { params: { limit } },
    );
    return response.data.data ?? [];
  },

  /**
   * Get recent activities
   */
  getRecentActivities: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await apiClient.get<BackendApiResponse<RecentActivity[]>>(
      '/admin/activities/recent',
      { params: { limit } },
    );
    return response.data.data ?? [];
  },

  // ============================================================================
  // User Management
  // ============================================================================

  /**
   * Get all users with filters and pagination
   */
  getUsers: async (filters: UserListFilters = {}): Promise<UserListResponse> => {
    const params: Record<string, unknown> = {
      page: filters.page,
      limit: filters.per_page,
      search: filters.search,
    };

    if (filters.role && filters.role !== 'all') {
      params.role = filters.role;
    }

    if (filters.status && filters.status !== 'all') {
      params.status = filters.status;
    }

    const response = await apiClient.get<BackendApiResponse<any>>('/admin/users', { params });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Không thể tải danh sách người dùng');
    }

    // Hai dạng response có thể có:
    // 1) Admin route: { success, data: User[], pagination }
    // 2) Alias route: { success, data: { users: User[], pagination } }
    const body: any = response.data;

    let rawUsers: BackendUser[] = [];
    let rawPagination: any = body.pagination;

    if (Array.isArray(body.data)) {
      rawUsers = body.data as BackendUser[];
    } else if (body.data && Array.isArray(body.data.users)) {
      rawUsers = body.data.users as BackendUser[];
      rawPagination = body.data.pagination ?? rawPagination;
    }

    const users = rawUsers.map(mapBackendUserToAdminUser);

    if (!rawPagination) {
      rawPagination = {
        page: filters.page ?? 1,
        limit: filters.per_page ?? rawUsers.length ?? 0,
        total: rawUsers.length,
        totalPages: 1,
      };
    }

    return {
      users,
      pagination: mapBackendPaginationToUserList(rawPagination),
    };
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<AdminUser> => {
    const response = await apiClient.get<BackendApiResponse<BackendUser>>(`/admin/users/${userId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Không tìm thấy người dùng');
    }
    return mapBackendUserToAdminUser(response.data.data);
  },

  /**
   * Get user statistics
   */
  getUserStats: async (userId: string): Promise<UserStats> => {
    // Per-user statistics endpoint chưa tồn tại trên backend.
    // Tạm thời trả về cấu trúc rỗng an toàn để UI vẫn hoạt động.
    void userId;
    const fallback: UserStats = {
      enrolled_courses_count: 0,
      completed_courses_count: 0,
      quiz_average_score: 0,
      courses_created_count: 0,
      total_students_count: 0,
      total_revenue: 0,
    };
    return fallback;
  },

  /**
   * Create new user
   */
  createUser: async (data: CreateUserPayload): Promise<AdminUser> => {
    // Split full_name into first_name and last_name for backend
    const nameParts = data.full_name.trim().split(' ');
    const firstName = nameParts[0] || data.full_name;
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const payload: Record<string, unknown> = {
      email: data.email,
      password: data.password,
      role: data.role,
      status: data.status === 'active' ? 'active' : 'suspended',
      first_name: firstName,
      last_name: lastName,
      bio: data.bio,
      avatar: data.avatar_url,
    };

    const response = await apiClient.post<BackendApiResponse<BackendUser>>('/admin/users', payload);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Tạo người dùng thất bại');
    }
    return mapBackendUserToAdminUser(response.data.data);
  },

  /**
   * Update user
   */
  updateUser: async (userId: string, data: UpdateUserPayload): Promise<AdminUser> => {
    const payload: Record<string, unknown> = {
      email: data.email,
      role: data.role,
      status: data.status,
      bio: data.bio,
      avatar: data.avatar_url,
    };

    if (data.full_name) {
      const [firstName, ...rest] = data.full_name.split(' ');
      payload.first_name = firstName;
      payload.last_name = rest.join(' ') || firstName;
    }

    if (data.password) {
      payload.password = data.password;
    }

    const response = await apiClient.patch<BackendApiResponse<BackendUser>>(
      `/admin/users/${userId}`,
      payload,
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Cập nhật người dùng thất bại');
    }
    return mapBackendUserToAdminUser(response.data.data);
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<BackendApiResponse<{ success: boolean }>>(
      `/admin/users/${userId}`,
    );
    return {
      success: response.data.success,
      message: response.data.message,
    };
  },

  /**
   * Change user role
   */
  changeUserRole: async (
    userId: string,
    role: 'student' | 'instructor' | 'admin' | 'super_admin'
  ): Promise<AdminUser> => {
    const response = await apiClient.patch<BackendApiResponse<BackendUser>>(
      `/admin/users/${userId}/role`,
      { role },
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Thay đổi vai trò thất bại');
    }
    return mapBackendUserToAdminUser(response.data.data);
  },

  /**
   * Change user status (activate/suspend)
   */
  changeUserStatus: async (
    userId: string,
    status: 'active' | 'suspended'
  ): Promise<AdminUser> => {
    const backendStatus = status === 'active' ? 'active' : 'suspended';
    const response = await apiClient.patch<BackendApiResponse<BackendUser>>(
      `/admin/users/${userId}/status`,
      { status: backendStatus },
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Thay đổi trạng thái thất bại');
    }
    return mapBackendUserToAdminUser(response.data.data);
  },

  /**
   * Reset user password (send email)
   */
  resetUserPassword: async (
    userId: string
  ): Promise<{ success: boolean; message: string }> => {
    void userId;
    return {
      success: false,
      message: 'Chức năng đặt lại mật khẩu chưa được triển khai trên máy chủ',
    };
  },

  /**
   * Send notification to user
   */
  sendUserNotification: async (
    userId: string,
    data: { title: string; message: string; type?: string }
  ): Promise<{ success: boolean; message: string }> => {
    void userId;
    void data;
    return {
      success: false,
      message: 'Chức năng gửi thông báo chưa được triển khai trên máy chủ',
    };
  },

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  /**
   * Perform bulk action on users
   */
  bulkAction: async (
    payload: BulkActionPayload
  ): Promise<{ success: boolean; message: string; affected: number }> => {
    void payload;
    return {
      success: false,
      message: 'Chức năng thao tác hàng loạt chưa được triển khai trên máy chủ',
      affected: 0,
    };
  },

  /**
   * Export users to CSV
   */
  exportUsers: async (filters: UserListFilters = {}): Promise<Blob> => {
    void filters;
    return new Blob([], { type: 'text/csv' });
  },
};

export default adminApi;
