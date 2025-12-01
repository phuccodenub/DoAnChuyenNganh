/**
 * Migration: Create comment_moderations table
 * Version: 019a
 * Description: Creates the comment_moderations table for storing moderation history
 * 
 * Note: This migration was missing - tables 020, 021, 022 depend on this table existing
 */

import { QueryInterface, DataTypes } from 'sequelize';

export const version = '019a';
export const description = 'Create comment_moderations table';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Check if table already exists
  const tableExists = await queryInterface.sequelize.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comment_moderations'
    );`,
    { type: 'SELECT' }
  ) as any[];
  
  if (tableExists[0]?.exists) {
    console.log('Table comment_moderations already exists, skipping creation');
    return;
  }

  // First, ensure the enum type exists
  try {
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."enum_comment_moderations_status" AS ENUM('pending', 'approved', 'rejected', 'blocked', 'flagged');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
  } catch (error) {
    // Enum may already exist, which is fine
  }

  await queryInterface.createTable('comment_moderations', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    message_id: {
      type: DataTypes.UUID,
      allowNull: true, // Can be null if comment was blocked before saving
      references: { model: 'live_session_messages', key: 'id' },
      onDelete: 'CASCADE',
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'live_sessions', key: 'id' },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    // Moderation result
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'blocked', 'flagged'),
      allowNull: false,
      defaultValue: 'pending',
    },
    // AI moderation result
    ai_checked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ai_risk_score: {
      type: DataTypes.DECIMAL(5, 2), // 0.00 - 1.00
      allowNull: true,
    },
    ai_risk_categories: {
      type: DataTypes.ARRAY(DataTypes.STRING), // ['toxicity', 'spam', 'profanity', etc.]
      allowNull: false,
      defaultValue: [],
    },
    ai_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Manual moderation
    moderated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    },
    moderation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    moderated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Violation tracking
    violation_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // Metadata
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
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

  // Add indexes
  await queryInterface.addIndex('comment_moderations', ['message_id']);
  await queryInterface.addIndex('comment_moderations', ['session_id']);
  await queryInterface.addIndex('comment_moderations', ['user_id']);
  await queryInterface.addIndex('comment_moderations', ['status']);
  await queryInterface.addIndex('comment_moderations', ['created_at']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('comment_moderations');
  
  // Drop enum type
  try {
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "public"."enum_comment_moderations_status";
    `);
  } catch (error) {
    // Ignore if enum doesn't exist
  }
}
