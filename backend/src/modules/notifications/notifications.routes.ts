import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { notificationsValidation } from './notifications.validate';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UserRole } from '../../constants/roles.enum';

const router = Router();
const controller = new NotificationsController();

router.use(authMiddleware);

// Create notification (admin/instructor)
router.post(
  '/',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(notificationsValidation.create),
  controller.create
);

// My notifications
router.get(
  '/me',
  validate(notificationsValidation.queryList),
  controller.myNotifications
);

// Unread count
router.get('/me/unread-count', controller.unreadCount);

// Mark all as read
router.post('/me/mark-all-read', controller.markAllRead);

// Archive old
router.post('/me/archive-old', controller.archiveOld);

export default router;























