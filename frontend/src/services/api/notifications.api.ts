import { httpClient } from '../http/client';

interface NotificationQueryParams {
  page?: number;
  limit?: number;
  is_read?: boolean;
  is_archived?: boolean;
}

export const notificationApi = {
  /**
   * Get all notifications for current user
   */
  async getNotifications(page: number = 1, limit: number = 20, isRead?: boolean, isArchived?: boolean) {
    const params: NotificationQueryParams = { page, limit };
    if (isRead !== undefined) params.is_read = isRead;
    if (isArchived !== undefined) params.is_archived = isArchived;

    const response = await httpClient.get('/notifications/me', { params });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    const response = await httpClient.get('/notifications/me/unread-count');
    return response.data;
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId: string) {
    const response = await httpClient.post(`/notifications/${notificationId}/mark-read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const response = await httpClient.post('/notifications/me/mark-all-read');
    return response.data;
  },

  /**
   * Archive old notifications (older than X days)
   */
  async archiveOld(daysOld: number = 30) {
    const response = await httpClient.post('/notifications/me/archive-old', { days_old: daysOld });
    return response.data;
  },

  /**
   * Archive single notification
   */
  async archiveNotification(notificationId: string) {
    const response = await httpClient.post(`/notifications/${notificationId}/archive`);
    return response.data;
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string) {
    const response = await httpClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};
