/**
 * Chat Controller
 * HTTP endpoints for chat operations (REST API fallback)
 */

import { Request, Response, NextFunction } from 'express';
import { ChatService } from './chat.service';
import { GetMessagesOptions, SearchMessagesOptions } from './chat.types';
import { sendSuccessResponse, sendErrorResponse } from '../../utils/response.util';
import logger from '../../utils/logger.util';

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

      sendSuccessResponse(res, 'Messages retrieved successfully', result);
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
      const { message, message_type, file_url, file_name, file_size, reply_to } = req.body;

      const result = await this.chatService.sendMessage({
        course_id: courseId,
        sender_id: userId,
        message,
        message_type,
        file_url,
        file_name,
        file_size,
        reply_to
      });

      sendSuccessResponse(res, 'Message sent successfully', result);
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
      const { message } = req.body;

      const result = await this.chatService.updateMessage(messageId, userId, { message });

      sendSuccessResponse(res, 'Message updated successfully', result);
    } catch (error: unknown) {
      logger.error('Error in updateMessage:', error);
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

      sendSuccessResponse(res, 'Message deleted successfully', null);
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
        sendErrorResponse(res, 'Search term is required', 400);
        return;
      }

      const options: SearchMessagesOptions = {
        courseId,
        searchTerm: searchTerm as string,
        page: Number(page),
        limit: Number(limit)
      };

      const result = await this.chatService.searchMessages(options);

      sendSuccessResponse(res, 'Search completed successfully', result);
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

      sendSuccessResponse(res, 'Statistics retrieved successfully', result);
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

      sendSuccessResponse(res, 'Messages retrieved successfully', result);
    } catch (error: unknown) {
      logger.error('Error in getMessagesByType:', error);
      next(error);
    }
  };
}
