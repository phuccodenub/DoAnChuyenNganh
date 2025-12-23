import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 042: Add blockchain fields to certificates table
 * 
 * Purpose: Support real blockchain integration (NFT certificates on Polygon Mumbai/Sepolia)
 */

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Add blockchain-related fields
  await queryInterface.addColumn('certificates', 'blockchain_token_id', {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: false,
    comment: 'NFT Token ID trên blockchain (từ smart contract)'
  });

  await queryInterface.addColumn('certificates', 'blockchain_tx_hash', {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: false,
    comment: 'Transaction hash của việc issue certificate trên blockchain'
  });

  await queryInterface.addColumn('certificates', 'blockchain_network', {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Blockchain network (mumbai, sepolia, hardhat, etc.)'
  });

  await queryInterface.addColumn('certificates', 'blockchain_contract_address', {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Smart contract address trên blockchain'
  });

  await queryInterface.addColumn('certificates', 'blockchain_explorer_url', {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL để view certificate trên blockchain explorer (Polygonscan, Etherscan)'
  });

  await queryInterface.addColumn('certificates', 'blockchain_opensea_url', {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL để view certificate trên OpenSea (testnet hoặc mainnet)'
  });

  // Add index for faster lookups
  await queryInterface.addIndex('certificates', ['blockchain_token_id'], {
    name: 'idx_certificates_blockchain_token_id',
    where: { blockchain_token_id: { [Symbol.for('ne')]: null } }
  });

  await queryInterface.addIndex('certificates', ['blockchain_tx_hash'], {
    name: 'idx_certificates_blockchain_tx_hash',
    where: { blockchain_tx_hash: { [Symbol.for('ne')]: null } }
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  // Remove indexes first
  await queryInterface.removeIndex('certificates', 'idx_certificates_blockchain_token_id');
  await queryInterface.removeIndex('certificates', 'idx_certificates_blockchain_tx_hash');

  // Remove columns
  await queryInterface.removeColumn('certificates', 'blockchain_token_id');
  await queryInterface.removeColumn('certificates', 'blockchain_tx_hash');
  await queryInterface.removeColumn('certificates', 'blockchain_network');
  await queryInterface.removeColumn('certificates', 'blockchain_contract_address');
  await queryInterface.removeColumn('certificates', 'blockchain_explorer_url');
  await queryInterface.removeColumn('certificates', 'blockchain_opensea_url');
};


