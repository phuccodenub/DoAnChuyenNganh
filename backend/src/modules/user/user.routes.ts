import { Router, Request, Response, NextFunction } from 'express';
import { UserModuleController } from './user.controller';
import { AuthController } from '../auth/auth.controller';
import { EnrollmentController } from '../enrollment/enrollment.controller';
import { authSchemas } from '../../validates/auth.validate';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware';
import { userValidation as userSchemas } from '../../validates/user.validate';
import multer, { FileFilterCallback } from 'multer';

const router = Router();
const userModuleController = new UserModuleController();
const authController = new AuthController();
const enrollmentController = new EnrollmentController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// All routes require authentication
router.use(authMiddleware);

// ===== NGHIỆP VỤ RIÊNG CỦA USER =====

// Search users for chat/messaging
router.get(
  '/search',
  (req: Request, res: Response, next: NextFunction) => userModuleController.searchUsers(req, res, next)
);

// Get user profile (authenticated users only)
router.get(
  '/profile',
  (req: Request, _res: Response, next: NextFunction) => {
    // Temporary info log to verify route match during tests
     
    const logger = require('../../utils/logger.util').default;
    logger.info('Matched route GET /users/profile', { baseUrl: req.baseUrl, url: req.url });
    next();
  },
  (req: Request, res: Response, next: NextFunction) => userModuleController.getProfile(req, res, next)
);

// Get current user's enrollments (authenticated users only)
router.get(
  '/profile/enrollments',
  (req: Request, res: Response, next: NextFunction) => enrollmentController.getMyEnrollments(req, res, next)
);

// Update user profile (authenticated users only)
router.put(
  '/profile',
  validateBody(userSchemas.updateProfile),
  (req: Request, _res: Response, next: NextFunction) => {
    // Temporary info log to verify route match during tests
     
    const logger = require('../../utils/logger.util').default;
    logger.info('Matched route PUT /users/profile', { baseUrl: req.baseUrl, url: req.url });
    next();
  },
  (req: Request, res: Response, next: NextFunction) => userModuleController.updateProfile(req, res, next)
);

// Upload avatar (authenticated users only)
router.post(
  '/avatar',
  upload.single('avatar'),
  (req: Request, res: Response, next: NextFunction) => userModuleController.uploadAvatar(req, res, next)
);

// Update user preferences (authenticated users only)
router.patch(
  '/preferences',
  validateBody(userSchemas.updatePreferences),
  (req: Request, res: Response, next: NextFunction) => userModuleController.updatePreferences(req, res, next)
);

// Get active sessions (authenticated users only)
router.get(
  '/sessions',
  (req: Request, res: Response, next: NextFunction) => userModuleController.getActiveSessions(req, res, next)
);

// Logout all devices (authenticated users only)
router.post(
  '/logout-all',
  (req: Request, res: Response, next: NextFunction) => userModuleController.logoutAllDevices(req, res, next)
);

// Backward-compatible alias: some clients/tests expect change-password under /api/users
// Delegate to AuthController to keep single implementation
router.put(
  '/change-password',
  validateBody(authSchemas.changePassword),
  (req: Request, res: Response, next: NextFunction) => authController.changePassword(req, res, next)
);

// Two-factor authentication (authenticated users only)
router.post(
  '/2fa/enable',
  (req: Request, res: Response, next: NextFunction) => userModuleController.enableTwoFactor(req, res, next)
);

router.post(
  '/2fa/disable',
  (req: Request, res: Response, next: NextFunction) => userModuleController.disableTwoFactor(req, res, next)
);

// Social account linking (authenticated users only)
router.post(
  '/social/link',
  validateBody(userSchemas.linkSocialAccount),
  (req: Request, res: Response, next: NextFunction) => userModuleController.linkSocialAccount(req, res, next)
);

// User analytics (authenticated users only)
router.get(
  '/analytics',
  (req: Request, res: Response, next: NextFunction) => userModuleController.getUserAnalytics(req, res, next)
);

// Notification settings (authenticated users only)
router.patch(
  '/notifications',
  validateBody(userSchemas.updateNotificationSettings),
  (req: Request, res: Response, next: NextFunction) => userModuleController.updateNotificationSettings(req, res, next)
);

// Privacy settings (authenticated users only)
router.patch(
  '/privacy',
  validateBody(userSchemas.updatePrivacySettings),
  (req: Request, res: Response, next: NextFunction) => userModuleController.updatePrivacySettings(req, res, next)
);

// ===== ENROLLMENT NESTED ROUTES =====

/**
 * Get user enrollments
 * GET /users/:id/enrollments
 * This allows viewing enrollment history for a specific user
 */
router.get(
  '/:id/enrollments',
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR]),
  (req: Request, res: Response, next: NextFunction) => enrollmentController.getUserEnrollments(req, res, next)
);

export default router;

