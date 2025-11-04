import { DataTypes, Op } from 'sequelize';
import type { ModelStatic } from '../types/sequelize-types';
import { NotificationRecipientAttributes, NotificationRecipientCreationAttributes, NotificationRecipientInstance } from '../types/model.types';
import Notification from './notification.model';
import User from './user.model';
import { addInstanceMethods, addStaticMethods, exportModel, getModelSequelize } from '../utils/model-extension.util';

const sequelize = getModelSequelize();

/**
 * NotificationRecipient Model
 * Junction table để ghi lại người nhận thông báo và trạng thái đọc
 *
 * Nghiệp vụ:
 * - Mỗi bản ghi đại diện cho việc một user nhận một notification
 * - Lưu trạng thái đọc/chưa đọc riêng cho từng user
 * - Đảm bảo một user chỉ nhận một notification một lần (UNIQUE constraint)
 */
const NotificationRecipient = sequelize.define('NotificationRecipient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  notification_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'notifications',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'ID thông báo'
  },
  recipient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'ID người nhận'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Đã đọc hay chưa'
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời điểm đọc thông báo'
  },
  is_archived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Đã lưu trữ/ẩn khỏi danh sách chính'
  },
  archived_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời điểm lưu trữ'
  },
  is_dismissed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Đã bỏ qua/dismiss thông báo'
  },
  dismissed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời điểm bỏ qua'
  },
  clicked_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Thời điểm click vào thông báo'
  },
  interaction_data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Dữ liệu về tương tác của user với thông báo'
  }
}, {
  tableName: 'notification_recipients',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['notification_id', 'recipient_id'],
      name: 'unique_notification_recipient'
    },
    { fields: ['recipient_id'] },
    { fields: ['notification_id'] },
    { fields: ['is_read'] },
    {
      // Index để query thông báo chưa đọc của user
      fields: ['recipient_id', 'is_read'],
      name: 'recipient_read_status'
    },
    {
      // Index cho thông báo chưa đọc và chưa archived
      fields: ['recipient_id', 'is_read', 'is_archived'],
      name: 'recipient_active_unread'
    },
    { fields: ['created_at'] }
  ]
});

const NotificationRecipientModel = NotificationRecipient as unknown as ModelStatic<NotificationRecipientInstance>;

// Instance methods (typed)
addInstanceMethods(NotificationRecipientModel, {
  async markAsRead(this: NotificationRecipientInstance) {
    if (!this.is_read) {
      this.is_read = true;
      this.read_at = new Date();
      await (this as any).save();

      await Notification.updateReadCount(this.notification_id);
    }
    return this;
  },

  async markAsUnread(this: NotificationRecipientInstance) {
    if (this.is_read) {
      this.is_read = false;
      this.read_at = null;
      await (this as any).save();

      await Notification.updateReadCount(this.notification_id);
    }
    return this;
  },

  async archive(this: NotificationRecipientInstance) {
    this.is_archived = true;
    this.archived_at = new Date();
    await (this as any).save();
    return this;
  },

  async dismiss(this: NotificationRecipientInstance) {
    this.is_dismissed = true;
    this.dismissed_at = new Date();
    await (this as any).save();
    return this;
  },

  async trackClick(this: NotificationRecipientInstance) {
    this.clicked_at = new Date();
    await (this as any).save();
    return this;
  }
});

// Static methods (typed)
addStaticMethods(NotificationRecipientModel, {
  async getUserNotifications(
    this: ModelStatic<NotificationRecipientInstance>,
    userId: string,
    options: {
      includeRead?: boolean;
      includeArchived?: boolean;
      limit?: number;
      offset?: number;
      category?: string;
    } = {}
  ) {
    const {
      includeRead = true,
      includeArchived = false,
      limit = 50,
      offset = 0,
      category
    } = options;

    const where: Partial<NotificationRecipientAttributes> & Record<string, unknown> = { recipient_id: userId };

    if (!includeRead) where.is_read = false;
    if (!includeArchived) where.is_archived = false;

    const notificationWhere: Record<string, unknown> = {};
    if (category) notificationWhere.category = category;

    return await this.findAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Notification,
          as: 'notification',
          where: notificationWhere,
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'first_name', 'last_name', 'avatar']
            }
          ]
        }
      ]
    });
  },

  async getUnreadCount(this: ModelStatic<NotificationRecipientInstance>, userId: string): Promise<number> {
    return await this.count({
      where: {
        recipient_id: userId,
        is_read: false,
        is_archived: false
      }
    });
  },

  async markAllAsRead(this: ModelStatic<NotificationRecipientInstance>, userId: string) {
    const recipients = await this.findAll({
      where: {
        recipient_id: userId,
        is_read: false
      }
    });

    if (recipients.length === 0) return 0;

    const readAt = new Date();
    await this.update(
      { is_read: true, read_at: readAt },
      {
        where: {
          recipient_id: userId,
          is_read: false
        }
      }
    );

    // Update read counts for all affected notifications
    const notificationIds = Array.from(new Set(recipients.map((r: any) => r.notification_id)));
    for (const notificationId of notificationIds) {
      await Notification.updateReadCount(notificationId);
    }

    return recipients.length;
  },

  async archiveOldNotifications(this: ModelStatic<NotificationRecipientInstance>, userId: string, daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const [affected] = await this.update(
      { is_archived: true, archived_at: new Date() },
      {
        where: {
          recipient_id: userId,
          is_archived: false,
          created_at: {
            [Op.lt]: cutoffDate
          }
        }
      }
    );

    return affected;
  },

  async getNotificationStats(this: ModelStatic<NotificationRecipientInstance>, userId: string) {
    const total = await this.count({ where: { recipient_id: userId } });

    const unread = await this.count({
      where: {
        recipient_id: userId,
        is_read: false
      }
    });

    const archived = await this.count({
      where: {
        recipient_id: userId,
        is_archived: true
      }
    });

    return {
      total,
      unread,
      read: total - unread,
      archived,
      active: total - archived
    };
  }
});

export default exportModel(NotificationRecipientModel);







