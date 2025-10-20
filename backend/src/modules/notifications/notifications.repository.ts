import { Notification, NotificationRecipient, User } from '../../models';

export class NotificationsRepository {
  async createNotification(senderId: string | null, data: any) {
    const notification = await Notification.create({
      sender_id: senderId,
      ...data
    });
    return notification;
  }

  async bulkCreateRecipients(notificationId: string, recipientIds: string[]) {
    if (recipientIds.length === 0) return [];
    const rows = recipientIds.map((recipientId) => ({
      notification_id: notificationId,
      recipient_id: recipientId
    }));
    return await NotificationRecipient.bulkCreate(rows, { ignoreDuplicates: true });
  }

  async getUserNotifications(userId: string, params: { includeRead?: boolean; includeArchived?: boolean; limit?: number; offset?: number; category?: string }) {
    return await NotificationRecipient.getUserNotifications(userId, params);
  }

  async getUnreadCount(userId: string) {
    return await NotificationRecipient.getUnreadCount(userId);
  }

  async markAllAsRead(userId: string) {
    return await NotificationRecipient.markAllAsRead(userId);
  }

  async archiveOld(userId: string, days = 30) {
    return await NotificationRecipient.archiveOldNotifications(userId, days);
  }

  async findById(notificationId: string) {
    return await Notification.findByPk(notificationId, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'first_name', 'last_name', 'email'] }]
    });
  }
}






