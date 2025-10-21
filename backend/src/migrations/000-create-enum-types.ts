/**
 * Migration 000: Create PostgreSQL enum types
 * Phải chạy trước tất cả các migration khác
 */

import { QueryInterface } from 'sequelize';

export async function createEnumTypes(queryInterface: QueryInterface): Promise<void> {
  // User role enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // User status enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Course status enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived', 'suspended');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Course level enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Enrollment status enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE enrollment_status AS ENUM ('enrolled', 'completed', 'dropped', 'suspended');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Enrollment type enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE enrollment_type AS ENUM ('free', 'paid', 'trial');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Payment status enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Quiz type enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE quiz_type AS ENUM ('practice', 'exam', 'assignment');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Quiz question type enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Assignment status enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE assignment_status AS ENUM ('draft', 'published', 'closed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Submission status enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'graded', 'returned');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Grade status enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE grade_status AS ENUM ('pending', 'graded', 'appealed', 'final');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Live session status enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE live_session_status AS ENUM ('scheduled', 'live', 'ended', 'cancelled');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Notification type enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error', 'success');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Notification priority enum
  await queryInterface.sequelize.query(`
    DO $$ BEGIN
      CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  console.log('✅ PostgreSQL enum types created successfully');
}

export async function dropEnumTypes(queryInterface: QueryInterface): Promise<void> {
  const enumTypes = [
    'user_role',
    'user_status', 
    'course_status',
    'course_level',
    'enrollment_status',
    'enrollment_type',
    'payment_status',
    'quiz_type',
    'question_type',
    'assignment_status',
    'submission_status',
    'grade_status',
    'live_session_status',
    'notification_type',
    'notification_priority'
  ];

  for (const enumType of enumTypes) {
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS ${enumType} CASCADE;
    `);
  }

  console.log('✅ PostgreSQL enum types dropped successfully');
}
