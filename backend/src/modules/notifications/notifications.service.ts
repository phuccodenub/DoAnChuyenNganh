import { NotificationsRepository } from './notifications.repository';
import { CreateNotificationDto, QueryNotificationsDto, BulkNotificationDto, BulkNotificationResponse, QuerySentNotificationsDto } from './notifications.types';
import { NotificationInstance } from '../../types/model.types';
import { ApiError } from '../../errors';
import { getNotificationGateway, NotificationPayload } from './notifications.gateway';

export class NotificationsService {
  private repo: NotificationsRepository;

  constructor() {
    this.repo = new NotificationsRepository();
  }

  /**
   * Build NotificationPayload for real-time emit
   */
  private buildPayload(notification: NotificationInstance, sender?: { id: string; first_name: string; last_name: string; avatar?: string } | null): NotificationPayload {
    return {
      id: notification.id,
      notification_type: notification.notification_type,
      title: notification.title,
      message: notification.message,
      link_url: notification.link_url ?? undefined,
      priority: notification.priority ?? undefined,
      category: notification.category ?? undefined,
      related_resource_type: notification.related_resource_type ?? undefined,
      related_resource_id: notification.related_resource_id ?? undefined,
      metadata: notification.metadata as Record<string, unknown> | undefined,
      created_at: notification.created_at,
      sender: sender ?? null
    };
  }

  /**
   * Emit notification to recipients via Socket.IO
   */
  private emitToRecipients(payload: NotificationPayload, recipientIds: string[], isBroadcast: boolean): void {
    const gateway = getNotificationGateway();
    if (!gateway) {
      return; // Gateway not initialized (e.g., in tests)
    }

    if (isBroadcast) {
      gateway.broadcast(payload);
    } else {
      gateway.sendToUsers(recipientIds, payload);
    }
  }

  /**
   * Tạo notification cơ bản với recipient_ids
   */
  async create(senderId: string | null, dto: CreateNotificationDto): Promise<NotificationInstance> {
    const { recipient_ids = [], ...notifData } = dto;
    const notification = await this.repo.createNotification(senderId, notifData);

    if (!dto.is_broadcast && recipient_ids.length > 0) {
      await this.repo.bulkCreateRecipients(notification.id, recipient_ids);
      notification.total_recipients = recipient_ids.length;
      notification.sent_at = new Date();
      await (notification as any).save();
    }

    // Emit real-time notification
    const payload = this.buildPayload(notification);
    this.emitToRecipients(payload, recipient_ids, dto.is_broadcast ?? false);

    return notification;
  }

