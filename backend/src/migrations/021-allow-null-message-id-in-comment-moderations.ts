/**
 * Migration: Allow null message_id in comment_moderations table
 * Version: 021
 * Description: Allows message_id to be null for comments blocked before saving
 */

import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';
import logger from '../utils/logger.util';

export const version = '021';
export const description = 'Allow null message_id in comment_moderations table';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Check if column is already nullable
  const [result] = await queryInterface.sequelize.query(
    `SELECT is_nullable FROM information_schema.columns 
     WHERE table_name = 'comment_moderations' AND column_name = 'message_id'`,
    { type: QueryTypes.SELECT }
  ) as [{ is_nullable: string }[], unknown];
  
  if (result && (result as any).is_nullable === 'YES') {
    logger.info('[Migration 021] message_id column is already nullable, skipping...');
    return;
  }

  // First, drop the NOT NULL constraint
  await queryInterface.sequelize.query(`
    ALTER TABLE comment_moderations 
    ALTER COLUMN message_id DROP NOT NULL;
  `);
  
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

