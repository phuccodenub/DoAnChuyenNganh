import User from '../../models/user.model';
import { UserInstance } from '../../types/user.types';
import { UserRepository as BaseUserRepository } from '../../repositories/user.repository';
import { UserTypes } from './user.types';
import logger from '../../utils/logger.util';

export class UserModuleRepository extends BaseUserRepository {
  constructor() {
    super();
  }

  /**
   * Find user with preferences
   */
  async findWithPreferences(userId: string): Promise<UserInstance | null> {
    try {
      logger.debug('Finding user with preferences', { userId });
      
      const user = await this.findOne({
        where: { id: userId },
        include: [
          {
            model: require('../../models').UserPreference,
            as: 'preferences',
            required: false
          }
        ]
      });
      
      if (user) {
        logger.debug('User with preferences found', { userId });
      } else {
        logger.debug('User with preferences not found', { userId });
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user with preferences:', error);
      throw error;
    }
  }

  /**
   * Find user with sessions
   */
  async findWithSessions(userId: string): Promise<UserInstance | null> {
    try {
      logger.debug('Finding user with sessions', { userId });
      
      const user = await this.findOne({
        where: { id: userId },
        include: [
          {
            model: require('../../models').UserSession,
            as: 'sessions',
            required: false,
            where: { is_active: true }
          }
        ]
      });
      
      if (user) {
        logger.debug('User with sessions found', { userId });
      } else {
        logger.debug('User with sessions not found', { userId });
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user with sessions:', error);
      throw error;
    }
  }

  /**
   * Find user with social accounts
   */
  async findWithSocialAccounts(userId: string): Promise<UserInstance | null> {
    try {
      logger.debug('Finding user with social accounts', { userId });
      
      const user = await this.findOne({
        where: { id: userId },
        include: [
          {
            model: require('../../models').SocialAccount,
            as: 'socialAccounts',
            required: false
          }
        ]
      });
      
      if (user) {
        logger.debug('User with social accounts found', { userId });
      } else {
        logger.debug('User with social accounts not found', { userId });
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user with social accounts:', error);
      throw error;
    }
  }

  /**
   * Find user with analytics
   */
  async findWithAnalytics(userId: string): Promise<UserInstance | null> {
    try {
      logger.debug('Finding user with analytics', { userId });
      
      const user = await this.findOne({
        where: { id: userId },
        include: [
          {
            model: require('../../models').UserAnalytics,
            as: 'analytics',
            required: false
          }
        ]
      });
      
      if (user) {
        logger.debug('User with analytics found', { userId });
      } else {
        logger.debug('User with analytics not found', { userId });
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user with analytics:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: UserTypes.UserPreferences): Promise<void> {
    try {
      logger.debug('Updating user preferences', { userId, preferences });
      
      const { UserPreference } = require('../../models');
      
      await UserPreference.upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date()
      });
      
      logger.debug('User preferences updated', { userId });
    } catch (error) {
      logger.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserTypes.UserPreferences | null> {
    try {
      logger.debug('Getting user preferences', { userId });
      
      const { UserPreference } = require('../../models');
      
      const preferences = await UserPreference.findOne({
        where: { user_id: userId }
      });
      
      if (preferences) {
        logger.debug('User preferences found', { userId });
        return preferences.toJSON() as UserTypes.UserPreferences;
      } else {
        logger.debug('User preferences not found', { userId });
        return null;
      }
    } catch (error) {
      logger.error('Error getting user preferences:', error);
      throw error;
    }
  }

  /**
   * Create user session
   */
  async createSession(sessionData: UserTypes.UserSession): Promise<any> {
    try {
      logger.debug('Creating user session', { userId: sessionData.user_id });
      
      const { UserSession } = require('../../models');
      
      const session = await UserSession.create(sessionData);
      
      logger.debug('User session created', { userId: sessionData.user_id, sessionId: session.id });
      return session;
    } catch (error) {
      logger.error('Error creating user session:', error);
      throw error;
    }
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(userId: string): Promise<any[]> {
    try {
      logger.debug('Getting active sessions', { userId });
      
      const { UserSession } = require('../../models');
      
      const sessions = await UserSession.findAll({
        where: {
          user_id: userId,
          is_active: true
        },
        order: [['last_activity', 'DESC']]
      });
      
      logger.debug('Active sessions retrieved', { userId, count: sessions.length });
      return sessions;
    } catch (error) {
      logger.error('Error getting active sessions:', error);
      throw error;
    }
  }

  /**
   * Deactivate session
   */
  async deactivateSession(sessionId: string): Promise<void> {
    try {
      logger.debug('Deactivating session', { sessionId });
      
      const { UserSession } = require('../../models');
      
      await UserSession.update(
        { is_active: false, ended_at: new Date() },
        { where: { id: sessionId } }
      );
      
      logger.debug('Session deactivated', { sessionId });
    } catch (error) {
      logger.error('Error deactivating session:', error);
      throw error;
    }
  }

  /**
   * Deactivate all sessions
   */
  async deactivateAllSessions(userId: string): Promise<void> {
    try {
      logger.debug('Deactivating all sessions', { userId });
      
      const { UserSession } = require('../../models');
      
      await UserSession.update(
        { is_active: false, ended_at: new Date() },
        { where: { user_id: userId, is_active: true } }
      );
      
      logger.debug('All sessions deactivated', { userId });
    } catch (error) {
      logger.error('Error deactivating all sessions:', error);
      throw error;
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      logger.debug('Updating session activity', { sessionId });
      
      const { UserSession } = require('../../models');
      
      await UserSession.update(
        { last_activity: new Date() },
        { where: { id: sessionId } }
      );
      
      logger.debug('Session activity updated', { sessionId });
    } catch (error) {
      logger.error('Error updating session activity:', error);
      throw error;
    }
  }

  /**
   * Link social account
   */
  async linkSocialAccount(userId: string, provider: string, socialId: string): Promise<void> {
    try {
      logger.debug('Linking social account', { userId, provider, socialId });
      
      const { SocialAccount } = require('../../models');
      
      await SocialAccount.create({
        user_id: userId,
        provider,
        social_id: socialId,
        linked_at: new Date()
      });
      
      logger.debug('Social account linked', { userId, provider, socialId });
    } catch (error) {
      logger.error('Error linking social account:', error);
      throw error;
    }
  }

  /**
   * Unlink social account
   */
  async unlinkSocialAccount(userId: string, provider: string): Promise<void> {
    try {
      logger.debug('Unlinking social account', { userId, provider });
      
      const { SocialAccount } = require('../../models');
      
      await SocialAccount.destroy({
        where: { user_id: userId, provider }
      });
      
      logger.debug('Social account unlinked', { userId, provider });
    } catch (error) {
      logger.error('Error unlinking social account:', error);
      throw error;
    }
  }

  /**
   * Get social accounts
   */
  async getSocialAccounts(userId: string): Promise<any[]> {
    try {
      logger.debug('Getting social accounts', { userId });
      
      const { SocialAccount } = require('../../models');
      
      const accounts = await SocialAccount.findAll({
        where: { user_id: userId }
      });
      
      logger.debug('Social accounts retrieved', { userId, count: accounts.length });
      return accounts;
    } catch (error) {
      logger.error('Error getting social accounts:', error);
      throw error;
    }
  }

  /**
   * Update user analytics
   */
  async updateAnalytics(userId: string, analytics: UserTypes.UserAnalytics): Promise<void> {
    try {
      logger.debug('Updating user analytics', { userId, analytics });
      
      const { UserAnalytics } = require('../../models');
      
      await UserAnalytics.upsert({
        user_id: userId,
        ...analytics,
        updated_at: new Date()
      });
      
      logger.debug('User analytics updated', { userId });
    } catch (error) {
      logger.error('Error updating user analytics:', error);
      throw error;
    }
  }

  /**
   * Get user analytics
   */
  async getAnalytics(userId: string): Promise<UserTypes.UserAnalytics | null> {
    try {
      logger.debug('Getting user analytics', { userId });
      
      const { UserAnalytics } = require('../../models');
      
      const analytics = await UserAnalytics.findOne({
        where: { user_id: userId }
      });
      
      if (analytics) {
        logger.debug('User analytics found', { userId });
        return analytics.toJSON() as UserTypes.UserAnalytics;
      } else {
        logger.debug('User analytics not found', { userId });
        return null;
      }
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
      logger.debug('Updating notification settings', { userId, settings });
      
      const { UserPreference } = require('../../models');
      
      await UserPreference.upsert({
        user_id: userId,
        notification_settings: settings,
        updated_at: new Date()
      });
      
      logger.debug('Notification settings updated', { userId });
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
      logger.debug('Updating privacy settings', { userId, settings });
      
      const { UserPreference } = require('../../models');
      
      await UserPreference.upsert({
        user_id: userId,
        privacy_settings: settings,
        updated_at: new Date()
      });
      
      logger.debug('Privacy settings updated', { userId });
    } catch (error) {
      logger.error('Error updating privacy settings:', error);
      throw error;
    }
  }
}
