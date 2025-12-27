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

// Create simple inline validation schemas to avoid blocking on import
// This bypasses the complex baseValidation dependency chain
import { z } from 'zod';

console.log('[AUTH_ROUTES] Creating inline validation schemas...');
const authSchemas = {
  register: z.object({
    email: z.string().email('Invalid email format').toLowerCase().max(255),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
    password: z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
    first_name: z.string().min(2).max(100).optional(),
    last_name: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
    role: z.enum(['student', 'instructor', 'admin', 'super_admin']).default('student')
  }),
  login: z.object({
    email: z.string().email('Invalid email format').toLowerCase(),
    password: z.string().min(1, 'Password is required')
  }),
  loginWith2FA: z.object({
    email: z.string().email('Invalid email format').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
    code: z.string().length(6, '2FA code must be 6 digits').regex(/^\d+$/)
  }),
  refreshToken: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  }),
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
    confirmPassword: z.string().min(1, 'Password confirmation is required')
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),
  forgotPassword: z.object({
    email: z.string().email('Invalid email format').toLowerCase(),
    mode: z.enum(['link', 'password']).optional().default('link')
  }),
  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  }),
  verify2FA: z.object({
    code: z.string().length(6, '2FA code must be 6 digits').regex(/^\d+$/)
  })
};
console.log('[AUTH_ROUTES] Inline validation schemas created');

// Pre-load authSchemas asynchronously after router creation
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

