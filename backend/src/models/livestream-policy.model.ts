import { DataTypes } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

/**
 * Livestream Policy Model
 * Quản lý các policy cho livestream sessions
 */
const LivestreamPolicy = sequelize.define('LivestreamPolicy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  session_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'live_sessions', key: 'id' },
    onDelete: 'CASCADE',
    unique: true, // Mỗi session chỉ có 1 policy
  },
  // Comment moderation settings
  comment_moderation_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  comment_ai_moderation: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true, // Tự động kiểm tra bằng AI
  },
  comment_manual_moderation: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // Yêu cầu host phê duyệt trước khi hiển thị
  },
  comment_blocked_keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
  },
  comment_max_length: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 500, // Giới hạn độ dài comment
  },
  comment_min_interval_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 2, // Thời gian tối thiểu giữa các comment (chống spam)
  },
  // Content moderation settings
  content_moderation_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  content_ai_moderation: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true, // Tự động kiểm tra nội dung livestream
  },
  content_blocked_keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
  },
  // Action settings
  auto_block_violations: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true, // Tự động chặn nội dung vi phạm
  },
  auto_warn_violations: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true, // Tự động cảnh báo
  },
  violation_threshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3, // Số lần vi phạm trước khi bị chặn
  },
  // Metadata
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
}, {
  tableName: 'livestream_policies',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['session_id'] },
  ]
});

const LivestreamPolicyModel = LivestreamPolicy as unknown as ModelStatic<any>;
export default exportModel(LivestreamPolicyModel);

