import { Course } from '@/services/api/course.api';
import { httpClient } from '@/services/http/client';

/**
 * Get course thumbnail URL
 * Handles both thumbnail_url and thumbnail fields
 * Converts relative paths to full URLs
 */
export function getCourseThumbnailUrl(course: Course): string | null {
  // ưu tiên thumbnail_url, fallback về thumbnail
  const thumbnail = course.thumbnail_url || course.thumbnail;
  
  if (!thumbnail) {
    return null;
  }

  // Nếu đã là full URL (http/https), trả về trực tiếp
  if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
    return thumbnail;
  }

  // Nếu là relative path bắt đầu bằng /, thêm origin
  if (thumbnail.startsWith('/')) {
    // Nếu là path của frontend public folder
    if (thumbnail.startsWith('/GekLearn') || thumbnail.startsWith('/auth_') || thumbnail.startsWith('/learning_')) {
      return `${window.location.origin}${thumbnail}`;
    }
    // Nếu là API path, thêm API base URL
    const apiBaseUrl = httpClient.defaults.baseURL || import.meta.env.VITE_API_BASE_URL || '';
    return `${apiBaseUrl}${thumbnail}`;
  }

  // Nếu là filename hoặc path không bắt đầu bằng /, có thể là:
  // 1. Path trong uploads folder -> dùng /files/view endpoint
  // 2. Hoặc thêm API base URL
  const apiBaseUrl = httpClient.defaults.baseURL || import.meta.env.VITE_API_BASE_URL || '';
  
  // Nếu path chứa / hoặc có vẻ là file path, dùng files/view endpoint
  if (thumbnail.includes('/') || thumbnail.includes('.')) {
    // Extract folder and filename
    const parts = thumbnail.split('/');
    if (parts.length >= 2) {
      const folder = parts[0];
      const filename = parts.slice(1).join('/');
      return `${apiBaseUrl}/files/view/${folder}/${filename}`;
    }
  }
  
  // Default: thêm API base URL
  return `${apiBaseUrl}${thumbnail.startsWith('/') ? '' : '/'}${thumbnail}`;
}

