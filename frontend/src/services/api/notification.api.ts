import { apiClient } from '../http/client';

/**
 * Notification Types
 */
export interface Notification {
  id: number;
  user_id: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'course' | 'assignment' | 'quiz';
  title: string;
  message: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Notification API Service
 */
export const notificationApi = {
  /**
   * Get notifications with pagination
   */
  getNotifications: async (params?: { 
    page?: number; 
    limit?: number;
    unread_only?: boolean;
  }): Promise<NotificationListResponse> => {
    const response = await apiClient.get<NotificationListResponse>('/notifications', { 
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        unread_only: params?.unread_only || false,
      }
    });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: number): Promise<void> => {
    await apiClient.put(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId: number): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },

  /**
   * Get notification by ID
   */
  getNotification: async (notificationId: number): Promise<Notification> => {
    const response = await apiClient.get<Notification>(`/notifications/${notificationId}`);
    return response.data;
  },
};

export default notificationApi;
