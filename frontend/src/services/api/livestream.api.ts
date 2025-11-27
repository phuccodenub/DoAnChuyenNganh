/**
 * Livestream API Service
 * 
 * API calls for livestream session management
 */

import { httpClient } from '../http/client';

export interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface WebRTCConfiguration {
  iceServers?: IceServerConfig[];
  [key: string]: unknown;
}

export interface LiveSession {
  id: string;
  host_user_id?: string;
  instructor_name?: string;
  instructor_avatar?: string;
  course_id?: string | null;
  course_title?: string;
  title: string;
  description?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  actual_start?: string;
  actual_end?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  platform?: string;
  ingest_type?: 'webrtc' | 'rtmp';
  webrtc_room_id?: string | null;
  webrtc_config?: WebRTCConfiguration;
  meeting_url?: string;
  meeting_password?: string;
  max_participants?: number;
  viewer_count?: number;
  attendance_count?: number;
  duration_minutes?: number;
  is_recorded?: boolean;
  is_public?: boolean;
  recording_url?: string;
  thumbnail_url?: string;
  stream_key?: string | null;
  playback_url?: string | null;
  category?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  course?: {
    id: string;
    title: string;
    category?: string;
  };
  host?: {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    role?: string;
  };
}

export interface LiveSessionsQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface LiveSessionsResponse {
  sessions: LiveSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateSessionData {
  course_id?: string | null;
  title: string;
  description?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  duration_minutes?: number;
  meeting_url?: string;
  meeting_password?: string;
  platform?: string;
  max_participants?: number;
  is_public?: boolean;
  category?: string;
  thumbnail_url?: string;
  playback_url?: string;
  stream_key?: string;
  ingest_type?: 'webrtc' | 'rtmp';
  webrtc_room_id?: string | null;
  webrtc_config?: WebRTCConfiguration;
  metadata?: Record<string, unknown>;
}

export interface UpdateSessionData {
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  recording_url?: string;
  actual_start?: string;
  actual_end?: string;
  viewer_count?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

const BASE_PATH = '/live-sessions';

export const livestreamApi = {
  /**
   * Get all sessions (instructor's own sessions)
   */
  getMySessions: async (params?: PaginationParams): Promise<LiveSessionsResponse> => {
    const response = await httpClient.get(`${BASE_PATH}/my`, { params });
    return response.data.data;
  },

  /**
   * Get public live sessions
   */
  getLiveSessions: async (params?: LiveSessionsQuery): Promise<LiveSessionsResponse> => {
    const response = await httpClient.get(BASE_PATH, { params });
    return response.data.data;
  },

  /**
   * Get single session by ID
   */
  getSession: async (id: string): Promise<LiveSession> => {
    const response = await httpClient.get(`${BASE_PATH}/${id}`);
    return response.data.data;
  },

  /**
   * Create new session
   */
  createSession: async (data: CreateSessionData): Promise<LiveSession> => {
    const response = await httpClient.post(BASE_PATH, data);
    return response.data.data;
  },

  /**
   * Update session
   */
  updateSession: async (id: string, data: UpdateSessionData): Promise<LiveSession> => {
    const response = await httpClient.put(`${BASE_PATH}/${id}/status`, data);
    return response.data.data;
  },

  /**
   * Delete session
   */
  deleteSession: async (id: string): Promise<void> => {
    await httpClient.delete(`${BASE_PATH}/${id}`);
  },

  /**
   * Start session (change status to live)
   */
  getSessionViewers: async (id: string): Promise<{ count: number; viewers: any[] }> => {
    const response = await httpClient.get(`${BASE_PATH}/${id}/viewers`);
    return response.data.data;
  },

  joinSession: async (id: string): Promise<void> => {
    await httpClient.post(`${BASE_PATH}/${id}/join`);
  },

  leaveSession: async (id: string): Promise<void> => {
    await httpClient.post(`${BASE_PATH}/${id}/leave`);
  },

  uploadThumbnail: async (id: string, file: File): Promise<LiveSession> => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    const response = await httpClient.post(`${BASE_PATH}/${id}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  /**
   * Get ICE servers for WebRTC (with Twilio NTS support)
   * This endpoint generates a Twilio NTS token and returns ICE servers
   * that can be used for cross-network WebRTC connections
   */
  getIceServers: async (): Promise<{ iceServers: IceServerConfig[] }> => {
    const response = await httpClient.get(`${BASE_PATH}/webrtc/ice-servers`);
    return response.data.data;
  },
};
