/**
 * Conversation Validation Schemas
 * 
 * Zod schemas for validating conversation/DM requests
 */

import { z } from 'zod';

// Create conversation schema
export const createConversationSchema = z.object({
  body: z.object({
    course_id: z.string().uuid('Invalid course ID'),
    instructor_id: z.string().uuid('Invalid instructor ID'),
    initial_message: z.string().max(5000, 'Message too long').optional(),
  }),
});

// Send message schema
export const sendMessageSchema = z.object({
  params: z.object({
    conversationId: z.string().uuid('Invalid conversation ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
    attachment_type: z.enum(['image', 'file']).optional(),
    attachment_url: z.string().url('Invalid attachment URL').optional(),
    attachment_name: z.string().max(255).optional(),
    attachment_size: z.number().positive().optional(),
  }),
});

// Edit message schema
export const editMessageSchema = z.object({
  params: z.object({
    messageId: z.string().uuid('Invalid message ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  }),
});

// Get messages query schema
export const getMessagesQuerySchema = z.object({
  params: z.object({
    conversationId: z.string().uuid('Invalid conversation ID'),
  }),
  query: z.object({
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
    before: z.string().datetime().optional(),
    after: z.string().datetime().optional(),
  }),
});

// Get conversations query schema
export const getConversationsQuerySchema = z.object({
  query: z.object({
    include_archived: z.string().optional().transform(val => val === 'true'),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50),
    offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
  }),
});

// Mark as read schema
export const markAsReadSchema = z.object({
  params: z.object({
    conversationId: z.string().uuid('Invalid conversation ID'),
  }),
});

// Archive schema
export const archiveSchema = z.object({
  params: z.object({
    conversationId: z.string().uuid('Invalid conversation ID'),
  }),
  body: z.object({
    archive: z.boolean().default(true),
  }),
});

// Search messages schema
export const searchMessagesSchema = z.object({
  params: z.object({
    conversationId: z.string().uuid('Invalid conversation ID'),
  }),
  query: z.object({
    q: z.string().min(1, 'Search query required').max(100),
  }),
});

// Conversation ID param schema
export const conversationIdParamSchema = z.object({
  params: z.object({
    conversationId: z.string().uuid('Invalid conversation ID'),
  }),
});

// Message ID param schema
export const messageIdParamSchema = z.object({
  params: z.object({
    messageId: z.string().uuid('Invalid message ID'),
  }),
});

// Types from schemas
export type CreateConversationInput = z.infer<typeof createConversationSchema>['body'];
export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];
export type EditMessageInput = z.infer<typeof editMessageSchema>['body'];
export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>['query'];
export type GetConversationsQuery = z.infer<typeof getConversationsQuerySchema>['query'];
