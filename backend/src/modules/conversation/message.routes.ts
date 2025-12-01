/**
 * Message Routes
 * 
 * Separate routes for message operations (edit, delete)
 */

import { Router } from 'express';
import { conversationController } from './conversation.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateRequest, validateParams } from '../../middlewares/validate.middleware';
import { editMessageSchema, messageIdParamSchema } from './conversation.validate';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   PUT /api/v1/messages/:messageId
 * @desc    Edit a message
 * @access  Private
 */
router.put(
  '/:messageId',
  validateRequest({
    params: messageIdParamSchema.shape.params,
    body: editMessageSchema.shape.body,
  }),
  conversationController.editMessage
);

/**
 * @route   DELETE /api/v1/messages/:messageId
 * @desc    Delete a message (soft delete)
 * @access  Private
 */
router.delete(
  '/:messageId',
  validateParams(messageIdParamSchema.shape.params),
  conversationController.deleteMessage
);

export default router;
