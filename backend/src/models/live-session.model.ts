import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';
import { LiveSessionAttributes, LiveSessionCreationAttributes, LiveSessionInstance } from '../types/model.types';

const sequelize = getSequelize();

const LiveSession = sequelize.define('LiveSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE'
  },
  instructor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: DataTypes.TEXT,
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration_minutes: DataTypes.INTEGER,
  meeting_url: DataTypes.TEXT,
  meeting_id: DataTypes.STRING(100),
  meeting_password: DataTypes.STRING(100),
  status: {
    type: DataTypes.ENUM('scheduled', 'live', 'ended', 'cancelled'),
    defaultValue: 'scheduled'
  },
  recording_url: DataTypes.TEXT,
  started_at: DataTypes.DATE,
  ended_at: DataTypes.DATE
}, {
  tableName: 'live_sessions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['course_id'] },
    { fields: ['instructor_id'] },
    { fields: ['scheduled_at'] },
    { fields: ['status'] }
  ]
});

export default LiveSession as any;







