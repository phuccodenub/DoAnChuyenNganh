import { Router } from 'express';
import { LiveStreamController } from './livestream.controller';
import { liveStreamValidation } from './livestream.validate';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UserRole } from '../../constants/roles.enum';
import { uploadMiddleware } from '../files/upload.middleware';

const router = Router();
const controller = new LiveStreamController();

router.use(authMiddleware);

// List sessions (requires auth for now)
router.get('/', validate(liveStreamValidation.list), controller.list);

// My sessions
router.get(
  '/my',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(liveStreamValidation.list),
  controller.mySessions
);

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

// Delete session
router.delete(
  '/:sessionId',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(liveStreamValidation.sessionId),
  controller.delete
);

router.post(
  '/:sessionId/thumbnail',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(liveStreamValidation.sessionId),
  uploadMiddleware('thumbnail'),
  controller.uploadThumbnail
);

// Join session (student)
router.post('/:sessionId/join', validate(liveStreamValidation.sessionId), controller.join);

// Leave session
router.post('/:sessionId/leave', validate(liveStreamValidation.sessionId), controller.leave);

// Viewers list
router.get('/:sessionId/viewers', validate(liveStreamValidation.sessionId), controller.getViewers);

// Get ICE servers for WebRTC (Twilio NTS)
router.get('/webrtc/ice-servers', controller.getIceServers);

export default router;

































