import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 030: Create certificates table
 *
 * Mục tiêu:
 * - Tạo bảng certificates để lưu trữ chứng chỉ số
 * - Sử dụng Mock Blockchain (cryptographic hashing) + IPFS (Pinata)
 * - Metadata snapshot để độc lập với course lifecycle
 */

export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. Tạo enum type cho certificate status
  try {
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE certificate_status_enum AS ENUM ('active', 'revoked', 'expired');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
  } catch (error) {
    console.error('Error creating certificate_status_enum:', error);
    throw error;
  }

  // 2. Tạo bảng certificates
  await queryInterface.createTable('certificates', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'Học viên nhận certificate',
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
      onDelete: 'CASCADE',
      comment: 'Khóa học đã hoàn thành (có thể bị xóa sau, nhưng metadata đã snapshot)',
    },
    enrollment_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'enrollments',
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'Reference đến enrollment record',
    },
    ipfs_hash: {
      type: DataTypes.STRING(255),
      allowNull: true, // Optional - fallback to DB storage if IPFS unavailable
      unique: true,
      comment: 'IPFS hash của certificate metadata (lưu trên Pinata) - Optional, có thể null nếu IPFS không khả dụng',
    },
    certificate_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'SHA-256 hash của certificate (Mock Blockchain) - Không thể fake',
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Snapshot đầy đủ của certificate metadata (student, course, completion info) - Độc lập với course lifecycle',
    },
    certificate_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Số chứng chỉ duy nhất (CERT-YYYYMMDD-XXXXX)',
    },
    issued_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Thời gian cấp certificate',
    },
    status: {
      type: DataTypes.ENUM('active', 'revoked', 'expired'),
      defaultValue: 'active',
      allowNull: false,
      comment: 'Trạng thái certificate',
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Thời gian thu hồi certificate (nếu bị revoked)',
    },
    revoked_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Lý do thu hồi certificate',
    },
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
  });

  // 3. Tạo indexes
  await queryInterface.addIndex('certificates', ['user_id'], {
    name: 'idx_certificates_user_id',
  });

  await queryInterface.addIndex('certificates', ['course_id'], {
    name: 'idx_certificates_course_id',
  });

  await queryInterface.addIndex('certificates', ['enrollment_id'], {
    name: 'idx_certificates_enrollment_id',
  });

  await queryInterface.addIndex('certificates', ['ipfs_hash'], {
    name: 'idx_certificates_ipfs_hash',
    unique: false, // Not unique because ipfs_hash can be null
  });

  await queryInterface.addIndex('certificates', ['certificate_hash'], {
    name: 'idx_certificates_certificate_hash',
    unique: true,
  });

  await queryInterface.addIndex('certificates', ['certificate_number'], {
    name: 'idx_certificates_certificate_number',
    unique: true,
  });

  await queryInterface.addIndex('certificates', ['status'], {
    name: 'idx_certificates_status',
  });

  await queryInterface.addIndex('certificates', ['issued_at'], {
    name: 'idx_certificates_issued_at',
  });

  // 4. Unique constraint: Mỗi user chỉ có 1 certificate cho 1 course
  await queryInterface.addIndex('certificates', ['user_id', 'course_id'], {
    name: 'unique_user_course_certificate',
    unique: true,
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('certificates');
  
  // Drop enum type
  await queryInterface.sequelize.query(`
    DROP TYPE IF EXISTS certificate_status_enum;
  `);
}

