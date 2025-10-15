/**
 * Migration 007: Add indexes to enrollments table
 */

import { QueryInterface } from 'sequelize';

export async function addIndexesToEnrollmentsTable(queryInterface: QueryInterface): Promise<void> {
  // User ID index
  await queryInterface.addIndex('enrollments', ['user_id'], {
    name: 'idx_enrollments_user_id'
  });

  // Course ID index
  await queryInterface.addIndex('enrollments', ['course_id'], {
    name: 'idx_enrollments_course_id'
  });

  // Status index
  await queryInterface.addIndex('enrollments', ['status'], {
    name: 'idx_enrollments_status'
  });

  // Payment status index
  await queryInterface.addIndex('enrollments', ['payment_status'], {
    name: 'idx_enrollments_payment_status'
  });

  // Enrollment type index
  await queryInterface.addIndex('enrollments', ['enrollment_type'], {
    name: 'idx_enrollments_enrollment_type'
  });

  // Progress percentage index
  await queryInterface.addIndex('enrollments', ['progress_percentage'], {
    name: 'idx_enrollments_progress_percentage'
  });

  // Last accessed at index
  await queryInterface.addIndex('enrollments', ['last_accessed_at'], {
    name: 'idx_enrollments_last_accessed_at'
  });

  // Completion date index
  await queryInterface.addIndex('enrollments', ['completion_date'], {
    name: 'idx_enrollments_completion_date'
  });

  // Certificate issued index
  await queryInterface.addIndex('enrollments', ['certificate_issued'], {
    name: 'idx_enrollments_certificate_issued'
  });

  // Rating index
  await queryInterface.addIndex('enrollments', ['rating'], {
    name: 'idx_enrollments_rating'
  });

  // Created at index for sorting
  await queryInterface.addIndex('enrollments', ['created_at'], {
    name: 'idx_enrollments_created_at'
  });

  // Composite index for user enrollments
  await queryInterface.addIndex('enrollments', ['user_id', 'status'], {
    name: 'idx_enrollments_user_status'
  });

  // Composite index for course enrollments
  await queryInterface.addIndex('enrollments', ['course_id', 'status'], {
    name: 'idx_enrollments_course_status'
  });

  // Composite index for active enrollments
  await queryInterface.addIndex('enrollments', ['user_id', 'course_id', 'status'], {
    name: 'idx_enrollments_user_course_status',
    unique: true
  });
}

