import { DataTypes } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { LiveSessionMessageInstance } from '../types/model.types';
import { exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const LiveSessionMessage = sequelize.define('LiveSessionMessage', {
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
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  message_type: {
    type: DataTypes.ENUM('text', 'emoji', 'system'),
    defaultValue: 'text',
  },
  reply_to: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'live_session_messages', key: 'id' },
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'live_session_messages',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['session_id'] },
    { fields: ['sender_id'] },
    { fields: ['created_at'] },
  ]
});

const LiveSessionMessageModel = LiveSessionMessage as unknown as ModelStatic<LiveSessionMessageInstance>;
export default exportModel(LiveSessionMessageModel);

