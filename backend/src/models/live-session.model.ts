import { DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model } = require('sequelize');
const sequelize = getSequelize();

class LiveSession extends Model {
  declare id: string;
  declare course_id: string;
  declare instructor_id: string;
  declare title: string;
  declare description: string | null;
  declare scheduled_at: Date;
  declare duration_minutes: number | null;
  declare meeting_url: string | null;
  declare meeting_id: string | null;
  declare meeting_password: string | null;
  declare status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  declare recording_url: string | null;
  declare started_at: Date | null;
  declare ended_at: Date | null;
  declare created_at: Date | null;
  declare updated_at: Date | null;

  static associate(models: any) {
    (LiveSession as any).belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
    (LiveSession as any).belongsTo(models.User, { foreignKey: 'instructor_id', as: 'instructor' });
    (LiveSession as any).hasMany(models.LiveSessionAttendance, { foreignKey: 'session_id', as: 'attendances' });
  }
}

(LiveSession as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'courses', key: 'id' }
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    meeting_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    meeting_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    meeting_password: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'live', 'ended', 'cancelled'),
      allowNull: false,
      defaultValue: 'scheduled'
    },
    recording_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ended_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'live_sessions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default LiveSession;
