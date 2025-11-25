import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '@/services/api/admin.api';
import type {
  AdminUser,
  AdminDashboardStats,
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

// ============================================================================
// Query Keys
// ============================================================================

export const adminQueryKeys = {
  all: ['admin'] as const,
  dashboardStats: () => [...adminQueryKeys.all, 'dashboard-stats'] as const,
  userGrowth: (days: number) => [...adminQueryKeys.all, 'user-growth', days] as const,
  enrollmentTrend: (days: number) => [...adminQueryKeys.all, 'enrollment-trend', days] as const,
  topInstructors: (limit: number) => [...adminQueryKeys.all, 'top-instructors', limit] as const,
  recentActivities: (limit: number) => [...adminQueryKeys.all, 'recent-activities', limit] as const,
  users: (filters: UserListFilters) => [...adminQueryKeys.all, 'users', filters] as const,
  user: (userId: string) => [...adminQueryKeys.all, 'user', userId] as const,
  userStats: (userId: string) => [...adminQueryKeys.all, 'user-stats', userId] as const,
};

// ============================================================================
// Dashboard & Statistics Hooks
// ============================================================================

/**
 * Get admin dashboard statistics
 */
export function useAdminDashboardStats() {
  return useQuery({
    queryKey: adminQueryKeys.dashboardStats(),
    queryFn: () => adminApi.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get user growth data
 */
export function useUserGrowth(days: number = 30) {
  return useQuery<UserGrowthData[]>({
    queryKey: adminQueryKeys.userGrowth(days),
    queryFn: () => adminApi.getUserGrowth(days),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get enrollment trend data
 */
export function useEnrollmentTrend(days: number = 30) {
  return useQuery<EnrollmentTrendData[]>({
    queryKey: adminQueryKeys.enrollmentTrend(days),
    queryFn: () => adminApi.getEnrollmentTrend(days),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get top instructors
 */
export function useTopInstructors(limit: number = 5) {
  return useQuery<TopInstructor[]>({
    queryKey: adminQueryKeys.topInstructors(limit),
    queryFn: () => adminApi.getTopInstructors(limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get recent activities
 */
export function useRecentActivities(limit: number = 10) {
  return useQuery<RecentActivity[]>({
    queryKey: adminQueryKeys.recentActivities(limit),
    queryFn: () => adminApi.getRecentActivities(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ============================================================================
// User Management Hooks
// ============================================================================

/**
 * Get users list with filters
 */
export function useAdminUsers(filters: UserListFilters = {}) {
  return useQuery({
    queryKey: adminQueryKeys.users(filters),
    queryFn: () => adminApi.getUsers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get user by ID
 */
export function useAdminUser(userId: string, enabled: boolean = true) {
  return useQuery<AdminUser>({
    queryKey: adminQueryKeys.user(userId),
    queryFn: () => adminApi.getUserById(userId),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get user statistics
 */
export function useUserStats(userId: string, enabled: boolean = true) {
  return useQuery<UserStats>({
    queryKey: adminQueryKeys.userStats(userId),
    queryFn: () => adminApi.getUserStats(userId),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// User Mutation Hooks
// ============================================================================

/**
 * Create new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserPayload) => adminApi.createUser(data),
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
      toast.success('Tạo người dùng thành công');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Tạo người dùng thất bại';
      toast.error(message);
    },
  });
}

/**
 * Update user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserPayload }) =>
      adminApi.updateUser(userId, data),
    onSuccess: (updatedUser) => {
      // Update user in cache
      queryClient.setQueryData(adminQueryKeys.user(updatedUser.id), updatedUser);
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: [...adminQueryKeys.all, 'users'] });
      toast.success('Cập nhật người dùng thành công');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Cập nhật người dùng thất bại';
      toast.error(message);
    },
  });
}

/**
 * Delete user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      // Invalidate all users queries
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
      toast.success('Xóa người dùng thành công');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Xóa người dùng thất bại';
      toast.error(message);
    },
  });
}

/**
 * Change user role with optimistic update
 */
export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: AdminUser['role'] }) =>
      adminApi.changeUserRole(userId, role),
    onMutate: async ({ userId, role }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.user(userId) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<AdminUser>(adminQueryKeys.user(userId));

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData<AdminUser>(adminQueryKeys.user(userId), {
          ...previousUser,
          role,
        });
      }

      return { previousUser };
    },
    onSuccess: (updatedUser) => {
      // Update with server response
      queryClient.setQueryData(adminQueryKeys.user(updatedUser.id), updatedUser);
      queryClient.invalidateQueries({ queryKey: [...adminQueryKeys.all, 'users'] });
      toast.success('Thay đổi vai trò thành công');
    },
    onError: (error: { response?: { data?: { message?: string } } }, _variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(
          adminQueryKeys.user(context.previousUser.id),
          context.previousUser
        );
      }
      const message = error?.response?.data?.message || 'Thay đổi vai trò thất bại';
      toast.error(message);
    },
  });
}

/**
 * Change user status with optimistic update
 */
export function useChangeUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'suspended' }) =>
      adminApi.changeUserStatus(userId, status),
    onMutate: async ({ userId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.user(userId) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<AdminUser>(adminQueryKeys.user(userId));

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData<AdminUser>(adminQueryKeys.user(userId), {
          ...previousUser,
          status,
          is_active: status === 'active',
        });
      }

      return { previousUser };
    },
    onSuccess: (updatedUser) => {
      // Update with server response
      queryClient.setQueryData(adminQueryKeys.user(updatedUser.id), updatedUser);
      queryClient.invalidateQueries({ queryKey: [...adminQueryKeys.all, 'users'] });
      toast.success('Thay đổi trạng thái thành công');
    },
    onError: (error: { response?: { data?: { message?: string } } }, _variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(
          adminQueryKeys.user(context.previousUser.id),
          context.previousUser
        );
      }
      const message = error?.response?.data?.message || 'Thay đổi trạng thái thất bại';
      toast.error(message);
    },
  });
}

/**
 * Reset user password
 */
export function useResetUserPassword() {
  return useMutation({
    mutationFn: (userId: string) => adminApi.resetUserPassword(userId),
    onSuccess: (response) => {
      toast.success(response.message || 'Đã gửi email đặt lại mật khẩu');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Gửi email đặt lại mật khẩu thất bại';
      toast.error(message);
    },
  });
}

/**
 * Send notification to user
 */
export function useSendUserNotification() {
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: { title: string; message: string; type?: string };
    }) => adminApi.sendUserNotification(userId, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Gửi thông báo thành công');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Gửi thông báo thất bại';
      toast.error(message);
    },
  });
}

/**
 * Bulk action on users
 */
export function useBulkAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkActionPayload) => adminApi.bulkAction(payload),
    onSuccess: (response) => {
      // Invalidate all users queries
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
      toast.success(response.message || `Đã thực hiện trên ${response.affected} người dùng`);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Thao tác hàng loạt thất bại';
      toast.error(message);
    },
  });
}

/**
 * Export users to CSV
 */
export function useExportUsers() {
  return useMutation({
    mutationFn: (filters: UserListFilters) => adminApi.exportUsers(filters),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Xuất dữ liệu thành công');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message || 'Xuất dữ liệu thất bại';
      toast.error(message);
    },
  });
}
