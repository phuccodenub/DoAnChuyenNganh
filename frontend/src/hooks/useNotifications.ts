import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { notificationApi } from '@/services/api/notifications.api';
import { QUERY_KEYS } from '@/constants/queryKeys';

export interface Notification {
  id: number;
  user_id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  related_resource_type?: string;
  related_resource_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface NotificationsResponse {
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface UnreadCountResponse {
  unread_count: number;
}

/**
 * Fetch user notifications with pagination and filters
 */
export function useNotifications(page: number = 1, limit: number = 20, isRead?: boolean, isArchived?: boolean) {
  return useQuery({
    queryKey: [...QUERY_KEYS.notifications.list({ page, limit, isRead, isArchived })],
    queryFn: () => notificationApi.getNotifications(page, limit, isRead, isArchived),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
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
  });
}

/**
 * Mark single notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: number) => notificationApi.markAsRead(notificationId),
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
    onSuccess: (response: any) => {
      toast.success(`Đã lưu trữ ${response.archived_count || 0} thông báo cũ`);
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
    mutationFn: (notificationId: number) => notificationApi.archiveNotification(notificationId),
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
    mutationFn: (notificationId: number) => notificationApi.deleteNotification(notificationId),
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
