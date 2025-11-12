/**
 * Migration 007: Add indexes to enrollments table
 */

import { QueryInterface } from 'sequelize';

// Helper to add index safely (ignore if already exists or column doesn't exist)
async function addIndexSafe(
  queryInterface: QueryInterface,
  table: string,
  columns: string[],
  options: { name: string; unique?: boolean }
): Promise<void> {
  try {
    await queryInterface.addIndex(table, columns, options);
  } catch (error: any) {
    // Ignore if index already exists (code 42P07) or column doesn't exist (code 42703)
    if (error?.parent?.code !== '42P07' && error?.parent?.code !== '42703') {
      throw error;
    }
  }
}

export async function addIndexesToEnrollmentsTable(queryInterface: QueryInterface): Promise<void> {
  // User ID index
  await addIndexSafe(queryInterface, 'enrollments', ['user_id'], {
    name: 'idx_enrollments_user_id'
  });

  // Course ID index
  await addIndexSafe(queryInterface, 'enrollments', ['course_id'], {
    name: 'idx_enrollments_course_id'
  });

  // Status index
  await addIndexSafe(queryInterface, 'enrollments', ['status'], {
    name: 'idx_enrollments_status'
  });

  // Payment status index (may not exist)
  await addIndexSafe(queryInterface, 'enrollments', ['payment_status'], {
    name: 'idx_enrollments_payment_status'
  });

  // Enrollment type index (may not exist)
  await addIndexSafe(queryInterface, 'enrollments', ['enrollment_type'], {
    name: 'idx_enrollments_enrollment_type'
  });

  // Progress percentage index
  await addIndexSafe(queryInterface, 'enrollments', ['progress_percentage'], {
    name: 'idx_enrollments_progress_percentage'
  });

  // Last accessed at index
  await addIndexSafe(queryInterface, 'enrollments', ['last_accessed_at'], {
    name: 'idx_enrollments_last_accessed_at'
  });

  // Completion date index
  await addIndexSafe(queryInterface, 'enrollments', ['completion_date'], {
    name: 'idx_enrollments_completion_date'
  });

  // Certificate issued index (may not exist)
  await addIndexSafe(queryInterface, 'enrollments', ['certificate_issued'], {
    name: 'idx_enrollments_certificate_issued'
  });

  // Rating index (may not exist)
  await addIndexSafe(queryInterface, 'enrollments', ['rating'], {
    name: 'idx_enrollments_rating'
  });

  // Created at index for sorting
  await addIndexSafe(queryInterface, 'enrollments', ['created_at'], {
    name: 'idx_enrollments_created_at'
  });

  // Composite index for user enrollments
  await addIndexSafe(queryInterface, 'enrollments', ['user_id', 'status'], {
    name: 'idx_enrollments_user_status'
  });

  // Composite index for course enrollments
  await addIndexSafe(queryInterface, 'enrollments', ['course_id', 'status'], {
    name: 'idx_enrollments_course_status'
  });

  // Composite index for active enrollments
  await addIndexSafe(queryInterface, 'enrollments', ['user_id', 'course_id', 'status'], {
    name: 'idx_enrollments_user_course_status',
    unique: true
  });
}

