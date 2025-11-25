import { apiClient } from '../http/client';

export interface ChatMessage {
  id: string;
  courseId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: 'text' | 'file' | 'notification' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyTo?: string;
  replyToMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}

export interface ChatMessagesResponse {
  data: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OnlineUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastSeen: string;
  status: 'online' | 'away' | 'offline';
}

export interface ChatStatistics {
  totalMessages: number;
  totalUsers: number;
  activeUsers: number;
  messagesPerDay: { date: string; count: number }[];
}

/**
 * Chat API Service
 */
export const chatApi = {
  /**
   * Get chat messages for a course
   */
  getMessages: async (courseId: string, page: number = 1, limit: number = 50): Promise<ChatMessagesResponse> => {
    const response = await apiClient.get<ChatMessagesResponse>(
      `/chat/courses/${courseId}/messages`,
      { params: { page, limit } }
    );
    return response.data;
  },

  /**
   * Send a chat message
   */
  sendMessage: async (courseId: string, content: string, replyToId?: string): Promise<ChatMessage> => {
    const response = await apiClient.post<ChatMessage>(
      `/chat/courses/${courseId}/messages`,
      {
        message: content,
        message_type: 'text',
        reply_to: replyToId,
      }
    );
    return response.data;
  },

  /**
   * Update a chat message
   */
  updateMessage: async (messageId: string, content: string): Promise<ChatMessage> => {
    const response = await apiClient.put<ChatMessage>(
      `/chat/messages/${messageId}`,
      { message: content }
    );
    return response.data;
  },

  /**
   * Delete a chat message
   */
  deleteMessage: async (messageId: string): Promise<void> => {
    await apiClient.delete(`/chat/messages/${messageId}`);
  },

  /**
   * Search messages in a course
   */
  searchMessages: async (courseId: string, searchTerm: string, page: number = 1): Promise<ChatMessagesResponse> => {
    const response = await apiClient.get<ChatMessagesResponse>(
      `/chat/courses/${courseId}/messages/search`,
      { params: { searchTerm, page, limit: 50 } }
    );
    return response.data;
  },

  /**
   * Get online users in a course
   */
  getOnlineUsers: async (courseId: string): Promise<OnlineUser[]> => {
    const response = await apiClient.get<{ data: OnlineUser[] }>(
      `/chat/courses/${courseId}/online-users`
    );
    return response.data.data;
  },

  /**
   * Get chat statistics
   */
  getStatistics: async (courseId: string): Promise<ChatStatistics> => {
    const response = await apiClient.get<{ data: ChatStatistics }>(
      `/chat/courses/${courseId}/statistics`
    );
    return response.data.data;
  },
};
