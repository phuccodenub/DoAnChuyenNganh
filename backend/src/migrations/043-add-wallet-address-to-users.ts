/**
 * Migration 043: Add wallet_address field to users table
 * Purpose: Support blockchain certificate issuance by storing user's wallet address
 */

import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.addColumn('users', 'wallet_address', {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: false,
    comment: 'Ethereum wallet address để nhận NFT certificates (optional)'
  });

  // Add index for faster lookups
  await queryInterface.addIndex('users', ['wallet_address'], {
    name: 'idx_users_wallet_address',
    where: { wallet_address: { [Symbol.for('ne')]: null } }
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.removeIndex('users', 'idx_users_wallet_address');
  await queryInterface.removeColumn('users', 'wallet_address');
};

