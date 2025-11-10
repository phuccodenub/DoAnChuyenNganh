import axios from 'axios'
import type { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'
import i18n from '@/i18n'

// Get API base URL from environment with versioning support
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api/v1.3.0'
const DEBUG_MODE = (import.meta as any).env?.VITE_DEBUG_MODE === 'true'

// Create axios instance with enhanced configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased for file uploads
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Retry configuration constants
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

// Request interceptor to add authentication token and logging
apiClient.interceptors.request.use(
  (config) => {
    // Add request timestamp for debugging
    if (DEBUG_MODE) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data
      })
    }

    // Get token from localStorage (Zustand persist storage)
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage)
        const token = parsed?.state?.token
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        console.warn('Failed to parse auth storage:', error)
      }
    }
    
    // Add request timestamp for tracking (using headers)
    config.headers['X-Request-Start'] = Date.now().toString()
    
    return config
  },
  (error) => {
    if (DEBUG_MODE) {
      console.error('❌ Request Error:', error)
    }
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in debug mode
    if (DEBUG_MODE) {
      const startTime = response.config.headers['X-Request-Start']
      const duration = startTime ? Date.now() - parseInt(startTime) : 0
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data
      })
    }
    return response
  },
  (error: AxiosError) => {
    // Log error in debug mode
    if (DEBUG_MODE) {
      const startTime = error.config?.headers?.['X-Request-Start']
      const duration = startTime ? Date.now() - parseInt(startTime) : 0
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        duration: `${duration}ms`,
        error: error.response?.data || error.message
      })
    }

    // Handle common errors
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as any
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          if (data?.message !== 'Access token is required') {
            // Clear auth state and redirect to login
            localStorage.removeItem('auth-storage')
            window.location.href = '/login'
            toast.error(i18n.t('errors.sessionExpired'))
          }
          break
          
        case 403:
          // Forbidden
          toast.error(i18n.t('errors.accessDenied'))
          break
          
        case 404:
          // Not found
          if (data?.message) {
            toast.error(data.message)
          }
          break
          
        case 422:
          // Validation error
          if (data?.errors && Array.isArray(data.errors)) {
            const errorMessages = data.errors.map((err: any) => err.message).join(', ')
            toast.error(errorMessages)
          } else if (data?.message) {
            toast.error(data.message)
          } else {
            toast.error(i18n.t('errors.validation'))
          }
          break
          
        case 429:
          // Rate limit exceeded
          toast.error(i18n.t('errors.tooManyRequests'))
          break
          
        case 500:
          // Server error
          toast.error(i18n.t('errors.server'))
          break
          
        default:
          // Other errors
          if (data?.message) {
            toast.error(data.message)
          } else {
            toast.error(i18n.t('errors.unexpected'))
          }
      }
    } else if (error.request) {
      // Network error
      toast.error(i18n.t('errors.network'))
    } else {
      // Other errors
      toast.error(i18n.t('errors.unexpected'))
    }
    
    return Promise.reject(error)
  }
)

// Export commonly used methods
export const get = <T>(url: string, config = {}) => 
  apiClient.get<T>(url, config)

export const post = <T>(url: string, data?: any, config = {}) => 
  apiClient.post<T>(url, data, config)

export const put = <T>(url: string, data?: any, config = {}) => 
  apiClient.put<T>(url, data, config)

export const patch = <T>(url: string, data?: any, config = {}) => 
  apiClient.patch<T>(url, data, config)

export const del = <T>(url: string, config = {}) => 
  apiClient.delete<T>(url, config)

export default apiClient