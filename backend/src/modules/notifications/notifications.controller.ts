import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';
import { responseUtils } from '../../utils/response.util';

export class NotificationsController {
  private service: NotificationsService;

  constructor() {
    this.service = new NotificationsService();
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const senderId = req.user?.userId ?? null;
      const notification = await this.service.create(senderId, req.body);
      return responseUtils.success(res, notification, 'Notification created', 201);
    } catch (error: unknown) {
      next(error);
    }
  };

  myNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const data = await this.service.getMyNotifications(userId, req.query as any);
      return responseUtils.success(res, data, 'Notifications retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };

  unreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const count = await this.service.getUnreadCount(userId);
      return responseUtils.success(res, { count }, 'Unread count retrieved');
    } catch (error: unknown) {
      next(error);
    }
  };

  markAllRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const affected = await this.service.markAllAsRead(userId);
      return responseUtils.success(res, { affected }, 'All notifications marked as read');
    } catch (error: unknown) {
      next(error);
    }
  };

  archiveOld = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const days = parseInt((req.query.days as string) || '30', 10);
      const result = await this.service.archiveOld(userId, days);
      return responseUtils.success(res, result, 'Old notifications archived');
    } catch (error: unknown) {
      next(error);
    }
  };
}






