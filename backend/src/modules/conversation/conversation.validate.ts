/**
 * Conversation Validation Schemas
 * 
 * Zod schemas for validating conversation/DM requests
 */

import { z } from 'zod';

// Create conversation schema - supports both recipient_id (new) and course_id/instructor_id (legacy)
export const createConversationSchema = z.object({
  body: z.object({
    recipient_id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid recipient ID').optional(),
    course_id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid course ID').optional(),
    instructor_id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid instructor ID').optional(),
    initial_message: z.string().max(5000, 'Message too long').optional(),
  }).refine(data => data.recipient_id || (data.course_id && data.instructor_id), {
    message: 'Either recipient_id or both course_id and instructor_id are required',
  }),
});

// Send message schema
export const sendMessageSchema = z.object({
  params: z.object({
    conversationId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid conversation ID'),
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
    messageId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid message ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  }),
});

// Get messages query schema
export const getMessagesQuerySchema = z.object({
  params: z.object({
    conversationId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid conversation ID'),
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
    conversationId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid conversation ID'),
  }),
});

// Archive schema
export const archiveSchema = z.object({
  params: z.object({
    conversationId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid conversation ID'),
  }),
  body: z.object({
    archive: z.boolean().default(true),
  }),
});

// Search messages schema
export const searchMessagesSchema = z.object({
  params: z.object({
    conversationId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid conversation ID'),
  }),
  query: z.object({
    q: z.string().min(1, 'Search query required').max(100),
  }),
});

// Conversation ID param schema
export const conversationIdParamSchema = z.object({
  params: z.object({
    conversationId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid conversation ID'),
  }),
});

// Message ID param schema
export const messageIdParamSchema = z.object({
  params: z.object({
    messageId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid message ID'),
  }),
});

// Types from schemas
export type CreateConversationInput = z.infer<typeof createConversationSchema>['body'];
export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];
export type EditMessageInput = z.infer<typeof editMessageSchema>['body'];
export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>['query'];
export type GetConversationsQuery = z.infer<typeof getConversationsQuerySchema>['query'];
