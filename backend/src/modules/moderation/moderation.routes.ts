import { Router } from 'express';
import { ModerationController } from './moderation.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';

const router = Router();
const controller = new ModerationController();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get policy for a session
router.get('/sessions/:sessionId/policy', controller.getPolicy);

// Update policy for a session (host/admin only)
router.put(
  '/sessions/:sessionId/policy',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.updatePolicy
);

// Get moderation history for a session
router.get(
  '/sessions/:sessionId/moderation-history',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.getModerationHistory
);

// Manually moderate a comment (host/admin only)
router.post(
  '/messages/:messageId/moderate',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.moderateComment
);

// Unban a user (reset violation count) (host/admin only)
router.post(
  '/sessions/:sessionId/users/:userId/unban',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  controller.unbanUser
);

export default router;

