/**
 * Conversation Model
 * 
 * Represents a direct message conversation between any two users
 * (student, instructor, or admin) optionally in the context of a course.
 */

import { DataTypes } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { ConversationInstance } from '../types/model.types';
import { exportModel, addStaticMethods, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: true, // Nullable for direct messages without course context
    references: {
      model: 'courses',
      key: 'id',
    },
  },
  user1_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  user2_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  last_message_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  user1_last_read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  user2_last_read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_archived_by_user1: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_archived_by_user2: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'conversations',
  timestamps: true,
  underscored: true,
});

const ConversationModel = Conversation as unknown as ModelStatic<ConversationInstance>;

// Static Methods
addStaticMethods(ConversationModel, {
  /**
   * Find or create conversation between two users for a course
   */
  async findOrCreateConversation(
    this: ModelStatic<ConversationInstance>,
    courseId: string,
    user1Id: string,
    user2Id: string
  ) {
    const [conversation, created] = await this.findOrCreate({
      where: {
        course_id: courseId,
        user1_id: user1Id,
        user2_id: user2Id,
      },
      defaults: {
        course_id: courseId,
        user1_id: user1Id,
        user2_id: user2Id,
      },
    });
    return { conversation, created };
  },

  /**
   * Get all conversations for a user
   */
  async getConversationsForUser(
    this: ModelStatic<ConversationInstance>,
    userId: string,
    includeArchived = false
  ) {
    const { Op } = require('sequelize');
    
    const whereClause: Record<string, unknown> = {
      [Op.or]: [
        { user1_id: userId },
        { user2_id: userId },
      ],
    };
    
    if (!includeArchived) {
      whereClause[Op.and] = [
        {
          [Op.or]: [
            { user1_id: userId, is_archived_by_user1: false },
            { user2_id: userId, is_archived_by_user2: false },
          ],
        },
      ];
    }

    return await this.findAll({
      where: whereClause,
      include: [
        {
          model: sequelize.models.User,
          as: 'user1',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'status', 'role'],
        },
        {
          model: sequelize.models.User,
          as: 'user2',
          attributes: ['id', 'first_name', 'last_name', 'avatar', 'status', 'role'],
        },
        {
          model: sequelize.models.Course,
          as: 'course',
          attributes: ['id', 'title', 'thumbnail'],
        },
      ],
      order: [['last_message_at', 'DESC NULLS LAST']],
    });
  },
});

export default exportModel(ConversationModel);
