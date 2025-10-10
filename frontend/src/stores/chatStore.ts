import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import socketService, { type ChatMessage, type OnlineUser } from '@/services/socketService'
import { useAuthStore } from './authStore'

interface ChatState {
  // Chat messages organized by course
  messages: Record<string, ChatMessage[]>
  
  // Online users by course
  onlineUsers: Record<string, OnlineUser[]>
  
  // Connection status
  isConnected: boolean
  isConnecting: boolean
  
  // Current active course chat
  activeCourse: string | null
  
  // Actions
  connect: () => Promise<void>
  disconnect: () => void
  joinCourse: (courseId: string) => void
  leaveCourse: (courseId: string) => void
  sendMessage: (courseId: string, message: string) => void
  addMessage: (message: ChatMessage) => void
  setOnlineUsers: (courseId: string, users: OnlineUser[]) => void
  addOnlineUser: (courseId: string, user: OnlineUser) => void
  removeOnlineUser: (courseId: string, userId: number) => void
  clearMessages: (courseId: string) => void
  
  // Demo mode helpers
  simulateOnlineUsers: (courseId: string) => void
  simulateIncomingMessage: (courseId: string) => void
  loadInitialMessages: (courseId: string) => void
}

export const useChatStore = create<ChatState>()(
  subscribeWithSelector((set, get) => ({
    messages: {},
    onlineUsers: {},
    isConnected: false,
    isConnecting: false,
    activeCourse: null,

    connect: async () => {
      const { user } = useAuthStore.getState()
      if (!user) return

      set({ isConnecting: true })
      
      try {
        await socketService.connect(user)
        set({ isConnected: true, isConnecting: false })
        
        // Set up event listeners
        socketService.onMessage((message) => {
          get().addMessage(message)
        })
        
        socketService.onUserJoined((user) => {
          const activeCourse = get().activeCourse
          if (activeCourse) {
            get().addOnlineUser(activeCourse, user)
          }
        })
        
        socketService.onUserLeft((userId) => {
          const activeCourse = get().activeCourse
          if (activeCourse) {
            get().removeOnlineUser(activeCourse, userId)
          }
        })
        
        socketService.onOnlineUsers((users) => {
          const activeCourse = get().activeCourse
          if (activeCourse) {
            get().setOnlineUsers(activeCourse, users)
          }
        })
        
      } catch (error) {
        console.error('Failed to connect to chat:', error)
        set({ isConnecting: false })
        // In demo mode, simulate connection anyway
        set({ isConnected: true })
      }
    },

    disconnect: () => {
      socketService.disconnect()
      set({ 
        isConnected: false, 
        isConnecting: false,
        activeCourse: null,
        messages: {},
        onlineUsers: {}
      })
    },

    joinCourse: (courseId: string) => {
      socketService.joinCourse(courseId)
      set({ activeCourse: courseId })
      
      // Initialize course chat if not exists
      const { messages, onlineUsers } = get()
      if (!messages[courseId]) {
        set({ 
          messages: { ...messages, [courseId]: [] },
          onlineUsers: { ...onlineUsers, [courseId]: [] }
        })
      }
      
      // Simulate online users for demo
      get().simulateOnlineUsers(courseId)
      
      // Load some initial messages for demo
      get().loadInitialMessages(courseId)
    },

    leaveCourse: (courseId: string) => {
      socketService.leaveCourse(courseId)
      if (get().activeCourse === courseId) {
        set({ activeCourse: null })
      }
    },

    sendMessage: (courseId: string, message: string) => {
      socketService.sendMessage(courseId, message)
      
      // In demo mode, if not connected, simulate the message directly
      if (!get().isConnected) {
        const { user } = useAuthStore.getState()
        if (user) {
          const chatMessage: ChatMessage = {
            id: `${Date.now()}-${Math.random()}`,
            courseId,
            userId: user.id,
            user: {
              id: user.id,
              full_name: user.full_name,
              role: user.role,
              avatar_url: user.avatar_url
            },
            message,
            timestamp: new Date().toISOString(),
            type: 'text'
          }
          get().addMessage(chatMessage)
          
          // Simulate a response after a delay
          setTimeout(() => {
            get().simulateIncomingMessage(courseId)
          }, 2000 + Math.random() * 3000)
        }
      }
    },

    addMessage: (message: ChatMessage) => {
      const { messages } = get()
      const courseMessages = messages[message.courseId] || []
      
      // Avoid duplicate messages
      if (courseMessages.find(m => m.id === message.id)) {
        return
      }
      
      set({
        messages: {
          ...messages,
          [message.courseId]: [...courseMessages, message].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
        }
      })
    },

    setOnlineUsers: (courseId: string, users: OnlineUser[]) => {
      const { onlineUsers } = get()
      set({
        onlineUsers: {
          ...onlineUsers,
          [courseId]: users
        }
      })
    },

    addOnlineUser: (courseId: string, user: OnlineUser) => {
      const { onlineUsers } = get()
      const courseUsers = onlineUsers[courseId] || []
      
      if (courseUsers.find(u => u.id === user.id)) {
        return
      }
      
      set({
        onlineUsers: {
          ...onlineUsers,
          [courseId]: [...courseUsers, user]
        }
      })
    },

    removeOnlineUser: (courseId: string, userId: number) => {
      const { onlineUsers } = get()
      const courseUsers = onlineUsers[courseId] || []
      
      set({
        onlineUsers: {
          ...onlineUsers,
          [courseId]: courseUsers.filter(u => u.id !== userId)
        }
      })
    },

    clearMessages: (courseId: string) => {
      const { messages } = get()
      set({
        messages: {
          ...messages,
          [courseId]: []
        }
      })
    },

    // Demo mode helpers
    simulateOnlineUsers: (courseId: string) => {
      const { user } = useAuthStore.getState()
      if (!user) return

      // Mock online users for demo
      const mockOnlineUsers: OnlineUser[] = [
        {
          id: user.id,
          full_name: user.full_name,
          role: user.role,
          avatar_url: user.avatar_url,
          status: 'online'
        }
      ]

      // Add some other demo users
      if (user.role === 'student') {
        mockOnlineUsers.push({
          id: 1,
          full_name: 'Dr. John Smith',
          role: 'instructor',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          status: 'online'
        })
      } else {
        mockOnlineUsers.push(
          {
            id: 2,
            full_name: 'Jane Doe',
            role: 'student',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b125b0d7?w=150&h=150&fit=crop&crop=face',
            status: 'online'
          },
          {
            id: 3,
            full_name: 'Alice Johnson',
            role: 'student',
            avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            status: 'online'
          }
        )
      }

      get().setOnlineUsers(courseId, mockOnlineUsers)
    },

    simulateIncomingMessage: (courseId: string) => {
      const { user } = useAuthStore.getState()
      if (!user) return

      const responses = [
        'That\'s a great question!',
        'I agree with that point.',
        'Let me help clarify this concept.',
        'Has anyone tried implementing this?',
        'Great example! That really helps.',
        'I\'m having trouble with this part too.',
        'The documentation mentions this approach.',
        'Thanks for sharing that resource!',
      ]

      const otherUser = user.role === 'student' 
        ? {
            id: 1,
            full_name: 'Dr. John Smith',
            role: 'instructor',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          }
        : {
            id: 2,
            full_name: 'Jane Doe',
            role: 'student',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b125b0d7?w=150&h=150&fit=crop&crop=face'
          }

      const message: ChatMessage = {
        id: `sim-${Date.now()}-${Math.random()}`,
        courseId,
        userId: otherUser.id,
        user: otherUser,
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        type: 'text'
      }

      get().addMessage(message)
    },

    loadInitialMessages: (courseId: string) => {
      // Add some initial demo messages
      const { user } = useAuthStore.getState()
      if (!user) return

      const initialMessages: ChatMessage[] = [
        {
          id: `init-1-${courseId}`,
          courseId,
          userId: 1,
          user: {
            id: 1,
            full_name: 'Dr. John Smith',
            role: 'instructor',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          },
          message: 'Welcome to the course discussion! Feel free to ask questions at any time.',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          type: 'announcement'
        },
        {
          id: `init-2-${courseId}`,
          courseId,
          userId: 2,
          user: {
            id: 2,
            full_name: 'Jane Doe',
            role: 'student',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b125b0d7?w=150&h=150&fit=crop&crop=face'
          },
          message: 'Excited to be here! Looking forward to learning.',
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          type: 'text'
        }
      ]

      const { messages } = get()
      set({
        messages: {
          ...messages,
          [courseId]: initialMessages
        }
      })
    }
  }))
)