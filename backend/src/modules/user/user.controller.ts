import { Request, Response, NextFunction } from 'express';
import { UserModuleService } from './user.service';
import { UserPreferences, UserSession, UserAnalytics } from './user.types';
import { responseUtils } from '../../utils/response.util';
import { validateBody, validateQuery } from '../../middlewares/validate.middleware';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';
import { userSchemas } from '../../validates/user.validate';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';

export class UserModuleController {
  private userModuleService: UserModuleService;

  constructor() {
    this.userModuleService = new UserModuleService();
  }

  // Helper method to get userId from request
  private getUserId(req: Request): string {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return userId;
  }

  // ===== NGHIỆP VỤ RIÊNG CỦA USER =====

  // Get user profile
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      // Temporary debug: trace which userId is being fetched
  // Elevate to info for better visibility in CI logs
  logger.info('User getProfile called', { userIdFromToken: userId });
      const profile = await this.userModuleService.getProfile(userId);
      // Wrap under { user } to match test expectations
      responseUtils.sendSuccess(res, 'Profile retrieved successfully', { user: profile });
    } catch (error: unknown) {
      if ((error as Error).message === 'User ID not found in request') {
        responseUtils.sendUnauthorized(res, 'Unauthorized');
        return;
      }
      logger.error('Error getting profile:', error);
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      // Temporary debug: trace update profile caller id
  logger.info('User updateProfile called', { userIdFromToken: userId });
      const userData = req.body;
      const updatedProfile = await this.userModuleService.updateProfile(userId, userData);
      // Wrap under { user } to match test expectations
      responseUtils.sendSuccess(res, 'Profile updated successfully', { user: updatedProfile });
    } catch (error: unknown) {
      logger.error('Error updating profile:', error);
      next(error);
    }
  }

  // Upload avatar
  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const file = req.file as any; // Multer file object
      
      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
          data: null
        });
        return;
      }

      const result = await this.userModuleService.uploadAvatar(userId!, file);
      responseUtils.sendSuccess(res, 'Avatar uploaded successfully', result);
    } catch (error: unknown) {
      logger.error('Error uploading avatar:', error);
      next(error);
    }
  }

  // Update user preferences
  async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const preferences: UserPreferences = req.body;
      
      const updatedPreferences = await this.userModuleService.updatePreferences(userId, preferences);
      responseUtils.sendSuccess(res, 'Preferences updated successfully', updatedPreferences);
    } catch (error: unknown) {
      logger.error('Error updating preferences:', error);
      next(error);
    }
  }

  // Get active sessions
  async getActiveSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const sessions = await this.userModuleService.getActiveSessions(userId);
      
      responseUtils.sendSuccess(res, 'Active sessions retrieved', sessions);
    } catch (error: unknown) {
      logger.error('Error getting active sessions:', error);
      next(error);
    }
  }

  // Logout all devices
  async logoutAllDevices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      await this.userModuleService.logoutAllDevices(userId);
      
      responseUtils.sendSuccess(res, 'Logged out from all devices', null);
    } catch (error: unknown) {
      logger.error('Error logging out all devices:', error);
      next(error);
    }
  }

  // Enable two-factor authentication
  async enableTwoFactor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const result = await this.userModuleService.enableTwoFactor(userId);
      
      responseUtils.sendSuccess(res, 'Two-factor authentication enabled', result);
    } catch (error: unknown) {
      logger.error('Error enabling 2FA:', error);
      next(error);
    }
  }

  // Disable two-factor authentication
  async disableTwoFactor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { code } = req.body as { code: string };
      await this.userModuleService.disableTwoFactor(userId, code);
      
      responseUtils.sendSuccess(res, 'Two-factor authentication disabled', null);
    } catch (error: unknown) {
      logger.error('Error disabling 2FA:', error);
      next(error);
    }
  }

  // Link social account
  async linkSocialAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { provider, socialId } = req.body;
      
      await this.userModuleService.linkSocialAccount(userId, provider, socialId);
      responseUtils.sendSuccess(res, 'Social account linked successfully', null);
    } catch (error: unknown) {
      logger.error('Error linking social account:', error);
      next(error);
    }
  }

  // Get user analytics
  async getUserAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const analytics = await this.userModuleService.getUserAnalytics(userId);
      
      responseUtils.sendSuccess(res, 'User analytics retrieved', analytics);
    } catch (error: unknown) {
      logger.error('Error getting user analytics:', error);
      next(error);
    }
  }

  // Update notification settings
  async updateNotificationSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const settings = req.body;
      
      await this.userModuleService.updateNotificationSettings(userId, settings);
      responseUtils.sendSuccess(res, 'Notification settings updated', null);
    } catch (error: unknown) {
      logger.error('Error updating notification settings:', error);
      next(error);
    }
  }

  // Update privacy settings
  async updatePrivacySettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const settings = req.body;
      
      await this.userModuleService.updatePrivacySettings(userId, settings);
      responseUtils.sendSuccess(res, 'Privacy settings updated', null);
    } catch (error: unknown) {
      logger.error('Error updating privacy settings:', error);
      next(error);
    }
  }

  // Search users for chat/messaging
  async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const userRole = req.user?.role || 'student';
      const { q, limit = 20, excludeSelf } = req.query;
      
      const searchTerm = (q as string) || '';
      const limitNum = Math.min(Number(limit) || 20, 50);
      const shouldExcludeSelf = excludeSelf === 'true' || excludeSelf === '1';
      
      const users = await this.userModuleService.searchUsers(searchTerm, {
        limit: limitNum,
        excludeUserId: shouldExcludeSelf ? userId : undefined,
        currentUserId: userId,
        currentUserRole: userRole,
      });
      
      responseUtils.sendSuccess(res, 'Users found', { users });
    } catch (error: unknown) {
      logger.error('Error searching users:', error);
      next(error);
    }
  }
}