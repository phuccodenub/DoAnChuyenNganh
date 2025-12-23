/**
 * Migration: Create ai_lesson_analysis table
 * 
 * Bảng lưu trữ kết quả phân tích AI cho mỗi bài học
 * - Summary (tóm tắt)
 * - Video transcript & key points
 * - Content analysis (key concepts, difficulty level)
 * - Status tracking & versioning
 */

import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('ai_lesson_analysis', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      lesson_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'lessons',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      
      // Summary
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'AI-generated summary of the lesson',
      },
      summary_language: {
        type: DataTypes.STRING(10),
        defaultValue: 'vi',
        allowNull: false,
      },
      
      // Video Analysis (if lesson has video)
      video_transcript: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Transcript extracted from video',
      },
      video_key_points: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Key highlights from video analysis',
      },
      video_duration_analyzed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Video duration in seconds',
      },
      
      // Content Analysis
      content_key_concepts: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Array of key concepts: ["React", "Hooks", ...]',
      },
      content_difficulty_level: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'beginner, intermediate, advanced',
      },
      estimated_study_time: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Estimated study time in minutes',
      },
      
      // Status Tracking
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending',
        allowNull: false,
        comment: 'pending, processing, completed, failed',
      },
      processing_started_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      processing_completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      
      // Versioning (when lesson is updated)
      version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false,
      },
      
      // Metadata
      analyzed_by: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'proxypal, gemini-flash, groq',
      },
      model_used: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Model name used for analysis',
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Error message if analysis failed',
      },
      
      // Timestamps
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Indexes for performance
    await queryInterface.addIndex('ai_lesson_analysis', ['lesson_id'], {
      name: 'idx_ai_lesson_analysis_lesson_id',
    });

    await queryInterface.addIndex('ai_lesson_analysis', ['status'], {
      name: 'idx_ai_lesson_analysis_status',
    });

    await queryInterface.addIndex('ai_lesson_analysis', ['created_at'], {
      name: 'idx_ai_lesson_analysis_created_at',
    });

    console.log('✅ Migration: ai_lesson_analysis table created successfully');
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('ai_lesson_analysis');
    console.log('✅ Migration: ai_lesson_analysis table dropped');
  },
};
