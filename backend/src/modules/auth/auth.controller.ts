import { Request, Response, NextFunction } from 'express';
import { AuthModuleService } from './auth.service';
import { LoginCredentials, RegisterData, ChangePasswordData } from './auth.types';
import { responseUtils } from '../../utils/response.util';
import { validateBody } from '../../middlewares/validate.middleware';
import { authValidation } from '../../validates/auth.validate';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';
import { AuthenticationError, ValidationError, ApiError } from '../../errors';

export class AuthController {
  private authService: AuthModuleService;

  constructor() {
    this.authService = new AuthModuleService();
  }

  // Register new user
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: RegisterData = req.body;
      const newUser = await this.authService.register(userData);
      
      responseUtils.sendCreated(res, RESPONSE_CONSTANTS.MESSAGE.CREATED, newUser);
    } catch (error: unknown) {
      logger.error('Error during registration:', error);
      next(error);
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const credentials: LoginCredentials = req.body;
      const device = req.headers['user-agent'] || 'Unknown Device';
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';
      const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

      const result = await this.authService.login(credentials, device, ipAddress, userAgent);
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.LOGIN_SUCCESS, result);
    } catch (error: unknown) {
      logger.error('Error during login:', error);
      next(error);
    }
  }

  // Login with 2FA
  async loginWith2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, code } = req.body;
      const device = req.headers['user-agent'] || 'Unknown Device';
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';
      const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

      const credentials: LoginCredentials = { email, password };
      const result = await this.authService.loginWith2FA(credentials, code, device, ipAddress, userAgent);
      responseUtils.sendSuccess(res, 'Login with 2FA successful', result);
    } catch (error: unknown) {
      logger.error('Error logging in with 2FA:', error);
      next(error);
    }
  }

  // Enable 2FA
  async enable2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        responseUtils.sendError(res, RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED);
        return;
      }

      const result = await this.authService.enable2FA(userId);
      responseUtils.sendSuccess(res, '2FA enabled successfully', result);
    } catch (error: unknown) {
      logger.error('Error enabling 2FA:', error);
      next(error);
    }
  }

  // Verify 2FA setup
  async verify2FASetup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        responseUtils.sendError(res, RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED);
        return;
      }

      const { code } = req.body;
      const isValid = await this.authService.verify2FASetup(userId, code);
      responseUtils.sendSuccess(res, '2FA setup verified', { verified: isValid });
    } catch (error: unknown) {
      logger.error('Error verifying 2FA setup:', error);
      next(error);
    }
  }

  // Disable 2FA
  async disable2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        responseUtils.sendError(res, RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED);
        return;
      }

      const { code } = req.body;
      await this.authService.disable2FA(userId, code);
      responseUtils.sendSuccess(res, '2FA disabled successfully', null);
    } catch (error: unknown) {
      logger.error('Error disabling 2FA:', error);
      next(error);
    }
  }

  // Refresh token
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refreshToken(refreshToken);
      
      responseUtils.sendSuccess(res, 'Token refreshed successfully', tokens);
    } catch (error: unknown) {
      logger.error('Error refreshing token:', error);
      next(error);
    }
  }

  // Logout user
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        responseUtils.sendError(res, RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED);
        return;
      }
      
      await this.authService.logout(userId);
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.LOGOUT_SUCCESS, null);
    } catch (error: unknown) {
      logger.error('Error during logout:', error);
      next(error);
    }
  }

  // Change password
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        responseUtils.sendError(res, RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED);
        return;
      }
      
      const data: ChangePasswordData = req.body;
      await this.authService.changePassword(userId, data);
      
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.PASSWORD_CHANGED, null);
    } catch (error: unknown) {
      logger.error('Error changing password:', error);
      next(error);
    }
  }

  // Verify token
  async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      
      responseUtils.sendSuccess(res, 'Token is valid', {
        userId,
        userRole,
        valid: true
      });
    } catch (error: unknown) {
      logger.error('Error verifying token:', error);
      next(error);
    }
  }

  // Verify email
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      // TODO: Implement email verification logic
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.EMAIL_VERIFIED, null);
    } catch (error: unknown) {
      logger.error('Error verifying email:', error);
      next(error);
    }
  }
}

