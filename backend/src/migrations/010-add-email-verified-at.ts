/**
 * Migration 010: Add email_verified_at column to users
 */

import { QueryInterface, DataTypes } from 'sequelize';

export async function addEmailVerifiedAt(queryInterface: QueryInterface): Promise<void> {
  // Add email_verified_at column if it doesn't exist
  try {
    await queryInterface.addColumn('users', 'email_verified_at', {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp when email was verified'
    } as any);
  } catch (_) {
    // Column may already exist in some environments
  }

  // Add index for performance
  try {
    await queryInterface.addIndex('users', ['email_verified_at'], {
      name: 'idx_users_email_verified_at'
    });
  } catch (_) {
    // Index may already exist
  }

  // Backfill: set email_verified_at to updated_at for verified users if null
  await queryInterface.sequelize.query(`
    UPDATE users
    SET email_verified_at = updated_at
    WHERE email_verified = true AND email_verified_at IS NULL;
  `);
}

export async function removeEmailVerifiedAt(queryInterface: QueryInterface): Promise<void> {
  try {
    await queryInterface.removeIndex('users', 'idx_users_email_verified_at');
  } catch (_) {
    // ignore
  }
  try {
    await queryInterface.removeColumn('users', 'email_verified_at');
  } catch (_) {
    // ignore
  }
}
