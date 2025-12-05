/**
 * Chat Service
 * Business logic for chat operations
 */

import { ChatRepository } from './chat.repository';
import {
  SendMessageDto,
  UpdateMessageDto,
  GetMessagesOptions,
  SearchMessagesOptions,
  MessagesResponse
} from './chat.types';
import logger from '../../utils/logger.util';

export class ChatService {
  private repository: ChatRepository;

  constructor() {
    this.repository = new ChatRepository();
  }

  /**
   * Send a new message
   */
  async sendMessage(data: SendMessageDto) {
    try {
      // Validate user has access to course chat
      const hasAccess = await this.repository.canUserAccessChat(
        data.user_id,
        data.course_id
      );

      if (!hasAccess) {
        throw new Error('User does not have access to this course chat');
      }

      // Create message
      const message = await this.repository.createMessage({
        course_id: data.course_id,
        user_id: data.user_id,
        content: data.content,
        message_type: data.message_type || 'text',
        attachment_url: data.attachment_url,
        attachment_name: data.attachment_name,
        attachment_size: data.attachment_size,
        attachment_type: data.attachment_type,
        reply_to_message_id: data.reply_to_message_id
      });

      return message;
    } catch (error: unknown) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a course
   */
  async getMessages(options: GetMessagesOptions): Promise<MessagesResponse> {
    try {
      const result = await this.repository.getMessages(options);

      return {
        data: result.messages as any,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasMore: result.hasMore
        }
      };
    } catch (error: unknown) {
      logger.error('Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Update a message
   */
  async updateMessage(messageId: string, userId: string, dto: UpdateMessageDto) {
    try {
      const message = await this.repository.updateMessage(
        messageId,
        userId,
        dto.content
      );

      if (!message) {
        throw new Error('Message not found or user not authorized');
      }

      return message;
    } catch (error: unknown) {
      logger.error('Error updating message:', error);
      throw error;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string, userId: string) {
    try {
      const message = await this.repository.deleteMessage(messageId, userId);

      if (!message) {
        throw new Error('Message not found or user not authorized');
      }

      return message;
    } catch (error: unknown) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Search messages
   */
  async searchMessages(options: SearchMessagesOptions) {
    try {
      return await this.repository.searchMessages(options);
    } catch (error: unknown) {
      logger.error('Error searching messages:', error);
      throw error;
    }
  }

  /**
   * Get message by ID
   */
  async getMessageById(messageId: string) {
    try {
      return await this.repository.getMessageById(messageId);
    } catch (error: unknown) {
      logger.error('Error getting message by ID:', error);
      throw error;
    }
  }

  /**
   * Get chat statistics
   */
  async getChatStatistics(courseId: string) {
    try {
      return await this.repository.getChatStatistics(courseId);
    } catch (error: unknown) {
      logger.error('Error getting chat statistics:', error);
      throw error;
    }
  }

  /**
   * Check user access to chat
   */
  async checkUserAccess(userId: string, courseId: string): Promise<boolean> {
    try {
      return await this.repository.canUserAccessChat(userId, courseId);
    } catch (error: unknown) {
      logger.error('Error checking user access:', error);
      return false;
    }
  }

  /**
   * Get messages by type
   */
  async getMessagesByType(courseId: string, messageType: string) {
    try {
      return await this.repository.getMessagesByType(courseId, messageType);
    } catch (error: unknown) {
      logger.error('Error getting messages by type:', error);
      throw error;
    }
  }
}
