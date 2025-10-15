import { DataTypes, Model } from 'sequelize';
import { getSequelize } from '../config/db';
import { LiveSessionAttendanceAttributes, LiveSessionAttendanceCreationAttributes, LiveSessionAttendanceInstance } from '../types/model.types';

const sequelize = getSequelize();

const LiveSessionAttendance = sequelize.define('LiveSessionAttendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  session_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'live_sessions', key: 'id' },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  left_at: DataTypes.DATE,
  duration_minutes: DataTypes.INTEGER
}, {
  tableName: 'live_session_attendance',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['session_id'] },
    { fields: ['user_id'] },
    { unique: true, fields: ['session_id', 'user_id'] }
  ]
});

export default LiveSessionAttendance as any;







