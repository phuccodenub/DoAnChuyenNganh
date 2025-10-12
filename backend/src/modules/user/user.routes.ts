import { Router } from 'express';
import { UserModuleController } from './user.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware';
import { userSchemas } from '../../validates/user.validate';
import multer from 'multer';

const router = Router();
const userModuleController = new UserModuleController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// All routes require authentication
router.use(authMiddleware);

// ===== NGHIỆP VỤ RIÊNG CỦA USER =====

// Get user profile (authenticated users only)
router.get(
  '/profile',
  (req, res, next) => userModuleController.getProfile(req, res, next)
);

// Update user profile (authenticated users only)
router.put(
  '/profile',
  validateBody(userSchemas.updateProfile),
  (req, res, next) => userModuleController.updateProfile(req, res, next)
);

// Upload avatar (authenticated users only)
router.post(
  '/avatar',
  upload.single('avatar'),
  (req, res, next) => userModuleController.uploadAvatar(req, res, next)
);

// Update user preferences (authenticated users only)
router.patch(
  '/preferences',
  validateBody(userSchemas.updatePreferences),
  (req, res, next) => userModuleController.updatePreferences(req, res, next)
);

// Get active sessions (authenticated users only)
router.get(
  '/sessions',
  (req, res, next) => userModuleController.getActiveSessions(req, res, next)
);

// Logout all devices (authenticated users only)
router.post(
  '/logout-all',
  (req, res, next) => userModuleController.logoutAllDevices(req, res, next)
);

// Two-factor authentication (authenticated users only)
router.post(
  '/2fa/enable',
  (req, res, next) => userModuleController.enableTwoFactor(req, res, next)
);

router.post(
  '/2fa/disable',
  (req, res, next) => userModuleController.disableTwoFactor(req, res, next)
);

// Social account linking (authenticated users only)
router.post(
  '/social/link',
  validateBody(userSchemas.linkSocialAccount),
  (req, res, next) => userModuleController.linkSocialAccount(req, res, next)
);

// User analytics (authenticated users only)
router.get(
  '/analytics',
  (req, res, next) => userModuleController.getUserAnalytics(req, res, next)
);

// Notification settings (authenticated users only)
router.patch(
  '/notifications',
  validateBody(userSchemas.notificationSettings),
  (req, res, next) => userModuleController.updateNotificationSettings(req, res, next)
);

// Privacy settings (authenticated users only)
router.patch(
  '/privacy',
  validateBody(userSchemas.privacySettings),
  (req, res, next) => userModuleController.updatePrivacySettings(req, res, next)
);

export default router;
