/**
 * Migration 023: Create Conversations Table
 * 
 * Direct Message conversations between students and instructors
 */

import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

// Helper to check if table exists
async function tableExists(queryInterface: QueryInterface, tableName: string): Promise<boolean> {
  const [results] = await queryInterface.sequelize.query(
    `SELECT table_name FROM information_schema.tables WHERE table_name = '${tableName}'`,
    { type: QueryTypes.SELECT }
  ) as [{ table_name: string }[], unknown];
  return results !== undefined && (results as any).table_name === tableName;
}

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Skip if table already exists
  if (await tableExists(queryInterface, 'conversations')) {
    console.log('Table conversations already exists, skipping...');
    return;
  }

  await queryInterface.createTable('conversations', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    instructor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    student_last_read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    instructor_last_read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_archived_by_student: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_archived_by_instructor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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

  // Add unique constraint: one conversation per student-instructor-course combination
  await queryInterface.addConstraint('conversations', {
    fields: ['course_id', 'student_id', 'instructor_id'],
    type: 'unique',
    name: 'unique_conversation_per_course_student_instructor',
  });

  // Add indexes for common queries
  await queryInterface.addIndex('conversations', ['student_id'], {
    name: 'idx_conversations_student_id',
  });

  await queryInterface.addIndex('conversations', ['instructor_id'], {
    name: 'idx_conversations_instructor_id',
  });

  await queryInterface.addIndex('conversations', ['course_id'], {
    name: 'idx_conversations_course_id',
  });

  await queryInterface.addIndex('conversations', ['last_message_at'], {
    name: 'idx_conversations_last_message_at',
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('conversations');
};
