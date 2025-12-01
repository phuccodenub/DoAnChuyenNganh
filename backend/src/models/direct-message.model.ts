/**
 * Direct Message Model
 * 
 * Represents a message within a conversation (1-on-1 DM)
 */

import { DataTypes, Op } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { DirectMessageInstance } from '../types/model.types';
import { exportModel, addStaticMethods, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const DirectMessage = sequelize.define('DirectMessage', {
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
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('sending', 'sent', 'delivered', 'read', 'failed'),
    defaultValue: 'sent',
  },
  attachment_type: {
    type: DataTypes.ENUM('image', 'file'),
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
}, {
  tableName: 'direct_messages',
  timestamps: true,
  underscored: true,
});

const DirectMessageModel = DirectMessage as unknown as ModelStatic<DirectMessageInstance>;

// Static Methods
addStaticMethods(DirectMessageModel, {
  /**
   * Get messages for a conversation with pagination
   */
  async getMessagesForConversation(
    this: ModelStatic<DirectMessageInstance>,
    conversationId: string,
    options: { limit?: number; before?: string; after?: string } = {}
  ) {
    const { limit = 50, before, after } = options;
    
    const whereClause: Record<string, unknown> = {
      conversation_id: conversationId,
      is_deleted: false,
    };

    if (before) {
      whereClause.created_at = { [Op.lt]: new Date(before) };
    } else if (after) {
      whereClause.created_at = { [Op.gt]: new Date(after) };
    }

    return await this.findAll({
      where: whereClause,
      include: [
        {
          model: sequelize.models.User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'role'],
        },
      ],
      order: [['created_at', before ? 'DESC' : 'ASC']],
      limit,
    });
  },

  /**
   * Count unread messages for a user in a conversation
   */
  async countUnreadMessages(
    this: ModelStatic<DirectMessageInstance>,
    conversationId: string,
    userId: string,
    lastReadAt: Date | null
  ) {
    const whereClause: Record<string, unknown> = {
      conversation_id: conversationId,
      sender_id: { [Op.ne]: userId },
      is_deleted: false,
    };

    if (lastReadAt) {
      whereClause.created_at = { [Op.gt]: lastReadAt };
    }

    return await this.count({ where: whereClause });
  },

  /**
   * Get the last message of a conversation
   */
  async getLastMessage(
    this: ModelStatic<DirectMessageInstance>,
    conversationId: string
  ) {
    return await this.findOne({
      where: {
        conversation_id: conversationId,
        is_deleted: false,
      },
      include: [
        {
          model: sequelize.models.User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'role'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  },
});

export default exportModel(DirectMessageModel);
