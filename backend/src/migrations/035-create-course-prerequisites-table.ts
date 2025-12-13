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
  // Kiểm tra xem bảng đã tồn tại chưa
  const tableExists = await queryInterface.sequelize.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'course_prerequisites'
    );
  `);
  
  const exists = (tableExists[0] as any[])[0]?.exists;
  
  if (!exists) {
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
  } else {
    console.log('Table course_prerequisites already exists, skipping creation...');
  }

  // Tạo indexes (với error handling)
  try {
    await queryInterface.addIndex('course_prerequisites', ['course_id'], {
      name: 'idx_course_prerequisites_course_id',
    });
  } catch (error: any) {
    if (error?.parent?.code !== '42P07') { // 42P07 = duplicate_object
      throw error;
    }
    console.log('Index idx_course_prerequisites_course_id already exists, skipping...');
  }

  try {
    await queryInterface.addIndex('course_prerequisites', ['prerequisite_course_id'], {
      name: 'idx_course_prerequisites_prerequisite_course_id',
    });
  } catch (error: any) {
    if (error?.parent?.code !== '42P07') {
      throw error;
    }
    console.log('Index idx_course_prerequisites_prerequisite_course_id already exists, skipping...');
  }

  try {
    await queryInterface.addIndex('course_prerequisites', ['is_required'], {
      name: 'idx_course_prerequisites_is_required',
    });
  } catch (error: any) {
    if (error?.parent?.code !== '42P07') {
      throw error;
    }
    console.log('Index idx_course_prerequisites_is_required already exists, skipping...');
  }

  // Unique constraint: Mỗi course không thể có duplicate prerequisite
  try {
    await queryInterface.addIndex('course_prerequisites', ['course_id', 'prerequisite_course_id'], {
      name: 'unique_course_prerequisite',
      unique: true,
    });
  } catch (error: any) {
    if (error?.parent?.code !== '42P07') {
      throw error;
    }
    console.log('Index unique_course_prerequisite already exists, skipping...');
  }

  // Check constraint: Không cho phép course tự prerequisite chính nó
  try {
    await queryInterface.sequelize.query(`
      ALTER TABLE course_prerequisites
      ADD CONSTRAINT check_no_self_prerequisite
      CHECK (course_id != prerequisite_course_id);
    `);
  } catch (error: any) {
    if (error?.parent?.code !== '42P01') { // 42P01 = undefined_object, nhưng constraint có thể đã tồn tại
      const errorMessage = error?.parent?.message || '';
      if (!errorMessage.includes('already exists') && !errorMessage.includes('duplicate')) {
        throw error;
      }
    }
    console.log('Constraint check_no_self_prerequisite may already exist, skipping...');
  }
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

