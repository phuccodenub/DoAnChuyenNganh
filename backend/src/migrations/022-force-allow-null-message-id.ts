/**
 * Migration: Force allow null message_id in comment_moderations table
 * Version: 022
 * Description: Direct SQL to ensure message_id can be null
 */

import { QueryInterface } from 'sequelize';
import logger from '../utils/logger.util';

export const version = '022';
export const description = 'Force allow null message_id in comment_moderations table';

export async function up(queryInterface: QueryInterface): Promise<void> {
  try {
    // Use raw SQL to drop NOT NULL constraint (most reliable method)
    await queryInterface.sequelize.query(`
      ALTER TABLE comment_moderations 
      ALTER COLUMN message_id DROP NOT NULL;
    `);
    logger.info('[Migration 022] Successfully dropped NOT NULL constraint on message_id');
  } catch (error: any) {
    // If constraint doesn't exist or already allows null, that's fine
    if (error.message?.includes('does not exist') || error.message?.includes('already')) {
      logger.info('[Migration 022] message_id already allows NULL or constraint does not exist');
    } else {
      throw error;
    }
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Delete records with null message_id first
  await queryInterface.sequelize.query(`
    DELETE FROM comment_moderations WHERE message_id IS NULL;
  `);
  
  // Then add NOT NULL constraint back
  await queryInterface.sequelize.query(`
    ALTER TABLE comment_moderations 
    ALTER COLUMN message_id SET NOT NULL;
  `);
}

