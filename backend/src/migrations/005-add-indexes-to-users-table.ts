/**
 * Migration 005: Add indexes to users table
 */

import { QueryInterface } from 'sequelize';

// Helper to add index safely (ignore if already exists)
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

export async function addIndexesToUsersTable(queryInterface: QueryInterface): Promise<void> {
  // Email index
  await addIndexSafe(queryInterface, 'users', ['email'], {
    name: 'idx_users_email',
    unique: true
  });

  // Username index
  await addIndexSafe(queryInterface, 'users', ['username'], {
    name: 'idx_users_username',
    unique: true
  });

  // Phone index
  await addIndexSafe(queryInterface, 'users', ['phone'], {
    name: 'idx_users_phone',
    unique: true
  });

  // Role index
  await addIndexSafe(queryInterface, 'users', ['role'], {
    name: 'idx_users_role'
  });

  // Status index
  await addIndexSafe(queryInterface, 'users', ['status'], {
    name: 'idx_users_status'
  });

  // Email verification token index
  await addIndexSafe(queryInterface, 'users', ['email_verification_token'], {
    name: 'idx_users_email_verification_token'
  });

  // Password reset token index (only if column exists)
  await addIndexSafe(queryInterface, 'users', ['password_reset_token'], {
    name: 'idx_users_password_reset_token'
  });

  // Social ID index
  await addIndexSafe(queryInterface, 'users', ['social_id'], {
    name: 'idx_users_social_id',
    unique: true
  });

  // Created at index for sorting
  await addIndexSafe(queryInterface, 'users', ['created_at'], {
    name: 'idx_users_created_at'
  });

  // Last login index
  await addIndexSafe(queryInterface, 'users', ['last_login'], {
    name: 'idx_users_last_login'
  });
}

