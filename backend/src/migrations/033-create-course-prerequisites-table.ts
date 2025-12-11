import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 033: Create course_prerequisites table
 *
 * Mục tiêu:
 * - Tạo bảng course_prerequisites để quản lý yêu cầu trước khi học khóa học
 * - Mỗi khóa học có thể yêu cầu hoàn thành một hoặc nhiều khóa học khác
 * - Hỗ trợ cả required và optional prerequisites
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Tạo bảng course_prerequisites
  await queryInterface.createTable('course_prerequisites', {
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
      onDelete: 'CASCADE',
      comment: 'Khóa học yêu cầu prerequisites',
    },
    prerequisite_course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'Khóa học cần hoàn thành trước',
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: 'true = bắt buộc, false = khuyến nghị',
    },
    order_index: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Thứ tự hiển thị (có thể sắp xếp theo độ quan trọng)',
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

  // Tạo indexes
  await queryInterface.addIndex('course_prerequisites', ['course_id'], {
    name: 'idx_course_prerequisites_course_id',
  });

  await queryInterface.addIndex('course_prerequisites', ['prerequisite_course_id'], {
    name: 'idx_course_prerequisites_prerequisite_course_id',
  });

  await queryInterface.addIndex('course_prerequisites', ['is_required'], {
    name: 'idx_course_prerequisites_is_required',
  });

  // Unique constraint: Mỗi course không thể có duplicate prerequisite
  await queryInterface.addIndex('course_prerequisites', ['course_id', 'prerequisite_course_id'], {
    name: 'unique_course_prerequisite',
    unique: true,
  });

  // Check constraint: Không cho phép course tự prerequisite chính nó
  await queryInterface.sequelize.query(`
    ALTER TABLE course_prerequisites
    ADD CONSTRAINT check_no_self_prerequisite
    CHECK (course_id != prerequisite_course_id);
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Drop constraint
  await queryInterface.sequelize.query(`
    ALTER TABLE course_prerequisites
    DROP CONSTRAINT IF EXISTS check_no_self_prerequisite;
  `);

  // Drop table
  await queryInterface.dropTable('course_prerequisites');
}

