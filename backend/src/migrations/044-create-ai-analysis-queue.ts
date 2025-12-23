/**
 * Migration: Create ai_analysis_queue table
 * 
 * Queue system for AI analysis tasks
 * - Manages pending, processing, completed tasks
 * - Retry mechanism with exponential backoff
 * - Priority-based processing
 */

import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('ai_analysis_queue', {
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
      
      // Task Configuration
      task_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'summary, video_analysis, full_analysis',
      },
      priority: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        allowNull: false,
        comment: '1 (highest) to 10 (lowest)',
      },
      
      // Status Tracking
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending',
        allowNull: false,
        comment: 'pending, processing, completed, failed',
      },
      
      // Retry Logic
      retry_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      max_retries: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
        allowNull: false,
      },
      
      // Error Handling
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      error_stack: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      
      // Scheduling
      scheduled_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When to retry (for exponential backoff)',
      },
      processing_started_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      processed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      
      // Metadata
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'User ID who triggered the analysis',
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Additional task metadata',
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

    // Indexes for queue processing
    await queryInterface.addIndex('ai_analysis_queue', ['status'], {
      name: 'idx_ai_analysis_queue_status',
    });

    await queryInterface.addIndex('ai_analysis_queue', ['lesson_id'], {
      name: 'idx_ai_analysis_queue_lesson_id',
    });

    await queryInterface.addIndex('ai_analysis_queue', ['scheduled_at'], {
      name: 'idx_ai_analysis_queue_scheduled_at',
    });

    // Composite index for queue worker query
    await queryInterface.addIndex(
      'ai_analysis_queue',
      ['status', 'priority', 'created_at'],
      {
        name: 'idx_ai_analysis_queue_worker',
      }
    );

    console.log('✅ Migration: ai_analysis_queue table created successfully');
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('ai_analysis_queue');
    console.log('✅ Migration: ai_analysis_queue table dropped');
  },
};
