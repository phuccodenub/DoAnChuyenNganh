/**
 * Conversation Controller
 * 
 * HTTP handlers for direct message endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { conversationService } from './conversation.service';
import { asyncHandler } from '../../middlewares/error.middleware';
import {
  CreateConversationInput,
  SendMessageInput,
  EditMessageInput,
  GetMessagesQuery,
  GetConversationsQuery,
} from './conversation.validate';
import { getConversationGateway } from './conversation.gateway';

export class ConversationController {
  /**
   * GET /api/v1/conversations
   * Get all conversations for the current user
   */
  getConversations = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const query = req.query as unknown as GetConversationsQuery;

    const result = await conversationService.getConversations(userId, {
      includeArchived: query.include_archived,
      limit: query.limit,
      offset: query.offset,
    });

    res.json({
      success: true,
      data: result.conversations,
      pagination: {
        total: result.total,
        limit: query.limit || 50,
        offset: query.offset || 0,
      },
    });
  });

  /**
   * GET /api/v1/conversations/:conversationId
   * Get a single conversation
   */
  getConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { conversationId } = req.params;

    const conversation = await conversationService.getConversation(conversationId, userId);

    res.json({
      success: true,
      data: conversation,
    });
  });

  /**
   * POST /api/v1/conversations
   * Create a new conversation or get existing one
   */
  createConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const body = req.body as CreateConversationInput;

    const { conversation, created } = await conversationService.createConversation(userId, body);

    res.status(created ? 201 : 200).json({
      success: true,
      data: conversation,
      created,
    });
  });

  /**
   * GET /api/v1/conversations/:conversationId/messages
   * Get messages for a conversation
   */
  getMessages = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { conversationId } = req.params;
    const query = req.query as unknown as GetMessagesQuery;

    const messages = await conversationService.getMessages(conversationId, userId, {
      limit: query.limit,
      before: query.before,
      after: query.after,
    });

    res.json({
      success: true,
      data: messages,
    });
  });

  /**
   * POST /api/v1/conversations/:conversationId/messages
   * Send a message in a conversation
   */
  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { conversationId } = req.params;
    const body = req.body as SendMessageInput;

    const message = await conversationService.sendMessage(userId, {
      conversation_id: conversationId,
      ...body,
    });

    // ✅ CRITICAL: Emit Socket.IO event for real-time delivery (excluding sender)
    const gateway = getConversationGateway();
    if (gateway) {
      await gateway.notifyNewMessage(conversationId, message, userId);
    } else {
      console.warn('[Controller] ConversationGateway not available for real-time notification');
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  });

  /**
   * PUT /api/v1/messages/:messageId
   * Edit a message
   */
  editMessage = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { messageId } = req.params;
    const { content } = req.body as EditMessageInput;

    const message = await conversationService.editMessage(messageId, userId, content);

    res.json({
      success: true,
      data: message,
    });
  });

  /**
   * DELETE /api/v1/messages/:messageId
   * Delete a message (soft delete)
   */
  deleteMessage = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { messageId } = req.params;

    await conversationService.deleteMessage(messageId, userId);

    res.json({
      success: true,
      message: 'Message deleted',
    });
  });

  /**
   * PUT /api/v1/conversations/:conversationId/read
   * Mark all messages in conversation as read
   */
  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { conversationId } = req.params;

    await conversationService.markAsRead(conversationId, userId);

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  });

  /**
   * PUT /api/v1/conversations/:conversationId/archive
   * Archive or unarchive a conversation
   */
  archiveConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { conversationId } = req.params;
    const { archive = true } = req.body;

    await conversationService.archiveConversation(conversationId, userId, archive);

    res.json({
      success: true,
      message: archive ? 'Conversation archived' : 'Conversation unarchived',
    });
  });

  /**
   * GET /api/v1/conversations/:conversationId/search
   * Search messages in a conversation
   */
  searchMessages = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { conversationId } = req.params;
    const { q } = req.query as { q: string };

    const messages = await conversationService.searchMessages(conversationId, userId, q);

    res.json({
      success: true,
      data: messages,
    });
  });

  /**
   * GET /api/v1/conversations/unread-count
   * Get total unread message count
   */
  getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    const count = await conversationService.getTotalUnreadCount(userId);

    res.json({
      success: true,
      data: { unread_count: count },
    });
  });

  /**
   * GET /api/v1/conversations/:conversationId/online-status
   * Get real-time online status of conversation participant
   */
  getOnlineStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { conversationId } = req.params;

    // Verify participation
    const conversation = await conversationService.getConversation(conversationId, userId);
    const gateway = getConversationGateway();
    
    if (!gateway) {
      return res.json({
        success: true,
        data: { isOnline: false },
      });
    }

    // Determine other user
    const otherUserId = (conversation as any).user1_id === userId 
      ? (conversation as any).user2_id 
      : (conversation as any).user1_id;

    const isOnline = gateway.isUserOnline(otherUserId);

    res.json({
      success: true,
      data: { isOnline },
    });
  });
}

export const conversationController = new ConversationController();
export default conversationController;
