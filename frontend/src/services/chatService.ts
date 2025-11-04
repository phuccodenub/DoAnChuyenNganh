import { apiClient } from './apiClient'

export interface Message {
  id: string
  courseId: string
  userId: string
  user: {
    id: string
    full_name: string
    avatar_url?: string
    role: string
  }
  content: string
  type: 'text' | 'file' | 'image' | 'system'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  timestamp: string
  edited?: boolean
  editedAt?: string
}

export interface ChatStatistics {
  totalMessages: number
  totalUsers: number
  messagesByType: Record<string, number>
  activeUsers: number
  averageMessagesPerUser: number
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

export interface MessageSearchParams extends PaginationParams {
  query: string
  type?: string
  userId?: string
  startDate?: string
  endDate?: string
}

export const chatService = {
  /**
   * Get messages for a course with pagination
   */
  async getMessages(
    courseId: string, 
    params?: PaginationParams
  ): Promise<ApiResponse<{ messages: Message[], pagination: any }>> {
    const response = await apiClient.get<ApiResponse<{ messages: Message[], pagination: any }>>(
      `/chat/courses/${courseId}/messages`,
      { params }
    )
    return response.data
  },

  /**
   * Send a message to course chat (REST fallback)
   */
  async sendMessage(
    courseId: string, 
    content: string, 
    type: 'text' | 'file' | 'image' = 'text',
    fileData?: { fileName?: string, fileUrl?: string, fileSize?: number }
  ): Promise<ApiResponse<Message>> {
    const response = await apiClient.post<ApiResponse<Message>>(
      `/chat/courses/${courseId}/messages`,
      {
        content,
        type,
        ...fileData
      }
    )
    return response.data
  },

  /**
   * Search messages in a course
   */
  async searchMessages(
    courseId: string, 
    params: MessageSearchParams
  ): Promise<ApiResponse<{ messages: Message[], pagination: any }>> {
    const response = await apiClient.get<ApiResponse<{ messages: Message[], pagination: any }>>(
      `/chat/courses/${courseId}/messages/search`,
      { params }
    )
    return response.data
  },

  /**
   * Get chat statistics for a course
   */
  async getStatistics(courseId: string): Promise<ApiResponse<ChatStatistics>> {
    const response = await apiClient.get<ApiResponse<ChatStatistics>>(
      `/chat/courses/${courseId}/statistics`
    )
    return response.data
  },

  /**
   * Get messages by type (text, file, image, etc.)
   */
  async getMessagesByType(
    courseId: string, 
    messageType: string,
    params?: PaginationParams
  ): Promise<ApiResponse<{ messages: Message[], pagination: any }>> {
    const response = await apiClient.get<ApiResponse<{ messages: Message[], pagination: any }>>(
      `/chat/courses/${courseId}/messages/type/${messageType}`,
      { params }
    )
    return response.data
  },

  /**
   * Update/edit a message
   */
  async updateMessage(
    messageId: string, 
    content: string
  ): Promise<ApiResponse<Message>> {
    const response = await apiClient.put<ApiResponse<Message>>(
      `/chat/messages/${messageId}`,
      { content }
    )
    return response.data
  },

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/chat/messages/${messageId}`
    )
    return response.data
  },

  /**
   * Get file messages for a course (convenience method)
   */
  async getFileMessages(
    courseId: string,
    params?: PaginationParams
  ): Promise<ApiResponse<{ messages: Message[], pagination: any }>> {
    return this.getMessagesByType(courseId, 'file', params)
  },

  /**
   * Get image messages for a course (convenience method)
   */
  async getImageMessages(
    courseId: string,
    params?: PaginationParams
  ): Promise<ApiResponse<{ messages: Message[], pagination: any }>> {
    return this.getMessagesByType(courseId, 'image', params)
  }
}
