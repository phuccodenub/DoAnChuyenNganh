import { DataTypes, Model, Op } from 'sequelize';
import { getSequelize } from '../config/db';
import { NotificationAttributes, NotificationCreationAttributes, NotificationInstance } from '../types/model.types';

const sequelize = getSequelize();

/**
 * Notification Model
 * Lưu trữ nội dung gốc của thông báo
 * 
 * Nghiệp vụ:
 * - Một thông báo có thể được gửi đến nhiều người (M-N relationship thông qua NotificationRecipients)
 * - Mỗi thông báo có người tạo (sender) và nhiều người nhận (recipients)
 * - Thông báo có thể liên kết đến một resource cụ thể (course, assignment, quiz...)
 */
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'ID người tạo thông báo (null nếu là hệ thống tự động)'
  },
  notification_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Loại thông báo: course_update, assignment_due, grade_posted, message, system, etc.'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Tiêu đề thông báo'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Nội dung chi tiết của thông báo'
  },
  link_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'URL liên kết đến resource liên quan'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
    comment: 'Mức độ ưu tiên của thông báo'
  },
  category: {
    type: DataTypes.ENUM('course', 'assignment', 'quiz', 'grade', 'message', 'system', 'announcement'),
    defaultValue: 'system',
    comment: 'Danh mục thông báo'
  },
  related_resource_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Loại resource liên quan: course, assignment, quiz, lesson, etc.'
  },
  related_resource_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID của resource liên quan'
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời gian lên lịch gửi thông báo (null = gửi ngay)'
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời gian thực tế gửi thông báo'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời gian hết hạn của thông báo'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Metadata bổ sung (action buttons, images, data...)'
  },
  is_broadcast: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Thông báo broadcast (gửi đến tất cả users)'
  },
  total_recipients: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Tổng số người nhận (cached)'
  },
  read_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Số người đã đọc (cached)'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['sender_id']
    },
    {
      fields: ['notification_type']
    },
    {
      fields: ['category']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['scheduled_at']
    },
    {
      fields: ['sent_at']
    },
    {
      fields: ['related_resource_type', 'related_resource_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Instance Methods
;(Notification as any).prototype.isExpired = function(): boolean {
  return this.expires_at && new Date() > this.expires_at;
};

;(Notification as any).prototype.isPending = function(): boolean {
  return this.scheduled_at && !this.sent_at;
};

;(Notification as any).prototype.isSent = function(): boolean {
  return this.sent_at !== null;
};

;(Notification as any).prototype.getReadPercentage = function(): number {
  return this.total_recipients > 0 
    ? (this.read_count / this.total_recipients) * 100 
    : 0;
};

;(Notification as any).prototype.markAsSent = async function() {
  this.sent_at = new Date();
  await this.save();
  return this;
};

// Class Methods
;(Notification as any).findByType = async function(type: string, limit: number = 50) {
  return await this.findAll({
    where: { notification_type: type },
    order: [['created_at', 'DESC']],
    limit,
    include: [
      {
        model: sequelize.models.User,
        as: 'sender',
        attributes: ['id', 'first_name', 'last_name', 'email', 'avatar']
      }
    ]
  });
};

;(Notification as any).findPendingNotifications = async function() {
  return await this.findAll({
    where: {
      scheduled_at: {
        [Op.lte]: new Date()
      },
      sent_at: null
    },
    order: [['scheduled_at', 'ASC']]
  });
};

;(Notification as any).findExpiredNotifications = async function() {
  return await this.findAll({
    where: {
      expires_at: {
        [Op.lt]: new Date()
      }
    }
  });
};

;(Notification as any).updateReadCount = async function(notificationId: string) {
  const count = await sequelize.models.NotificationRecipient.count({
    where: {
      notification_id: notificationId,
      is_read: true
    }
  });
  
  await this.update(
    { read_count: count },
    { where: { id: notificationId } }
  );
  
  return count;
};

export default Notification as any;







