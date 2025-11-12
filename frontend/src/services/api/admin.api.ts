import { apiClient } from '../http/client';
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
    const response = await apiClient.get<AdminDashboardStats>('/admin/dashboard/stats');
    return response.data;
  },

  /**
   * Get user growth data (last 30 days)
   */
  getUserGrowth: async (days: number = 30): Promise<UserGrowthData[]> => {
    const response = await apiClient.get<UserGrowthData[]>('/admin/analytics/user-growth', {
      params: { days },
    });
    return response.data;
  },

  /**
   * Get course enrollment trend data
   */
  getEnrollmentTrend: async (days: number = 30): Promise<EnrollmentTrendData[]> => {
    const response = await apiClient.get<EnrollmentTrendData[]>('/admin/analytics/enrollment-trend', {
      params: { days },
    });
    return response.data;
  },

  /**
   * Get top instructors by enrollments
   */
  getTopInstructors: async (limit: number = 5): Promise<TopInstructor[]> => {
    const response = await apiClient.get<TopInstructor[]>('/admin/analytics/top-instructors', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get recent activities
   */
  getRecentActivities: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await apiClient.get<RecentActivity[]>('/admin/activities/recent', {
      params: { limit },
    });
    return response.data;
  },

  // ============================================================================
  // User Management
  // ============================================================================

  /**
   * Get all users with filters and pagination
   */
  getUsers: async (filters: UserListFilters = {}): Promise<UserListResponse> => {
    const response = await apiClient.get<UserListResponse>('/admin/users', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: number): Promise<AdminUser> => {
    const response = await apiClient.get<AdminUser>(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Get user statistics
   */
  getUserStats: async (userId: number): Promise<UserStats> => {
    const response = await apiClient.get<UserStats>(`/admin/users/${userId}/stats`);
    return response.data;
  },

  /**
   * Create new user
   */
  createUser: async (data: CreateUserPayload): Promise<AdminUser> => {
    const response = await apiClient.post<AdminUser>('/admin/users', data);
    return response.data;
  },

  /**
   * Update user
   */
  updateUser: async (userId: number, data: UpdateUserPayload): Promise<AdminUser> => {
    const response = await apiClient.patch<AdminUser>(`/admin/users/${userId}`, data);
    return response.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (userId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/admin/users/${userId}`
    );
    return response.data;
  },

  /**
   * Change user role
   */
  changeUserRole: async (
    userId: number,
    role: 'student' | 'instructor' | 'admin' | 'super_admin'
  ): Promise<AdminUser> => {
    const response = await apiClient.patch<AdminUser>(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  /**
   * Change user status (activate/suspend)
   */
  changeUserStatus: async (
    userId: number,
    status: 'active' | 'suspended'
  ): Promise<AdminUser> => {
    const response = await apiClient.patch<AdminUser>(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  /**
   * Reset user password (send email)
   */
  resetUserPassword: async (
    userId: number
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/admin/users/${userId}/reset-password`
    );
    return response.data;
  },

  /**
   * Send notification to user
   */
  sendUserNotification: async (
    userId: number,
    data: { title: string; message: string; type?: string }
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/admin/users/${userId}/notify`,
      data
    );
    return response.data;
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
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      affected: number;
    }>('/admin/users/bulk-action', payload);
    return response.data;
  },

  /**
   * Export users to CSV
   */
  exportUsers: async (filters: UserListFilters = {}): Promise<Blob> => {
    const response = await apiClient.get<Blob>('/admin/users/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default adminApi;
