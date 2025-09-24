import { apiClient } from './apiClient'
import type { User } from '@/stores/authStore'

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
  }
}

export interface ProfileResponse {
  success: boolean
  message: string
  data: {
    user: User
  }
}

export interface VerifyResponse {
  success: boolean
  message: string
  data: {
    userId: number
    userRole: string
  }
}

export const authService = {
  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password
    })
    return response.data
  },

  /**
   * Register new user
   */
  async register(data: {
    email: string
    password: string
    full_name: string
    role?: 'student' | 'instructor'
  }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      // Silent fail - logout should work even if API call fails
      console.warn('Logout API call failed:', error)
    }
  },

  /**
   * Get user profile
   */
  async getProfile(): Promise<ProfileResponse> {
    const response = await apiClient.get<ProfileResponse>('/auth/profile')
    return response.data
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<ProfileResponse> {
    const response = await apiClient.put<ProfileResponse>('/auth/profile', data)
    return response.data
  },

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    })
    return response.data
  },

  /**
   * Verify token
   */
  async verifyToken(): Promise<VerifyResponse> {
    const response = await apiClient.get<VerifyResponse>('/auth/verify')
    return response.data
  }
}