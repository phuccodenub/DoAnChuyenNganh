import { Request, Response, NextFunction } from 'express';
import { AuthModuleService } from './auth.service';
import { LoginCredentials, RegisterData, ChangePasswordData, UpdateProfileData } from './auth.types';
import { responseUtils } from '@utils/response.util';
import { RESPONSE_CONSTANTS } from '@constants/response.constants';
import logger from '@utils/logger.util';
import { UserActivityLog } from '../../models';

// Helper function to log activity
const logActivity = async (params: {
  userId: string;
  action: 'login' | 'logout' | 'register' | 'password_change';
  status: 'success' | 'failed';
  ipAddress?: string;
  userAgent?: string;
  errorMessage?: string;
}) => {
  try {
    await UserActivityLog.create({
      user_id: params.userId,
      activity_type: params.action, // legacy column
      action: params.action,
      resource_type: 'auth',
      resource_id: params.userId,
      status: params.status,
      error_message: params.errorMessage || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      metadata: {},
      old_values: {},
      new_values: {},
    });
  } catch (err) {
    logger.warn('Failed to log activity', { error: err });
  }
};

export class AuthController {
  private authService: AuthModuleService;

  constructor() {
    this.authService = new AuthModuleService();
  }

  // Get user profile
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        (responseUtils as any).sendUnauthorized(res, RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED);
        return;
      }

      const profile = await this.authService.getProfile(userId);
      responseUtils.sendSuccess(res, 'Profile retrieved successfully', { user: profile });
    } catch (error: unknown) {
      logger.error('Error getting profile:', error);
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        (responseUtils as any).sendUnauthorized(res, RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED);
        return;
      }

      const data: UpdateProfileData = req.body;
      const updatedProfile = await this.authService.updateProfile(userId, data);
      responseUtils.sendSuccess(res, 'Profile updated successfully', { user: updatedProfile });
    } catch (error: unknown) {
      logger.error('Error updating profile:', error);
      next(error);
    }
  }

  // Register new user
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: RegisterData = req.body;
      const result = await this.authService.register(userData);
      responseUtils.sendCreated(res, RESPONSE_CONSTANTS.MESSAGE.CREATED, result);
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
      
      // Log successful login
      if (result.user?.id) {
        void logActivity({
          userId: result.user.id,
          action: 'login',
          status: 'success',
          ipAddress: ipAddress as string,
          userAgent: userAgent as string,
        });
      }
      
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.LOGIN_SUCCESS, result);
    } catch (error: unknown) {
      logger.error('Error during login:', error);
      next(error);
    }
  }

  // Login with 2FA
  async loginWith2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password, code } = req.body;
      const device = req.headers['user-agent'] || 'Unknown Device';
      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';
      const userAgent = req.headers['user-agent'] || 'Unknown User Agent';

      const credentials: LoginCredentials = { email: username, password };
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
        (responseUtils as any).sendUnauthorized(res, RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED);
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
        (responseUtils as any).sendUnauthorized(res, RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED);
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
        (responseUtils as any).sendUnauthorized(res, RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED);
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
      // Wrap tokens in an object to match tests expecting data.tokens.{accessToken,refreshToken}
      responseUtils.sendSuccess(res, 'Token refreshed successfully', { tokens });
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
        (responseUtils as any).sendUnauthorized(res, RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED);
        return;
      }
      
      // Log logout activity before actual logout
      void logActivity({
        userId,
        action: 'logout',
        status: 'success',
        ipAddress: (req.ip || req.connection.remoteAddress || 'Unknown IP') as string,
        userAgent: (req.headers['user-agent'] || 'Unknown User Agent') as string,
      });
      
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
        (responseUtils as any).sendUnauthorized(res, RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED);
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

  // Forgot password - request password reset
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, mode } = req.body as { email: string; mode?: 'link' | 'password' };
      await this.authService.forgotPassword(email, mode || 'link');
      
      // Return success message even if email doesn't exist (for security)
      responseUtils.sendSuccess(res, 'Password reset email sent successfully. Please check your email.', null);
    } catch (error: unknown) {
      logger.error('Error in forgot password:', error);
      next(error);
    }
  }

  // Reset password - with token
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await this.authService.resetPassword(token, password);
      
      responseUtils.sendSuccess(res, 'Password reset successfully. Please login with your new password.', null);
    } catch (error: unknown) {
      logger.error('Error resetting password:', error);
      next(error);
    }
  }
}


