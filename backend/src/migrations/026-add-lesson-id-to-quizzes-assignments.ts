import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 026: Add lesson_id to quizzes and assignments
 *
 * Mục tiêu:
 * - Cho phép quiz/assignment gắn trực tiếp với lesson (lesson-level)
 * - Vẫn giữ course_id để filter nhanh theo khóa học (course-level)
 * - lesson_id là nullable: null = bài kiểm tra cấp course (midterm/final, v.v.)
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Add lesson_id to quizzes
  try {
    await queryInterface.addColumn('quizzes', 'lesson_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'lessons',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment:
        'Nếu có giá trị → quiz gắn với 1 lesson cụ thể; null → quiz cấp course (kiểm tra tổng hợp)',
    } as any);

    await queryInterface.addIndex('quizzes', ['lesson_id'], {
      name: 'idx_quizzes_lesson_id',
    });
  } catch (error) {
    // Column/index có thể đã tồn tại trong một số môi trường, bỏ qua lỗi
  }

  // Add lesson_id to assignments
  try {
    await queryInterface.addColumn('assignments', 'lesson_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'lessons',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment:
        'Nếu có giá trị → assignment gắn với 1 lesson cụ thể; null → assignment cấp course',
    } as any);

    await queryInterface.addIndex('assignments', ['lesson_id'], {
      name: 'idx_assignments_lesson_id',
    });
  } catch (error) {
    // Column/index có thể đã tồn tại trong một số môi trường, bỏ qua lỗi
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remove lesson_id from quizzes
  try {
    await queryInterface.removeIndex('quizzes', 'idx_quizzes_lesson_id');
  } catch {
    // ignore
  }
  try {
    await queryInterface.removeColumn('quizzes', 'lesson_id');
  } catch {
    // ignore
  }

  // Remove lesson_id from assignments
  try {
    await queryInterface.removeIndex('assignments', 'idx_assignments_lesson_id');
  } catch {
    // ignore
  }
  try {
    await queryInterface.removeColumn('assignments', 'lesson_id');
  } catch {
    // ignore
  }
}


