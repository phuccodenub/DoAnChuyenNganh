/**
 * Migration 004: Create chat messages table
 */

import { QueryInterface, DataTypes } from 'sequelize';

export async function createChatMessagesTable(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('chat_messages', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'file', 'system', 'announcement'),
      allowNull: false,
      defaultValue: 'text'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachment_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    attachment_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    attachment_size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    attachment_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    reply_to_message_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'chat_messages',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    is_edited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    edited_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deleted_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    is_pinned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    pinned_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pinned_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    reactions: {
      type: DataTypes.JSON,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });
}

