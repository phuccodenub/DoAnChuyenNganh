import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 038: Add instructions column to assignments
 *
 * Mục tiêu:
 * - Thêm cột instructions vào bảng assignments
 * - instructions: Câu hỏi/yêu cầu chi tiết của assignment
 * - description: Mô tả tổng quan về assignment
 * - Phân biệt rõ ràng giữa description (mô tả) và instructions (câu hỏi/yêu cầu)
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Kiểm tra xem cột đã tồn tại chưa
  const tableDescription = await queryInterface.describeTable('assignments');
  
  if (!tableDescription.instructions) {
    await queryInterface.addColumn('assignments', 'instructions', {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Câu hỏi/yêu cầu chi tiết của assignment (khác với description - mô tả tổng quan)'
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Xóa cột instructions
  const tableDescription = await queryInterface.describeTable('assignments');
  
  if (tableDescription.instructions) {
    await queryInterface.removeColumn('assignments', 'instructions');
  }
}
