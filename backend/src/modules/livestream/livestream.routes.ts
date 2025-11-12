import { Router } from 'express';
import { LiveStreamController } from './livestream.controller';
import { liveStreamValidation } from './livestream.validate';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UserRole } from '../../constants/roles.enum';

const router = Router();
const controller = new LiveStreamController();

router.use(authMiddleware);

// Create session (instructor/admin)
router.post(
  '/',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(liveStreamValidation.create),
  controller.create
);

// Get session
router.get('/:sessionId', validate(liveStreamValidation.sessionId), controller.getOne);

// Update status (instructor/admin)
router.put(
  '/:sessionId/status',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(liveStreamValidation.update),
  controller.updateStatus
);

// Join session (student)
router.post('/:sessionId/join', validate(liveStreamValidation.sessionId), controller.join);

export default router;


























