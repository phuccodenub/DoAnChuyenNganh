console.log('[AUTH_ROUTES] Starting imports...');
import express, { Request, Response, NextFunction } from 'express';
console.log('[AUTH_ROUTES] express imported');

import { AuthController } from './auth.controller';
console.log('[AUTH_ROUTES] AuthController imported');

import { validateBody } from '@middlewares/validate.middleware';
console.log('[AUTH_ROUTES] validateBody imported');

import { authMiddleware } from '@middlewares/auth.middleware';
console.log('[AUTH_ROUTES] authMiddleware imported');

import { authRateLimit, passwordResetRateLimit, registrationRateLimit } from '@middlewares/auth-rate-limit.middleware';
console.log('[AUTH_ROUTES] rate limit middlewares imported');

// Lazy load authSchemas to avoid blocking on import
let authSchemas: any;
const getAuthSchemas = () => {
  if (!authSchemas) {
    console.log('[AUTH_ROUTES] Lazy loading authSchemas...');
    authSchemas = require('@validates/auth.validate').authSchemas;
    console.log('[AUTH_ROUTES] authSchemas loaded');
  }
  return authSchemas;
};
console.log('[AUTH_ROUTES] authSchemas lazy loader created');

console.log('[AUTH_ROUTES] Creating router...');
const router = express.Router();
console.log('[AUTH_ROUTES] Router created');

console.log('[AUTH_ROUTES] Creating AuthController instance...');
const authController = new AuthController();
console.log('[AUTH_ROUTES] AuthController instance created');


// ===== PUBLIC ROUTES (No authentication required) =====

// Register new user (with rate limiting)
router.post(
  '/register',
  registrationRateLimit,
  validateBody(getAuthSchemas().register),
  (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next)
);

// Login user (with rate limiting)
router.post(
  '/login',
  authRateLimit,
  validateBody(getAuthSchemas().login),
  (req: Request, res: Response, next: NextFunction) => authController.login(req, res, next)
);

// Login with 2FA (with rate limiting)
router.post(
  '/login-2fa',
  authRateLimit,
  validateBody(getAuthSchemas().loginWith2FA),
  (req: Request, res: Response, next: NextFunction) => authController.loginWith2FA(req, res, next)
);

// Refresh token
router.post(
  '/refresh',
  validateBody(getAuthSchemas().refreshToken),
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
  validateBody(getAuthSchemas().forgotPassword),
  (req: Request, res: Response, next: NextFunction) => authController.forgotPassword(req, res, next)
);

// Reset password - with token
router.post(
  '/reset-password',
  passwordResetRateLimit,
  validateBody(getAuthSchemas().resetPassword),
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
  validateBody(getAuthSchemas().changePassword),
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
  validateBody(getAuthSchemas().verify2FA),
  (req: Request, res: Response, next: NextFunction) => authController.verify2FASetup(req, res, next)
);

// Disable 2FA
router.post(
  '/2fa/disable',
  validateBody(getAuthSchemas().verify2FA),
  (req: Request, res: Response, next: NextFunction) => authController.disable2FA(req, res, next)
);

export default router;

