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
import type { WhereOptions } from '../../types/sequelize-types';
import type { 
  ChatMessageInstance, 
  ChatMessageAttributes, 
  ChatMessageCreationAttributes,
  CourseInstance 
} from '../../types/model.types';

export interface ChatStats {
  totalMessages: number;
  messagesByType: {
    text: number;
    file: number;
    image: number;
    system: number;
    announcement: number;
  };
}

export class ChatRepository {
  /**
   * Create a new chat message
   */
  async createMessage(data: {
    course_id: string;
    user_id: string;  // sender
    content: string;  // message content
    message_type?: 'text' | 'file' | 'image' | 'system' | 'announcement';
    attachment_url?: string;
    attachment_name?: string;
    attachment_size?: number;
    attachment_type?: string;
    reply_to_message_id?: string;
  }): Promise<ChatMessageInstance | null> {
    try {
      const message = await ChatMessage.create(data) as ChatMessageInstance;
      
      // Fetch with sender details
      return await this.getMessageById(message.id);
    } catch (error: unknown) {
      logger.error('Error creating message:', error);
      throw error;
    }
  }

  /**
   * Get message by ID with sender details
   */
  async getMessageById(messageId: string): Promise<ChatMessageInstance | null> {
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
            attributes: ['id', 'content', 'user_id', 'created_at'],
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

      const where: WhereOptions<ChatMessageAttributes> = {
        course_id: courseId,
        is_deleted: false
      };

      // Filter by message type
      if (messageType) {
        where.message_type = messageType;
      }

      // Search in messages
      if (searchTerm) {
        (where as any).content = {
          [Op.iLike]: `%${searchTerm}%`
        };
      }

      // Pagination with message ID
      if (beforeMessageId) {
        const beforeMessage = await ChatMessage.findByPk(beforeMessageId) as ChatMessageInstance | null;
        if (beforeMessage) {
          (where as any).created_at = {
            [Op.lt]: beforeMessage.created_at
          };
        }
      }

      if (afterMessageId) {
        const afterMessage = await ChatMessage.findByPk(afterMessageId) as ChatMessageInstance | null;
        if (afterMessage) {
          (where as any).created_at = {
            [Op.gt]: afterMessage.created_at
          };
        }
      }

      const offset = (page - 1) * limit;

      const { rows: messages, count } = await (ChatMessage as any).findAndCountAll({
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
            attributes: ['id', 'content', 'user_id'],
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
  async updateMessage(messageId: string, userId: string, newContent: string) {
    try {
      const message = await ChatMessage.findOne({
        where: {
          id: messageId,
          user_id: userId,
          is_deleted: false
        }
      });

      if (!message) {
        return null;
      }

      await (message as any).update({
        content: newContent,
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
          user_id: userId,
          is_deleted: false
        }
      });

      if (!message) {
        return null;
      }

      await (message as any).update({
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
   * Get all member IDs of a course (instructor + enrolled students)
   */
  async getCourseMemberIds(courseId: string): Promise<string[]> {
    try {
      const course = await Course.findByPk(courseId) as CourseInstance | null;
      if (!course) {
        return [];
      }

      const memberIds: string[] = [course.instructor_id];

      // Get all enrolled students
      const Enrollment = (await import('../../models/enrollment.model')).default;
      const enrollments = await Enrollment.findAll({
        where: {
          course_id: courseId,
          status: 'active'
        },
        attributes: ['user_id']
      });

      const studentIds = enrollments.map((e: any) => e.user_id);
      memberIds.push(...studentIds);

      return [...new Set(memberIds)]; // Remove duplicates
    } catch (error: unknown) {
      logger.error('Error getting course member IDs:', error);
      return [];
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

      // Check if user is admin (admin can access all course chats)
      const User = (await import('../../models/user.model')).default;
      const user = await User.findByPk(userId);
      if (user && (user as any).role === 'admin') {
        return true;
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
  async getChatStatistics(courseId: string): Promise<ChatStats> {
    try {
      const totalMessages = await this.getMessageCount(courseId);

      const messagesByType = await ChatMessage.findAll({
        where: {
          course_id: courseId,
          is_deleted: false
        },
        attributes: [
          'message_type',
          [(ChatMessage as any).sequelize!.fn('COUNT', (ChatMessage as any).sequelize!.col('id')), 'count']
        ],
        group: ['message_type']
      }) as Array<ChatMessageInstance & { getDataValue: (key: string) => any }>;

      const stats: ChatStats = {
        totalMessages,
        messagesByType: {
          text: 0,
          file: 0,
          image: 0,
          system: 0,
          announcement: 0
        }
      };

      messagesByType.forEach((item) => {
        const messageType = item.message_type;
        const count = parseInt(item.getDataValue('count'));
        if (messageType in stats.messagesByType) {
          stats.messagesByType[messageType] = count;
        }
      });

      return stats;
    } catch (error: unknown) {
      logger.error('Error getting chat statistics:', error);
      throw error;
    }
  }
}
