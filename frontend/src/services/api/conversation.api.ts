/**
 * Conversation (DM) API
 * 
 * API service for direct messaging between students and instructors
 */

import { apiClient } from '../http/client';

// ============ Types ============

export interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  status?: string;
  role: string;
}

export interface CourseInfo {
  id: string;
  title: string;
  thumbnail?: string;
}

export interface Conversation {
  id: string;
  course_id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string | null;
  user1_last_read_at: string | null;
  user2_last_read_at: string | null;
  is_archived_by_user1: boolean;
  is_archived_by_user2: boolean;
  created_at: string;
  updated_at: string;
  user1: Participant;
  user2: Participant;
  course: CourseInfo;
  unread_count?: number;
  last_message?: DirectMessage;
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  attachment_url?: string;
  attachment_type?: 'image' | 'file' | 'video';
  is_read: boolean;
  read_at?: string;
  is_edited: boolean;
  edited_at?: string;
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  sender: Participant;
  sender_role?: string; // Role of the sender (from backend)
}

export interface ConversationsResponse {
  success: boolean;
  data: Conversation[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface MessagesResponse {
  success: boolean;
  data: DirectMessage[];
}

export interface CreateConversationInput {
  recipient_id: string;  // User ID to start conversation with
  course_id?: string;    // Optional: for context
  instructor_id?: string;
  student_id?: string;
}

export interface SendMessageInput {
  content: string;
  attachment_url?: string;
  attachment_type?: 'image' | 'file' | 'video';
}

// ============ API Functions ============

/**
 * Get all conversations for the current user
 */
export const getConversations = async (params?: {
  include_archived?: boolean;
  limit?: number;
  offset?: number;
}): Promise<ConversationsResponse> => {
  const response = await apiClient.get<ConversationsResponse>('/conversations', { params });
  return response.data;
};

/**
 * Get a single conversation
 */
export const getConversation = async (conversationId: string): Promise<{ success: boolean; data: Conversation }> => {
  const response = await apiClient.get(`/conversations/${conversationId}`);
  return response.data;
};

/**
 * Create a new conversation or get existing one
 */
export const createConversation = async (data: CreateConversationInput): Promise<{
  success: boolean;
  data: Conversation;
  created: boolean;
}> => {
  const response = await apiClient.post('/conversations', data);
  return response.data;
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (
  conversationId: string,
  params?: {
    limit?: number;
    before?: string;
    after?: string;
  }
): Promise<MessagesResponse> => {
  const response = await apiClient.get<MessagesResponse>(
    `/conversations/${conversationId}/messages`,
    { params }
  );
  return response.data;
};

/**
 * Send a message in a conversation
 */
export const sendMessage = async (
  conversationId: string,
  data: SendMessageInput
): Promise<{ success: boolean; data: DirectMessage }> => {
  const response = await apiClient.post(`/conversations/${conversationId}/messages`, data);
  return response.data;
};

/**
 * Edit a message
 */
export const editMessage = async (
  messageId: string,
  content: string
): Promise<{ success: boolean; data: DirectMessage }> => {
  const response = await apiClient.put(`/messages/${messageId}`, { content });
  return response.data;
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/messages/${messageId}`);
  return response.data;
};

/**
 * Mark all messages in a conversation as read
 */
export const markAsRead = async (conversationId: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.put(`/conversations/${conversationId}/read`);
  return response.data;
};

/**
 * Archive or unarchive a conversation
 */
export const archiveConversation = async (
  conversationId: string,
  archive: boolean = true
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.put(`/conversations/${conversationId}/archive`, { archive });
  return response.data;
};

/**
 * Search messages in a conversation
 */
export const searchMessages = async (
  conversationId: string,
  query: string
): Promise<MessagesResponse> => {
  const response = await apiClient.get<MessagesResponse>(
    `/conversations/${conversationId}/search`,
    { params: { q: query } }
  );
  return response.data;
};

/**
 * Get total unread message count
 */
export const getUnreadCount = async (): Promise<{ success: boolean; data: { unread_count: number } }> => {
  const response = await apiClient.get('/conversations/unread-count');
  return response.data;
};

/**
 * Get real-time online status of conversation participant
 */
export const getOnlineStatus = async (conversationId: string): Promise<{ success: boolean; data: { isOnline: boolean } }> => {
  const response = await apiClient.get(`/conversations/${conversationId}/online-status`);
  return response.data;
};

// Export as object for convenience
export const conversationApi = {
  getConversations,
  getConversation,
  createConversation,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead,
  archiveConversation,
  searchMessages,
  getUnreadCount,
  getOnlineStatus,
};
