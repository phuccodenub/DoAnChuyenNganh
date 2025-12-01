import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { notificationApi, Notification, NotificationQueryParams, BulkNotificationDto, SentNotificationQueryParams } from '@/services/api/notifications.api';
import { QUERY_KEYS } from '@/constants/queryKeys';

// Re-export types
export type { Notification, BulkNotificationDto, SentNotificationQueryParams } from '@/services/api/notifications.api';

/**
 * Fetch user notifications with pagination and filters
 */
export function useNotifications(params?: NotificationQueryParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.notifications.list(params || {})],
    queryFn: () => notificationApi.getMyNotifications(params),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    select: (response) => ({
      notifications: response.data?.notifications || [],
      total: response.data?.total || 0,
      unreadCount: response.data?.notifications?.filter((n: Notification) => !n.is_read).length || 0,
    }),
  });
}

/**
 * Fetch unread notification count
 */
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.unreadCount,
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 10000, // 10 seconds
    gcTime: 1 * 60 * 1000, // 1 minute
    select: (response) => response.data?.unread_count || 0,
  });
}

/**
 * Mark single notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate both notifications list and unread count
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.unreadCount });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể đánh dấu đã đọc';
      toast.error(message);
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      toast.success('Đã đánh dấu tất cả thông báo đã đọc');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.unreadCount });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể đánh dấu tất cả thông báo';
      toast.error(message);
    },
  });
}

/**
 * Archive old notifications
 */
export function useArchiveOldNotifications() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (daysOld: number) => notificationApi.archiveOld(daysOld),
    onSuccess: (response) => {
      toast.success(`Đã lưu trữ ${response.data?.archived_count || 0} thông báo cũ`);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể lưu trữ thông báo cũ';
      toast.error(message);
    },
  });
}

/**
 * Archive single notification
 */
export function useArchiveNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.archiveNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể lưu trữ thông báo';
      toast.error(message);
    },
  });
}

/**
 * Delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.deleteNotification(notificationId),
    onSuccess: () => {
      toast.success('Đã xóa thông báo');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.unreadCount });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể xóa thông báo';
      toast.error(message);
    },
  });
}

// ============================================
// Admin/Instructor Hooks
// ============================================

/**
 * Send bulk notification (Admin/Instructor)
 */
export function useSendBulkNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: BulkNotificationDto) => notificationApi.sendBulk(dto),
    onSuccess: (response) => {
      toast.success(`Đã gửi thông báo đến ${response.data?.recipients_count || 0} người`);
      queryClient.invalidateQueries({ queryKey: ['sent-notifications'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Không thể gửi thông báo';
      toast.error(message);
    },
  });
}

/**
 * Get sent notifications (Admin/Instructor)
 */
export function useSentNotifications(params?: SentNotificationQueryParams) {
  return useQuery({
    queryKey: ['sent-notifications', params],
    queryFn: () => notificationApi.getSentNotifications(params),
    staleTime: 60000, // 1 minute
    select: (response) => ({
      notifications: response.data?.notifications || [],
      total: response.data?.total || 0,
    }),
  });
}

/**
 * Get all notifications in system (Admin only)
 */
export function useAllNotifications(params?: SentNotificationQueryParams) {
  return useQuery({
    queryKey: ['all-notifications', params],
    queryFn: () => notificationApi.getAllNotifications(params),
    staleTime: 60000, // 1 minute
    select: (response) => ({
      notifications: response.data?.notifications || [],
      total: response.data?.total || 0,
    }),
  });
}
