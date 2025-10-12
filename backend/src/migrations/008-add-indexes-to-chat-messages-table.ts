/**
 * Migration 008: Add indexes to chat messages table
 */

import { QueryInterface } from 'sequelize';

export async function addIndexesToChatMessagesTable(queryInterface: QueryInterface): Promise<void> {
  // Course ID index
  await queryInterface.addIndex('chat_messages', ['course_id'], {
    name: 'idx_chat_messages_course_id'
  });

  // User ID index
  await queryInterface.addIndex('chat_messages', ['user_id'], {
    name: 'idx_chat_messages_user_id'
  });

  // Message type index
  await queryInterface.addIndex('chat_messages', ['message_type'], {
    name: 'idx_chat_messages_message_type'
  });

  // Reply to message ID index
  await queryInterface.addIndex('chat_messages', ['reply_to_message_id'], {
    name: 'idx_chat_messages_reply_to_message_id'
  });

  // Is edited index
  await queryInterface.addIndex('chat_messages', ['is_edited'], {
    name: 'idx_chat_messages_is_edited'
  });

  // Is deleted index
  await queryInterface.addIndex('chat_messages', ['is_deleted'], {
    name: 'idx_chat_messages_is_deleted'
  });

  // Is pinned index
  await queryInterface.addIndex('chat_messages', ['is_pinned'], {
    name: 'idx_chat_messages_is_pinned'
  });

  // Created at index for sorting
  await queryInterface.addIndex('chat_messages', ['created_at'], {
    name: 'idx_chat_messages_created_at'
  });

  // Updated at index
  await queryInterface.addIndex('chat_messages', ['updated_at'], {
    name: 'idx_chat_messages_updated_at'
  });

  // Composite index for course messages
  await queryInterface.addIndex('chat_messages', ['course_id', 'created_at'], {
    name: 'idx_chat_messages_course_created_at'
  });

  // Composite index for active messages
  await queryInterface.addIndex('chat_messages', ['course_id', 'is_deleted', 'created_at'], {
    name: 'idx_chat_messages_course_active'
  });

  // Composite index for pinned messages
  await queryInterface.addIndex('chat_messages', ['course_id', 'is_pinned', 'created_at'], {
    name: 'idx_chat_messages_course_pinned'
  });
}
