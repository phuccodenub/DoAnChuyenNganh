import { UserModuleRepository } from './user.repository';
import { UserTypes } from './user.types';
import { UserInstance } from '../../types/user.types';
import { globalServices } from '../../services/global';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import { ApiError } from '../../middlewares/error.middleware';
import { userUtils } from '../../utils/user.util';
import logger from '../../utils/logger.util';

/**
 * User Module Service
 * Handles user-related business logic specific to the user module
 */
export class UserModuleService {
  private userRepository: UserModuleRepository;

  constructor() {
    this.userRepository = new UserModuleRepository();
  }

  // ===== USER MANAGEMENT METHODS =====

  /**
   * Get all users with pagination and filtering
   */
  async getAllUsers(options: {
    page: number;
    limit: number;
    role?: string;
    status?: string;
    search?: string;
    sortBy: string;
    sortOrder: string;
  }): Promise<{ users: any[]; pagination: any }> {
    try {
      logger.info('Getting all users', options);

      const result = await this.userRepository.findAllWithPagination(options);
      
      logger.info('All users retrieved successfully', { 
        count: result.users.length, 
        total: result.pagination.total 
      });
      
      return result;
    } catch (error) {
      logger.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<any> {
    try {
      logger.info('Getting user by ID', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      const publicProfile = userUtils.getPublicProfile(user);
      
      logger.info('User retrieved successfully', { userId });
      return publicProfile;
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, status: string): Promise<any> {
    try {
      logger.info('Updating user status', { userId, status });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Update user status
      const updatedUser = await this.userRepository.update(userId, { status });
      
      // Clear cache
      await globalServices.user.clearUserCache(userId);
      
      const publicProfile = userUtils.getPublicProfile(updatedUser);
      
      logger.info('User status updated successfully', { userId, status });
      return publicProfile;
    } catch (error) {
      logger.error('Error updating user status:', error);
      throw error;
    }
  }

  /**
   * Get user enrollments
   */
  async getUserEnrollments(userId: string): Promise<any[]> {
    try {
      logger.info('Getting user enrollments', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Get user enrollments
      const enrollments = await this.userRepository.getUserEnrollments(userId);
      
      logger.info('User enrollments retrieved successfully', { userId, count: enrollments.length });
      return enrollments;
    } catch (error) {
      logger.error('Error getting user enrollments:', error);
      throw error;
    }
  }

  /**
   * Get user progress
   */
  async getUserProgress(userId: string): Promise<any> {
    try {
      logger.info('Getting user progress', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Get user progress
      const progress = await this.userRepository.getUserProgress(userId);
      
      logger.info('User progress retrieved successfully', { userId });
      return progress;
    } catch (error) {
      logger.error('Error getting user progress:', error);
      throw error;
    }
  }

  // ===== USER PROFILE METHODS =====

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserTypes.UserProfile> {
    try {
      logger.info('Getting user profile', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      const profile = userUtils.getPublicProfile(user) as UserTypes.UserProfile;
      
      logger.info('User profile retrieved successfully', { userId });
      return profile;
    } catch (error) {
      logger.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, userData: Partial<UserTypes.UserProfile>): Promise<UserTypes.UserProfile> {
    try {
      logger.info('Updating user profile', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Update user data
      const updatedUser = await this.userRepository.update(userId, userData);
      
      // Clear cache
      await globalServices.user.clearUserCache(userId);
      
      const profile = userUtils.getPublicProfile(updatedUser) as UserTypes.UserProfile;
      
      logger.info('User profile updated successfully', { userId });
      return profile;
    } catch (error) {
      logger.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(userId: string, file: any): Promise<{ avatar: string }> {
    try {
      logger.info('Uploading avatar', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Upload file using global file service
      const uploadResult = await globalServices.file.uploadFile(file, {
        folder: 'avatars',
        userId: userId,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 5 * 1024 * 1024 // 5MB
      });

      // Update user avatar
      await this.userRepository.update(userId, { avatar: uploadResult.url });
      
      // Clear cache
      await globalServices.user.clearUserCache(userId);

      logger.info('Avatar uploaded successfully', { userId, avatar: uploadResult.url });
      return { avatar: uploadResult.url };
    } catch (error) {
      logger.error('Error uploading avatar:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: UserTypes.UserPreferences): Promise<UserTypes.UserPreferences> {
    try {
      logger.info('Updating user preferences', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Update preferences
      await this.userRepository.updatePreferences(userId, preferences);
      
      // Get updated preferences
      const updatedPreferences = await this.userRepository.getPreferences(userId);
      
      logger.info('User preferences updated successfully', { userId });
      return updatedPreferences || preferences;
    } catch (error) {
      logger.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(userId: string): Promise<UserTypes.UserSession[]> {
    try {
      logger.info('Getting active sessions', { userId });

      const sessions = await this.userRepository.getActiveSessions(userId);
      
      logger.info('Active sessions retrieved successfully', { userId, count: sessions.length });
      return sessions;
    } catch (error) {
      logger.error('Error getting active sessions:', error);
      throw error;
    }
  }

  /**
   * Logout all devices
   */
  async logoutAllDevices(userId: string): Promise<void> {
    try {
      logger.info('Logging out all devices', { userId });

      // Deactivate all sessions
      await this.userRepository.deactivateAllSessions(userId);
      
      // Update token version to invalidate all tokens
      await globalServices.user.updateTokenVersion(userId);
      
      // Clear all session cache
      await globalServices.cache.deleteWithPattern(`session:${userId}`);
      
      logger.info('All devices logged out successfully', { userId });
    } catch (error) {
      logger.error('Error logging out all devices:', error);
      throw error;
    }
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(userId: string): Promise<{ qrCode: string; secret: string; backupCodes: string[] }> {
    try {
      logger.info('Enabling two-factor authentication', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Check if 2FA is already enabled
      const isEnabled = await globalServices.twoFactor.is2FAEnabled(userId);
      if (isEnabled) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.CONFLICT, 'Two-factor authentication is already enabled');
      }

      // Generate secret and QR code
      const secret = globalServices.twoFactor.generateSecret();
      const qrCode = await globalServices.twoFactor.generateQRCode(user.email, secret);
      
      // Generate backup codes
      const backupCodes = globalServices.twoFactor.generateBackupCodes();

      // Enable 2FA
      await globalServices.twoFactor.enable2FA(userId, secret, backupCodes);

      logger.info('Two-factor authentication enabled successfully', { userId });

      return {
        qrCode,
        secret,
        backupCodes
      };
    } catch (error) {
      logger.error('Error enabling two-factor authentication:', error);
      throw error;
    }
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(userId: string, code: string): Promise<void> {
    try {
      logger.info('Disabling two-factor authentication', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Verify the code before disabling
      const secret = await globalServices.twoFactor.get2FASecret(userId);
      if (!secret) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST, '2FA is not enabled');
      }

      const isValidCode = globalServices.twoFactor.verifyTOTPCode(secret, code);
      const isValidBackupCode = await globalServices.twoFactor.verifyBackupCode(userId, code);

      if (!isValidCode && !isValidBackupCode) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED, 'Invalid verification code');
      }

      // Disable 2FA
      await globalServices.twoFactor.disable2FA(userId);

      logger.info('Two-factor authentication disabled successfully', { userId });
    } catch (error) {
      logger.error('Error disabling two-factor authentication:', error);
      throw error;
    }
  }

  /**
   * Link social account
   */
  async linkSocialAccount(userId: string, provider: string, socialId: string): Promise<void> {
    try {
      logger.info('Linking social account', { userId, provider });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Check if social account is already linked
      const existingAccount = await this.userRepository.getSocialAccounts(userId);
      const isAlreadyLinked = existingAccount.some(account => 
        account.provider === provider && account.social_id === socialId
      );

      if (isAlreadyLinked) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.CONFLICT, 'Social account is already linked');
      }

      // Link social account
      await this.userRepository.linkSocialAccount(userId, provider, socialId);

      logger.info('Social account linked successfully', { userId, provider });
    } catch (error) {
      logger.error('Error linking social account:', error);
      throw error;
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string): Promise<UserTypes.UserAnalytics> {
    try {
      logger.info('Getting user analytics', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Get analytics data
      const analytics = await this.userRepository.getAnalytics(userId);
      
      if (!analytics) {
        // Return default analytics if none exist
        return {
          login_count: 0,
          last_login: null,
          session_duration: 0,
          courses_enrolled: 0,
          courses_completed: 0,
          assignments_submitted: 0,
          forum_posts: 0,
          profile_views: 0,
          time_spent_learning: 0,
          achievements_earned: 0
        };
      }

      logger.info('User analytics retrieved successfully', { userId });
      return analytics;
    } catch (error) {
      logger.error('Error getting user analytics:', error);
      throw error;
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(userId: string, settings: UserTypes.NotificationSettings): Promise<void> {
    try {
      logger.info('Updating notification settings', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Update notification settings
      await this.userRepository.updateNotificationSettings(userId, settings);

      logger.info('Notification settings updated successfully', { userId });
    } catch (error) {
      logger.error('Error updating notification settings:', error);
      throw error;
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(userId: string, settings: UserTypes.PrivacySettings): Promise<void> {
    try {
      logger.info('Updating privacy settings', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Update privacy settings
      await this.userRepository.updatePrivacySettings(userId, settings);

      logger.info('Privacy settings updated successfully', { userId });
    } catch (error) {
      logger.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserTypes.UserStats> {
    try {
      logger.info('Getting user statistics', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Get various statistics
      const [
        loginCount,
        lastLogin,
        sessionCount,
        coursesEnrolled,
        coursesCompleted,
        assignmentsSubmitted,
        forumPosts,
        profileViews
      ] = await Promise.all([
        this.userRepository.getAnalytics(userId).then(a => a?.login_count || 0),
        this.userRepository.findById(userId).then(u => u?.last_login),
        this.userRepository.getActiveSessions(userId).then(s => s.length),
        // TODO: Implement these methods
        0, // coursesEnrolled
        0, // coursesCompleted
        0, // assignmentsSubmitted
        0, // forumPosts
        0  // profileViews
      ]);

      const stats: UserTypes.UserStats = {
        login_count: loginCount,
        last_login: lastLogin,
        session_count: sessionCount,
        courses_enrolled: coursesEnrolled,
        courses_completed: coursesCompleted,
        assignments_submitted: assignmentsSubmitted,
        forum_posts: forumPosts,
        profile_views: profileViews,
        account_age_days: Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        profile_completion: userUtils.calculateProfileCompletion(user)
      };

      logger.info('User statistics retrieved successfully', { userId });
      return stats;
    } catch (error) {
      logger.error('Error getting user statistics:', error);
      throw error;
    }
  }
}