/**
 * Notification Service - REST API Integration
 * Handles notifications, user preferences, and real-time updates
 */

import { apiClient } from './apiClient'

export interface Notification {
  id: string
  user_id: number
  type: 'info' | 'success' | 'warning' | 'error' | 'chat' | 'quiz' | 'assignment' | 'livestream' | 'course'
  title: string
  message: string
  data?: any
  course_id?: string
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface CreateNotificationData {
  type: Notification['type']
  title: string
  message: string
  data?: any
  course_id?: string
}

export interface NotificationPreferences {
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  categories: {
    chat: boolean
    quiz: boolean
    assignment: boolean
    stream: boolean
    announcement: boolean
  }
  enableSound: boolean
  enableBrowser: boolean
}

const notificationService = {
  async getNotifications(params?: PaginationParams): Promise<ApiResponse<{ notifications: Notification[], pagination: any }>> {
    const response = await apiClient.get<ApiResponse<{ notifications: Notification[], pagination: any }>>('/notifications', { params })
    return response.data
  },

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count')
    return response.data
  },

  async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    const response = await apiClient.put<ApiResponse<Notification>>(`/notifications/${notificationId}/read`)
    return response.data
  },

  async markAllAsRead(): Promise<ApiResponse<null>> {
    const response = await apiClient.put<ApiResponse<null>>('/notifications/mark-all-read')
    return response.data
  },

  async deleteNotification(notificationId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/notifications/${notificationId}`)
    return response.data
  },

  async createNotification(data: CreateNotificationData): Promise<ApiResponse<Notification>> {
    const response = await apiClient.post<ApiResponse<Notification>>('/notifications', data)
    return response.data
  },

  async getCourseNotifications(courseId: string, params?: PaginationParams): Promise<ApiResponse<{ notifications: Notification[], pagination: any }>> {
    const response = await apiClient.get<ApiResponse<{ notifications: Notification[], pagination: any }>>(`/notifications/course/${courseId}`, { params })
    return response.data
  },

  formatTime(timestamp: string): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  },

  getNotificationIcon(type: Notification['type']): string {
    const icons = {
      info: '🔔',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      chat: '💬',
      quiz: '📝',
      assignment: '📋',
      livestream: '📹',
      course: '📚'
    }
    return icons[type] || '🔔'
  },

  getNotificationColor(type: Notification['type']): string {
    const colors = {
      info: 'blue',
      success: 'green',
      warning: 'yellow',
      error: 'red',
      chat: 'purple',
      quiz: 'indigo',
      assignment: 'orange',
      livestream: 'pink',
      course: 'teal'
    }
    return colors[type] || 'gray'
  }
}
 
export { notificationService }
export default notificationService