import { DataTypes, Model } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { CertificateAttributes, CertificateCreationAttributes, CertificateInstance } from '../types/model.types';
import { exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

/**
 * Certificate Model
 * Quản lý chứng chỉ số được cấp cho học viên khi hoàn thành khóa học
 * Sử dụng Mock Blockchain (cryptographic hashing) + IPFS (Pinata)
 */
const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  
  // ===== RELATIONSHIPS =====
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Học viên nhận certificate'
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    },
    comment: 'Khóa học đã hoàn thành (có thể bị xóa sau, nhưng metadata đã snapshot)'
  },
  enrollment_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'enrollments',
      key: 'id'
    },
    comment: 'Reference đến enrollment record'
  },
  
  // ===== BLOCKCHAIN & IPFS =====
  ipfs_hash: {
    type: DataTypes.STRING(255),
    allowNull: true, // Optional - fallback to DB storage if IPFS unavailable
    unique: false, // Not unique because it can be null
    comment: 'IPFS hash của certificate metadata (lưu trên Pinata) - Optional, có thể null nếu IPFS không khả dụng'
  },
  certificate_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'SHA-256 hash của certificate (Mock Blockchain) - Không thể fake'
  },
  // Real Blockchain Integration (NFT)
  blockchain_token_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: false,
    comment: 'NFT Token ID trên blockchain (từ smart contract)'
  },
  blockchain_tx_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: false,
    comment: 'Transaction hash của việc issue certificate trên blockchain'
  },
  blockchain_network: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Blockchain network (mumbai, sepolia, hardhat, etc.)'
  },
  blockchain_contract_address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Smart contract address trên blockchain'
  },
  blockchain_explorer_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL để view certificate trên blockchain explorer (Polygonscan, Etherscan)'
  },
  blockchain_opensea_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL để view certificate trên OpenSea (testnet hoặc mainnet)'
  },
  
  // ===== METADATA SNAPSHOT =====
  metadata: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Snapshot đầy đủ của certificate metadata (student, course, completion info) - Độc lập với course lifecycle'
  },
  
  // ===== CERTIFICATE INFO =====
  certificate_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Số chứng chỉ duy nhất (CERT-YYYYMMDD-XXXXX)'
  },
  issued_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Thời gian cấp certificate'
  },
  
  // ===== STATUS =====
  status: {
    type: DataTypes.ENUM('active', 'revoked', 'expired'),
    defaultValue: 'active',
    allowNull: false,
    comment: 'Trạng thái certificate'
  },
  revoked_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời gian thu hồi certificate (nếu bị revoked)'
  },
  revoked_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Lý do thu hồi certificate'
  },
  
  // Timestamps
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'certificates',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['course_id'] },
    { fields: ['enrollment_id'] },
    { fields: ['ipfs_hash'], unique: false }, // Not unique because it can be null
    { fields: ['certificate_hash'], unique: true },
    { fields: ['certificate_number'], unique: true },
    { fields: ['status'] },
    { fields: ['issued_at'] },
    { 
      fields: ['user_id', 'course_id'],
      unique: true,
      name: 'unique_user_course_certificate'
    }
  ]
});

const CertificateModel = Certificate as unknown as ModelStatic<CertificateInstance>;
export default exportModel(CertificateModel);

