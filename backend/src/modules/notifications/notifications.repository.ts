import { Op } from 'sequelize';
import type { ModelStatic, WhereOptions } from '../../types/sequelize-types';
import Notification from '../../models/notification.model';
import NotificationRecipient from '../../models/notification-recipient.model';
import User from '../../models/user.model';
import { NotificationInstance, NotificationCreationAttributes, NotificationRecipientInstance, NotificationRecipientCreationAttributes, NotificationRecipientAttributes, UserInstance } from '../../types/model.types';
import { CreateNotificationDto, QueryNotificationsDto } from './notifications.types';

export class NotificationsRepository {
  private NotificationModel: ModelStatic<NotificationInstance>;
  private NotificationRecipientModel: ModelStatic<NotificationRecipientInstance>;
  private UserModel: ModelStatic<UserInstance>;

  constructor() {
    this.NotificationModel = Notification as unknown as ModelStatic<NotificationInstance>;
    this.NotificationRecipientModel = NotificationRecipient as unknown as ModelStatic<NotificationRecipientInstance>;
    this.UserModel = User as unknown as ModelStatic<UserInstance>;
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

  async getUserNotifications(userId: string, options: { includeRead?: boolean; includeArchived?: boolean; limit?: number; offset?: number; category?: string }): Promise<NotificationRecipientInstance[]> {
    const { includeRead = true, includeArchived = false, limit = 50, offset = 0, category } = options;

    const where: WhereOptions<NotificationRecipientAttributes> = { recipient_id: userId };
    if (!includeRead) Object.assign(where, { is_read: false });
    if (!includeArchived) Object.assign(where, { is_archived: false });

    const notificationWhere: Record<string, unknown> = {};
    if (category) Object.assign(notificationWhere, { category });

    return await this.NotificationRecipientModel.findAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: this.NotificationModel,
          as: 'notification',
          where: notificationWhere,
          include: [
            {
              model: this.UserModel,
              as: 'sender',
              attributes: ['id', 'first_name', 'last_name', 'avatar']
            }
          ]
        }
      ]
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
