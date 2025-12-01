import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service';
import { QueryNotificationsDto, QuerySentNotificationsDto } from './notifications.types';
import { responseUtils } from '../../utils/response.util';

export class NotificationsController {
  private service: NotificationsService;

  constructor() {
    this.service = new NotificationsService();
  }

  /**
   * Tạo notification cơ bản (Instructor/Admin)
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const senderId = req.user?.userId ?? null;
      const notification = await this.service.create(senderId, req.body);
      return responseUtils.success(res, notification, 'Thông báo đã được tạo', 201);
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Gửi bulk notification (Admin/Instructor)
   */
  sendBulk = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const senderId = req.user!.userId;
      const result = await this.service.sendBulk(senderId, req.body);
      return responseUtils.success(
        res, 
        result, 
        `Thông báo đã được gửi đến ${result.recipients_count} người nhận`, 
        201
      );
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Lấy danh sách notifications của user hiện tại
   */
  myNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const raw = req.query as Record<string, unknown>;
      const query: QueryNotificationsDto = {
        category: typeof raw.category === 'string' ? raw.category : undefined,
        priority:
          typeof raw.priority === 'string' && ['low', 'normal', 'high', 'urgent'].includes(raw.priority as string)
            ? (raw.priority as QueryNotificationsDto['priority'])
            : undefined,
        limit:
          typeof raw.limit === 'string'
            ? parseInt(raw.limit as string, 10)
            : typeof raw.limit === 'number'
              ? (raw.limit as number)
              : undefined,
        offset:
          typeof raw.offset === 'string'
            ? parseInt(raw.offset as string, 10)
            : typeof raw.offset === 'number'
              ? (raw.offset as number)
              : undefined,
      };
      const data = await this.service.getMyNotifications(userId, query);
      return responseUtils.success(res, data, 'Đã lấy danh sách thông báo');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Đếm số thông báo chưa đọc
   */
  unreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const count = await this.service.getUnreadCount(userId);
      return responseUtils.success(res, { unread_count: count }, 'Đã lấy số thông báo chưa đọc');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const affected = await this.service.markAllAsRead(userId);
      return responseUtils.success(res, { affected }, 'Đã đánh dấu tất cả thông báo đã đọc');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Đánh dấu 1 thông báo đã đọc
   */
  markOneRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const notificationId = req.params.id;
      await this.service.markOneAsRead(userId, notificationId);
      return responseUtils.success(res, null, 'Đã đánh dấu thông báo đã đọc');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Archive 1 thông báo
   */
  archiveOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const notificationId = req.params.id;
      await this.service.archiveOne(userId, notificationId);
      return responseUtils.success(res, null, 'Đã lưu trữ thông báo');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Archive thông báo cũ (theo số ngày)
   */
  archiveOld = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const days = parseInt((req.query.days as string) || '30', 10);
      const result = await this.service.archiveOld(userId, days);
      return responseUtils.success(res, { archived_count: result }, 'Đã lưu trữ thông báo cũ');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Xóa thông báo (Admin only)
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = req.params.id;
      await this.service.deleteNotification(notificationId);
      return responseUtils.success(res, null, 'Đã xóa thông báo');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Lấy thông báo theo ID
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = req.params.id;
      const notification = await this.service.getById(notificationId);
      return responseUtils.success(res, notification, 'Đã lấy thông báo');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Lấy danh sách thông báo đã gửi (Admin/Instructor)
   */
  getSentNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const senderId = req.user!.userId;
      const raw = req.query as Record<string, unknown>;
      const query: QuerySentNotificationsDto = {
        notification_type: typeof raw.notification_type === 'string' ? raw.notification_type : undefined,
        category: typeof raw.category === 'string' ? raw.category : undefined,
        limit: typeof raw.limit === 'string' ? parseInt(raw.limit, 10) : undefined,
        offset: typeof raw.offset === 'string' ? parseInt(raw.offset, 10) : undefined,
      };
      const result = await this.service.getSentNotifications(senderId, query);
      return responseUtils.success(res, result, 'Đã lấy danh sách thông báo đã gửi');
    } catch (error: unknown) {
      next(error);
    }
  };

  /**
   * Lấy tất cả thông báo trong hệ thống (Admin only)
   */
  getAllNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const raw = req.query as Record<string, unknown>;
      const query: QuerySentNotificationsDto = {
        notification_type: typeof raw.notification_type === 'string' ? raw.notification_type : undefined,
        category: typeof raw.category === 'string' ? raw.category : undefined,
        limit: typeof raw.limit === 'string' ? parseInt(raw.limit, 10) : 50,
        offset: typeof raw.offset === 'string' ? parseInt(raw.offset, 10) : 0,
      };
      const result = await this.service.getAllNotifications(query);
      return responseUtils.success(res, result, 'Đã lấy tất cả thông báo');
    } catch (error: unknown) {
      next(error);
    }
  };
}

































