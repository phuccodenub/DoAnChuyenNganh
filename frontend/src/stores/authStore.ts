import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
// Use mock service for demo mode (switch to authService when backend is ready)
import { mockAuthService as authService } from '@/services/mockAuthService'

export interface User {
  id: number
  email: string
  full_name: string
  role: 'student' | 'instructor' | 'admin'
  avatar_url?: string
  is_active: boolean
  email_verified: boolean
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  isLoading: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>
  register: (data: {
    email: string
    password: string
    full_name: string
    role?: 'student' | 'instructor'
  }) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  initializeAuth: () => void
  setLoading: (loading: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,
      isLoading: false,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          
          const response = await authService.login(email, password)
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false
            })
            
            toast.success('Login successful!')
            return true
          } else {
            toast.error(response.message || 'Login failed')
            set({ isLoading: false })
            return false
          }
        } catch (error: any) {
          const message = error?.response?.data?.message || 'Login failed'
          toast.error(message)
          set({ isLoading: false })
          return false
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true })
          
          const response = await authService.register(data)
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false
            })
            
            toast.success('Registration successful!')
            return true
          } else {
            toast.error(response.message || 'Registration failed')
            set({ isLoading: false })
            return false
          }
        } catch (error: any) {
          const message = error?.response?.data?.message || 'Registration failed'
          toast.error(message)
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        // Call logout API if needed
        authService.logout().catch(() => {
          // Silent fail for logout API
        })
        
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
        
        toast.success('Logged out successfully')
      },

      updateProfile: async (data) => {
        try {
          set({ isLoading: true })
          
          const response = await authService.updateProfile(data)
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isLoading: false
            })
            
            toast.success('Profile updated successfully!')
            return true
          } else {
            toast.error(response.message || 'Update failed')
            set({ isLoading: false })
            return false
          }
        } catch (error: any) {
          const message = error?.response?.data?.message || 'Update failed'
          toast.error(message)
          set({ isLoading: false })
          return false
        }
      },

      initializeAuth: () => {
        const { token } = get()
        
        if (token) {
          // Verify token with backend
          authService.verifyToken()
            .then((response) => {
              if (response.success) {
                // Token is valid, get user profile
                return authService.getProfile()
              } else {
                throw new Error('Token invalid')
              }
            })
            .then((response) => {
              if (response.success && response.data) {
                set({
                  user: response.data.user,
                  isAuthenticated: true,
                  isInitialized: true
                })
              } else {
                throw new Error('Profile fetch failed')
              }
            })
            .catch(() => {
              // Token invalid or expired, clear auth state
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isInitialized: true
              })
            })
        } else {
          set({ isInitialized: true })
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)