import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { authRateLimit, passwordResetRateLimit, registrationRateLimit } from '../../middlewares/auth-rate-limit.middleware';
import { authSchemas } from '../../validates/auth.validate';

const router = Router();
const authController = new AuthController();


// ===== PUBLIC ROUTES (No authentication required) =====

// Register new user (with rate limiting)
router.post(
  '/register',
  registrationRateLimit,
  validateBody(authSchemas.register),
  (req, res, next) => authController.register(req, res, next)
);

// Login user (with rate limiting)
router.post(
  '/login',
  authRateLimit,
  validateBody(authSchemas.login),
  (req, res, next) => authController.login(req, res, next)
);

// Login with 2FA (with rate limiting)
router.post(
  '/login-2fa',
  authRateLimit,
  validateBody(authSchemas.loginWith2FA),
  (req, res, next) => authController.loginWith2FA(req, res, next)
);

// Refresh token
router.post(
  '/refresh-token',
  validateBody(authSchemas.refreshToken),
  (req, res, next) => authController.refreshToken(req, res, next)
);

// Backward-compatible alias to satisfy tests expecting /api/auth/refresh
router.post(
  '/refresh',
  validateBody(authSchemas.refreshToken),
  (req, res, next) => authController.refreshToken(req, res, next)
);

// Verify email
router.get(
  '/verify-email/:token',
  (req, res, next) => authController.verifyEmail(req, res, next)
);

// ===== PROTECTED ROUTES (Authentication required) =====

// All routes below require authentication
router.use(authMiddleware);

// Logout user
router.post(
  '/logout',
  (req, res, next) => authController.logout(req, res, next)
);

// Verify token
router.get(
  '/verify',
  (req, res, next) => authController.verifyToken(req, res, next)
);

// Change password
router.post(
  '/change-password',
  validateBody(authSchemas.changePassword),
  (req, res, next) => authController.changePassword(req, res, next)
);

// ===== 2FA ROUTES =====

// Enable 2FA
router.post(
  '/2fa/enable',
  (req, res, next) => authController.enable2FA(req, res, next)
);

// Verify 2FA setup
router.post(
  '/2fa/verify-setup',
  validateBody(authSchemas.verify2FA),
  (req, res, next) => authController.verify2FASetup(req, res, next)
);

// Disable 2FA
router.post(
  '/2fa/disable',
  validateBody(authSchemas.verify2FA),
  (req, res, next) => authController.disable2FA(req, res, next)
);

export default router;

