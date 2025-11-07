import { io, Socket } from 'socket.io-client'
import type { User } from '@/stores/authStore'

const DEMO_MODE = (import.meta as any).env?.VITE_DEMO_MODE === 'true'
const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:3000'
const DEBUG_MODE = (import.meta as any).env?.VITE_DEBUG_MODE === 'true'

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

/**
 * Typed event map cho socket on/off/emit
 * Kèm theo một số payload tối thiểu để tránh vòng phụ thuộc
 */

// Lightweight payload types to tránh circular deps với quizService
type QuizQuestionPayload = {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  options?: string[];
  points: number;
  timeLimit?: number;
};

type QuizPayload = {
  id: string;
  title: string;
  courseId: string;
  questions: QuizQuestionPayload[];
};

type LiveQuizSessionPayload = {
  quizId: string;
  courseId: string;
  currentQuestionIndex: number;
  timeRemaining?: number;
};

type QuizResponsePublic = {
  id: string;
  quizId: string;
  questionId: string;
  userId: number;
  isCorrect?: boolean;
  pointsEarned: number;
  timeSpent: number;
  submittedAt: string;
};

export type SocketEvents = {
  // Chat events (incoming)
  'message-received': ChatMessage;
  'new-message': ChatMessage;

  // Presence (incoming)
  'user-joined': OnlineUser;
  'user-left': number;
  'online-users': OnlineUser[];

  // Chat/course actions (outgoing)
  'send-message': ChatMessage;
  'join-course': { courseId: string };
  'leave-course': { courseId: string };

  // Live stream control (outgoing)
  'start-livestream': { courseId?: string; streamId: string };
  'join-livestream': { courseId?: string };
  'end-livestream': { courseId?: string };

  // Live stream status (incoming)
  'livestream-started': { courseId: string; instructorName: string; streamId: string };
  'livestream-ended': { courseId: string };

  // WebRTC signaling (bi-directional)
  'webrtc-offer': { offer: RTCSessionDescriptionInit; courseId?: string; to?: string; from?: string };
  'webrtc-answer': { answer: RTCSessionDescriptionInit; courseId?: string; to?: string; from?: string };
  'ice-candidate': { candidate: RTCIceCandidateInit; courseId?: string; to?: string; from?: string };
  // Alias used by some components
  'webrtc-ice-candidate': { candidate: RTCIceCandidateInit; courseId?: string; to?: string; from?: string };

  // Participant events (incoming)
  'participant-joined-stream': { participantId: string };
  'participant-left-stream': { participantId: string };

  // Quiz control (outgoing)
  'start-quiz': { courseId: string; quizId: string; quiz: QuizPayload; session: LiveQuizSessionPayload };
  'end-quiz': { courseId: string; quizId: string };
  'quiz-next-question': {
    courseId: string;
    quizId: string;
    questionIndex: number;
    question: QuizQuestionPayload;
    timeRemaining?: number;
  };
  'quiz-response': { courseId: string; response: QuizResponsePublic };

  // Quiz status (incoming)
  'quiz-started': { courseId: string; quiz: QuizPayload; session: LiveQuizSessionPayload };
  'quiz-ended': { courseId: string; quizId: string };
  // 'quiz-next-question' và 'quiz-response' dùng 2 chiều đã được định nghĩa phía trên
};

class SocketService {
  private socket: Socket | null = null
  private currentUser: User | null = null
  private currentCourse: string | null = null
  private callbacks: Map<keyof SocketEvents, Function[]> = new Map()
  private listenerWrappers: Map<string, Map<Function, (data: unknown) => void>> = new Map()

  connect(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Skip socket connection in demo mode
        if (DEMO_MODE) {
          if (DEBUG_MODE) {
            console.log('🔄 Socket: Demo mode - skipping real connection')
          }
          this.currentUser = user
          setTimeout(() => resolve(), 100)
          return
        }

        const authStorage = localStorage.getItem('auth-storage')
        if (!authStorage) {
          throw new Error('No auth token found')
        }

        const parsed = JSON.parse(authStorage)
        const token = parsed?.state?.token

        if (!token) {
          throw new Error('No valid token found')
        }

        if (DEBUG_MODE) {
          console.log('🔄 Socket: Connecting to', SOCKET_URL, 'with auth token')
        }

        this.socket = io(SOCKET_URL, {
          auth: {
            token,
            userId: user.id,
            role: user.role
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5
        })

        this.currentUser = user

        this.socket.on('connect', () => {
          if (DEBUG_MODE) {
            console.log('✅ Socket: Connected to server:', this.socket?.id)
          }
          resolve()
        })

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket: Connection error:', error.message)
          reject(error)
        })

        this.socket.on('disconnect', (reason) => {
          if (DEBUG_MODE) {
            console.log('🔌 Socket: Disconnected from server. Reason:', reason)
          }
        })

        this.socket.on('reconnect', (attemptNumber) => {
          if (DEBUG_MODE) {
            console.log('🔄 Socket: Reconnected after', attemptNumber, 'attempts')
          }
        })

        this.socket.on('reconnect_error', (error) => {
          console.error('❌ Socket: Reconnection error:', error.message)
        })

        // Handle authentication errors
        this.socket.on('auth_error', (error) => {
          console.error('❌ Socket: Authentication error:', error)
          this.disconnect()
          reject(new Error('Socket authentication failed'))
        })

      } catch (error) {
        console.error('❌ Socket: Connection setup failed:', error)
        reject(error)
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
    } else if (DEMO_MODE) {
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
  on<K extends keyof SocketEvents>(event: K, callback: (data: SocketEvents[K]) => void): void {
    const eventKey = event as string
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback as unknown as Function)

    // Set up socket listener if connected
    if (this.socket) {
      const listener = (data: unknown) => callback(data as SocketEvents[K])
      let map = this.listenerWrappers.get(eventKey)
      if (!map) {
        map = new Map()
        this.listenerWrappers.set(eventKey, map)
      }
      map.set(callback as unknown as Function, listener)
      this.socket.on(eventKey, listener)
    }
  }

  off<K extends keyof SocketEvents>(event: K, callback: (data: SocketEvents[K]) => void): void {
    const eventKey = event as string
    if (this.callbacks.has(event)) {
      const callbacks = this.callbacks.get(event)!
      const index = callbacks.indexOf(callback as unknown as Function)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }

    if (this.socket) {
      const map = this.listenerWrappers.get(eventKey)
      const listener = map?.get(callback as unknown as Function)
      if (listener) {
        this.socket.off(eventKey, listener)
        map!.delete(callback as unknown as Function)
      }
    }
  }

  emit<K extends keyof SocketEvents>(event: K, data: SocketEvents[K]): void {
    const eventKey = event as string
    if (this.socket?.connected) {
      this.socket.emit(eventKey, data)
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