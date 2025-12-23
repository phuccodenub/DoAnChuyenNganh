import { httpClient } from '../http/client';

/**
 * Notification Types - matching backend schema
 */
export interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  link_url?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  related_resource_type?: string;
  related_resource_id?: string;
  metadata?: Record<string, unknown>;
  is_broadcast: boolean;
  scheduled_at?: string;
  expires_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  } | null;
  // Recipient-specific fields (from notification_recipients)
  is_read?: boolean;
  read_at?: string;
  is_archived?: boolean;
  archived_at?: string;
}

export interface NotificationQueryParams {
  limit?: number;
  offset?: number;
  category?: string;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unread_count: number;
  };
}

/**
 * Target Audience for bulk notifications
 */
export type TargetAudienceType = 'all' | 'role' | 'course' | 'users';

export interface TargetAudience {
  type: TargetAudienceType;
  role?: 'student' | 'instructor' | 'STUDENT' | 'INSTRUCTOR' | 'admin' | 'ADMIN';
  course_id?: string;
  user_ids?: string[];
}

export interface BulkNotificationDto {
  notification_type: string;
  title: string;
  message: string;
  target_audience: TargetAudience;
  link_url?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  related_resource_type?: string;
  related_resource_id?: string;
  scheduled_at?: string;
  expires_at?: string;
  metadata?: Record<string, unknown>;
}

export interface BulkNotificationResponse {
  success: boolean;
  message: string;
  data: {
    notification: {
      id: string;
      title: string;
      message: string;
      notification_type: string;
      created_at: string;
    };
    recipients_count: number;
  };
}

export interface SentNotificationQueryParams {
  notification_type?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

/**
 * Notification API Service
 */
export const notificationApi = {
  /**
   * Get all notifications for current user
   */
  async getMyNotifications(params?: NotificationQueryParams): Promise<NotificationsResponse> {
    const response = await httpClient.get('/notifications/me', { params });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await httpClient.get('/notifications/me/unread-count');
    return response.data;
  },

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await httpClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    // Backend route sử dụng POST /notifications/me/mark-all-read
    const response = await httpClient.post('/notifications/me/mark-all-read');
    return response.data;
  },

  /**
   * Archive old notifications (older than X days)
   */
  async archiveOld(daysOld: number = 30): Promise<{ success: boolean; message: string; data: { archived_count: number } }> {
    const response = await httpClient.post('/notifications/me/archive-old', { days: daysOld });
    return response.data;
  },

  /**
   * Archive single notification
   */
  async archiveNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await httpClient.put(`/notifications/${notificationId}/archive`);
    return response.data;
  },

  /**
   * Delete notification (Admin only)
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await httpClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Get notification by ID
   */
  async getById(notificationId: string): Promise<{ success: boolean; message: string; data: Notification }> {
    const response = await httpClient.get(`/notifications/${notificationId}`);
    return response.data;
  },

  // ============================================
  // Admin/Instructor APIs
  // ============================================

  /**
   * Send bulk notification (Admin/Instructor)
   */
  async sendBulk(dto: BulkNotificationDto): Promise<BulkNotificationResponse> {
    const response = await httpClient.post('/notifications/bulk', dto);
    return response.data;
  },

  /**
   * Get sent notifications (Admin/Instructor)
   */
  async getSentNotifications(params?: SentNotificationQueryParams): Promise<NotificationsResponse> {
    const response = await httpClient.get('/notifications/sent', { params });
    return response.data;
  },

  /**
   * Get all notifications in system (Admin only)
   */
  async getAllNotifications(params?: SentNotificationQueryParams): Promise<NotificationsResponse> {
    const response = await httpClient.get('/notifications/all', { params });
    return response.data;
  },
};
