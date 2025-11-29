import express, { Request, Response, NextFunction } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '@middlewares/validate.middleware';
import { authMiddleware } from '@middlewares/auth.middleware';
import { authRateLimit, passwordResetRateLimit, registrationRateLimit } from '@middlewares/auth-rate-limit.middleware';
import { authSchemas } from '@validates/auth.validate';

const router = express.Router();
const authController = new AuthController();


// ===== PUBLIC ROUTES (No authentication required) =====

// Register new user (with rate limiting)
router.post(
  '/register',
  registrationRateLimit,
  validateBody(authSchemas.register),
  (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next)
);

// Login user (with rate limiting)
router.post(
  '/login',
  authRateLimit,
  validateBody(authSchemas.login),
  (req: Request, res: Response, next: NextFunction) => authController.login(req, res, next)
);

// Login with 2FA (with rate limiting)
router.post(
  '/login-2fa',
  authRateLimit,
  validateBody(authSchemas.loginWith2FA),
  (req: Request, res: Response, next: NextFunction) => authController.loginWith2FA(req, res, next)
);

// Refresh token
router.post(
  '/refresh',
  validateBody(authSchemas.refreshToken),
  (req: Request, res: Response, next: NextFunction) => authController.refreshToken(req, res, next)
);

// Verify email
router.get(
  '/verify-email/:token',
  (req: Request, res: Response, next: NextFunction) => authController.verifyEmail(req, res, next)
);

// Forgot password - request password reset
router.post(
  '/forgot-password',
  passwordResetRateLimit,
  validateBody(authSchemas.forgotPassword),
  (req: Request, res: Response, next: NextFunction) => authController.forgotPassword(req, res, next)
);

// Reset password - with token
router.post(
  '/reset-password',
  passwordResetRateLimit,
  validateBody(authSchemas.resetPassword),
  (req: Request, res: Response, next: NextFunction) => authController.resetPassword(req, res, next)
);

// ===== PROTECTED ROUTES (Authentication required) =====

// All routes below require authentication
router.use(authMiddleware);

// Logout user
router.post(
  '/logout',
  (req: Request, res: Response, next: NextFunction) => authController.logout(req, res, next)
);

// Verify token
router.get(
  '/verify',
  (req: Request, res: Response, next: NextFunction) => authController.verifyToken(req, res, next)
);

// Get user profile
router.get(
  '/profile',
  (req: Request, res: Response, next: NextFunction) => authController.getProfile(req, res, next)
);

// Update user profile
router.put(
  '/profile',
  (req: Request, res: Response, next: NextFunction) => authController.updateProfile(req, res, next)
);

// Change password
router.post(
  '/change-password',
  validateBody(authSchemas.changePassword),
  (req: Request, res: Response, next: NextFunction) => authController.changePassword(req, res, next)
);

// ===== 2FA ROUTES =====

// Enable 2FA
router.post(
  '/2fa/enable',
  (req: Request, res: Response, next: NextFunction) => authController.enable2FA(req, res, next)
);

// Verify 2FA setup
router.post(
  '/2fa/verify-setup',
  validateBody(authSchemas.verify2FA),
  (req: Request, res: Response, next: NextFunction) => authController.verify2FASetup(req, res, next)
);

// Disable 2FA
router.post(
  '/2fa/disable',
  validateBody(authSchemas.verify2FA),
  (req: Request, res: Response, next: NextFunction) => authController.disable2FA(req, res, next)
);

export default router;

