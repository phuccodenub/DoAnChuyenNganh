export interface CreateNotificationDto {
  notification_type: string;
  title: string;
  message: string;
  link_url?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  category?: 'course' | 'assignment' | 'quiz' | 'grade' | 'message' | 'system' | 'announcement';
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










