/**
 * Conversation Service
 * 
 * Business logic for direct message conversations
 */

import { conversationRepository } from './conversation.repository';
import { directMessageRepository } from './direct-message.repository';
import { Course, Enrollment, User } from '../../models';
import { ApiError } from '../../errors/api.error';
import logger from '../../utils/logger.util';

export interface CreateConversationDto {
  course_id: string;
  instructor_id: string;
  initial_message?: string;
}

export interface SendMessageDto {
  conversation_id: string;
  content: string;
  attachment_type?: 'image' | 'file';
  attachment_url?: string;
  attachment_name?: string;
  attachment_size?: number;
}

export interface GetConversationsOptions {
  includeArchived?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetMessagesOptions {
  limit?: number;
  before?: string;
  after?: string;
}

export class ConversationService {
  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string, options: GetConversationsOptions = {}) {
    // Determine user role
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const role = (user as any).role === 'instructor' ? 'instructor' : 'student';
    const result = await conversationRepository.findByUserId(userId, role, options);

    // Enrich with unread counts and last message
    const enrichedConversations = await Promise.all(
      result.rows.map(async (conv: any) => {
        const lastReadAt = role === 'student' 
          ? conv.student_last_read_at 
          : conv.instructor_last_read_at;

        const unreadCount = await directMessageRepository.countUnread(
          conv.id,
          userId,
          lastReadAt
        );

        const lastMessage = await directMessageRepository.getLastMessage(conv.id);

        return {
          ...conv.toJSON(),
          unread_count: unreadCount,
          last_message: lastMessage ? {
            content: lastMessage.content,
            created_at: lastMessage.created_at,
            sender_id: lastMessage.sender_id,
            sender_role: (lastMessage as any).sender?.role,
          } : null,
        };
      })
    );

    return {
      conversations: enrichedConversations,
      total: result.count,
    };
  }

