import { NotificationsRepository } from './notifications.repository';
import { CreateNotificationDto, QueryNotificationsDto } from './notifications.types';
import { NotificationInstance } from '../../types/model.types';

export class NotificationsService {
  private repo: NotificationsRepository;

  constructor() {
    this.repo = new NotificationsRepository();
  }

  async create(senderId: string | null, dto: CreateNotificationDto): Promise<NotificationInstance> {
    const { recipient_ids = [], ...notifData } = dto;
    const notification = await this.repo.createNotification(senderId, notifData);

    if (!dto.is_broadcast && recipient_ids.length > 0) {
      await this.repo.bulkCreateRecipients(notification.id, recipient_ids);
      notification.total_recipients = recipient_ids.length;
      await (notification as any).save();
    }

    return notification;
  }

  async getMyNotifications(userId: string, query: QueryNotificationsDto) {
    return await this.repo.getUserNotifications(userId, {
      includeRead: true,
      includeArchived: false,
      limit: query.limit ?? 50,
      offset: query.offset ?? 0,
      category: query.category
    });
  }

  async getUnreadCount(userId: string) {
    return await this.repo.getUnreadCount(userId);
  }

  async markAllAsRead(userId: string) {
    return await this.repo.markAllAsRead(userId);
  }

  async archiveOld(userId: string, days = 30) {
    return await this.repo.archiveOld(userId, days);
  }
}



















