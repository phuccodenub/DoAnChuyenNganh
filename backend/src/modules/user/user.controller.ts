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

  // ===== USER MANAGEMENT ROUTES =====

  // Get all users with pagination
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Use validated query if available, otherwise use raw query
      const queryData = (req as any).validatedQuery || req.query;
      
      const options = {
        page: parseInt(queryData.page as string) || 1,
        limit: parseInt(queryData.limit as string) || 10,
        role: queryData.role as string,
        status: queryData.status as string,
        search: queryData.search as string,
        sortBy: (queryData.sort as string) || 'created_at',
        sortOrder: (queryData.order as string) || 'DESC'
      };
      
      const result = await this.userModuleService.getAllUsers(options);
      responseUtils.sendPaginated(res, result.users, result.pagination, 'Users retrieved successfully');
    } catch (error) {
      logger.error('Error getting all users:', error);
      next(error);
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const user = await this.userModuleService.getUserById(userId);
      responseUtils.sendSuccess(res, 'User retrieved successfully', user);
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const { status } = req.body;
      const user = await this.userModuleService.updateUserStatus(userId, status);
      responseUtils.sendSuccess(res, 'User status updated successfully', user);
    } catch (error) {
      logger.error('Error updating user status:', error);
      next(error);
    }
  }

  async getUserEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const enrollments = await this.userModuleService.getUserEnrollments(userId);
      responseUtils.sendSuccess(res, 'User enrollments retrieved successfully', enrollments);
    } catch (error) {
      logger.error('Error getting user enrollments:', error);
      next(error);
    }
  }

  async getUserProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const progress = await this.userModuleService.getUserProgress(userId);
      responseUtils.sendSuccess(res, 'User progress retrieved successfully', progress);
    } catch (error) {
      logger.error('Error getting user progress:', error);
      next(error);
    }
  }

  // ===== NGHIỆP VỤ RIÊNG CỦA USER =====

  // Get user profile
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const profile = await this.userModuleService.getProfile(userId);
      responseUtils.sendSuccess(res, 'Profile retrieved successfully', profile);
    } catch (error) {
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

      const userData = req.body;
      const updatedProfile = await this.userModuleService.updateProfile(userId, userData);
      responseUtils.sendSuccess(res, 'Profile updated successfully', updatedProfile);
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      logger.error('Error enabling 2FA:', error);
      next(error);
    }
  }

  // Disable two-factor authentication
  async disableTwoFactor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const code = (req.body && (req.body.code as string)) || '';
      if (!code) {
        res.status(RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST).json({ success: false, message: 'Verification code is required' });
        return;
      }
      await this.userModuleService.disableTwoFactor(userId, code);
      
      responseUtils.sendSuccess(res, 'Two-factor authentication disabled', null);
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      logger.error('Error updating privacy settings:', error);
      next(error);
    }
  }
}
