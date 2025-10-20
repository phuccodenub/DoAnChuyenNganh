/**
 * Chat Module Types
 * Types and interfaces for real-time chat system
 */

import { ChatMessageInstance, UserInstance } from '../../types/model.types';

// ===== MESSAGE DATA TYPES =====

export interface SendMessageDto {
  course_id: string;
  sender_id: string;
  message: string;
  message_type?: 'text' | 'file' | 'image' | 'system' | 'announcement';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  reply_to?: string;
}

export interface UpdateMessageDto {
  message: string;
}

export interface DeleteMessageDto {
  message_id: string;
  user_id: string;
}

// ===== SOCKET EVENT TYPES =====

export interface SocketUser {
  userId: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export interface JoinRoomData {
  courseId: string;
  userId: string;
}

export interface LeaveRoomData {
  courseId: string;
  userId: string;
}

export interface TypingData {
  courseId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface MessageReadData {
  messageId: string;
  userId: string;
}

export interface OnlineUsersData {
  courseId: string;
  users: {
    userId: string;
    userName: string;
    avatar?: string;
  }[];
}

// ===== CHAT ROOM TYPES =====

export interface ChatRoom {
  courseId: string;
  users: Set<string>; // User IDs
  lastActivity: Date;
}

export interface UserStatus {
  userId: string;
  socketId: string;
  rooms: Set<string>; // Course IDs
  isOnline: boolean;
  lastSeen: Date;
}

// ===== RESPONSE TYPES =====

export interface MessagesResponse {
  data: ChatMessageInstance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface MessageWithSender extends ChatMessageInstance {
  sender: Pick<UserInstance, 'id' | 'first_name' | 'last_name' | 'avatar' | 'role'>;
}

// ===== QUERY OPTIONS =====

export interface GetMessagesOptions {
  courseId: string;
  page?: number;
  limit?: number;
  beforeMessageId?: string;
  afterMessageId?: string;
  searchTerm?: string;
  messageType?: 'text' | 'file' | 'image' | 'system' | 'announcement';
}

export interface SearchMessagesOptions {
  courseId: string;
  searchTerm: string;
  page?: number;
  limit?: number;
}

// ===== CHAT STATISTICS =====

export interface ChatStatistics {
  totalMessages: number;
  totalUsers: number;
  messagesPerHour: number;
  activeUsers: number;
  messagesByType: {
    text: number;
    file: number;
    image: number;
    system: number;
    announcement: number;
  };
}

// ===== NOTIFICATION TYPES =====

export interface MessageNotification {
  type: 'new_message' | 'message_edited' | 'message_deleted' | 'user_typing';
  courseId: string;
  message?: ChatMessageInstance;
  userId?: string;
  userName?: string;
  timestamp: Date;
}

// ===== SOCKET EVENTS =====

export enum ChatSocketEvents {
  // Client to Server
  JOIN_ROOM = 'chat:join_room',
  LEAVE_ROOM = 'chat:leave_room',
  SEND_MESSAGE = 'chat:send_message',
  EDIT_MESSAGE = 'chat:edit_message',
  DELETE_MESSAGE = 'chat:delete_message',
  TYPING_START = 'chat:typing_start',
  TYPING_STOP = 'chat:typing_stop',
  MESSAGE_READ = 'chat:message_read',
  GET_ONLINE_USERS = 'chat:get_online_users',

  // Server to Client
  NEW_MESSAGE = 'chat:new_message',
  MESSAGE_UPDATED = 'chat:message_updated',
  MESSAGE_DELETED = 'chat:message_deleted',
  USER_JOINED = 'chat:user_joined',
  USER_LEFT = 'chat:user_left',
  USER_TYPING = 'chat:user_typing',
  ONLINE_USERS = 'chat:online_users',
  ERROR = 'chat:error',
  MESSAGE_SENT = 'chat:message_sent',
}

// ===== ERROR TYPES =====

export interface ChatError {
  code: string;
  message: string;
  details?: unknown;
}

export enum ChatErrorCodes {
  UNAUTHORIZED = 'CHAT_UNAUTHORIZED',
  FORBIDDEN = 'CHAT_FORBIDDEN',
  ROOM_NOT_FOUND = 'CHAT_ROOM_NOT_FOUND',
  MESSAGE_NOT_FOUND = 'CHAT_MESSAGE_NOT_FOUND',
  INVALID_MESSAGE = 'CHAT_INVALID_MESSAGE',
  FILE_TOO_LARGE = 'CHAT_FILE_TOO_LARGE',
  RATE_LIMIT_EXCEEDED = 'CHAT_RATE_LIMIT_EXCEEDED',
  SERVER_ERROR = 'CHAT_SERVER_ERROR',
}
