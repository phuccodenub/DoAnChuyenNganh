import axios from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'
import toast from 'react-hot-toast'

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
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
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
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
            toast.error('Session expired. Please login again.')
          }
          break
          
        case 403:
          // Forbidden
          toast.error('Access denied. You do not have permission.')
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
          }
          break
          
        case 429:
          // Rate limit exceeded
          toast.error('Too many requests. Please wait a moment and try again.')
          break
          
        case 500:
          // Server error
          toast.error('Server error. Please try again later.')
          break
          
        default:
          // Other errors
          if (data?.message) {
            toast.error(data.message)
          } else {
            toast.error('An unexpected error occurred.')
          }
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Other errors
      toast.error('An unexpected error occurred.')
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