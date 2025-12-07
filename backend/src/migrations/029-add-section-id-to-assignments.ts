import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 029: Add section_id to assignments
 *
 * Mục tiêu:
 * - Thêm section_id vào bảng assignments (tương tự như quizzes)
 * - Assignment có thể gắn với section (section-level) hoặc course (course-level)
 * - Giữ lesson_id để backward compatibility (assignment có thể gắn với lesson hoặc section)
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. Thêm section_id vào assignments
  try {
    await queryInterface.addColumn('assignments', 'section_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'sections',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'Nếu có giá trị → assignment gắn với 1 section cụ thể; null → assignment cấp course',
    } as any);

    await queryInterface.addIndex('assignments', ['section_id'], {
      name: 'idx_assignments_section_id',
    });
  } catch (error) {
    console.error('Error adding section_id to assignments:', error);
    throw error;
  }

  // 2. Migrate dữ liệu: Lấy section_id từ lesson_id hiện có (nếu có)
  try {
    await queryInterface.sequelize.query(`
      UPDATE assignments
      SET section_id = (
        SELECT lessons.section_id
        FROM lessons
        WHERE lessons.id = assignments.lesson_id
      )
      WHERE lesson_id IS NOT NULL
        AND section_id IS NULL;
    `);
  } catch (error) {
    console.error('Error migrating data from lesson_id to section_id:', error);
    // Không throw error, vì có thể không có dữ liệu cần migrate
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // 1. Xóa section_id khỏi assignments
  try {
    await queryInterface.removeIndex('assignments', 'idx_assignments_section_id');
  } catch (error) {
    console.warn('Index idx_assignments_section_id not found, skipping removal');
  }

  try {
    await queryInterface.removeColumn('assignments', 'section_id');
  } catch (error) {
    console.error('Error removing section_id from assignments:', error);
    throw error;
  }
}

