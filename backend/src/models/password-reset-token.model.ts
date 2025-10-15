import { DataTypes, Model, Op } from 'sequelize';
import { getSequelize } from '../config/db';
import { PasswordResetTokenAttributes, PasswordResetTokenCreationAttributes, PasswordResetTokenInstance } from '../types/model.types';

const sequelize = getSequelize();

/**
 * PasswordResetToken Model
 * Lưu trữ các token dùng cho chức năng "Quên mật khẩu"
 * 
 * Nghiệp vụ:
 * - Một người dùng có thể yêu cầu đặt lại mật khẩu nhiều lần (tạo ra nhiều token ở các thời điểm khác nhau)
 * - Mỗi token chỉ thuộc về một và chỉ một người dùng
 * - Token có thời gian hết hạn và chỉ sử dụng được một lần
 */
const PasswordResetToken = sequelize.define('PasswordResetToken', {
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
      key: 'id'
    },
    onDelete: 'CASCADE', // Khi user bị xóa, tất cả token liên quan cũng bị xóa
    comment: 'ID của người dùng yêu cầu đặt lại mật khẩu'
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'Token được gửi qua email để xác thực yêu cầu đặt lại mật khẩu'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Thời gian hết hạn của token (thường là 1-2 giờ sau khi tạo)'
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Đánh dấu token đã được sử dụng hay chưa (token chỉ dùng được 1 lần)'
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'Địa chỉ IP của người yêu cầu (cho mục đích bảo mật)'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Thông tin trình duyệt/thiết bị của người yêu cầu (cho mục đích bảo mật)'
  }
}, {
  tableName: 'password_reset_tokens',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['token']
    },
    {
      fields: ['expires_at']
    },
    {
      // Index để tìm token còn hạn và chưa sử dụng
      fields: ['token', 'used', 'expires_at']
    }
  ]
});

// Instance Methods
;(PasswordResetToken as any).prototype.isExpired = function(): boolean {
  return new Date() > this.expires_at;
};

;(PasswordResetToken as any).prototype.isValid = function(): boolean {
  return !this.used && !this.isExpired();
};

// Class Methods
;(PasswordResetToken as any).findValidToken = async function(token: string) {
  return await this.findOne({
    where: {
      token,
      used: false,
    },
    include: [{
      model: sequelize.models.User,
      as: 'user',
      attributes: ['id', 'email', 'first_name', 'last_name']
    }]
  });
};

;(PasswordResetToken as any).cleanupExpiredTokens = async function() {
  return await this.destroy({
    where: {
      expires_at: {
        [Op.lt]: new Date()
      }
    }
  });
};

export default PasswordResetToken as any;







