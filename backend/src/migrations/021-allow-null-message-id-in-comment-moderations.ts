/**
 * Migration: Allow null message_id in comment_moderations table
 * Version: 021
 * Description: Allows message_id to be null for comments blocked before saving
 */

import { QueryInterface, DataTypes } from 'sequelize';
import logger from '../utils/logger.util';

export const version = '021';
export const description = 'Allow null message_id in comment_moderations table';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // First, drop the NOT NULL constraint
  await queryInterface.sequelize.query(`
    ALTER TABLE comment_moderations 
    ALTER COLUMN message_id DROP NOT NULL;
  `);
  
  // Then update the foreign key constraint if needed
  // The foreign key should already allow null, but we ensure it
  logger.info('[Migration 021] Updated message_id column to allow NULL');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Revert: make message_id NOT NULL again
  // First, set all null message_id to a default or delete those records
  await queryInterface.sequelize.query(`
    DELETE FROM comment_moderations WHERE message_id IS NULL;
  `);
  
  await queryInterface.changeColumn('comment_moderations', 'message_id', {
    type: DataTypes.UUID,
    allowNull: false,
    references: { 
      model: 'live_session_messages', 
      key: 'id' 
    },
    onDelete: 'CASCADE',
  });
}

