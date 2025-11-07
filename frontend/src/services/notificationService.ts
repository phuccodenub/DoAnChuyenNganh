/**
 * Notification Service - REST API Integration
 * Handles notifications, user preferences, and real-time updates
 */

import { apiClient } from './apiClient'

// Simple event emitter for UI subscriptions
class Emitter {
  private target = new EventTarget()
  on(event: string, handler: EventListenerOrEventListenerObject) { this.target.addEventListener(event, handler as EventListener) }
  off(event: string, handler: EventListenerOrEventListenerObject) { this.target.removeEventListener(event, handler as EventListener) }
  emit(event: string, detail?: any) { this.target.dispatchEvent(new CustomEvent(event, { detail })) }
}

export interface Notification {
  id: string
  user_id: number
  type: 'info' | 'success' | 'warning' | 'error' | 'chat' | 'quiz' | 'assignment' | 'stream' | 'course'
  title: string
  message: string
  data?: any
  course_id?: string
  is_read: boolean
  created_at: string
  updated_at: string
  // UI-friendly camelCase aliases (optional)
  isRead?: boolean
  createdAt?: string
  actions?: NotificationAction[]
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
  courseId?: string // accept camelCase from components
  actions?: NotificationAction[]
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
export interface NotificationAction {
  id: string
  label: string
  type?: 'primary' | 'secondary' | 'danger'
  action: 'navigate' | 'retry' | string
  data?: any
}

type Listener = (payload?: any) => void

class NotificationService {
  private emitter = new Emitter()
  private store = new Map<number, Notification[]>() // userId -> notifications
  private prefs = new Map<number, NotificationPreferences>()

  initialize(socketService?: any) {
    // Optionally wire to socket events in demo mode
    if (socketService && typeof socketService.on === 'function') {
      // Example: relay socket events to UI
      socketService.on('notification', (n: Notification) => this.ingest(n))
    }
  }

  on(event: string, handler: Listener) { this.emitter.on(event, ((e: CustomEvent) => handler(e.detail)) as EventListener) }
  off(event: string, handler: Listener) { this.emitter.off(event, handler as unknown as EventListener) }

  private ingest(n: Notification) {
    // normalize aliases for UI usage
    n.isRead = n.is_read
    n.createdAt = n.created_at
    const list = this.store.get(n.user_id) || []
    this.store.set(n.user_id, [n, ...list])
    this.emitter.emit('notification-received', n)
    this.emitter.emit('toast-notification', n)
  }

  // Notifications API - overloads for UI demo (sync) and hooks (async)
  getNotifications(userId: number): Notification[]
  getNotifications(params?: PaginationParams): Promise<ApiResponse<{ notifications: Notification[]; pagination: any }>>
  getNotifications(arg?: number | PaginationParams): any {
    if (typeof arg === 'number') {
      return this.store.get(arg) || []
    }
    const notifications = Array.from(this.store.values()).flat()
    return Promise.resolve({ success: true, message: 'ok', data: { notifications, pagination: {} } })
  }

  getUserPreferences(userId: number): NotificationPreferences {
    if (!this.prefs.has(userId)) {
      this.prefs.set(userId, {
        quietHours: { enabled: false, start: '22:00', end: '07:00' },
        categories: { chat: true, quiz: true, assignment: true, stream: true, announcement: true },
        enableSound: true,
        enableBrowser: false,
      })
    }
    return this.prefs.get(userId)!
  }

  updatePreferences(userId: number, updates: Partial<NotificationPreferences>) {
    const current = this.getUserPreferences(userId)
    this.prefs.set(userId, { ...current, ...updates, categories: { ...current.categories, ...(updates as any).categories } })
  }

  getUnreadCount(userId: number): number
  getUnreadCount(): Promise<ApiResponse<{ count: number }>>
  getUnreadCount(arg?: number): any {
    if (typeof arg === 'number') {
      return (this.store.get(arg) || []).filter(n => !(n.isRead ?? n.is_read)).length
    }
    const count = (this.store.get(0) || []).filter(n => !(n.isRead ?? n.is_read)).length
    return Promise.resolve({ success: true, message: 'ok', data: { count } })
  }

