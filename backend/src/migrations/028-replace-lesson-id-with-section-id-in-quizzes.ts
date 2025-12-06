import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 028: Replace lesson_id with section_id in quizzes
 *
 * Mục tiêu:
 * - Thay thế lesson_id bằng section_id trong bảng quizzes
 * - Quiz có thể gắn với section (section-level) hoặc course (course-level)
 * - Giống như cách tạo Document trong Section
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. Thêm section_id vào quizzes
  try {
    await queryInterface.addColumn('quizzes', 'section_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'sections',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'Nếu có giá trị → quiz gắn với 1 section cụ thể; null → quiz cấp course',
    } as any);

    await queryInterface.addIndex('quizzes', ['section_id'], {
      name: 'idx_quizzes_section_id',
    });
  } catch (error) {
    console.error('Error adding section_id to quizzes:', error);
    throw error;
  }

  // 2. Migrate dữ liệu: Lấy section_id từ lesson_id hiện có
  try {
    await queryInterface.sequelize.query(`
      UPDATE quizzes
      SET section_id = (
        SELECT lessons.section_id
        FROM lessons
        WHERE lessons.id = quizzes.lesson_id
      )
      WHERE lesson_id IS NOT NULL
        AND section_id IS NULL;
    `);
  } catch (error) {
    console.error('Error migrating data from lesson_id to section_id:', error);
    // Không throw error, vì có thể không có dữ liệu cần migrate
  }

  // 3. Xóa lesson_id khỏi quizzes
  try {
    await queryInterface.removeIndex('quizzes', 'idx_quizzes_lesson_id');
  } catch (error) {
    // Index có thể không tồn tại, bỏ qua
    console.warn('Index idx_quizzes_lesson_id not found, skipping removal');
  }

  try {
    await queryInterface.removeColumn('quizzes', 'lesson_id');
  } catch (error) {
    console.error('Error removing lesson_id from quizzes:', error);
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // 1. Thêm lại lesson_id vào quizzes
  try {
    await queryInterface.addColumn('quizzes', 'lesson_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'lessons',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'Nếu có giá trị → quiz gắn với 1 lesson cụ thể; null → quiz cấp course',
    } as any);

    await queryInterface.addIndex('quizzes', ['lesson_id'], {
      name: 'idx_quizzes_lesson_id',
    });
  } catch (error) {
    console.error('Error adding lesson_id back to quizzes:', error);
    throw error;
  }

  // 2. Migrate dữ liệu: Lấy lesson_id từ section_id (lấy lesson đầu tiên của section)
  // Lưu ý: Đây là rollback không hoàn toàn chính xác vì một section có thể có nhiều lessons
  try {
    await queryInterface.sequelize.query(`
      UPDATE quizzes
      SET lesson_id = (
        SELECT lessons.id
        FROM lessons
        WHERE lessons.section_id = quizzes.section_id
        ORDER BY lessons.order_index ASC, lessons.created_at ASC
        LIMIT 1
      )
      WHERE section_id IS NOT NULL
        AND lesson_id IS NULL;
    `);
  } catch (error) {
    console.error('Error migrating data from section_id to lesson_id:', error);
    // Không throw error
  }

  // 3. Xóa section_id khỏi quizzes
  try {
    await queryInterface.removeIndex('quizzes', 'idx_quizzes_section_id');
  } catch (error) {
    console.warn('Index idx_quizzes_section_id not found, skipping removal');
  }

  try {
    await queryInterface.removeColumn('quizzes', 'section_id');
  } catch (error) {
    console.error('Error removing section_id from quizzes:', error);
    throw error;
  }
}



