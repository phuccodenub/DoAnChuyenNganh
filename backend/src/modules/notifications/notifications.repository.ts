import { Op } from 'sequelize';
import type { ModelStatic, WhereOptions } from '../../types/sequelize-types';
import Notification from '../../models/notification.model';
import NotificationRecipient from '../../models/notification-recipient.model';
import User from '../../models/user.model';
import Enrollment from '../../models/enrollment.model';
import { NotificationInstance, NotificationCreationAttributes, NotificationRecipientInstance, NotificationRecipientCreationAttributes, NotificationRecipientAttributes, UserInstance, EnrollmentInstance } from '../../types/model.types';
import { CreateNotificationDto, TargetAudience } from './notifications.types';
import logger from '../../utils/logger.util';

export class NotificationsRepository {
  private NotificationModel: ModelStatic<NotificationInstance>;
  private NotificationRecipientModel: ModelStatic<NotificationRecipientInstance>;
  private UserModel: ModelStatic<UserInstance>;
  private EnrollmentModel: ModelStatic<EnrollmentInstance>;

  constructor() {
    this.NotificationModel = Notification as unknown as ModelStatic<NotificationInstance>;
    this.NotificationRecipientModel = NotificationRecipient as unknown as ModelStatic<NotificationRecipientInstance>;
    this.UserModel = User as unknown as ModelStatic<UserInstance>;
    this.EnrollmentModel = Enrollment as unknown as ModelStatic<EnrollmentInstance>;
  }

  async createNotification(senderId: string | null, dto: Omit<CreateNotificationDto, 'recipient_ids'>): Promise<NotificationInstance> {
    const payload: Partial<NotificationCreationAttributes> = {
      sender_id: senderId ?? null,
      notification_type: dto.notification_type,
      title: dto.title,
      message: dto.message,
      link_url: dto.link_url ?? null,
      priority: dto.priority ?? 'normal',
      category: dto.category ?? 'system',
      related_resource_type: dto.related_resource_type ?? null,
      related_resource_id: dto.related_resource_id ?? null,
      scheduled_at: dto.scheduled_at ? new Date(dto.scheduled_at as Date | string) : null,
      sent_at: null,
      expires_at: dto.expires_at ? new Date(dto.expires_at as Date | string) : null,
      metadata: dto.metadata ?? {},
      is_broadcast: dto.is_broadcast ?? false,
      total_recipients: 0,
      read_count: 0
    };
    return await this.NotificationModel.create(payload as NotificationCreationAttributes);
  }

  async bulkCreateRecipients(notificationId: string, recipientIds: string[]): Promise<number> {
    if (!recipientIds || recipientIds.length === 0) return 0;
    const rows: NotificationRecipientCreationAttributes[] = recipientIds.map((id) => ({
      notification_id: notificationId,
      recipient_id: id,
      is_read: false
    }));
    const created = await this.NotificationRecipientModel.bulkCreate(rows, { ignoreDuplicates: true });
    return created.length;
  }

  /**
   * Lấy danh sách recipient IDs dựa trên target_audience
   */
  async getRecipientIdsByTargetAudience(target: TargetAudience): Promise<string[]> {
    switch (target.type) {
      case 'all':
        // Tất cả users active (database uses 'status' column, not 'is_active')
        const allUsers = await this.UserModel.findAll({
          where: { status: 'active' },
          attributes: ['id']
        });
        return allUsers.map(u => u.id);

      case 'role':
        // Users theo role - normalize to lowercase for database query
        if (!target.role) return [];
        const normalizedRole = target.role.toLowerCase();
        const roleUsers = await this.UserModel.findAll({
          where: { role: normalizedRole, status: 'active' },
          attributes: ['id']
        });
        return roleUsers.map(u => u.id);

      case 'course':
        // Students enrolled trong course
        if (!target.course_id) return [];
        const enrollments = await this.EnrollmentModel.findAll({
          where: { 
            course_id: target.course_id,
            status: 'active'
          },
          attributes: ['user_id']
        });
        return enrollments.map(e => e.user_id);

      case 'users':
        // Specific users
        return target.user_ids || [];

      default:
        return [];
    }
  }

  /**
   * Lấy notification recipient record
   */
  async findRecipientRecord(userId: string, notificationId: string): Promise<NotificationRecipientInstance | null> {
    return await this.NotificationRecipientModel.findOne({
      where: {
        recipient_id: userId,
        notification_id: notificationId
      }
    });
  }

  /**
   * Đánh dấu 1 notification đã đọc
   */
  async markOneAsRead(userId: string, notificationId: string): Promise<boolean> {
    const recipient = await this.findRecipientRecord(userId, notificationId);
    if (!recipient) return false;
    
    if (!recipient.is_read) {
      await this.NotificationRecipientModel.update(
        { is_read: true, read_at: new Date() },
        { where: { id: recipient.id } }
      );
      
      // Update read_count của notification
      const readCount = await this.NotificationRecipientModel.count({
        where: { notification_id: notificationId, is_read: true }
      });
      await this.NotificationModel.update(
        { read_count: readCount },
        { where: { id: notificationId } }
      );
    }
    return true;
  }

  /**
   * Archive 1 notification
   */
  async archiveOne(userId: string, notificationId: string): Promise<boolean> {
    const recipient = await this.findRecipientRecord(userId, notificationId);
    if (!recipient) return false;
    
    await this.NotificationRecipientModel.update(
      { is_archived: true, archived_at: new Date() },
      { where: { id: recipient.id } }
    );
    return true;
  }

