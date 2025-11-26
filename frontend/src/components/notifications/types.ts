export type NotificationType = 'assignment' | 'update' | 'achievement' | 'certificate' | 'reply' | 'discussion';

export interface NotificationData {
  points?: number;
  fileName?: string;
  fileUrl?: string;
  commentContent?: string;
  userAvatar?: string;
  userName?: string;
  courseName?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  data?: NotificationData;
}
