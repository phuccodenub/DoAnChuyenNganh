'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔧 Starting migration: Add student/instructor fields to users...');
      
      // Check if columns exist
      const tableDescription = await queryInterface.describeTable('users');
      
      // Add student_id if not exists
      if (!tableDescription.student_id) {
        console.log('  → Adding column: student_id');
        await queryInterface.addColumn('users', 'student_id', {
          type: Sequelize.STRING(20),
          allowNull: true,
          comment: 'Mã số sinh viên (ví dụ: SV001, 2021001234)'
        }, { transaction });
        
        await queryInterface.addConstraint('users', {
          fields: ['student_id'],
          type: 'unique',
          name: 'users_student_id_unique',
          transaction
        });
      }
      
      // Add class if not exists
      if (!tableDescription.class) {
        console.log('  → Adding column: class');
        await queryInterface.addColumn('users', 'class', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Lớp học (ví dụ: CNTT-K62)'
        }, { transaction });
      }
      
      // Add major if not exists
      if (!tableDescription.major) {
        console.log('  → Adding column: major');
        await queryInterface.addColumn('users', 'major', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Chuyên ngành'
        }, { transaction });
      }
      
      // Add year if not exists
      if (!tableDescription.year) {
        console.log('  → Adding column: year');
        await queryInterface.addColumn('users', 'year', {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Khóa học (ví dụ: 2021, 2022)'
        }, { transaction });
      }
      
      // Add gpa if not exists
      if (!tableDescription.gpa) {
        console.log('  → Adding column: gpa');
        await queryInterface.addColumn('users', 'gpa', {
          type: Sequelize.DECIMAL(3, 2),
          allowNull: true,
          comment: 'Điểm trung bình tích lũy (0.00 - 4.00)'
        }, { transaction });
      }
      
      // Add instructor_id if not exists
      if (!tableDescription.instructor_id) {
        console.log('  → Adding column: instructor_id');
        await queryInterface.addColumn('users', 'instructor_id', {
          type: Sequelize.STRING(20),
          allowNull: true,
          comment: 'Mã số giảng viên'
        }, { transaction });
        
        await queryInterface.addConstraint('users', {
          fields: ['instructor_id'],
          type: 'unique',
          name: 'users_instructor_id_unique',
          transaction
        });
      }
      
      // Add department if not exists
      if (!tableDescription.department) {
        console.log('  → Adding column: department');
        await queryInterface.addColumn('users', 'department', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Khoa/Bộ môn'
        }, { transaction });
      }
      
      // Add specialization if not exists
      if (!tableDescription.specialization) {
        console.log('  → Adding column: specialization');
        await queryInterface.addColumn('users', 'specialization', {
          type: Sequelize.STRING(200),
          allowNull: true,
          comment: 'Chuyên môn'
        }, { transaction });
      }
      
      // Add experience_years if not exists
      if (!tableDescription.experience_years) {
        console.log('  → Adding column: experience_years');
        await queryInterface.addColumn('users', 'experience_years', {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Số năm kinh nghiệm giảng dạy'
        }, { transaction });
      }
      
      // Add education_level if not exists
      if (!tableDescription.education_level) {
        console.log('  → Adding column: education_level');
        // Create enum type first
        await queryInterface.sequelize.query(
          `DO $$ BEGIN
            CREATE TYPE enum_users_education_level AS ENUM ('bachelor', 'master', 'phd', 'professor');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;`,
          { transaction }
        );
        
        await queryInterface.addColumn('users', 'education_level', {
          type: Sequelize.ENUM('bachelor', 'master', 'phd', 'professor'),
          allowNull: true,
          comment: 'Trình độ học vấn'
        }, { transaction });
      }
      
      // Add research_interests if not exists
      if (!tableDescription.research_interests) {
        console.log('  → Adding column: research_interests');
        await queryInterface.addColumn('users', 'research_interests', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Lĩnh vực nghiên cứu quan tâm'
        }, { transaction });
      }
      
      // Add common fields
      if (!tableDescription.date_of_birth) {
        console.log('  → Adding column: date_of_birth');
        await queryInterface.addColumn('users', 'date_of_birth', {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: 'Ngày sinh'
        }, { transaction });
      }
      
      if (!tableDescription.gender) {
        console.log('  → Adding column: gender');
        // Create enum type first
        await queryInterface.sequelize.query(
          `DO $$ BEGIN
            CREATE TYPE enum_users_gender AS ENUM ('male', 'female', 'other');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;`,
          { transaction }
        );
        
        await queryInterface.addColumn('users', 'gender', {
          type: Sequelize.ENUM('male', 'female', 'other'),
          allowNull: true,
          comment: 'Giới tính'
        }, { transaction });
      }
      
      if (!tableDescription.address) {
        console.log('  → Adding column: address');
        await queryInterface.addColumn('users', 'address', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Địa chỉ'
        }, { transaction });
      }
      
      if (!tableDescription.emergency_contact) {
        console.log('  → Adding column: emergency_contact');
        await queryInterface.addColumn('users', 'emergency_contact', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Liên hệ khẩn cấp'
        }, { transaction });
      }
      
      if (!tableDescription.emergency_phone) {
        console.log('  → Adding column: emergency_phone');
        await queryInterface.addColumn('users', 'emergency_phone', {
          type: Sequelize.STRING(20),
          allowNull: true,
          comment: 'Số điện thoại liên hệ khẩn cấp'
        }, { transaction });
      }
      
      await transaction.commit();
      console.log('✅ Migration completed successfully!');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Rolling back migration: Remove student/instructor fields...');
      
      // Remove constraints first
      try {
        await queryInterface.removeConstraint('users', 'users_student_id_unique', { transaction });
      } catch (e) {}
      
      try {
        await queryInterface.removeConstraint('users', 'users_instructor_id_unique', { transaction });
      } catch (e) {}
      
      // Remove columns
      const columnsToRemove = [
        'student_id', 'class', 'major', 'year', 'gpa',
        'instructor_id', 'department', 'specialization', 'experience_years', 'education_level', 'research_interests',
        'date_of_birth', 'gender', 'address', 'emergency_contact', 'emergency_phone'
      ];
      
      for (const column of columnsToRemove) {
        try {
          await queryInterface.removeColumn('users', column, { transaction });
        } catch (e) {}
      }
      
      await transaction.commit();
      console.log('✅ Rollback completed!');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }
};
