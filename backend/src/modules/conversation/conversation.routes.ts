/**
 * Conversation Routes
 * 
 * API routes for direct messaging (DM) feature
 */

import { Router } from 'express';
import { conversationController } from './conversation.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateRequest, validateParams } from '../../middlewares/validate.middleware';
import {
  createConversationSchema,
  sendMessageSchema,
  editMessageSchema,
  getMessagesQuerySchema,
  getConversationsQuerySchema,
  markAsReadSchema,
  archiveSchema,
  searchMessagesSchema,
  messageIdParamSchema,
} from './conversation.validate';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/v1/conversations
 * @desc    Get all conversations for current user
 * @access  Private
 */
router.get(
  '/',
  validateRequest({ query: getConversationsQuerySchema.shape.query }),
  conversationController.getConversations
);

/**
 * @route   GET /api/v1/conversations/unread-count
 * @desc    Get total unread message count
 * @access  Private
 */
router.get('/unread-count', conversationController.getUnreadCount);

/**
 * @route   POST /api/v1/conversations
 * @desc    Create a new conversation or get existing one
 * @access  Private
 */
router.post(
  '/',
  validateRequest({ body: createConversationSchema.shape.body }),
  conversationController.createConversation
);

/**
 * @route   GET /api/v1/conversations/:conversationId
 * @desc    Get a specific conversation
 * @access  Private
 */
router.get(
  '/:conversationId',
  validateParams(getMessagesQuerySchema.shape.params),
  conversationController.getConversation
);

/**
 * @route   GET /api/v1/conversations/:conversationId/messages
 * @desc    Get messages for a conversation
 * @access  Private
 */
router.get(
  '/:conversationId/messages',
  validateRequest({
    params: getMessagesQuerySchema.shape.params,
    query: getMessagesQuerySchema.shape.query,
  }),
  conversationController.getMessages
);

/**
 * @route   POST /api/v1/conversations/:conversationId/messages
 * @desc    Send a message in a conversation
 * @access  Private
 */
router.post(
  '/:conversationId/messages',
  validateRequest({
    params: sendMessageSchema.shape.params,
    body: sendMessageSchema.shape.body,
  }),
  conversationController.sendMessage
);

/**
 * @route   PUT /api/v1/conversations/:conversationId/read
 * @desc    Mark all messages as read
 * @access  Private
 */
router.put(
  '/:conversationId/read',
  validateParams(markAsReadSchema.shape.params),
  conversationController.markAsRead
);

/**
 * @route   GET /api/v1/conversations/:conversationId/online-status
 * @desc    Get real-time online status of conversation participant
 * @access  Private
 */
router.get(
  '/:conversationId/online-status',
  conversationController.getOnlineStatus
);

/**
 * @route   PUT /api/v1/conversations/:conversationId/archive
 * @desc    Archive or unarchive a conversation
 * @access  Private
 */
router.put(
  '/:conversationId/archive',
  validateRequest({
    params: archiveSchema.shape.params,
    body: archiveSchema.shape.body,
  }),
  conversationController.archiveConversation
);

/**
 * @route   GET /api/v1/conversations/:conversationId/search
 * @desc    Search messages in a conversation
 * @access  Private
 */
router.get(
  '/:conversationId/search',
  validateRequest({
    params: searchMessagesSchema.shape.params,
    query: searchMessagesSchema.shape.query,
  }),
  conversationController.searchMessages
);

export default router;
