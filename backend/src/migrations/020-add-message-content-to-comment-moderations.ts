/**
 * Migration: Add message_content column to comment_moderations table
 * Version: 020
 * Description: Adds message_content column to store comment content even when blocked
 */

import { QueryInterface, DataTypes } from 'sequelize';

export const version = '020';
export const description = 'Add message_content column to comment_moderations table';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Check if column already exists
  const tableDescription = await queryInterface.describeTable('comment_moderations');
  
  if (!tableDescription.message_content) {
    await queryInterface.addColumn('comment_moderations', 'message_content', {
      type: DataTypes.TEXT,
      allowNull: true, // Allow null initially for existing records
    });
    
    // Update existing records: try to get message content from live_session_messages
    await queryInterface.sequelize.query(`
      UPDATE comment_moderations cm
      SET message_content = lsm.message
      FROM live_session_messages lsm
      WHERE cm.message_id = lsm.id
        AND cm.message_content IS NULL;
    `);
    
    // Set default for records without message_id
    await queryInterface.sequelize.query(`
      UPDATE comment_moderations
      SET message_content = 'N/A'
      WHERE message_content IS NULL;
    `);
    
    // Now make it NOT NULL
    await queryInterface.changeColumn('comment_moderations', 'message_content', {
      type: DataTypes.TEXT,
      allowNull: false,
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const tableDescription = await queryInterface.describeTable('comment_moderations');
  
  if (tableDescription.message_content) {
    await queryInterface.removeColumn('comment_moderations', 'message_content');
  }
}

