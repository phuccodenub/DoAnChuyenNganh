/**
 * Chat Repository
 * Database operations for chat messages
 */

import ChatMessage from '../../models/chat-message.model';
import User from '../../models/user.model';
import Course from '../../models/course.model';
import { GetMessagesOptions, SearchMessagesOptions } from './chat.types';
import logger from '../../utils/logger.util';
import { Op } from 'sequelize';
import type { CourseInstance } from '../../types/model.types';

export class ChatRepository {
  /**
   * Create a new chat message
   */
  async createMessage(data: {
    course_id: string;
    sender_id: string;
    message: string;
    message_type?: 'text' | 'file' | 'image' | 'system' | 'announcement';
    file_url?: string;
    file_name?: string;
    file_size?: number;
    reply_to?: string;
  }) {
    try {
      const message = await ChatMessage.create(data);
      
      // Fetch with sender details
      return await this.getMessageById((message as any).id);
    } catch (error: unknown) {
      logger.error('Error creating message:', error);
      throw error;
    }
  }

  /**
   * Get message by ID with sender details
   */
  async getMessageById(messageId: string) {
    try {
      const message = await ChatMessage.findByPk(messageId, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'first_name', 'last_name', 'email', 'avatar', 'role']
          },
          {
            model: ChatMessage,
            as: 'replyToMessage',
            attributes: ['id', 'message', 'sender_id', 'created_at'],
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['id', 'first_name', 'last_name']
              }
            ]
          }
        ]
      });

      return message;
    } catch (error: unknown) {
      logger.error('Error getting message by ID:', error);
      throw error;
    }
  }

  /**
   * Get messages for a course with pagination
   */
  async getMessages(options: GetMessagesOptions) {
    try {
      const {
        courseId,
        page = 1,
        limit = 50,
        beforeMessageId,
        afterMessageId,
        searchTerm,
        messageType
      } = options;

      const where: any = {
        course_id: courseId,
        is_deleted: false
      };

      // Filter by message type
      if (messageType) {
        where.message_type = messageType;
      }

      // Search in messages
      if (searchTerm) {
        where.message = {
          [Op.iLike]: `%${searchTerm}%`
        };
      }

      // Pagination with message ID
      if (beforeMessageId) {
        const beforeMessage = await ChatMessage.findByPk(beforeMessageId);
        if (beforeMessage) {
          where.created_at = {
            [Op.lt]: (beforeMessage as any).created_at
          };
        }
      }

      if (afterMessageId) {
        const afterMessage = await ChatMessage.findByPk(afterMessageId);
        if (afterMessage) {
          where.created_at = {
            [Op.gt]: (afterMessage as any).created_at
          };
        }
      }

      const offset = (page - 1) * limit;

      const { rows: messages, count } = await ChatMessage.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'first_name', 'last_name', 'email', 'avatar', 'role']
          },
          {
            model: ChatMessage,
            as: 'replyToMessage',
            attributes: ['id', 'message', 'sender_id'],
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['id', 'first_name', 'last_name']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      return {
        messages,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasMore: offset + messages.length < count
      };
    } catch (error: unknown) {
      logger.error('Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Update message
   */
  async updateMessage(messageId: string, userId: string, newMessage: string) {
    try {
      const message = await ChatMessage.findOne({
        where: {
          id: messageId,
          sender_id: userId,
          is_deleted: false
        }
      });

      if (!message) {
        return null;
      }

      await message.update({
        message: newMessage,
        is_edited: true,
        edited_at: new Date()
      });

      return await this.getMessageById(messageId);
    } catch (error: unknown) {
      logger.error('Error updating message:', error);
      throw error;
    }
  }

  /**
   * Delete message (soft delete)
   */
  async deleteMessage(messageId: string, userId: string) {
    try {
      const message = await ChatMessage.findOne({
        where: {
          id: messageId,
          sender_id: userId,
          is_deleted: false
        }
      });

      if (!message) {
        return null;
      }

      await message.update({
        is_deleted: true,
        deleted_at: new Date()
      });

      return message;
    } catch (error: unknown) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Search messages in a course
   */
  async searchMessages(options: SearchMessagesOptions) {
    try {
      const { courseId, searchTerm, page = 1, limit = 50 } = options;

      const messages = await ChatMessage.searchInCourse(courseId, searchTerm);

      const offset = (page - 1) * limit;
      const paginatedMessages = messages.slice(offset, offset + limit);

      return {
        messages: paginatedMessages,
        total: messages.length,
        page,
        limit,
        totalPages: Math.ceil(messages.length / limit)
      };
    } catch (error: unknown) {
      logger.error('Error searching messages:', error);
      throw error;
    }
  }

  /**
   * Get message count by course
   */
  async getMessageCount(courseId: string): Promise<number> {
    try {
      return await ChatMessage.count({
        where: {
          course_id: courseId,
          is_deleted: false
        }
      });
    } catch (error: unknown) {
      logger.error('Error getting message count:', error);
      throw error;
    }
  }

  /**
   * Get messages by type
   */
  async getMessagesByType(courseId: string, messageType: string) {
    try {
      return await ChatMessage.findAll({
        where: {
          course_id: courseId,
          message_type: messageType,
          is_deleted: false
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'first_name', 'last_name', 'avatar']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 100
      });
    } catch (error: unknown) {
      logger.error('Error getting messages by type:', error);
      throw error;
    }
  }

  /**
   * Check if user can access course chat
   */
  async canUserAccessChat(userId: string, courseId: string): Promise<boolean> {
    try {
      // Check if course exists
      const course = await Course.findByPk(courseId) as CourseInstance | null;
      if (!course) {
        return false;
      }

      // Check if user is instructor
      if (course.instructor_id === userId) {
        return true;
      }

      // Check if user is enrolled
      const Enrollment = (await import('../../models/enrollment.model')).default;
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: courseId,
          status: 'active'
        }
      });

      return !!enrollment;
    } catch (error: unknown) {
      logger.error('Error checking user access:', error);
      return false;
    }
  }

  /**
   * Get chat statistics for a course
   */
  async getChatStatistics(courseId: string) {
    try {
      const totalMessages = await this.getMessageCount(courseId);

      const messagesByType = await ChatMessage.findAll({
        where: {
          course_id: courseId,
          is_deleted: false
        },
        attributes: [
          'message_type',
          [ChatMessage.sequelize!.fn('COUNT', ChatMessage.sequelize!.col('id')), 'count']
        ],
        group: ['message_type']
      });

      const stats: any = {
        totalMessages,
        messagesByType: {
          text: 0,
          file: 0,
          image: 0,
          system: 0,
          announcement: 0
        }
      };

      messagesByType.forEach((item: any) => {
        stats.messagesByType[item.message_type] = parseInt(item.getDataValue('count'));
      });

      return stats;
    } catch (error: unknown) {
      logger.error('Error getting chat statistics:', error);
      throw error;
    }
  }
}
