/**
 * Migration 001: Create users table
 */

import { QueryInterface, DataTypes } from 'sequelize';

export async function createUsersTable(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('student', 'instructor', 'admin', 'super_admin'),
      allowNull: false,
      defaultValue: 'student'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending'),
      allowNull: false,
      defaultValue: 'pending'
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    email_verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email_verification_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    two_factor_secret: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    two_factor_backup_codes: {
      type: DataTypes.JSON,
      allowNull: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    lockout_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    token_version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    social_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    social_provider: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });
}

