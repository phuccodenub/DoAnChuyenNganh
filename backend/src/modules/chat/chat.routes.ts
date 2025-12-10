/**
 * Chat Routes
 * HTTP endpoints for chat (REST API fallback when Socket.IO is not available)
 */

import { Router } from 'express';
import { ChatController } from './chat.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { messageRateLimiter } from '../../middlewares/message-rate-limit.middleware';

const router = Router();
const chatController = new ChatController();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /chat/unread-count
 * @desc    Get total count of courses with unread messages (not total message count)
 * @access  Private
 */
router.get('/unread-count', chatController.getUnreadCount);

/**
 * @route   GET /chat/unread-count-per-course
 * @desc    Get unread count for each enrolled course
 * @access  Private
 */
router.get('/unread-count-per-course', chatController.getUnreadCountPerCourse);

/**
 * @route   GET /chat/courses/:courseId/messages
 * @desc    Get messages for a course (with pagination)
 * @access  Private (authenticated users in the course)
 */
router.get('/courses/:courseId/messages', chatController.getMessages);

/**
 * @route   POST /chat/courses/:courseId/messages
 * @desc    Send a message to course chat (REST fallback)
 * @access  Private (authenticated users in the course)
 */
router.post(
  '/courses/:courseId/messages',
  messageRateLimiter.limit,
  chatController.sendMessage
);

/**
 * @route   GET /chat/courses/:courseId/messages/search
 * @desc    Search messages in a course
 * @access  Private (authenticated users in the course)
 */
router.get('/courses/:courseId/messages/search', chatController.searchMessages);

/**
 * @route   GET /chat/courses/:courseId/statistics
 * @desc    Get chat statistics for a course
 * @access  Private (authenticated users in the course)
 */
router.get('/courses/:courseId/statistics', chatController.getStatistics);

/**
 * @route   GET /chat/courses/:courseId/messages/type/:messageType
 * @desc    Get messages by type (text, file, image, etc.)
 * @access  Private (authenticated users in the course)
 */
router.get('/courses/:courseId/messages/type/:messageType', chatController.getMessagesByType);

/**
 * @route   POST /chat/courses/:courseId/mark-read
 * @desc    Mark all messages in a course as read
 * @access  Private (authenticated users in the course)
 */
router.post('/courses/:courseId/mark-read', chatController.markAsRead);

/**
 * @route   PUT /chat/messages/:messageId
 * @desc    Update/edit a message
 * @access  Private (message sender only)
 */
router.put('/messages/:messageId', chatController.updateMessage);

/**
 * @route   DELETE /chat/messages/:messageId
 * @desc    Delete a message
 * @access  Private (message sender only)
 */
router.delete('/messages/:messageId', chatController.deleteMessage);

export default router;
