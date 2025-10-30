/**
 * Livestream Service - REST API Integration
 * Handles livestream sessions, WebRTC signaling via backend API
 */

import { apiClient } from './apiClient'

export interface LivestreamSession {
  id: string
  course_id: string
  instructor_id: number
  title: string
  description?: string
  status: 'scheduled' | 'live' | 'ended'
  scheduled_at: string
  started_at?: string
  ended_at?: string
  viewer_count: number
  max_viewers: number
  recording_enabled: boolean
  recording_url?: string
  stream_key: string
  rtmp_url: string
  created_at: string
  updated_at: string
}

export interface LivestreamViewer {
  id: string
  session_id: string
  user_id: number
  user_name: string
  joined_at: string
  left_at?: string
  is_active: boolean
}

export interface LivestreamChat {
  id: string
  session_id: string
  user_id: number
  user_name: string
  message: string
  created_at: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface CreateSessionData {
  course_id: string
  title: string
  description?: string
  scheduled_at: string
  recording_enabled?: boolean
}

export const livestreamService = {
  /**
   * Create new livestream session (instructor only)
   */
  async createSession(data: CreateSessionData): Promise<ApiResponse<LivestreamSession>> {
    const response = await apiClient.post<ApiResponse<LivestreamSession>>('/livestreams', data)
    return response.data
  },

  /**
   * Get livestream session by ID
   */
  async getSession(sessionId: string): Promise<ApiResponse<LivestreamSession>> {
    const response = await apiClient.get<ApiResponse<LivestreamSession>>(`/livestreams/${sessionId}`)
    return response.data
  },

  /**
   * Update livestream session
   */
  async updateSession(sessionId: string, data: Partial<CreateSessionData>): Promise<ApiResponse<LivestreamSession>> {
    const response = await apiClient.put<ApiResponse<LivestreamSession>>(`/livestreams/${sessionId}`, data)
    return response.data
  },

  /**
   * Delete livestream session
   */
  async deleteSession(sessionId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/livestreams/${sessionId}`)
    return response.data
  },

  /**
   * Get livestream sessions for a course
   */
  async getCourseSessions(courseId: string, params?: PaginationParams): Promise<ApiResponse<{ sessions: LivestreamSession[], pagination: any }>> {
    const response = await apiClient.get<ApiResponse<{ sessions: LivestreamSession[], pagination: any }>>(`/livestreams/course/${courseId}`, { params })
    return response.data
  },

  /**
   * Start livestream session
   */
  async startSession(sessionId: string): Promise<ApiResponse<LivestreamSession>> {
    const response = await apiClient.post<ApiResponse<LivestreamSession>>(`/livestreams/${sessionId}/start`)
    return response.data
  },

  /**
   * End livestream session
   */
  async endSession(sessionId: string): Promise<ApiResponse<LivestreamSession>> {
    const response = await apiClient.post<ApiResponse<LivestreamSession>>(`/livestreams/${sessionId}/end`)
    return response.data
  },

  /**
   * Join livestream session (student)
   */
  async joinSession(sessionId: string): Promise<ApiResponse<{ session: LivestreamSession, viewer: LivestreamViewer }>> {
    const response = await apiClient.post<ApiResponse<{ session: LivestreamSession, viewer: LivestreamViewer }>>(`/livestreams/${sessionId}/join`)
    return response.data
  },

  /**
   * Leave livestream session
   */
  async leaveSession(sessionId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(`/livestreams/${sessionId}/leave`)
    return response.data
  },

  /**
   * Get session viewers
   */
  async getSessionViewers(sessionId: string): Promise<ApiResponse<{ viewers: LivestreamViewer[] }>> {
    const response = await apiClient.get<ApiResponse<{ viewers: LivestreamViewer[] }>>(`/livestreams/${sessionId}/viewers`)
    return response.data
  },

  /**
   * Get session chat messages
   */
  async getChatMessages(sessionId: string, params?: PaginationParams): Promise<ApiResponse<{ messages: LivestreamChat[], pagination: any }>> {
    const response = await apiClient.get<ApiResponse<{ messages: LivestreamChat[], pagination: any }>>(`/livestreams/${sessionId}/chat`, { params })
    return response.data
  },

  /**
   * Send chat message during livestream
   */
  async sendChatMessage(sessionId: string, message: string): Promise<ApiResponse<LivestreamChat>> {
    const response = await apiClient.post<ApiResponse<LivestreamChat>>(`/livestreams/${sessionId}/chat`, { message })
    return response.data
  },

  /**
   * Get WebRTC signaling data for session
   */
  async getSignalingData(sessionId: string): Promise<ApiResponse<{ ice_servers: any[], turn_servers: any[] }>> {
    const response = await apiClient.get<ApiResponse<{ ice_servers: any[], turn_servers: any[] }>>(`/livestreams/${sessionId}/signaling`)
    return response.data
  },

  /**
   * Send WebRTC offer/answer/ice-candidate
   */
  async sendSignal(sessionId: string, signalData: { type: 'offer' | 'answer' | 'ice-candidate', data: any }): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(`/livestreams/${sessionId}/signal`, signalData)
    return response.data
  },

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string): Promise<ApiResponse<{
    total_viewers: number
    peak_viewers: number
    average_watch_time: number
    chat_messages: number
    recording_duration?: number
  }>> {
    const response = await apiClient.get<ApiResponse<{
      total_viewers: number
      peak_viewers: number
      average_watch_time: number
      chat_messages: number
      recording_duration?: number
    }>>(`/livestreams/${sessionId}/stats`)
    return response.data
  },

  /**
   * Get instructor's livestream sessions
   */
  async getMySessions(params?: PaginationParams): Promise<ApiResponse<{ sessions: LivestreamSession[], pagination: any }>> {
    const response = await apiClient.get<ApiResponse<{ sessions: LivestreamSession[], pagination: any }>>('/livestreams/my-sessions', { params })
    return response.data
  },

  /**
   * Utility: Format session status
   */
  getStatusText(status: LivestreamSession['status']): string {
    const statusMap = {
      scheduled: 'Đã lên lịch',
      live: 'Đang phát trực tiếp',
      ended: 'Đã kết thúc'
    }
    return statusMap[status] || status
  },

  /**
   * Utility: Get status color
   */
  getStatusColor(status: LivestreamSession['status']): string {
    const colorMap = {
      scheduled: 'blue',
      live: 'red',
      ended: 'gray'
    }
    return colorMap[status] || 'gray'
  },

  /**
   * Utility: Check if session is live
   */
  isSessionLive(session: LivestreamSession): boolean {
    return session.status === 'live'
  },

  /**
   * Utility: Check if session can be joined
   */
  canJoinSession(session: LivestreamSession): boolean {
    return session.status === 'live' || session.status === 'scheduled'
  },

  /**
   * Utility: Format viewer count
   */
  formatViewerCount(count: number): string {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    return `${(count / 1000000).toFixed(1)}M`
  },

  /**
   * Utility: Calculate session duration
   */
  getSessionDuration(session: LivestreamSession): string {
    if (!session.started_at) return '0:00'
    
    const start = new Date(session.started_at)
    const end = session.ended_at ? new Date(session.ended_at) : new Date()
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000)
    
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const seconds = duration % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

export default livestreamService
