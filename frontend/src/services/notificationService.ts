/**
 * Notification Service
 * Handles real-time notifications, alerts, and updates using Socket.IO and browser storage
 */

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'chat' | 'quiz' | 'assignment' | 'stream'
  title: string
  message: string
  data?: any // Additional data for specific notification types
  userId: number
  courseId?: string
  isRead: boolean
  createdAt: string
  expiresAt?: string
  actions?: NotificationAction[]
}

export interface NotificationAction {
  id: string
  label: string
  type: 'primary' | 'secondary' | 'danger'
  action: string // Action identifier
  data?: any
}

export interface NotificationPreferences {
  userId: number
  enablePush: boolean
  enableSound: boolean
  enableBrowser: boolean
  categories: {
    chat: boolean
    quiz: boolean
    assignment: boolean
    stream: boolean
    announcement: boolean
  }
  quietHours: {
    enabled: boolean
    start: string // "22:00"
    end: string   // "08:00"
  }
}

class NotificationService {
  private notifications: Map<string, Notification> = new Map()
  private preferences: Map<number, NotificationPreferences> = new Map()
  private socketService: any = null
  private callbacks: Map<string, Function[]> = new Map()
  private audio: HTMLAudioElement | null = null
  private permission: NotificationPermission = 'default'

  constructor() {
    this.callbacks.set('notification-received', [])
    this.callbacks.set('notification-read', [])
    this.callbacks.set('notification-cleared', [])
    this.initializeAudio()
    this.requestBrowserPermission()
  }

  async initialize(socketService: any): Promise<void> {
    this.socketService = socketService
    this.setupSocketListeners()
    await this.loadFromStorage()
    await this.initializeDemoData()
  }

  private initializeAudio(): void {
    // Create notification sound (using data URI for a simple beep)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    
    // Create a simple notification sound using Web Audio API
    this.audio = new Audio()
  }

