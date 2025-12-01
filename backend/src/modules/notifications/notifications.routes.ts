import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { notificationsValidation } from './notifications.validate';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UserRole } from '../../constants/roles.enum';

const router = Router();
const controller = new NotificationsController();

router.use(authMiddleware);

// ============================================
// USER ENDPOINTS (Tất cả users đã đăng nhập)
// ============================================

// Lấy danh sách thông báo của user hiện tại
router.get(
  '/me',
  validate(notificationsValidation.queryList),
  controller.myNotifications
);

// Đếm số thông báo chưa đọc
router.get('/me/unread-count', controller.unreadCount);

// Đánh dấu tất cả thông báo đã đọc
router.post('/me/mark-all-read', controller.markAllRead);

// Archive thông báo cũ (theo số ngày)
router.post('/me/archive-old', controller.archiveOld);

// ============================================
// ADMIN/INSTRUCTOR ENDPOINTS
// (MUST be defined BEFORE /:id to avoid route conflict)
// ============================================

// Lấy danh sách thông báo đã gửi
router.get(
  '/sent',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(notificationsValidation.querySent),
  controller.getSentNotifications
);

// Lấy tất cả thông báo trong hệ thống (Admin only)
router.get(
  '/all',
  authorizeRoles([UserRole.ADMIN]),
  validate(notificationsValidation.querySent),
  controller.getAllNotifications
);

// Tạo notification cơ bản (chỉ định recipient_ids)
router.post(
  '/',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(notificationsValidation.create),
  controller.create
);

// Gửi bulk notification theo target_audience
router.post(
  '/bulk',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(notificationsValidation.sendBulk),
  controller.sendBulk
);

// ============================================
// SINGLE NOTIFICATION ENDPOINTS
// (Dynamic :id routes MUST come AFTER static routes)
// ============================================

// Lấy thông báo theo ID
router.get(
  '/:id',
  validate(notificationsValidation.notificationId),
  controller.getById
);

// Đánh dấu 1 thông báo đã đọc
router.put(
  '/:id/read',
  validate(notificationsValidation.notificationId),
  controller.markOneRead
);

// Archive 1 thông báo
router.put(
  '/:id/archive',
  validate(notificationsValidation.notificationId),
  controller.archiveOne
);

// ============================================
// ADMIN ONLY ENDPOINTS
// ============================================

// Xóa thông báo
router.delete(
  '/:id',
  authorizeRoles([UserRole.ADMIN]),
  validate(notificationsValidation.notificationId),
  controller.delete
);

export default router;

































