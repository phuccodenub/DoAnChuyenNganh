/**
 * Migration 008: Add indexes to chat messages table
 */

import { QueryInterface } from 'sequelize';

// Helper to add index safely (ignore if already exists or column doesn't exist)
async function addIndexSafe(
  queryInterface: QueryInterface,
  table: string,
  columns: string[],
  options: { name: string; unique?: boolean }
): Promise<void> {
  try {
    await queryInterface.addIndex(table, columns, options);
  } catch (error: any) {
    // Ignore if index already exists (code 42P07) or column doesn't exist (code 42703)
    if (error?.parent?.code !== '42P07' && error?.parent?.code !== '42703') {
      throw error;
    }
  }
}

export async function addIndexesToChatMessagesTable(queryInterface: QueryInterface): Promise<void> {
  // Course ID index
  await addIndexSafe(queryInterface, 'chat_messages', ['course_id'], {
    name: 'idx_chat_messages_course_id'
  });

  // User ID index
  await addIndexSafe(queryInterface, 'chat_messages', ['user_id'], {
    name: 'idx_chat_messages_user_id'
  });

  // Message type index (may not exist)
  await addIndexSafe(queryInterface, 'chat_messages', ['message_type'], {
    name: 'idx_chat_messages_message_type'
  });

  // Reply to message ID index (may not exist)
  await addIndexSafe(queryInterface, 'chat_messages', ['reply_to_message_id'], {
    name: 'idx_chat_messages_reply_to_message_id'
  });

  // Is edited index (may not exist)
  await addIndexSafe(queryInterface, 'chat_messages', ['is_edited'], {
    name: 'idx_chat_messages_is_edited'
  });

  // Is deleted index (may not exist)
  await addIndexSafe(queryInterface, 'chat_messages', ['is_deleted'], {
    name: 'idx_chat_messages_is_deleted'
  });

  // Is pinned index (may not exist)
  await addIndexSafe(queryInterface, 'chat_messages', ['is_pinned'], {
    name: 'idx_chat_messages_is_pinned'
  });

  // Created at index for sorting
  await addIndexSafe(queryInterface, 'chat_messages', ['created_at'], {
    name: 'idx_chat_messages_created_at'
  });

  // Updated at index
  await addIndexSafe(queryInterface, 'chat_messages', ['updated_at'], {
    name: 'idx_chat_messages_updated_at'
  });

  // Composite index for course messages
  await addIndexSafe(queryInterface, 'chat_messages', ['course_id', 'created_at'], {
    name: 'idx_chat_messages_course_created_at'
  });

  // Composite index for active messages (may fail if is_deleted doesn't exist)
  await addIndexSafe(queryInterface, 'chat_messages', ['course_id', 'is_deleted', 'created_at'], {
    name: 'idx_chat_messages_course_active'
  });

  // Composite index for pinned messages (may fail if is_pinned doesn't exist)
  await addIndexSafe(queryInterface, 'chat_messages', ['course_id', 'is_pinned', 'created_at'], {
    name: 'idx_chat_messages_course_pinned'
  });
}