  /**
   * Get a single conversation by ID
   */
  async getConversation(conversationId: string, userId: string) {
    // Verify participation
    const isParticipant = await conversationRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ApiError('You are not a participant in this conversation', 403);
    }

    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new ApiError('Conversation not found', 404);
    }

    // Get role and unread count
    const role = await conversationRepository.getParticipantRole(conversationId, userId);
    const lastReadAt = role === 'student'
      ? (conversation as any).student_last_read_at
      : (conversation as any).instructor_last_read_at;

    const unreadCount = await directMessageRepository.countUnread(
      conversationId,
      userId,
      lastReadAt
    );

    const lastMessage = await directMessageRepository.getLastMessage(conversationId);

    return {
      ...(conversation as any).toJSON(),
      unread_count: unreadCount,
      last_message: lastMessage ? {
        content: lastMessage.content,
        created_at: lastMessage.created_at,
        sender_id: lastMessage.sender_id,
        sender_role: (lastMessage as any).sender?.role,
      } : null,
    };
  }

  /**
   * Create or get existing conversation
   */
  async createConversation(userId: string, dto: CreateConversationDto) {
    const { course_id, instructor_id, initial_message } = dto;

    // Validate course exists
    const course = await Course.findByPk(course_id);
    if (!course) {
      throw new ApiError('Course not found', 404);
    }

    // Verify user is enrolled in the course (or is the instructor)
    const enrollment = await Enrollment.findOne({
      where: { course_id, user_id: userId },
    });

    const isInstructor = (course as any).instructor_id === userId;
    if (!enrollment && !isInstructor) {
      throw new ApiError('You must be enrolled in this course to start a conversation', 403);
    }

    // Determine student and instructor IDs
    let studentId: string;
    let instructorIdFinal: string;

    if (isInstructor) {
      // Instructor initiating conversation with a student
      instructorIdFinal = userId;
      studentId = instructor_id; // In this case, instructor_id param is the student
      
      // Verify student is enrolled
      const studentEnrollment = await Enrollment.findOne({
        where: { course_id, user_id: studentId },
      });
      if (!studentEnrollment) {
        throw new ApiError('Student is not enrolled in this course', 400);
      }
    } else {
      // Student initiating conversation with instructor
      studentId = userId;
      instructorIdFinal = instructor_id;
      
      // Verify instructor is the course instructor
      if ((course as any).instructor_id !== instructorIdFinal) {
        throw new ApiError('Invalid instructor for this course', 400);
      }
    }

    // Find or create conversation
    const { conversation, created } = await conversationRepository.findOrCreate(
      course_id,
      studentId,
      instructorIdFinal
    );

    // Send initial message if provided and conversation was just created
    if (initial_message && created && conversation) {
      await this.sendMessage(userId, {
        conversation_id: conversation.id,
        content: initial_message,
      });
    }

    return { conversation, created };
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, userId: string, options: GetMessagesOptions = {}) {
    // Verify participation
    const isParticipant = await conversationRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ApiError('You are not a participant in this conversation', 403);
    }

    const messages = await directMessageRepository.findByConversationId(conversationId, options);

    // Mark messages as read
    const role = await conversationRepository.getParticipantRole(conversationId, userId);
    if (role) {
      await conversationRepository.markAsRead(conversationId, userId, role);
      await directMessageRepository.markAsRead(conversationId, userId);
    }

    return messages;
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(userId: string, dto: SendMessageDto) {
    const { conversation_id, content, attachment_type, attachment_url, attachment_name, attachment_size } = dto;

    // Verify participation
    const isParticipant = await conversationRepository.isParticipant(conversation_id, userId);
    if (!isParticipant) {
      throw new ApiError('You are not a participant in this conversation', 403);
    }

    // Create message
    const message = await directMessageRepository.create({
      conversation_id,
      sender_id: userId,
      content,
      attachment_type,
      attachment_url,
      attachment_name,
      attachment_size,
    });

    // Update conversation last_message_at
    await conversationRepository.updateLastMessageAt(conversation_id);

    logger.info(`Message sent in conversation ${conversation_id} by user ${userId}`);

    return message;
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: string, userId: string, newContent: string) {
    // Verify sender
    const isSender = await directMessageRepository.isSender(messageId, userId);
    if (!isSender) {
      throw new ApiError('You can only edit your own messages', 403);
    }

    const message = await directMessageRepository.update(messageId, newContent);
    logger.info(`Message ${messageId} edited by user ${userId}`);

    return message;
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: string, userId: string) {
    // Verify sender
    const isSender = await directMessageRepository.isSender(messageId, userId);
    if (!isSender) {
      throw new ApiError('You can only delete your own messages', 403);
    }

    await directMessageRepository.softDelete(messageId);
    logger.info(`Message ${messageId} deleted by user ${userId}`);

    return { success: true };
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, userId: string) {
    const role = await conversationRepository.getParticipantRole(conversationId, userId);
    if (!role) {
      throw new ApiError('You are not a participant in this conversation', 403);
    }

    await conversationRepository.markAsRead(conversationId, userId, role);
    await directMessageRepository.markAsRead(conversationId, userId);

    return { success: true };
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId: string, userId: string, archive = true) {
    const role = await conversationRepository.getParticipantRole(conversationId, userId);
    if (!role) {
      throw new ApiError('You are not a participant in this conversation', 403);
    }

    await conversationRepository.archive(conversationId, userId, role, archive);
    logger.info(`Conversation ${conversationId} ${archive ? 'archived' : 'unarchived'} by user ${userId}`);

    return { success: true };
  }

  /**
   * Search messages in a conversation
   */
  async searchMessages(conversationId: string, userId: string, searchTerm: string) {
    // Verify participation
    const isParticipant = await conversationRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ApiError('You are not a participant in this conversation', 403);
    }

    return await directMessageRepository.search(conversationId, searchTerm);
  }

  /**
   * Get unread count for all conversations
   */
  async getTotalUnreadCount(userId: string): Promise<number> {
    const user = await User.findByPk(userId);
    if (!user) return 0;

    const role = (user as any).role === 'instructor' ? 'instructor' : 'student';
    const result = await conversationRepository.findByUserId(userId, role, { includeArchived: false });

    let totalUnread = 0;
    for (const conv of result.rows) {
      const lastReadAt = role === 'student'
        ? (conv as any).student_last_read_at
        : (conv as any).instructor_last_read_at;

      totalUnread += await directMessageRepository.countUnread((conv as any).id, userId, lastReadAt);
    }

    return totalUnread;
  }

  /**
   * Check if user has access to a conversation (for socket gateway)
   */
  async checkUserAccess(conversationId: string, userId: string): Promise<boolean> {
    return await conversationRepository.isParticipant(conversationId, userId);
  }

  /**
   * Get conversation by ID (basic info for gateway)
   */
  async getConversationById(conversationId: string) {
    const conv = await conversationRepository.findById(conversationId);
    if (!conv) return null;
    
    const convData = (conv as any).toJSON();
    return {
      id: convData.id,
      studentId: convData.student_id,
      instructorId: convData.instructor_id,
      courseId: convData.course_id,
    };
  }

  /**
   * Send message from gateway (simplified interface)
   */
  async sendMessageFromGateway(
    conversationId: string,
    senderId: string,
    data: { content: string; attachmentUrl?: string; attachmentType?: string }
  ) {
    const isParticipant = await conversationRepository.isParticipant(conversationId, senderId);
    if (!isParticipant) {
      throw new ApiError('You are not a participant in this conversation', 403);
    }

    const message = await directMessageRepository.create({
      conversation_id: conversationId,
      sender_id: senderId,
      content: data.content,
      attachment_url: data.attachmentUrl,
      attachment_type: data.attachmentType as any,
    });

    await conversationRepository.updateLastMessageAt(conversationId);
    return message;
  }

  /**
   * Mark a single message as read
   */
  async markMessageAsRead(messageId: string, userId: string) {
    const message = await directMessageRepository.findById(messageId);
    if (!message) {
      throw new ApiError('Message not found', 404);
    }

    const conversationId = (message as any).conversation_id;
    const isParticipant = await conversationRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ApiError('You are not a participant in this conversation', 403);
    }

    // Only mark as read if user is not the sender
    if ((message as any).sender_id !== userId) {
      await directMessageRepository.markSingleAsRead(messageId);
    }
  }

  /**
   * Get unread count for gateway
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.getTotalUnreadCount(userId);
  }
}

export const conversationService = new ConversationService();
export default conversationService;

