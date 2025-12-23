/**
 * AI Lesson Analysis Model
 * 
 * Stores AI analysis results for lessons
 */

import { DataTypes, Sequelize } from 'sequelize';
import { getModelSequelize } from '../../../utils/model-extension.util';

export interface AILessonAnalysisAttributes {
  id: string;
  lesson_id: string;
  summary: string | null;
  summary_language: string;
  video_transcript: string | null;
  video_key_points: any | null;
  video_duration_analyzed: number | null;
  content_key_concepts: any | null;
  content_difficulty_level: string | null;
  estimated_study_time: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_started_at: Date | null;
  processing_completed_at: Date | null;
  version: number;
  analyzed_by: string | null;
  model_used: string | null;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AILessonAnalysisCreationAttributes {
  lesson_id: string;
  summary?: string | null;
  summary_language?: string;
  video_transcript?: string | null;
  video_key_points?: any | null;
  video_duration_analyzed?: number | null;
  content_key_concepts?: any | null;
  content_difficulty_level?: string | null;
  estimated_study_time?: number | null;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  processing_started_at?: Date | null;
  processing_completed_at?: Date | null;
  version?: number;
  analyzed_by?: string | null;
  model_used?: string | null;
  error_message?: string | null;
}

// Initialize model using project pattern
const sequelize = getModelSequelize();

const AILessonAnalysis = sequelize.define(
  'AILessonAnalysis',
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
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    summary_language: {
      type: DataTypes.STRING(10),
      defaultValue: 'vi',
    },
    video_transcript: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    video_key_points: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    video_duration_analyzed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    content_key_concepts: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    content_difficulty_level: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    estimated_study_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
    },
    processing_started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    processing_completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    analyzed_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    model_used: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    error_message: {
      type: DataTypes.TEXT,
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
    sequelize,
    tableName: 'ai_lesson_analysis',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['lesson_id'],
        unique: true,
      },
      {
        fields: ['status'],
      },
      {
        fields: ['created_at'],
      },
    ],
  }
);

export default AILessonAnalysis;
