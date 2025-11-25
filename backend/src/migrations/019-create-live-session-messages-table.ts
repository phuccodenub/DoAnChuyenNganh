/**
 * Migration 019: Create live_session_messages table
 * Lưu trữ messages trong livestream sessions
 */

import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Create enum type for message_type
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE "enum_live_session_messages_message_type" AS ENUM ('text', 'emoji', 'system');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await queryInterface.createTable('live_session_messages', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'live_sessions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    message_type: {
      type: DataTypes.ENUM('text', 'emoji', 'system'),
      allowNull: false,
      defaultValue: 'text'
    },
    reply_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'live_session_messages',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
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

  // Add indexes
  await queryInterface.addIndex('live_session_messages', ['session_id'], {
    name: 'idx_live_session_messages_session_id'
  });

  await queryInterface.addIndex('live_session_messages', ['sender_id'], {
    name: 'idx_live_session_messages_sender_id'
  });

  await queryInterface.addIndex('live_session_messages', ['created_at'], {
    name: 'idx_live_session_messages_created_at'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('live_session_messages');
  
  // Drop enum type
  await queryInterface.sequelize.query(`
    DROP TYPE IF EXISTS "enum_live_session_messages_message_type";
  `);
}

