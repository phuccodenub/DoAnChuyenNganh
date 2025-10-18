import { DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

const { Model } = require('sequelize');
const sequelize = getSequelize();

class Lesson extends Model {
  declare id: string;
  declare section_id: string;
  declare title: string;
  declare description: string | null;
  declare content_type: 'video' | 'document' | 'text' | 'link' | 'quiz' | 'assignment';
  declare content: string | null;
  declare video_url: string | null;
  declare video_duration: number | null;
  declare order_index: number;
  declare duration_minutes: number | null;
  declare is_published: boolean;
  declare is_free_preview: boolean;
  declare completion_criteria: any | null;
  declare metadata: any | null;
  declare created_at: Date | null;
  declare updated_at: Date | null;
}

(Lesson as any).init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    section_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'sections', key: 'id' }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content_type: {
      type: DataTypes.ENUM('video', 'document', 'text', 'link', 'quiz', 'assignment'),
      allowNull: false,
      defaultValue: 'text'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    video_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    video_duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_free_preview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    completion_criteria: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
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
    tableName: 'lessons',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Lesson;