  private async requestBrowserPermission(): Promise<void> {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission()
    }
  }

  private setupSocketListeners(): void {
    if (!this.socketService) return

    // Listen for various real-time events
    this.socketService.on('new-message', (data: any) => {
      this.createNotification({
        type: 'chat',
        title: 'New Message',
        message: `${data.user.full_name}: ${data.message.substring(0, 50)}${data.message.length > 50 ? '...' : ''}`,
        courseId: data.courseId,
        data: data
      })
    })

    this.socketService.on('quiz-started', (data: any) => {
      this.createNotification({
        type: 'quiz',
        title: 'Quiz Started',
        message: `${data.quiz.title} is now available`,
        courseId: data.courseId,
        data: data,
        actions: [
          {
            id: 'join-quiz',
            label: 'Join Quiz',
            type: 'primary',
            action: 'navigate',
            data: { path: `/courses/${data.courseId}`, tab: 'quizzes' }
          }
        ]
      })
    })

    this.socketService.on('livestream-started', (data: any) => {
      this.createNotification({
        type: 'stream',
        title: 'Live Stream Started',
        message: `${data.instructorName} started a live stream`,
        courseId: data.courseId,
        data: data,
        actions: [
          {
            id: 'join-stream',
            label: 'Join Stream',
            type: 'primary',
            action: 'navigate',
            data: { path: `/course/${data.courseId}/live` }
          }
        ]
      })
    })

    // Generic notification listener
    this.socketService.on('notification', (data: any) => {
      this.createNotification(data)
    })
  }

  // Create and display notification
  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    // Get current user - this will be passed from the calling component
    // For now, we'll use a basic approach that works in demo mode
    let user: any = null
    try {
      const { useAuthStore } = await import('@/stores/authStore')
      user = useAuthStore.getState().user
    } catch (error) {
      console.warn('Could not get current user:', error)
    }
    if (!user) return Promise.reject('No user logged in')

    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: notificationData.type || 'info',
      title: notificationData.title || 'Notification',
      message: notificationData.message || '',
      data: notificationData.data,
      userId: user.id,
      courseId: notificationData.courseId,
      isRead: false,
      createdAt: new Date().toISOString(),
      expiresAt: notificationData.expiresAt,
      actions: notificationData.actions || []
    }

    // Check if user should receive this notification
    const prefs = this.getUserPreferences(user.id)
    if (!this.shouldShowNotification(notification, prefs)) {
      return notification
    }

    // Store notification
    this.notifications.set(notification.id, notification)
    await this.saveToStorage()

    // Display notification
    this.displayNotification(notification, prefs)

    // Emit event
    this.emit('notification-received', notification)

    return notification
  }

  private shouldShowNotification(notification: Notification, prefs: NotificationPreferences): boolean {
    // Check quiet hours
    if (prefs.quietHours.enabled) {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      if (currentTime >= prefs.quietHours.start || currentTime <= prefs.quietHours.end) {
        return false
      }
    }

    // Check category preferences
    const categoryMap: { [key: string]: keyof NotificationPreferences['categories'] } = {
      'chat': 'chat',
      'quiz': 'quiz',
      'assignment': 'assignment',
      'stream': 'stream',
      'info': 'announcement',
      'success': 'announcement',
      'warning': 'announcement',
      'error': 'announcement'
    }

    const category = categoryMap[notification.type]
    if (category && !prefs.categories[category]) {
      return false
    }

    return true
  }

  private displayNotification(notification: Notification, prefs: NotificationPreferences): void {
    // Play sound
    if (prefs.enableSound) {
      this.playNotificationSound()
    }

    // Show browser notification
    if (prefs.enableBrowser && this.permission === 'granted') {
      this.showBrowserNotification(notification)
    }

    // Show in-app notification (toast)
    this.showToastNotification(notification)
  }

  private playNotificationSound(): void {
    // Create a simple notification beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      console.warn('Could not play notification sound:', error)
    }
  }

  private showBrowserNotification(notification: Notification): void {
    try {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: this.getNotificationIcon(notification.type),
        tag: notification.id,
        requireInteraction: notification.actions && notification.actions.length > 0
      })

      browserNotif.onclick = () => {
        window.focus()
        this.markAsRead(notification.id)
        browserNotif.close()
      }

      // Auto-close after 5 seconds
      setTimeout(() => browserNotif.close(), 5000)
    } catch (error) {
      console.warn('Could not show browser notification:', error)
    }
  }

  private showToastNotification(notification: Notification): void {
    // This will be handled by a Toast component in the UI
    // For now, we'll just emit the event
    this.emit('toast-notification', notification)
  }

  private getNotificationIcon(type: Notification['type']): string {
    const icons = {
      info: '🔔',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      chat: '💬',
      quiz: '📝',
      assignment: '📋',
      stream: '📹'
    }
    return icons[type] || '🔔'
  }

  // Get notifications for user
  getNotifications(userId: number): Notification[] {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Get unread notifications count
  getUnreadCount(userId: number): number {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.isRead)
      .length
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId)
    if (notification && !notification.isRead) {
      notification.isRead = true
      this.notifications.set(notificationId, notification)
      await this.saveToStorage()
      this.emit('notification-read', notification)
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId: number): Promise<void> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.isRead)
    
    for (const notification of userNotifications) {
      notification.isRead = true
      this.notifications.set(notification.id, notification)
    }
    
    await this.saveToStorage()
    this.emit('notifications-read-all', { userId })
  }

  // Clear notification
  async clearNotification(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId)
    if (notification) {
      this.notifications.delete(notificationId)
      await this.saveToStorage()
      this.emit('notification-cleared', notification)
    }
  }

  // Clear all notifications for user
  async clearAllNotifications(userId: number): Promise<void> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
    
    for (const notification of userNotifications) {
      this.notifications.delete(notification.id)
    }
    
    await this.saveToStorage()
    this.emit('notifications-cleared-all', { userId })
  }

  // User preferences management
  getUserPreferences(userId: number): NotificationPreferences {
    return this.preferences.get(userId) || this.getDefaultPreferences(userId)
  }

  private getDefaultPreferences(userId: number): NotificationPreferences {
    return {
      userId,
      enablePush: true,
      enableSound: true,
      enableBrowser: true,
      categories: {
        chat: true,
        quiz: true,
        assignment: true,
        stream: true,
        announcement: true
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    }
  }

  async updatePreferences(userId: number, preferences: Partial<NotificationPreferences>): Promise<void> {
    const current = this.getUserPreferences(userId)
    const updated = { ...current, ...preferences }
    this.preferences.set(userId, updated)
    await this.saveToStorage()
  }

  // Storage management
  private async saveToStorage(): Promise<void> {
    try {
      const data = {
        notifications: Array.from(this.notifications.entries()),
        preferences: Array.from(this.preferences.entries())
      }
      localStorage.setItem('lms-notifications', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save notifications to storage:', error)
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('lms-notifications')
      if (stored) {
        const data = JSON.parse(stored)
        this.notifications = new Map(data.notifications || [])
        this.preferences = new Map(data.preferences || [])
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error)
    }
  }

  // Demo data initialization
  async initializeDemoData(): Promise<void> {
    let user: any = null
    try {
      const { useAuthStore } = await import('@/stores/authStore')
      user = useAuthStore.getState().user
    } catch (error) {
      console.warn('Could not get current user for demo data:', error)
      return
    }
    if (!user) return

    // Create some demo notifications
    const demoNotifications: Partial<Notification>[] = [
      {
        type: 'info',
        title: 'Welcome to the LMS',
        message: 'Explore the real-time features including chat, quizzes, and live streaming.',
        createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        type: 'assignment',
        title: 'New Assignment Posted',
        message: 'React Component Assignment is due next week.',
        courseId: '1',
        createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        actions: [
          {
            id: 'view-assignment',
            label: 'View Assignment',
            type: 'primary',
            action: 'navigate',
            data: { path: '/courses/1', tab: 'files' }
          }
        ]
      },
      {
        type: 'chat',
        title: 'New Message in React Course',
        message: 'Dr. John Smith: "Great questions in today\'s discussion!"',
        courseId: '1',
        createdAt: new Date(Date.now() - 900000).toISOString() // 15 minutes ago
      }
    ]

    for (const notif of demoNotifications) {
      await this.createNotification(notif)
    }
  }

  // Utility methods
  createSystemNotification(title: string, message: string, type: Notification['type'] = 'info'): Promise<Notification> {
    return this.createNotification({
      type,
      title,
      message,
      expiresAt: new Date(Date.now() + 300000).toISOString() // 5 minutes
    })
  }

  createCourseAnnouncement(courseId: string, title: string, message: string): Promise<Notification> {
    return this.createNotification({
      type: 'info',
      title,
      message,
      courseId,
      actions: [
        {
          id: 'view-course',
          label: 'View Course',
          type: 'primary',
          action: 'navigate',
          data: { path: `/courses/${courseId}` }
        }
      ]
    })
  }

  // Event handling
  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    if (this.callbacks.has(event)) {
      const callbacks = this.callbacks.get(event)!
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any): void {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event)!.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${event} callback:`, error)
        }
      })
    }
  }

  // Cleanup
  destroy(): void {
    this.callbacks.clear()
    this.socketService = null
  }
}

// Export singleton instance
export const notificationService = new NotificationService()
export default notificationService