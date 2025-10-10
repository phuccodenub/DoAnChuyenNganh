import { io, Socket } from 'socket.io-client'
import type { User } from '@/stores/authStore'

export interface ChatMessage {
  id: string
  courseId: string
  userId: number
  user: {
    id: number
    full_name: string
    role: string
    avatar_url?: string
  }
  message: string
  timestamp: string
  type: 'text' | 'system' | 'announcement'
}

export interface OnlineUser {
  id: number
  full_name: string
  role: string
  avatar_url?: string
  status: 'online' | 'away' | 'offline'
}

class SocketService {
  private socket: Socket | null = null
  private currentUser: User | null = null
  private currentCourse: string | null = null
  private callbacks: Map<string, Function[]> = new Map()

  connect(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // In demo mode, we'll connect to localhost:3003 where our demo server should be running
        this.socket = io('http://localhost:3003', {
          auth: {
            demo: true,
            userId: user.id,
            userName: user.full_name,
            userRole: user.role,
            userAvatar: user.avatar_url
          },
          transports: ['websocket', 'polling']
        })

        this.currentUser = user

        this.socket.on('connect', () => {
          console.log('Connected to server:', this.socket?.id)
          resolve()
        })

        this.socket.on('connect_error', (error) => {
          console.log('Connection error:', error.message)
          // For demo mode, we'll simulate a successful connection even if server is not running
          setTimeout(() => resolve(), 500)
        })

        this.socket.on('disconnect', () => {
          console.log('Disconnected from server')
        })

      } catch (error) {
        console.error('Socket connection failed:', error)
        // For demo mode, resolve anyway
        setTimeout(() => resolve(), 500)
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.currentUser = null
    this.currentCourse = null
  }

  joinCourse(courseId: string): void {
    this.currentCourse = courseId
    if (this.socket?.connected) {
      this.socket.emit('join-course', { courseId })
    }
  }

  leaveCourse(courseId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-course', { courseId })
    }
    if (this.currentCourse === courseId) {
      this.currentCourse = null
    }
  }

  sendMessage(courseId: string, message: string): void {
    if (!this.currentUser) return

    const chatMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      courseId,
      userId: this.currentUser.id,
      user: {
        id: this.currentUser.id,
        full_name: this.currentUser.full_name,
        role: this.currentUser.role,
        avatar_url: this.currentUser.avatar_url
      },
      message,
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    // If socket is connected, emit to server
    if (this.socket?.connected) {
      this.socket.emit('send-message', chatMessage)
    } else {
      // For demo mode, simulate message sending
      this.simulateMessage(chatMessage)
    }
  }

  private simulateMessage(message: ChatMessage): void {
    // Simulate server response after a short delay
    setTimeout(() => {
      // Broadcast the message back to simulate real-time behavior
      if (this.socket) {
        this.socket.emit('message-received', message)
      }
    }, 100)
  }

  onMessage(callback: (message: ChatMessage) => void): void {
    if (this.socket) {
      this.socket.on('message-received', callback)
      this.socket.on('new-message', callback)
    }
  }

  onUserJoined(callback: (user: OnlineUser) => void): void {
    if (this.socket) {
      this.socket.on('user-joined', callback)
    }
  }

  onUserLeft(callback: (userId: number) => void): void {
    if (this.socket) {
      this.socket.on('user-left', callback)
    }
  }

  onOnlineUsers(callback: (users: OnlineUser[]) => void): void {
    if (this.socket) {
      this.socket.on('online-users', callback)
    }
  }

  offMessage(callback: (message: ChatMessage) => void): void {
    if (this.socket) {
      this.socket.off('message-received', callback)
      this.socket.off('new-message', callback)
    }
  }

  offUserJoined(callback: (user: OnlineUser) => void): void {
    if (this.socket) {
      this.socket.off('user-joined', callback)
    }
  }

  offUserLeft(callback: (userId: number) => void): void {
    if (this.socket) {
      this.socket.off('user-left', callback)
    }
  }

  offOnlineUsers(callback: (users: OnlineUser[]) => void): void {
    if (this.socket) {
      this.socket.off('online-users', callback)
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  getCurrentCourse(): string | null {
    return this.currentCourse
  }

  // Generic event handling for notification service
  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback)

    // Set up socket listener if connected
    if (this.socket) {
      this.socket.on(event, callback as any)
    }
  }

  off(event: string, callback: Function): void {
    if (this.callbacks.has(event)) {
      const callbacks = this.callbacks.get(event)!
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }

    if (this.socket) {
      this.socket.off(event, callback as any)
    }
  }

  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    }
  }

  // Demo methods to trigger notification events
  simulateQuizStart(courseId: string): void {
    const event = 'quiz-started'
    const data = {
      courseId,
      quiz: {
        id: `quiz-${Date.now()}`,
        title: 'React Fundamentals Quiz',
        duration: 30
      },
      instructor: this.currentUser
    }

    if (this.callbacks.has(event)) {
      this.callbacks.get(event)!.forEach(callback => callback(data))
    }
  }

  simulateLiveStream(courseId: string): void {
    const event = 'livestream-started'
    const data = {
      courseId,
      instructorName: this.currentUser?.full_name || 'Instructor',
      streamId: `stream-${Date.now()}`
    }

    if (this.callbacks.has(event)) {
      this.callbacks.get(event)!.forEach(callback => callback(data))
    }
  }
}

// Export a singleton instance
export const socketService = new SocketService()
export default socketService