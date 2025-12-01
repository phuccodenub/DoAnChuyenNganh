export interface CreateNotificationDto {
  notification_type: string;
  title: string;
  message: string;
  link_url?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: 'course' | 'assignment' | 'quiz' | 'grade' | 'message' | 'system' | 'announcement' | 'achievement';
  related_resource_type?: string;
  related_resource_id?: string;
  scheduled_at?: string | Date | null;
  expires_at?: string | Date | null;
  is_broadcast?: boolean;
  metadata?: Record<string, unknown>;
  recipient_ids?: string[];
}

export interface QueryNotificationsDto {
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  limit?: number;
  offset?: number;
}

/**
 * Target audience for bulk notifications
 */
export interface TargetAudience {
  type: 'all' | 'role' | 'course' | 'users';
  role?: 'student' | 'instructor' | 'STUDENT' | 'INSTRUCTOR' | 'admin' | 'ADMIN';
  course_id?: string;
  user_ids?: string[];
}

/**
 * DTO for sending bulk notifications (Admin/Instructor)
 */
export interface BulkNotificationDto {
  notification_type: string;
  title: string;
  message: string;
  link_url?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: 'course' | 'assignment' | 'quiz' | 'grade' | 'message' | 'system' | 'announcement' | 'achievement';
  related_resource_type?: string;
  related_resource_id?: string;
  scheduled_at?: string | Date | null;
  expires_at?: string | Date | null;
  metadata?: Record<string, unknown>;
  target_audience: TargetAudience;
}

/**
 * Response for bulk notification creation
 */
export interface BulkNotificationResponse {
  notification: {
    id: string;
    title: string;
    message: string;
    notification_type: string;
    created_at: Date;
  };
  recipients_count: number;
}

/**
 * Query params for sent notifications (Admin/Instructor)
 */
export interface QuerySentNotificationsDto {
  notification_type?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

































