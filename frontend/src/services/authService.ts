import { apiClient } from './apiClient'
import type { User } from '@/stores/authStore.enhanced'

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
    refresh_token?: string // Optional for backward compatibility
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
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.get(`/auth/verify-email/${token}`)
    return response.data
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh-token', {
      refresh_token: refreshToken
    })
    return response.data
  },

  // ===== 2FA METHODS =====

  /**
   * Enable 2FA for user account
   */
  async enable2FA(): Promise<{ success: boolean; message: string; data: { qrCodeUrl: string; secret: string } }> {
    const response = await apiClient.post('/auth/2fa/enable')
    return response.data
  },

  /**
   * Verify 2FA setup with TOTP code
   */
  async verify2FASetup(code: string): Promise<{ success: boolean; message: string; data: { backupCodes: string[] } }> {
    const response = await apiClient.post('/auth/2fa/verify-setup', {
      code
    })
    return response.data
  },

  /**
   * Disable 2FA for user account
   */
  async disable2FA(code: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/2fa/disable', {
      code
    })
    return response.data
  },

  /**
   * Login with 2FA code
   */
  async loginWith2FA(email: string, password: string, code: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login-2fa', {
      email,
      password,
      code
    })
    return response.data
  }
}