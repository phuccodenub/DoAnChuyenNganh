import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 031: Make ipfs_hash nullable in certificates table
 * 
 * Mục tiêu:
 * - Cho phép ipfs_hash có thể null (IPFS là optional)
 * - Bỏ unique constraint cho ipfs_hash vì có thể có nhiều null values
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. Drop unique index on ipfs_hash if exists
  try {
    await queryInterface.removeIndex('certificates', 'idx_certificates_ipfs_hash');
  } catch (error) {
    // Index might not exist, ignore
    console.log('Index idx_certificates_ipfs_hash does not exist or already removed');
  }

  // 2. Alter column to allow null
  await queryInterface.changeColumn('certificates', 'ipfs_hash', {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'IPFS hash của certificate metadata (lưu trên Pinata) - Optional, có thể null nếu IPFS không khả dụng',
  });

  // 3. Recreate index without unique constraint
  await queryInterface.addIndex('certificates', ['ipfs_hash'], {
    name: 'idx_certificates_ipfs_hash',
    unique: false,
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Revert: Make ipfs_hash NOT NULL and unique again
  await queryInterface.removeIndex('certificates', 'idx_certificates_ipfs_hash');
  
  await queryInterface.changeColumn('certificates', 'ipfs_hash', {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'IPFS hash của certificate metadata (lưu trên Pinata)',
  });

  await queryInterface.addIndex('certificates', ['ipfs_hash'], {
    name: 'idx_certificates_ipfs_hash',
    unique: true,
  });
}

