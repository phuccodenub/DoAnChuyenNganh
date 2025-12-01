/**
 * Notification types matching backend schema
 */
export type NotificationType = 
  | 'assignment' 
  | 'update' 
  | 'achievement' 
  | 'certificate' 
  | 'reply' 
  | 'discussion'
  | 'course'
  | 'quiz'
  | 'grade'
  | 'announcement'
  | 'message'
  | 'system'
  | 'reminder';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationSender {
  id: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export interface NotificationData {
  points?: number;
  fileName?: string;
  fileUrl?: string;
  commentContent?: string;
  userAvatar?: string;
  userName?: string;
  courseName?: string;
  courseId?: string;
  [key: string]: unknown;
}

/**
 * Notification interface for frontend components
 * Maps from API response
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  priority?: NotificationPriority;
  linkUrl?: string;
  sender?: NotificationSender;
  data?: NotificationData;
}

/**
 * Raw notification from API
 */
export interface ApiNotification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  link_url?: string;
  priority?: NotificationPriority;
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
  sender?: NotificationSender | null;
  // Recipient-specific fields
  is_read?: boolean;
  read_at?: string;
  is_archived?: boolean;
  archived_at?: string;
}

/**
 * Safely parse date string to Date object
 */
function safeParseDate(dateStr: string | undefined | null): Date {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  // Check if date is valid
  if (isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}

/**
 * Transform API notification to frontend Notification
 */
export function transformNotification(apiNotif: ApiNotification): Notification {
  return {
    id: apiNotif.id,
    type: (apiNotif.notification_type || 'system') as NotificationType,
    title: apiNotif.title || 'Thông báo',
    description: apiNotif.message || '',
    timestamp: safeParseDate(apiNotif.created_at),
    isRead: apiNotif.is_read ?? false,
    priority: apiNotif.priority,
    linkUrl: apiNotif.link_url,
    sender: apiNotif.sender ?? undefined,
    data: {
      ...(apiNotif.metadata || {}),
      courseName: apiNotif.metadata?.course_name as string,
      courseId: apiNotif.related_resource_id,
    } as NotificationData,
  };
}
