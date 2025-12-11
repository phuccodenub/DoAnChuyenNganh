import { UserModuleRepository } from './user.repository';
import * as UserTypes from './user.types';
import { UserInstance } from '../../types/user.types';
import type { UploadedFile } from '../../services/global/file.service';
import { globalServices } from '../../services/global';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import { ApiError } from '../../errors/api.error';
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

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserTypes.UserProfile> {
    try {
      logger.info('Getting user profile', { userId });

      const user = await this.userRepository.findById(userId);
      // Temporary debug to verify repository result in tests
      logger.debug('User repository findById result', { userId, found: !!user });
      if (!user) {
        throw new ApiError('User not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      const profile = userUtils.getPublicProfile(user as any) as UserTypes.UserProfile;
      
      logger.info('User profile retrieved successfully', { userId });
      return profile;
    } catch (error: unknown) {
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
      logger.debug('User repository findById (for update) result', { userId, found: !!user });
      if (!user) {
        throw new ApiError('User not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      // Update user data
      const updatedUser = await this.userRepository.update(userId, userData);
      
      // Clear cache
      await globalServices.user.clearUserCache(userId);
      
      const profile = userUtils.getPublicProfile(updatedUser as any) as UserTypes.UserProfile;
      
      logger.info('User profile updated successfully', { userId });
      return profile;
    } catch (error: unknown) {
      logger.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(userId: string, file: UploadedFile): Promise<{ avatar: string }> {
    try {
      logger.info('Uploading avatar', { userId });

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ApiError('User not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
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
    } catch (error: unknown) {
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
        throw new ApiError('User not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      // Update preferences
      await this.userRepository.updatePreferences(userId, preferences);
      
      // Get updated preferences
      const updatedPreferences = await this.userRepository.getPreferences(userId);
      
      logger.info('User preferences updated successfully', { userId });
      return updatedPreferences || preferences;
    } catch (error: unknown) {
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
      
      // Map UserSessionInstance to UserSession DTO
      const mappedSessions: UserTypes.UserSession[] = sessions.map(session => ({
        id: session.id,
        device: session.device,
        location: session.location || 'Unknown',
        lastActivity: session.last_activity,
        isCurrent: false, // Will be determined by comparing session ID
        ipAddress: session.ip_address,
        userAgent: session.user_agent
      }));
      
      logger.info('Active sessions retrieved successfully', { userId, count: mappedSessions.length });
      return mappedSessions;
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
        throw new ApiError('User not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      // Check if 2FA is already enabled
      const isEnabled = await globalServices.twoFactor.is2FAEnabled(userId);
      if (isEnabled) {
        throw new ApiError('Two-factor authentication is already enabled', RESPONSE_CONSTANTS.STATUS_CODE.CONFLICT);
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
    } catch (error: unknown) {
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
        throw new ApiError('User not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      // Verify the code before disabling
      const secret = await globalServices.twoFactor.get2FASecret(userId);
      if (!secret) {
        throw new ApiError('2FA is not enabled', RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST);
      }

      const isValidCode = globalServices.twoFactor.verifyTOTPCode(secret, code);
      const isValidBackupCode = await globalServices.twoFactor.verifyBackupCode(userId, code);

      if (!isValidCode && !isValidBackupCode) {
        throw new ApiError('Invalid verification code', RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED);
      }

      // Disable 2FA
      await globalServices.twoFactor.disable2FA(userId);

      logger.info('Two-factor authentication disabled successfully', { userId });
    } catch (error: unknown) {
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
        throw new ApiError('User not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      // Check if social account is already linked
      const existingAccount = await this.userRepository.getSocialAccounts(userId);
      const isAlreadyLinked = existingAccount.some(account => 
        account.provider === provider && account.social_id === socialId
      );

      if (isAlreadyLinked) {
        throw new ApiError('Social account is already linked', RESPONSE_CONSTANTS.STATUS_CODE.CONFLICT);
      }

      // Link social account
      await this.userRepository.linkSocialAccount(userId, provider, socialId);

      logger.info('Social account linked successfully', { userId, provider });
    } catch (error: unknown) {
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
        throw new ApiError('User not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
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
    } catch (error: unknown) {
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
        throw new ApiError('User not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      // Update notification settings
      await this.userRepository.updateNotificationSettings(userId, settings);

      logger.info('Notification settings updated successfully', { userId });
    } catch (error: unknown) {
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
        throw new ApiError('User not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
      }

      // Update privacy settings
      await this.userRepository.updatePrivacySettings(userId, settings);

      logger.info('Privacy settings updated successfully', { userId });
    } catch (error: unknown) {
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
        throw new ApiError('User not found', RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND);
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
        last_login: lastLogin || null,
        session_count: sessionCount,
        courses_enrolled: coursesEnrolled,
        courses_completed: coursesCompleted,
        assignments_submitted: assignmentsSubmitted,
        forum_posts: forumPosts,
        profile_views: profileViews,
        account_age_days: Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        profile_completion: userUtils.getProfileCompletionPercentage(user as any)
      };

      logger.info('User statistics retrieved successfully', { userId });
      return stats;
    } catch (error: unknown) {
      logger.error('Error getting user statistics:', error);
      throw error;
    }
  }

  /**
   * Search users for chat/messaging
   * Role-based filtering applied
   */
  async searchUsers(searchTerm: string, options?: { 
    limit?: number; 
    excludeUserId?: string;
    currentUserId?: string;
    currentUserRole?: string;
  }): Promise<UserTypes.UserProfile[]> {
    try {
      logger.info('Searching users', { searchTerm, options });
      
      const { limit = 20, excludeUserId, currentUserId, currentUserRole } = options || {};
      
      const users = await this.userRepository.searchUsers(searchTerm, { 
        limit,
        excludeUserId,
        currentUserId,
        currentUserRole,
      });
      
      // Transform to public profiles
      const profiles = users.map(user => 
        userUtils.getPublicProfile(user as any) as UserTypes.UserProfile
      );
      
      logger.info('Users search completed', { count: profiles.length });
      return profiles;
    } catch (error: unknown) {
      logger.error('Error searching users:', error);
      throw error;
    }
  }

}