  /**
   * Xóa notification (Admin only)
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    // Xóa tất cả recipients trước (cascade)
    await this.NotificationRecipientModel.destroy({
      where: { notification_id: notificationId }
    });
    
    // Xóa notification
    const deleted = await this.NotificationModel.destroy({
      where: { id: notificationId }
    });
    return deleted > 0;
  }

  /**
   * Lấy notification by ID
   */
  async findById(notificationId: string): Promise<NotificationInstance | null> {
    return await this.NotificationModel.findByPk(notificationId, {
      include: [
        {
          model: this.UserModel,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'avatar']
        }
      ]
    });
  }

  /**
   * Lấy danh sách notifications đã gửi (cho Admin/Instructor)
   */
  async getSentNotifications(
    senderId: string, 
    options: { notification_type?: string; category?: string; limit?: number; offset?: number }
  ): Promise<{ notifications: any[]; total: number }> {
    const { notification_type, category, limit = 50, offset = 0 } = options;

    const where: Record<string, unknown> = { sender_id: senderId };
    if (notification_type) where.notification_type = notification_type;
    if (category) where.category = category;

    const { rows, count } = await (this.NotificationModel as any).findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: this.UserModel,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'avatar']
        }
      ]
    });

    // Transform to ensure created_at is always present (handle camelCase)
    const notifications = rows.map((n: any) => ({
      ...n.toJSON(),
      created_at: n.createdAt || n.created_at,
      updated_at: n.updatedAt || n.updated_at
    }));

    return { notifications, total: count };
  }

  /**
   * Lấy tất cả notifications trong hệ thống (Admin only)
   */
  async getAllNotifications(
    options: { notification_type?: string; category?: string; limit?: number; offset?: number }
  ): Promise<{ notifications: any[]; total: number }> {
    const { notification_type, category, limit = 50, offset = 0 } = options;

    const where: Record<string, unknown> = {};
    if (notification_type) where.notification_type = notification_type;
    if (category) where.category = category;

    const { rows, count } = await (this.NotificationModel as any).findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: this.UserModel,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'avatar']
        }
      ]
    });

    // Transform to ensure created_at is always present (handle camelCase)
    const notifications = rows.map((n: any) => ({
      ...n.toJSON(),
      created_at: n.createdAt || n.created_at,
      updated_at: n.updatedAt || n.updated_at
    }));

    return { notifications, total: count };
  }

  async getUserNotifications(userId: string, options: { includeRead?: boolean; includeArchived?: boolean; limit?: number; offset?: number; category?: string }): Promise<NotificationRecipientInstance[]> {
    const { includeRead = true, includeArchived = false, limit = 50, offset = 0, category } = options;

    const where: WhereOptions<NotificationRecipientAttributes> = { recipient_id: userId };
    if (!includeRead) Object.assign(where, { is_read: false });
    if (!includeArchived) Object.assign(where, { is_archived: false });

    logger.debug('getUserNotifications called', { userId, where, options });

    // Build notification include options
    const notificationInclude: any = {
      model: this.NotificationModel,
      as: 'notification',
      include: [
        {
          model: this.UserModel,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'avatar']
        }
      ]
    };
    
    // Only add where clause if category is specified
    if (category) {
      notificationInclude.where = { category };
    }

    const results = await this.NotificationRecipientModel.findAll({
      where,
      limit,
      offset,
      // Sort by notification's created_at (the actual notification time), not recipient's created_at
      order: [[{ model: this.NotificationModel, as: 'notification' }, 'created_at', 'DESC']],
      include: [notificationInclude]
    });
    
    logger.debug('getUserNotifications results', { count: results.length });
    return results;
  }

  /**
   * Đếm tổng số notifications của user (cho pagination)
   */
  async getTotalUserNotifications(userId: string, options: { includeArchived?: boolean; category?: string }): Promise<number> {
    const { includeArchived = false, category } = options;

    const where: WhereOptions<NotificationRecipientAttributes> = { recipient_id: userId };
    if (!includeArchived) Object.assign(where, { is_archived: false });

    // Build notification include options
    const notificationInclude: any = {
      model: this.NotificationModel,
      as: 'notification',
      attributes: [] // No attributes needed for count
    };
    
    if (category) {
      notificationInclude.where = { category };
    }

    return await this.NotificationRecipientModel.count({
      where,
      include: [notificationInclude]
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.NotificationRecipientModel.count({
      where: {
        recipient_id: userId,
        is_read: false,
        is_archived: false
      }
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const recipients = await this.NotificationRecipientModel.findAll({
      where: { recipient_id: userId, is_read: false } as WhereOptions<NotificationRecipientAttributes>
    });
    if (recipients.length === 0) return 0;

    const readAt = new Date();
    await this.NotificationRecipientModel.update(
      { is_read: true, read_at: readAt },
      { where: { recipient_id: userId, is_read: false } as WhereOptions<NotificationRecipientAttributes> }
    );

    const notificationIds = Array.from(new Set(recipients.map((r) => r.notification_id)));
    for (const nid of notificationIds) {
      await this.NotificationModel.update(
        { read_count: await this.NotificationRecipientModel.count({ where: { notification_id: nid, is_read: true } as WhereOptions<NotificationRecipientAttributes> }) },
        { where: { id: nid } }
      );
    }
    return recipients.length;
  }

  async archiveOld(userId: string, days: number = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const [affected] = await this.NotificationRecipientModel.update(
      { is_archived: true, archived_at: new Date() },
      {
        where: {
          recipient_id: userId,
          is_archived: false,
          created_at: { [Op.lt]: cutoff }
        } as WhereOptions<NotificationRecipientAttributes>
      }
    );
    return affected;
  }
}

export default NotificationsRepository;
