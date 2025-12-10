/**
 * Migration 024: Create Direct Messages Table
 * 
 * Messages within conversations (1-on-1 DM between student and instructor)
 */

import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

// Helper to check if table exists
async function tableExists(queryInterface: QueryInterface, tableName: string): Promise<boolean> {
  const [results] = await queryInterface.sequelize.query(
    `SELECT table_name FROM information_schema.tables WHERE table_name = '${tableName}'`,
    { type: QueryTypes.SELECT }
  ) as [{ table_name: string }[], unknown];
  return results !== undefined && (results as any).table_name === tableName;
}

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Skip if table already exists
  if (await tableExists(queryInterface, 'direct_messages')) {
    console.log('Table direct_messages already exists, skipping...');
    return;
  }

  // Create message_status enum if not exists
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE direct_message_status AS ENUM ('sending', 'sent', 'delivered', 'read', 'failed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Create attachment_type enum if not exists
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE dm_attachment_type AS ENUM ('image', 'file');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await queryInterface.createTable('direct_messages', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: 'direct_message_status',
      defaultValue: 'sent',
    },
    attachment_type: {
      type: 'dm_attachment_type',
      allowNull: true,
    },
    attachment_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachment_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    attachment_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_edited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    edited_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
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

  // Add indexes for common queries
  await queryInterface.addIndex('direct_messages', ['conversation_id'], {
    name: 'idx_direct_messages_conversation_id',
  });

  await queryInterface.addIndex('direct_messages', ['sender_id'], {
    name: 'idx_direct_messages_sender_id',
  });

  await queryInterface.addIndex('direct_messages', ['conversation_id', 'created_at'], {
    name: 'idx_direct_messages_conversation_created',
  });

  await queryInterface.addIndex('direct_messages', ['created_at'], {
    name: 'idx_direct_messages_created_at',
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('direct_messages');
  
  // Drop custom enums
  await queryInterface.sequelize.query(`
    DROP TYPE IF EXISTS direct_message_status;
    DROP TYPE IF EXISTS dm_attachment_type;
  `);
};
