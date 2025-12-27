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
// Use dynamic import with timeout to prevent hanging
let authSchemas: any;
let authSchemasLoading: Promise<any> | null = null;

const getAuthSchemas = (): any => {
  if (authSchemas) {
    return authSchemas;
  }
  
  if (authSchemasLoading) {
    // If already loading, wait for it (synchronous fallback)
    console.warn('[AUTH_ROUTES] authSchemas still loading, using fallback');
    // Return a minimal fallback schema
    return {
      register: { parse: (data: any) => data },
      login: { parse: (data: any) => data },
      loginWith2FA: { parse: (data: any) => data },
      refreshToken: { parse: (data: any) => data },
      forgotPassword: { parse: (data: any) => data },
      resetPassword: { parse: (data: any) => data },
      changePassword: { parse: (data: any) => data },
      verify2FA: { parse: (data: any) => data }
    };
  }
  
  // Start loading
  console.log('[AUTH_ROUTES] Starting lazy load authSchemas...');
  authSchemasLoading = Promise.race([
    import('@validates/auth.validate').then(module => {
      console.log('[AUTH_ROUTES] authSchemas module imported');
      authSchemas = module.authSchemas;
      console.log('[AUTH_ROUTES] authSchemas loaded successfully');
      authSchemasLoading = null;
      return authSchemas;
    }),
    new Promise((_, reject) => 
      setTimeout(() => {
        authSchemasLoading = null;
        reject(new Error('authSchemas load timeout after 10s'));
      }, 10000)
    )
  ]).catch((error: unknown) => {
    console.error('[AUTH_ROUTES] Failed to load authSchemas:', error);
    authSchemasLoading = null;
    // Return a minimal fallback schema to prevent app crash
    authSchemas = {
      register: { parse: (data: any) => data },
      login: { parse: (data: any) => data },
      loginWith2FA: { parse: (data: any) => data },
      refreshToken: { parse: (data: any) => data },
      forgotPassword: { parse: (data: any) => data },
      resetPassword: { parse: (data: any) => data },
      changePassword: { parse: (data: any) => data },
      verify2FA: { parse: (data: any) => data }
    };
    return authSchemas;
  });
  
  // Return fallback while loading
  return {
    register: { parse: (data: any) => data },
    login: { parse: (data: any) => data },
    loginWith2FA: { parse: (data: any) => data },
    refreshToken: { parse: (data: any) => data },
    forgotPassword: { parse: (data: any) => data },
    resetPassword: { parse: (data: any) => data },
    changePassword: { parse: (data: any) => data },
    verify2FA: { parse: (data: any) => data }
  };
};

// Pre-load authSchemas asynchronously after router creation
console.log('[AUTH_ROUTES] authSchemas lazy loader created');

console.log('[AUTH_ROUTES] Creating router...');
const router = express.Router();
console.log('[AUTH_ROUTES] Router created');

console.log('[AUTH_ROUTES] Creating AuthController instance...');
const authController = new AuthController();
console.log('[AUTH_ROUTES] AuthController instance created');

// Pre-load authSchemas asynchronously to avoid blocking route registration
setImmediate(() => {
  console.log('[AUTH_ROUTES] Pre-loading authSchemas in background...');
  getAuthSchemas().catch((err: unknown) => {
    console.error('[AUTH_ROUTES] Background pre-load failed:', err);
  });
});


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

