/**
 * Chat Controller
 * HTTP endpoints for chat operations (REST API fallback)
 */

import { Request, Response, NextFunction } from 'express';
import { ChatService } from './chat.service';
import { GetMessagesOptions, SearchMessagesOptions } from './chat.types';
import { responseUtils } from '../../utils/response.util';
import logger from '../../utils/logger.util';
import { getChatGateway } from './chat.gateway';

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  /**
   * Get messages for a course
   * GET /chat/courses/:courseId/messages
   */
  getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const {
        page = 1,
        limit = 50,
        beforeMessageId,
        afterMessageId,
        searchTerm,
        messageType
      } = req.query;

      const options: GetMessagesOptions = {
        courseId,
        page: Number(page),
        limit: Number(limit),
        beforeMessageId: beforeMessageId as string,
        afterMessageId: afterMessageId as string,
        searchTerm: searchTerm as string,
        messageType: messageType as any
      };

      const result = await this.chatService.getMessages(options);

      responseUtils.sendSuccess(res, 'Messages retrieved successfully', result);
    } catch (error: unknown) {
      logger.error('Error in getMessages:', error);
      next(error);
    }
  };

  /**
   * Send a message (REST fallback)
   * POST /chat/courses/:courseId/messages
   */
  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userId = req.user!.userId;
      const { 
        content, 
        message_type, 
        attachment_url, 
        attachment_name, 
        attachment_size,
        attachment_type,
        reply_to_message_id 
      } = req.body;

      const result = await this.chatService.sendMessage({
        course_id: courseId,
        user_id: userId,
        content,
        message_type,
        attachment_url,
        attachment_name,
        attachment_size,
        attachment_type,
        reply_to_message_id
      });

      // ✅ CRITICAL: Emit Socket.IO event for real-time delivery (excluding sender)
      const gateway = getChatGateway();
      if (gateway) {
        await gateway.notifyNewMessage(courseId, result, userId);
      } else {
        logger.warn('[ChatController] ChatGateway not available for real-time notification');
      }

      responseUtils.sendSuccess(res, 'Message sent successfully', result);
    } catch (error: unknown) {
      logger.error('Error in sendMessage:', error);
      next(error);
    }
  };

  /**
   * Update a message
   * PUT /chat/messages/:messageId
   */
  updateMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { messageId } = req.params;
      const userId = req.user!.userId;
      const { content } = req.body;

      const result = await this.chatService.updateMessage(messageId, userId, content);

      responseUtils.sendSuccess(res, 'Message updated successfully', result);
    } catch (error: unknown) {
      logger.error('Error in updateMessage:', error);
      next(error);
    }
  };

  /**
   * Get unread message count for all enrolled courses
   * GET /chat/unread-count
   * Returns the number of COURSES that have unread messages (not total message count)
   */
  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;

      // Get total count of courses with unread messages
      const unreadCount = await this.chatService.getTotalUnreadCount(userId);

      responseUtils.sendSuccess(res, 'Unread count retrieved', { unread_count: unreadCount });
    } catch (error: unknown) {
      logger.error('Error in getUnreadCount:', error);
      next(error);
    }
  };

  /**
   * Get unread count for each enrolled course
   * GET /chat/unread-count-per-course
   * Returns array of { course_id, unread_count }
   */
  getUnreadCountPerCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const unreadCounts = await this.chatService.getUnreadCountPerCourse(userId);

      responseUtils.sendSuccess(res, 'Unread counts retrieved', unreadCounts);
    } catch (error: unknown) {
      logger.error('Error in getUnreadCountPerCourse:', error);
      next(error);
    }
  };

  /**
   * Delete a message
   * DELETE /chat/messages/:messageId
   */
  deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { messageId } = req.params;
      const userId = req.user!.userId;

      await this.chatService.deleteMessage(messageId, userId);

      responseUtils.sendSuccess(res, 'Message deleted successfully', null);
    } catch (error: unknown) {
      logger.error('Error in deleteMessage:', error);
      next(error);
    }
  };

  /**
   * Search messages
   * GET /chat/courses/:courseId/messages/search
   */
  searchMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const { searchTerm, page = 1, limit = 50 } = req.query;

      if (!searchTerm) {
        responseUtils.sendError(res, 'Search term is required', 400);
        return;
      }

      const options: SearchMessagesOptions = {
        courseId,
        searchTerm: searchTerm as string,
        page: Number(page),
        limit: Number(limit)
      };

      const result = await this.chatService.searchMessages(options);

      responseUtils.sendSuccess(res, 'Search completed successfully', result);
    } catch (error: unknown) {
      logger.error('Error in searchMessages:', error);
      next(error);
    }
  };

  /**
   * Get chat statistics
   * GET /chat/courses/:courseId/statistics
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;

      const result = await this.chatService.getChatStatistics(courseId);

      responseUtils.sendSuccess(res, 'Statistics retrieved successfully', result);
    } catch (error: unknown) {
      logger.error('Error in getStatistics:', error);
      next(error);
    }
  };

  /**
   * Get messages by type
   * GET /chat/courses/:courseId/messages/type/:messageType
   */
  getMessagesByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId, messageType } = req.params;

      const result = await this.chatService.getMessagesByType(courseId, messageType);

      responseUtils.sendSuccess(res, 'Messages retrieved successfully', result);
    } catch (error: unknown) {
      logger.error('Error in getMessagesByType:', error);
      next(error);
    }
  };

  /**
   * Mark all messages in a course as read
   * POST /chat/courses/:courseId/mark-read
   */
  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const userId = req.user!.userId;

      await this.chatService.markCourseAsRead(courseId, userId);

      responseUtils.sendSuccess(res, 'Messages marked as read', null);
    } catch (error: unknown) {
      logger.error('Error in markAsRead:', error);
      next(error);
    }
  };
}
