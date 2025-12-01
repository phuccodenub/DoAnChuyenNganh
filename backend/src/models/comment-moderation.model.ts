import { DataTypes } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

/**
 * Comment Moderation Model
 * Lưu trữ lịch sử moderation của các comment
 */
const CommentModeration = sequelize.define('CommentModeration', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  message_id: {
    type: DataTypes.UUID,
    allowNull: true, // Can be null if comment was blocked before saving
    references: { model: 'live_session_messages', key: 'id' },
    onDelete: 'CASCADE',
  },
  message_content: {
    type: DataTypes.TEXT,
    allowNull: false, // Store message content even if blocked
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
}, {
  tableName: 'comment_moderations',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['message_id'] },
    { fields: ['session_id'] },
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
  ]
});

const CommentModerationModel = CommentModeration as unknown as ModelStatic<any>;
export default exportModel(CommentModerationModel);

