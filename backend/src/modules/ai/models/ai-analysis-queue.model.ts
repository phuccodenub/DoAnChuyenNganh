/**
 * AI Analysis Queue Model
 * 
 * Manages queue for AI analysis tasks
 */

import { DataTypes } from 'sequelize';
import { getModelSequelize } from '../../../utils/model-extension.util';

export interface AIAnalysisQueueAttributes {
  id: string;
  lesson_id: string;
  task_type: 'summary' | 'video_analysis' | 'full_analysis';
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retry_count: number;
  max_retries: number;
  error_message: string | null;
  error_stack: string | null;
  scheduled_at: Date | null;
  processing_started_at: Date | null;
  processed_at: Date | null;
  created_by: string | null;
  metadata: any | null;
  created_at: Date;
  updated_at: Date;
}

export interface AIAnalysisQueueCreationAttributes {
  lesson_id: string;
  task_type: 'summary' | 'video_analysis' | 'full_analysis';
  priority?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  retry_count?: number;
  max_retries?: number;
  error_message?: string | null;
  error_stack?: string | null;
  scheduled_at?: Date | null;
  processing_started_at?: Date | null;
  processed_at?: Date | null;
  created_by?: string | null;
  metadata?: any | null;
}

// Initialize model using project pattern
const sequelize = getModelSequelize();

const AIAnalysisQueue = sequelize.define(
  'AIAnalysisQueue',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lesson_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'lessons',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    task_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
    },
    retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    max_retries: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    error_stack: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    processing_started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'ai_analysis_queue',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['lesson_id'],
      },
      {
        fields: ['status', 'scheduled_at'],
      },
      {
        fields: ['priority', 'created_at'],
      },
    ],
  }
);

export default AIAnalysisQueue;
