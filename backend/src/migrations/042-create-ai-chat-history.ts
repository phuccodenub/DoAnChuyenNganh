import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 042: Create AI Chat History Table
 * 
 * Mục tiêu:
 * - Tạo bảng ai_chat_history để lưu lịch sử chat với AI Tutor
 * - Hỗ trợ tracking model, provider, latency, tokens
 * - Foreign keys: user_id, course_id (optional), lesson_id (optional)
 * Date: 2025-12-18
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('ai_chat_history', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      course_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'courses',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      lesson_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'lessons',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      role: {
        type: DataTypes.ENUM('user', 'assistant', 'system'),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      model: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      provider: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      latency: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Response latency in milliseconds',
      },
      tokens_used: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
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

    // Create indexes
    await queryInterface.addIndex('ai_chat_history', ['user_id', 'created_at'], {
      name: 'idx_ai_chat_history_user_created',
    });

    await queryInterface.addIndex('ai_chat_history', ['course_id'], {
      name: 'idx_ai_chat_history_course',
    });

    await queryInterface.addIndex('ai_chat_history', ['lesson_id'], {
      name: 'idx_ai_chat_history_lesson',
    });

    console.log('✅ Created ai_chat_history table with indexes');
  }

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('ai_chat_history');
  console.log('✅ Dropped ai_chat_history table');
}
