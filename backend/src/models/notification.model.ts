import { DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model } = require('sequelize');
const sequelize = getSequelize();

class Notification extends Model {
  declare id: string;
  declare sender_id: string | null;
  declare notification_type: string;
  declare title: string;
  declare message: string;
  declare link_url: string | null;
  declare priority: 'low' | 'normal' | 'high' | 'urgent';
  declare category: 'course' | 'assignment' | 'quiz' | 'grade' | 'message' | 'system' | 'announcement';
  declare related_resource_type: string | null;
  declare related_resource_id: string | null;
  declare scheduled_at: Date | null;
  declare sent_at: Date | null;
  declare expires_at: Date | null;
  declare metadata: any | null;
  declare is_broadcast: boolean;
  declare total_recipients: number;
  declare read_count: number;
  declare created_at: Date | null;
  declare updated_at: Date | null;
}

(Notification as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' }
    },
    notification_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    link_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'normal'
    },
    category: {
      type: DataTypes.ENUM('course', 'assignment', 'quiz', 'grade', 'message', 'system', 'announcement'),
      allowNull: false,
      defaultValue: 'system'
    },
    related_resource_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    related_resource_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    is_broadcast: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    total_recipients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    read_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
    tableName: 'notifications',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Notification;
