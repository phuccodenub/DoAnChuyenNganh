import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Add is_practice field to quizzes and assignments
 * 
 * is_practice = true: Practice Quiz/Assignment (không tính điểm vào tổng kết, có thể làm nhiều lần)
 * is_practice = false: Graded Quiz/Assignment (tính điểm vào tổng kết, có giới hạn)
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Add is_practice to quizzes table
  await queryInterface.addColumn('quizzes', 'is_practice', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // Mặc định là Graded Quiz
    comment: 'true = Practice Quiz (không tính điểm), false = Graded Quiz (tính điểm)'
  });

  // Add is_practice to assignments table
  await queryInterface.addColumn('assignments', 'is_practice', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // Mặc định là Graded Assignment
    comment: 'true = Practice Assignment (không tính điểm), false = Graded Assignment (tính điểm)'
  });

  // Add index for better query performance
  await queryInterface.addIndex('quizzes', ['is_practice'], {
    name: 'quizzes_is_practice_idx'
  });

  await queryInterface.addIndex('assignments', ['is_practice'], {
    name: 'assignments_is_practice_idx'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remove indexes
  await queryInterface.removeIndex('quizzes', 'quizzes_is_practice_idx');
  await queryInterface.removeIndex('assignments', 'assignments_is_practice_idx');

  // Remove columns
  await queryInterface.removeColumn('quizzes', 'is_practice');
  await queryInterface.removeColumn('assignments', 'is_practice');
}



