/**
 * Course Chat Read Status Model
 * Tracks when each user last read messages in a course chat
 */

import { DataTypes } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import type { CourseChatReadStatusInstance } from '../types/model.types';
import { exportModel, addStaticMethods, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const CourseChatReadStatus = sequelize.define('CourseChatReadStatus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    },
    onDelete: 'CASCADE',
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
  },
  last_read_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'course_chat_read_status',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['course_id', 'user_id'],
      name: 'course_chat_read_status_course_user_unique'
    },
    {
      fields: ['user_id'],
      name: 'course_chat_read_status_user_id_idx'
    },
    {
      fields: ['course_id'],
      name: 'course_chat_read_status_course_id_idx'
    }
  ]
});

const CourseChatReadStatusModel = CourseChatReadStatus as unknown as ModelStatic<CourseChatReadStatusInstance>;

// Static Methods
addStaticMethods(CourseChatReadStatusModel, {
  /**
   * Update or create last read timestamp for a user in a course
   */
  async updateLastRead(
    this: ModelStatic<CourseChatReadStatusInstance>,
    courseId: string,
    userId: string
  ): Promise<CourseChatReadStatusInstance> {
    // Use findOne + create or update pattern instead of upsert
    const existing = await this.findOne({
      where: {
        course_id: courseId,
        user_id: userId,
      },
    });

    if (existing) {
      existing.last_read_at = new Date();
      await (existing as any).save();
      return existing;
    } else {
      return await this.create({
        course_id: courseId,
        user_id: userId,
        last_read_at: new Date(),
      } as any);
    }
  },

  /**
   * Get last read timestamp for a user in a course
   */
  async getLastRead(
    this: ModelStatic<CourseChatReadStatusInstance>,
    courseId: string,
    userId: string
  ): Promise<Date | null> {
    const record = await this.findOne({
      where: {
        course_id: courseId,
        user_id: userId,
      },
    });
    return record ? record.last_read_at : null;
  },
});

export default exportModel(CourseChatReadStatusModel);
