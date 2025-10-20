import express, { Request, Response, NextFunction } from 'express';
import { UserModuleController } from './user.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware';
import { userSchemas } from '../../validates/user.validate';
import multer from 'multer';

const router = express.Router();
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

// ===== USER MANAGEMENT ROUTES =====

// Get all users (Admin/Instructor only)
router.get(
  '/',
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR]),
  validateQuery(userSchemas.userQuery),
  (req: Request, res: Response, next: NextFunction) => userModuleController.getAllUsers(req, res, next)
);

// ===== NGHIỆP VỤ RIÊNG CỦA USER =====

// Get user profile (authenticated users only) - MUST be before /:id route
router.get(
  '/profile',
  (req: Request, res: Response, next: NextFunction) => userModuleController.getProfile(req, res, next)
);

// Get user by ID (All authenticated users) - MUST be after specific routes
router.get(
  '/:id',
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT]),
  (req: Request, res: Response, next: NextFunction) => userModuleController.getUserById(req, res, next)
);

// Update user status (Admin/Super Admin only)
router.patch(
  '/:id/status',
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateBody(userSchemas.updateUserStatus),
  (req: Request, res: Response, next: NextFunction) => userModuleController.updateUserStatus(req, res, next)
);

// Get user enrollments (All authenticated users)
router.get(
  '/:id/enrollments',
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT]),
  (req: Request, res: Response, next: NextFunction) => userModuleController.getUserEnrollments(req, res, next)
);

// Get user progress (All authenticated users)
router.get(
  '/:id/progress',
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT]),
  (req: Request, res: Response, next: NextFunction) => userModuleController.getUserProgress(req, res, next)
);

// Update user profile (authenticated users only)
router.put(
  '/profile',
  validateBody(userSchemas.updateProfile),
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
  validateBody((userSchemas as any).updatePreferences),
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
  validateBody((userSchemas as any).linkSocialAccount),
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
  validateBody((userSchemas as any).notificationSettings),
  (req: Request, res: Response, next: NextFunction) => userModuleController.updateNotificationSettings(req, res, next)
);

// Privacy settings (authenticated users only)
router.patch(
  '/privacy',
  validateBody((userSchemas as any).privacySettings),
  (req: Request, res: Response, next: NextFunction) => userModuleController.updatePrivacySettings(req, res, next)
);

export default router;