  /**
   * Gửi bulk notification theo target_audience (Admin/Instructor)
   */
  async sendBulk(senderId: string, dto: BulkNotificationDto): Promise<BulkNotificationResponse> {
    // Lấy danh sách recipient IDs dựa trên target_audience
    const recipientIds = await this.repo.getRecipientIdsByTargetAudience(dto.target_audience);

    if (recipientIds.length === 0) {
      throw ApiError.badRequest('Không tìm thấy người nhận phù hợp');
    }

    // Tạo notification
    const isBroadcast = dto.target_audience.type === 'all';
    const notification = await this.repo.createNotification(senderId, {
      notification_type: dto.notification_type,
      title: dto.title,
      message: dto.message,
      link_url: dto.link_url,
      priority: dto.priority,
      category: dto.category,
      related_resource_type: dto.related_resource_type,
      related_resource_id: dto.related_resource_id,
      scheduled_at: dto.scheduled_at,
      expires_at: dto.expires_at,
      metadata: dto.metadata,
      is_broadcast: isBroadcast
    });

    // Tạo recipients
    await this.repo.bulkCreateRecipients(notification.id, recipientIds);

    // Cập nhật thông tin notification
    notification.total_recipients = recipientIds.length;
    notification.sent_at = new Date();
    await (notification as any).save();

    // Emit real-time notification
    const payload = this.buildPayload(notification);
    this.emitToRecipients(payload, recipientIds, isBroadcast);

    return {
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        notification_type: notification.notification_type,
        created_at: notification.created_at
      },
      recipients_count: recipientIds.length
    };
  }

  /**
   * Lấy danh sách notifications của user
   */
  async getMyNotifications(userId: string, query: QueryNotificationsDto) {
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;
    
    const recipients = await this.repo.getUserNotifications(userId, {
      includeRead: true,
      includeArchived: false,
      limit,
      offset,
      category: query.category
    });

    // Transform NotificationRecipient[] to notification format for frontend
    const notifications = recipients.map(recipient => {
      const notification = (recipient as any).notification;
      // Note: Sequelize returns camelCase (createdAt) even with underscored: true
      // when accessing via relationships. We need to handle both cases.
      return {
        id: notification?.id || recipient.notification_id,
        notification_type: notification?.notification_type,
        title: notification?.title,
        message: notification?.message,
        link_url: notification?.link_url,
        priority: notification?.priority,
        category: notification?.category,
        related_resource_type: notification?.related_resource_type,
        related_resource_id: notification?.related_resource_id,
        metadata: notification?.metadata,
        is_broadcast: notification?.is_broadcast,
        scheduled_at: notification?.scheduled_at,
        expires_at: notification?.expires_at,
        sent_at: notification?.sent_at,
        // Handle both camelCase and snake_case for timestamps
        created_at: notification?.createdAt || notification?.created_at || (recipient as any).createdAt || recipient.created_at,
        updated_at: notification?.updatedAt || notification?.updated_at,
        sender: notification?.sender || null,
        // Recipient-specific fields
        is_read: recipient.is_read,
        read_at: recipient.read_at,
        is_archived: recipient.is_archived,
        archived_at: recipient.archived_at
      };
    });

    // Get total count for pagination
    const total = await this.repo.getTotalUserNotifications(userId, {
      includeArchived: false,
      category: query.category
    });

    return {
      notifications,
      total,
      limit,
      offset
    };
  }

  /**
   * Đếm số notifications chưa đọc
   */
  async getUnreadCount(userId: string) {
    return await this.repo.getUnreadCount(userId);
  }

  /**
   * Đánh dấu tất cả đã đọc
   */
  async markAllAsRead(userId: string) {
    return await this.repo.markAllAsRead(userId);
  }

  /**
   * Đánh dấu 1 notification đã đọc
   */
  async markOneAsRead(userId: string, notificationId: string): Promise<void> {
    const success = await this.repo.markOneAsRead(userId, notificationId);
    if (!success) {
      throw ApiError.notFound('Không tìm thấy thông báo');
    }
  }

  /**
   * Archive 1 notification
   */
  async archiveOne(userId: string, notificationId: string): Promise<void> {
    const success = await this.repo.archiveOne(userId, notificationId);
    if (!success) {
      throw ApiError.notFound('Không tìm thấy thông báo');
    }
  }

  /**
   * Archive notifications cũ
   */
  async archiveOld(userId: string, days = 30) {
    return await this.repo.archiveOld(userId, days);
  }

  /**
   * Xóa notification (Admin only)
   */
  async deleteNotification(notificationId: string): Promise<void> {
    const notification = await this.repo.findById(notificationId);
    if (!notification) {
      throw ApiError.notFound('Không tìm thấy thông báo');
    }

    const success = await this.repo.deleteNotification(notificationId);
    if (!success) {
      throw ApiError.internalServerError('Không thể xóa thông báo');
    }
  }

  /**
   * Lấy notification by ID
   */
  async getById(notificationId: string): Promise<NotificationInstance> {
    const notification = await this.repo.findById(notificationId);
    if (!notification) {
      throw ApiError.notFound('Không tìm thấy thông báo');
    }
    return notification;
  }

  /**
   * Lấy danh sách notifications đã gửi (cho Admin/Instructor)
   */
  async getSentNotifications(senderId: string, query: QuerySentNotificationsDto) {
    return await this.repo.getSentNotifications(senderId, {
      notification_type: query.notification_type,
      category: query.category,
      limit: query.limit ?? 50,
      offset: query.offset ?? 0
    });
  }

  /**
   * Lấy tất cả notifications trong hệ thống (Admin only)
   */
  async getAllNotifications(query: QuerySentNotificationsDto) {
    return await this.repo.getAllNotifications({
      notification_type: query.notification_type,
      category: query.category,
      limit: query.limit ?? 50,
      offset: query.offset ?? 0
    });
  }
}

































