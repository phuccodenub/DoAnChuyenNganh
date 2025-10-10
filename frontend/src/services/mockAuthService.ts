import type { User } from '@/stores/authStore'
import { getMockUser, getMockUserById, mockUsers } from './mockData'

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock token generation
const generateMockToken = (user: User): string => {
  return btoa(JSON.stringify({ userId: user.id, email: user.email, role: user.role, name: user.full_name }))
}

export interface MockAuthResponse {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
  }
}

export interface MockProfileResponse {
  success: boolean
  message: string
  data?: {
    user: User
  }
}

export const mockAuthService = {
  /**
   * Mock login - uses predefined users with password 'demo123'
   */
  async login(email: string, password: string): Promise<MockAuthResponse> {
    await delay(800) // Simulate network delay
    
    const user = getMockUser(email, password)
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password. Use demo123 as password for any demo user.'
      }
    }
    
    const token = generateMockToken(user)
    
    return {
      success: true,
      message: 'Login successful',
      data: { user, token }
    }
  },

  /**
   * Mock registration - creates a new demo user
   */
  async register(data: {
    email: string
    password: string
    full_name: string
    role?: 'student' | 'instructor'
  }): Promise<MockAuthResponse> {
    await delay(1000) // Simulate network delay
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === data.email)
    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists'
      }
    }
    
    // Create new mock user
    const newUser: User = {
      id: mockUsers.length + 1,
      email: data.email,
      full_name: data.full_name,
      role: data.role || 'student',
      avatar_url: data.role === 'instructor' 
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
      is_active: true,
      email_verified: true,
      created_at: new Date().toISOString()
    }
    
    // Add to mock users (in memory only)
    mockUsers.push(newUser)
    
    const token = generateMockToken(newUser)
    
    return {
      success: true,
      message: 'Registration successful',
      data: { user: newUser, token }
    }
  },

  /**
   * Mock logout
   */
  async logout(): Promise<void> {
    await delay(200)
    // In a real app, you might invalidate the token on the server
    return
  },

  /**
   * Mock get profile
   */
  async getProfile(): Promise<MockProfileResponse> {
    await delay(300)
    
    // Get current user from token (stored in localStorage)
    const authStorage = localStorage.getItem('auth-storage')
    if (!authStorage) {
      return {
        success: false,
        message: 'No authentication token found'
      }
    }
    
    try {
      const parsed = JSON.parse(authStorage)
      const userId = parsed?.state?.user?.id
      
      if (!userId) {
        return {
          success: false,
          message: 'Invalid authentication token'
        }
      }
      
      const user = getMockUserById(userId)
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        }
      }
      
      return {
        success: true,
        message: 'Profile retrieved successfully',
        data: { user }
      }
    } catch {
      return {
        success: false,
        message: 'Failed to parse authentication token'
      }
    }
  },

  /**
   * Mock update profile
   */
  async updateProfile(data: Partial<User>): Promise<MockProfileResponse> {
    await delay(600)
    
    // Get current user
    const authStorage = localStorage.getItem('auth-storage')
    if (!authStorage) {
      return {
        success: false,
        message: 'No authentication token found'
      }
    }
    
    try {
      const parsed = JSON.parse(authStorage)
      const userId = parsed?.state?.user?.id
      
      if (!userId) {
        return {
          success: false,
          message: 'Invalid authentication token'
        }
      }
      
      const userIndex = mockUsers.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        return {
          success: false,
          message: 'User not found'
        }
      }
      
      // Update user data
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        ...data,
        id: userId // Ensure ID doesn't change
      }
      
      return {
        success: true,
        message: 'Profile updated successfully',
        data: { user: mockUsers[userIndex] }
      }
    } catch {
      return {
        success: false,
        message: 'Failed to update profile'
      }
    }
  },

  /**
   * Mock verify token
   */
  async verifyToken(): Promise<{ success: boolean; message: string; data?: { userId: number; userRole: string } }> {
    await delay(200)
    
    const authStorage = localStorage.getItem('auth-storage')
    if (!authStorage) {
      return {
        success: false,
        message: 'No authentication token found'
      }
    }
    
    try {
      const parsed = JSON.parse(authStorage)
      const user = parsed?.state?.user
      
      if (!user?.id) {
        return {
          success: false,
          message: 'Invalid authentication token'
        }
      }
      
      return {
        success: true,
        message: 'Token is valid',
        data: {
          userId: user.id,
          userRole: user.role
        }
      }
    } catch {
      return {
        success: false,
        message: 'Failed to verify token'
      }
    }
  }
}

// Demo accounts for easy testing
export const DEMO_ACCOUNTS = {
  instructor: {
    email: 'john.instructor@example.com',
    password: 'demo123',
    name: 'Dr. John Smith'
  },
  student: {
    email: 'jane.student@example.com', 
    password: 'demo123',
    name: 'Jane Doe'
  },
  student2: {
    email: 'alice.student@example.com',
    password: 'demo123', 
    name: 'Alice Johnson'
  },
  instructor2: {
    email: 'sarah.instructor@example.com',
    password: 'demo123',
    name: 'Prof. Sarah Wilson'
  }
}