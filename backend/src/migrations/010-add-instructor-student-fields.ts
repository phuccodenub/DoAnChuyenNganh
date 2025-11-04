import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Add instructor fields
  await queryInterface.addColumn('users', 'instructor_id', {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: 'Mã số giảng viên'
  });

  await queryInterface.addColumn('users', 'department', {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Khoa/Bộ môn'
  });

  await queryInterface.addColumn('users', 'specialization', {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Chuyên ngành'
  });

  await queryInterface.addColumn('users', 'experience_years', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Số năm kinh nghiệm'
  });

  await queryInterface.addColumn('users', 'education_level', {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Trình độ học vấn'
  });

  await queryInterface.addColumn('users', 'research_interests', {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Lĩnh vực nghiên cứu'
  });

  // Add student fields
  await queryInterface.addColumn('users', 'student_id', {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: 'Mã số sinh viên'
  });

  await queryInterface.addColumn('users', 'class', {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Lớp học'
  });

  await queryInterface.addColumn('users', 'major', {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Chuyên ngành học'
  });

  await queryInterface.addColumn('users', 'year', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Năm học'
  });

  await queryInterface.addColumn('users', 'gpa', {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'Điểm trung bình'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Helper function to safely remove column if it exists
  const safeRemoveColumn = async (tableName: string, columnName: string) => {
    try {
      await queryInterface.removeColumn(tableName, columnName);
    } catch (error: any) {
      if (error.message.includes('does not exist')) {
        console.log(`Column ${columnName} does not exist, skipping...`);
      } else {
        throw error;
      }
    }
  };

  // Remove student fields
  await safeRemoveColumn('users', 'gpa');
  await safeRemoveColumn('users', 'year');
  await safeRemoveColumn('users', 'major');
  await safeRemoveColumn('users', 'class');
  await safeRemoveColumn('users', 'student_id');

  // Remove instructor fields
  await safeRemoveColumn('users', 'education_level');
  await safeRemoveColumn('users', 'experience_years');
  await safeRemoveColumn('users', 'specialization');
  await safeRemoveColumn('users', 'department');
  await safeRemoveColumn('users', 'instructor_id');
}