  async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    this.store.forEach((list, uid) => {
      const idx = list.findIndex(n => n.id === notificationId)
      if (idx >= 0) {
        const n = { ...list[idx], is_read: true, isRead: true }
        list[idx] = n
        this.store.set(uid, [...list])
        this.emitter.emit('notification-read', n)
      }
    })
    return { success: true, message: 'ok', data: (null as unknown as Notification) }
  }

  markAllAsRead(userId: number): void
  markAllAsRead(): Promise<ApiResponse<null>>
  markAllAsRead(arg?: number): any {
    const uid = typeof arg === 'number' ? arg : 0
    const list = this.store.get(uid) || []
    const updated = list.map(n => ({ ...n, is_read: true, isRead: true }))
    this.store.set(uid, updated)
    this.emitter.emit('notification-read', { all: true })
    if (typeof arg !== 'number') {
      return Promise.resolve({ success: true, message: 'ok', data: null })
    }
  }

  clearNotification(notificationId: string): void {
    this.store.forEach((list, uid) => {
      const updated = list.filter(n => n.id !== notificationId)
      if (updated.length !== list.length) {
        this.store.set(uid, updated)
        this.emitter.emit('notification-cleared', { id: notificationId })
      }
    })
  }

  clearAllNotifications(userId: number): void {
    this.store.set(userId, [])
    this.emitter.emit('notification-cleared', { all: true })
  }

  async deleteNotification(_notificationId: string): Promise<ApiResponse<null>> {
    // Remove globally for demo
    this.store.forEach((list, uid) => {
      this.store.set(uid, list.filter(n => n.id !== _notificationId))
    })
    this.emitter.emit('notification-cleared', { id: _notificationId })
    return { success: true, message: 'ok', data: null }
  }

  // Demo creators used by NotificationDemo
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const userId = 0 // demo user
    const notification: Notification = {
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user_id: userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      course_id: data.course_id ?? data.courseId,
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isRead: false,
      createdAt: new Date().toISOString(),
      actions: data.actions,
    }
    this.ingest(notification)
    return notification
  }

  createSystemNotification(title: string, message: string, type: Exclude<Notification['type'], 'chat' | 'quiz' | 'assignment' | 'course'> = 'info') {
    return this.createNotification({ type, title, message })
  }

  createCourseAnnouncement(courseId: string, title: string, message: string) {
    return this.createNotification({ type: 'course', title, message, courseId })
  }

  // HTTP-backed APIs (unused in demo UI but kept for real integration)
  async fetchNotifications(params?: PaginationParams): Promise<ApiResponse<{ notifications: Notification[], pagination: any }>> {
    const response = await apiClient.get<ApiResponse<{ notifications: Notification[], pagination: any }>>('/notifications', { params })
    return response.data
  }

  async getCourseNotifications(courseId: string, _params?: PaginationParams): Promise<ApiResponse<{ notifications: Notification[]; pagination: any }>> {
    const notifications = Array.from(this.store.values()).flat().filter(n => n.course_id === courseId)
    return Promise.resolve({ success: true, message: 'ok', data: { notifications, pagination: {} } })
  }

  async fetchUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count')
    return response.data
  }

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
  }

  getNotificationIcon(type: Notification['type']): string {
    const icons: Record<string, string> = {
      info: '🔔', success: '✅', warning: '⚠️', error: '❌', chat: '💬', quiz: '📝', assignment: '📋', stream: '📹', course: '📚'
    }
    return icons[type] || '🔔'
  }

  getNotificationColor(type: Notification['type']): string {
    const colors: Record<string, string> = {
      info: 'blue', success: 'green', warning: 'yellow', error: 'red', chat: 'purple', quiz: 'indigo', assignment: 'orange', stream: 'pink', course: 'teal'
    }
    return colors[type] || 'gray'
  }
}

const notificationService = new NotificationService()
export { notificationService }
export default notificationService