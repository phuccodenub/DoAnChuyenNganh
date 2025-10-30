/**
 * Migration 011: Add missing user profile columns to users table
 */

import { QueryInterface, DataTypes } from 'sequelize';

export async function addUserProfileColumns(queryInterface: QueryInterface): Promise<void> {
  // Helper to add a column if it may not exist
  const addColumnSafe = async (table: string, column: string, definition: any) => {
    try {
      await queryInterface.addColumn(table, column, definition as any);
    } catch (_) {
      // ignore if exists
    }
  };

  // Student-related fields
  await addColumnSafe('users', 'student_id', { type: DataTypes.STRING(20), allowNull: true, comment: 'Mã số sinh viên' });
  await addColumnSafe('users', 'class', { type: DataTypes.STRING(50), allowNull: true, comment: 'Lớp học' });
  await addColumnSafe('users', 'major', { type: DataTypes.STRING(100), allowNull: true, comment: 'Chuyên ngành' });
  await addColumnSafe('users', 'year', { type: DataTypes.INTEGER, allowNull: true, comment: 'Khóa học' });
  await addColumnSafe('users', 'gpa', { type: DataTypes.DECIMAL(3, 2), allowNull: true, comment: 'Điểm trung bình tích lũy' });

  // Instructor-related fields
  await addColumnSafe('users', 'instructor_id', { type: DataTypes.STRING(20), allowNull: true, comment: 'Mã giảng viên' });
  await addColumnSafe('users', 'department', { type: DataTypes.STRING(100), allowNull: true, comment: 'Khoa/Bộ môn' });
  await addColumnSafe('users', 'specialization', { type: DataTypes.STRING(200), allowNull: true, comment: 'Chuyên môn' });
  await addColumnSafe('users', 'experience_years', { type: DataTypes.INTEGER, allowNull: true, comment: 'Số năm kinh nghiệm' });
  await addColumnSafe('users', 'education_level', { type: DataTypes.ENUM('bachelor', 'master', 'phd', 'professor'), allowNull: true, comment: 'Trình độ học vấn' } as any);
  await addColumnSafe('users', 'research_interests', { type: DataTypes.TEXT, allowNull: true, comment: 'Lĩnh vực nghiên cứu' });

  // Common fields
  await addColumnSafe('users', 'date_of_birth', { type: DataTypes.DATEONLY, allowNull: true, comment: 'Ngày sinh' });
  await addColumnSafe('users', 'gender', { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true, comment: 'Giới tính' } as any);
  await addColumnSafe('users', 'address', { type: DataTypes.TEXT, allowNull: true, comment: 'Địa chỉ' });
  await addColumnSafe('users', 'emergency_contact', { type: DataTypes.STRING(100), allowNull: true, comment: 'Liên hệ khẩn cấp' });
  await addColumnSafe('users', 'emergency_phone', { type: DataTypes.STRING(20), allowNull: true, comment: 'SĐT khẩn cấp' });
}

export async function removeUserProfileColumns(queryInterface: QueryInterface): Promise<void> {
  const removeColumnSafe = async (table: string, column: string) => {
    try {
      await queryInterface.removeColumn(table, column);
    } catch (_) {
      // ignore if missing
    }
  };

  await removeColumnSafe('users', 'student_id');
  await removeColumnSafe('users', 'class');
  await removeColumnSafe('users', 'major');
  await removeColumnSafe('users', 'year');
  await removeColumnSafe('users', 'gpa');
  await removeColumnSafe('users', 'instructor_id');
  await removeColumnSafe('users', 'department');
  await removeColumnSafe('users', 'specialization');
  await removeColumnSafe('users', 'experience_years');
  await removeColumnSafe('users', 'education_level');
  await removeColumnSafe('users', 'research_interests');
  await removeColumnSafe('users', 'date_of_birth');
  await removeColumnSafe('users', 'gender');
  await removeColumnSafe('users', 'address');
  await removeColumnSafe('users', 'emergency_contact');
  await removeColumnSafe('users', 'emergency_phone');
}
