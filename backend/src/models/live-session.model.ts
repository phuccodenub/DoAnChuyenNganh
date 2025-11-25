import { DataTypes } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { LiveSessionInstance } from '../types/model.types';
import { exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

const LiveSession = sequelize.define('LiveSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'courses', key: 'id' },
    onDelete: 'SET NULL',
  },
  host_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: DataTypes.TEXT,
  scheduled_start: DataTypes.DATE,
  scheduled_end: DataTypes.DATE,
  actual_start: DataTypes.DATE,
  actual_end: DataTypes.DATE,
  duration_minutes: DataTypes.INTEGER,
  meeting_url: DataTypes.TEXT,
  meeting_id: DataTypes.STRING(100),
  meeting_password: DataTypes.STRING(100),
  platform: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'internal',
  },
  ingest_type: {
    type: DataTypes.ENUM('webrtc', 'rtmp'),
    allowNull: false,
    defaultValue: 'webrtc',
  },
  webrtc_room_id: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  webrtc_config: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'live', 'ended', 'cancelled'),
    defaultValue: 'scheduled',
  },
  viewer_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  thumbnail_url: DataTypes.TEXT,
  stream_key: DataTypes.TEXT,
  playback_url: DataTypes.TEXT,
  recording_url: DataTypes.TEXT,
  max_participants: DataTypes.INTEGER,
  is_public: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  is_recorded: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  category: DataTypes.STRING(100),
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
}, {
  tableName: 'live_sessions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['host_user_id'] },
    { fields: ['scheduled_start'] },
    { fields: ['status'] },
    { fields: ['ingest_type'] },
    { fields: ['webrtc_room_id'] },
  ]
});

const LiveSessionModel = LiveSession as unknown as ModelStatic<LiveSessionInstance>;
export default exportModel(LiveSessionModel);







