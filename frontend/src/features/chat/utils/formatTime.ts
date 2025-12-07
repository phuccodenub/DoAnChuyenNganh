/**
 * Chat Time Formatting Utilities
 * 
 * Các hàm format thời gian cho tin nhắn và cuộc trò chuyện
 */

import { CHAT_COPY } from '../constants/copy';

/**
 * Format thời gian tin nhắn (HH:mm)
 */
export function formatMessageTime(dateString: string): string {
  if (!dateString) return '--:--';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string in formatMessageTime:', dateString);
    return '--:--';
  }
  
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format thời gian tương đối cho last message
 * Ví dụ: "Vừa xong", "5 phút trước", "Hôm qua"
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateString);
    return '';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return CHAT_COPY.time.justNow;
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${CHAT_COPY.time.minutesAgo}`;
  }

  if (diffInHours < 24) {
    return `${diffInHours} ${CHAT_COPY.time.hoursAgo}`;
  }

  if (diffInDays === 1) {
    return CHAT_COPY.time.yesterday;
  }

  if (diffInDays < 7) {
    return `${diffInDays} ${CHAT_COPY.time.daysAgo}`;
  }

  // Older than a week - show date
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
}

/**
 * Lấy label cho nhóm tin nhắn theo ngày
 */
export function getDateGroupLabel(dateString: string): string {
  if (!dateString) return 'Không xác định';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string in getDateGroupLabel:', dateString);
    return 'Không xác định';
  }
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) {
    return CHAT_COPY.time.today;
  }

  if (isSameDay(date, yesterday)) {
    return CHAT_COPY.time.yesterday;
  }

  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Kiểm tra 2 date có cùng ngày không
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Format last seen time
 */
export function formatLastSeen(dateString?: string): string {
  if (!dateString) return '';
  
  const relativeTime = formatRelativeTime(dateString);
  return `${CHAT_COPY.status.lastSeen} ${relativeTime}`;
}
