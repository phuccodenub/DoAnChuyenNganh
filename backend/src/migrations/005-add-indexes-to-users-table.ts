/**
 * Migration 005: Add indexes to users table
 */

import { QueryInterface } from 'sequelize';

export async function addIndexesToUsersTable(queryInterface: QueryInterface): Promise<void> {
  // Email index
  await queryInterface.addIndex('users', ['email'], {
    name: 'idx_users_email',
    unique: true
  });

  // Username index
  await queryInterface.addIndex('users', ['username'], {
    name: 'idx_users_username',
    unique: true
  });

  // Phone index
  await queryInterface.addIndex('users', ['phone'], {
    name: 'idx_users_phone',
    unique: true
  });

  // Role index
  await queryInterface.addIndex('users', ['role'], {
    name: 'idx_users_role'
  });

  // Status index
  await queryInterface.addIndex('users', ['status'], {
    name: 'idx_users_status'
  });

  // Email verification token index
  await queryInterface.addIndex('users', ['email_verification_token'], {
    name: 'idx_users_email_verification_token'
  });

  // Password reset token index
  await queryInterface.addIndex('users', ['password_reset_token'], {
    name: 'idx_users_password_reset_token'
  });

  // Social ID index
  await queryInterface.addIndex('users', ['social_id'], {
    name: 'idx_users_social_id',
    unique: true
  });

  // Created at index for sorting
  await queryInterface.addIndex('users', ['created_at'], {
    name: 'idx_users_created_at'
  });

  // Last login index
  await queryInterface.addIndex('users', ['last_login'], {
    name: 'idx_users_last_login'
  });
}

