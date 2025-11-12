/**
 * Livestream API Service
 * 
 * API calls for livestream session management
 */

import { httpClient } from '../http/client';

export interface LivestreamSession {
  id: number;
  instructor_id: number;
  course_id: number | null;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  meeting_url?: string;
  meeting_id?: string;
  meeting_password?: string;
  viewer_count: number;
  started_at?: string;
  ended_at?: string;
  recording_url?: string;
  course?: {
    id: number;
    title: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateSessionData {
  course_id?: number | null;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url?: string;
  meeting_id?: string;
  meeting_password?: string;
}

export interface UpdateSessionData {
  title?: string;
  description?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  status?: 'scheduled' | 'live' | 'ended' | 'cancelled';
  meeting_url?: string;
  meeting_id?: string;
  meeting_password?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const livestreamApi = {
  /**
   * Get all sessions (instructor's own sessions)
   */
  getMySessions: async (params?: PaginationParams): Promise<PaginatedResponse<LivestreamSession>> => {
    const response = await httpClient.get('/livestream/my-sessions', { params });
    return response.data;
  },

  /**
   * Get single session by ID
   */
  getSession: async (id: number): Promise<LivestreamSession> => {
    const response = await httpClient.get(`/livestream/sessions/${id}`);
    return response.data.data;
  },

  /**
   * Create new session
   */
  createSession: async (data: CreateSessionData): Promise<LivestreamSession> => {
    const response = await httpClient.post('/livestream/sessions', data);
    return response.data.data;
  },

  /**
   * Update session
   */
  updateSession: async (id: number, data: UpdateSessionData): Promise<LivestreamSession> => {
    const response = await httpClient.put(`/livestream/sessions/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete session
   */
  deleteSession: async (id: number): Promise<void> => {
    await httpClient.delete(`/livestream/sessions/${id}`);
  },

  /**
   * Start session (change status to live)
   */
  startSession: async (id: number): Promise<LivestreamSession> => {
    const response = await httpClient.post(`/livestream/sessions/${id}/start`);
    return response.data.data;
  },

  /**
   * End session (change status to ended)
   */
  endSession: async (id: number): Promise<LivestreamSession> => {
    const response = await httpClient.post(`/livestream/sessions/${id}/end`);
    return response.data.data;
  },

  /**
   * Get session viewers
   */
  getSessionViewers: async (id: number): Promise<{ count: number; viewers: any[] }> => {
    const response = await httpClient.get(`/livestream/sessions/${id}/viewers`);
    return response.data.data;
  },

  /**
   * Join session as viewer
   */
  joinSession: async (id: number): Promise<void> => {
    await httpClient.post(`/livestream/sessions/${id}/join`);
  },

  /**
   * Leave session
   */
  leaveSession: async (id: number): Promise<void> => {
    await httpClient.post(`/livestream/sessions/${id}/leave`);
  },
};
