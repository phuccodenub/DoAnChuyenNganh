/**
 * Migration 033: Create course_chat_read_status table
 * Track last read position for each user in each course chat
 */

import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('course_chat_read_status', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    last_read_message_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'chat_messages',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    last_read_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Add unique constraint to prevent duplicate entries
  await queryInterface.addConstraint('course_chat_read_status', {
    fields: ['course_id', 'user_id'],
    type: 'unique',
    name: 'unique_course_user_read_status',
  });

  // Add index for faster lookups
  await queryInterface.addIndex('course_chat_read_status', ['user_id'], {
    name: 'idx_course_chat_read_status_user',
  });

  await queryInterface.addIndex('course_chat_read_status', ['course_id'], {
    name: 'idx_course_chat_read_status_course',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('course_chat_read_status');
}
