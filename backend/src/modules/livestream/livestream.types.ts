/**
 * Livestream Module Types
 * Types and interfaces for livestream real-time features
 */

// Note: Import types from model.types if needed
// import { LiveSessionInstance, UserInstance } from '../../types/model.types';

// ===== SOCKET EVENT TYPES =====

export interface SocketUser {
  userId: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface JoinSessionData {
  sessionId: string;
  userId: string;
}

export interface LeaveSessionData {
  sessionId: string;
  userId: string;
}

export interface SendChatMessageDto {
  session_id: string;
  sender_id: string;
  message: string;
  message_type?: 'text' | 'emoji' | 'system';
  reply_to?: string;
}

export interface ReactionData {
  sessionId: string;
  userId: string;
  emoji: string; // e.g., '👍', '❤️', '🔥'
}

export interface ViewerCountData {
  sessionId: string;
  count: number;
  viewers: ViewerInfo[];
}

export interface ViewerInfo {
  userId: string;
  userName: string;
  avatar?: string;
  joinedAt: Date;
}

// ===== SOCKET EVENTS =====

export enum LiveStreamSocketEvents {
  // Client → Server
  JOIN_SESSION = 'livestream:join_session',
  LEAVE_SESSION = 'livestream:leave_session',
  SEND_MESSAGE = 'livestream:send_message',
  SEND_REACTION = 'livestream:send_reaction',
  TYPING_START = 'livestream:typing_start',
  TYPING_STOP = 'livestream:typing_stop',
  
  // Server → Client
  SESSION_JOINED = 'livestream:session_joined',
  SESSION_LEFT = 'livestream:session_left',
  VIEWER_JOINED = 'livestream:viewer_joined',
  VIEWER_LEFT = 'livestream:viewer_left',
  VIEWER_COUNT_UPDATED = 'livestream:viewer_count_updated',
  NEW_MESSAGE = 'livestream:new_message',
  MESSAGE_SENT = 'livestream:message_sent',
  REACTION_RECEIVED = 'livestream:reaction_received',
  USER_TYPING = 'livestream:user_typing',
  SESSION_STARTED = 'livestream:session_started',
  SESSION_ENDED = 'livestream:session_ended',
  ERROR = 'livestream:error',
}

// ===== ERROR CODES =====

export enum LiveStreamErrorCodes {
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_NOT_LIVE = 'SESSION_NOT_LIVE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_DATA = 'INVALID_DATA',
  ALREADY_JOINED = 'ALREADY_JOINED',
  NOT_JOINED = 'NOT_JOINED',
}

// ===== API DTO TYPES =====

export interface CreateLiveSessionDto {
  course_id?: string;
  title: string;
  description?: string;
  scheduled_start?: string | Date;
  scheduled_end?: string | Date;
  duration_minutes?: number;
  meeting_url?: string;
  meeting_password?: string;
  platform?: string;
  ingest_type?: 'webrtc' | 'rtmp';
  webrtc_room_id?: string;
  webrtc_config?: Record<string, unknown>;
  stream_key?: string;
  playback_url?: string;
  max_participants?: number;
  is_public?: boolean;
  category?: string;
  thumbnail_url?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateLiveSessionStatusDto {
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  recording_url?: string;
  actual_start?: string | Date;
  actual_end?: string | Date;
  viewer_count?: number;
}

export interface ListLiveSessionsQuery {
  page?: number;
  limit?: number;
  status?: 'scheduled' | 'live' | 'ended' | 'cancelled';
  search?: string;
  host_user_id?: string;
}

// ===== INTERNAL TYPES =====

export interface LiveStreamRoom {
  sessionId: string;
  viewers: Map<string, ViewerInfo>; // userId -> ViewerInfo
  messages: any[]; // Chat messages (optional, có thể lưu vào DB)
  reactions: Map<string, Set<string>>; // emoji -> Set of userIds
  lastActivity: Date;
}
