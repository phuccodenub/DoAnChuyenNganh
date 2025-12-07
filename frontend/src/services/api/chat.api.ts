import { apiClient } from '../http/client';

export interface ChatMessage {
  id: string;
  course_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'file' | 'image' | 'system' | 'announcement';
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_size?: number | null;
  attachment_type?: string | null;
  reply_to_message_id?: string | null;
  is_edited: boolean;
  edited_at?: string | null;
  is_deleted: boolean;
  is_pinned?: boolean;
  // Backend returns camelCase for these
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  replyToMessage?: ChatMessage | null;
}

export interface ChatMessagesResponse {
  data: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
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
    // Safety check - return empty result if no courseId
    if (!courseId) {
      return { data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0, hasMore: false } };
    }
    const response = await apiClient.get(
      `/chat/courses/${courseId}/messages`,
      { params: { page, limit } }
    );
    // API returns { success, data: { data: [], pagination } }
    const respData = response.data?.data || response.data;
    return {
      data: respData?.data || [],
      pagination: respData?.pagination || { page: 1, limit: 50, total: 0, totalPages: 0, hasMore: false }
    };
  },

  /**
   * Send a chat message
   */
  sendMessage: async (courseId: string, content: string, replyToMessageId?: string): Promise<ChatMessage> => {
    // Safety check - cannot send without courseId
    if (!courseId) {
      throw new Error('courseId is required to send a message');
    }
    const response = await apiClient.post(
      `/chat/courses/${courseId}/messages`,
      {
        content,  // Backend uses 'content' not 'message'
        message_type: 'text',
        reply_to_message_id: replyToMessageId,
      }
    );
    // API returns { success, data: Message }
    return response.data?.data || response.data;
  },

  /**
   * Update a chat message
   */
  updateMessage: async (messageId: string, content: string): Promise<ChatMessage> => {
    const response = await apiClient.put(
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
