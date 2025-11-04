import { DataTypes, Model, Op } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { NotificationAttributes, NotificationCreationAttributes, NotificationInstance } from '../types/model.types';
import { exportModel, addInstanceMethods, addStaticMethods, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

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
const NotificationModel = Notification as unknown as ModelStatic<NotificationInstance>;

// Instance Methods (type-safe)
addInstanceMethods(NotificationModel, {
  isExpired(this: NotificationInstance): boolean {
    return Boolean(this.expires_at && new Date() > this.expires_at);
  },
  isPending(this: NotificationInstance): boolean {
    return Boolean(this.scheduled_at && !this.sent_at);
  },
  isSent(this: NotificationInstance): boolean {
    return this.sent_at !== null;
  },
  getReadPercentage(this: NotificationInstance): number {
    return this.total_recipients > 0
      ? (this.read_count / this.total_recipients) * 100
      : 0;
  },
  async markAsSent(this: NotificationInstance) {
    this.sent_at = new Date();
    await (this as any).save();
    return this;
  }
});

// Static Methods (type-safe)
addStaticMethods(NotificationModel, {
  async findByType(this: ModelStatic<NotificationInstance>, type: string, limit: number = 50) {
    return await this.findAll({
      where: { notification_type: type },
      order: [['created_at', 'DESC']],
      limit,
      include: [
        {
          model: (sequelize.models as any).User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'email', 'avatar']
        }
      ]
    });
  },
  async findPendingNotifications(this: ModelStatic<NotificationInstance>) {
    return await this.findAll({
      where: {
        scheduled_at: {
          [Op.lte]: new Date()
        },
        sent_at: null
      },
      order: [['scheduled_at', 'ASC']]
    });
  },
  async findExpiredNotifications(this: ModelStatic<NotificationInstance>) {
    return await this.findAll({
      where: {
        expires_at: {
          [Op.lt]: new Date()
        }
      }
    });
  },
  async updateReadCount(this: ModelStatic<NotificationInstance>, notificationId: string) {
    const count = await (sequelize.models as any).NotificationRecipient.count({
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
  }
});

export default exportModel(NotificationModel);







