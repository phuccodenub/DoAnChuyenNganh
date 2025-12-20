/**
 * AI Chat History Model
 * Lưu trữ lịch sử chat với AI Tutor
 */

import { DataTypes, Model } from 'sequelize';
import { exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const AIChatHistory = sequelize.define(
  'AIChatHistory',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'courses',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    lesson_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'lessons',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    role: {
      type: DataTypes.ENUM('user', 'assistant', 'system'),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    latency: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Response latency in milliseconds',
    },
    tokens_used: {
      type: DataTypes.INTEGER,
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
  },
  {
    sequelize,
    tableName: 'ai_chat_history',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id', 'created_at'],
      },
      {
        fields: ['course_id'],
      },
      {
        fields: ['lesson_id'],
      },
    ],
  },
  {
    tableName: 'ai_chat_history',
    timestamps: true,
    underscored: true,
  }
);

export default exportModel(AIChatHistory);
