type UserInstance = any;
import { UserRepository as BaseUserRepository } from '@repositories/user.repository';
import logger from '@utils/logger.util';
import { RegisterData } from './auth.types';
// Local require shims to avoid pulling full model graph
declare const require: any;

export class AuthRepository extends BaseUserRepository {
  constructor() {
    super();
  }

  /**
   * Find user by username for authentication (LMS login)
   */
  async findUserForAuth(username: string): Promise<UserInstance | null> {
    try {
      logger.debug('Finding user for authentication', { username });
      
      const user = await this.findByUsername(username);
      
      if (user) {
        logger.debug('User found for authentication', { username });
      } else {
        logger.debug('User not found for authentication', { username });
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user for authentication:', error);
      throw error;
    }
  }

  /**
   * Find user by email for authentication (legacy support)
   */
  async findUserByEmailForAuth(email: string): Promise<UserInstance | null> {
    try {
      logger.debug('Finding user by email for authentication', { email });
      
      const user = await this.findByEmail(email);
      
      if (user) {
        logger.debug('User found by email for authentication', { email });
      } else {
        logger.debug('User not found by email for authentication', { email });
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user by email for authentication:', error);
      throw error;
    }
  }

  /**
   * Create user for registration
   */
  async createUserForAuth(userData: RegisterData): Promise<UserInstance> {
    try {
      logger.debug('Creating user for authentication', { email: userData.email });
      
      const user = await this.create(userData);
      
      logger.debug('User created for authentication', { email: userData.email, userId: user.id });
      return user;
    } catch (error) {
      logger.error('Error creating user for authentication:', error);
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updateUserPassword(userId: string, passwordHash: string, tokenVersion: number): Promise<UserInstance> {
    try {
      logger.debug('Updating user password', { userId });
      
      const user = await this.update(userId, {
        password: passwordHash,
        token_version: tokenVersion
      });
      
      logger.debug('User password updated', { userId });
      return user;
    } catch (error) {
      logger.error('Error updating user password:', error);
      throw error;
    }
  }

  /**
   * Update user email verification status
   */
  async updateEmailVerification(userId: string, isVerified: boolean): Promise<UserInstance> {
    try {
      logger.debug('Updating email verification', { userId, isVerified });
      
      const user = await this.update(userId, {
        email_verified: isVerified,
        email_verified_at: isVerified ? new Date() : null
      });
      
      logger.debug('Email verification updated', { userId, isVerified });
      return user;
    } catch (error) {
      logger.error('Error updating email verification:', error);
      throw error;
    }
  }

  /**
   * Update user token version
   */
  async updateTokenVersion(userId: string): Promise<UserInstance> {
    try {
      logger.debug('Updating token version', { userId });
      
      const user = await this.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const updatedUser = await this.update(userId, {
        token_version: (user as any).token_version + 1
      });
      
      logger.debug('Token version updated', { userId });
      return updatedUser;
    } catch (error) {
      logger.error('Error updating token version:', error);
      throw error;
    }
  }

  /**
   * Update user last login
   */
  async updateLastLogin(userId: string): Promise<UserInstance> {
    try {
      logger.debug('Updating last login', { userId });
      
      const user = await this.update(userId, {
        last_login: new Date()
      });
      
      logger.debug('Last login updated', { userId });
      return user;
    } catch (error) {
      logger.error('Error updating last login:', error);
      throw error;
    }
  }

  /**
   * Check if user exists by email
   */
  async userExistsByEmail(email: string): Promise<boolean> {
    try {
      logger.debug('Checking if user exists by email', { email });
      
      const exists = await this.exists(email);
      
      logger.debug('User existence check completed', { email, exists });
      return exists;
    } catch (error) {
      logger.error('Error checking user existence by email:', error);
      throw error;
    }
  }

  /**
   * Get user by ID with minimal fields for auth
   */
  async getUserForAuth(userId: string): Promise<UserInstance | null> {
    try {
      logger.debug('Getting user for authentication', { userId });
      
      const user = await this.findById(userId);
      
      if (user) {
        logger.debug('User retrieved for authentication', { userId });
      } else {
        logger.debug('User not found for authentication', { userId });
      }
      
      return user;
    } catch (error) {
      logger.error('Error getting user for authentication:', error);
      throw error;
    }
  }

  /**
   * Get user profile for auth response
   */
  async getUserProfile(userId: string): Promise<UserInstance | null> {
    try {
      logger.debug('Getting user profile', { userId });
      
      const user = await this.findById(userId);
      
      if (user) {
        logger.debug('User profile retrieved', { userId });
      } else {
        logger.debug('User profile not found', { userId });
      }
      
      return user;
    } catch (error) {
      logger.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, status: string): Promise<UserInstance> {
    try {
      logger.debug('Updating user status', { userId, status });
      
      const user = await this.update(userId, { status });
      
      logger.debug('User status updated', { userId, status });
      return user;
    } catch (error) {
      logger.error('Error updating user status:', error);
      throw error;
    }
  }

  /**
   * Get user with 2FA settings
   */
  async getUserWith2FA(userId: string): Promise<UserInstance | null> {
    try {
      logger.debug('Getting user with 2FA settings', { userId });
      
      const user = await this.findOne({
        where: { id: userId },
        include: [
          {
            model: require('../../models').TwoFactorAuth,
            as: 'twoFactorAuth',
            required: false
          }
        ]
      });
      
      if (user) {
        logger.debug('User with 2FA settings found', { userId });
      } else {
        logger.debug('User with 2FA settings not found', { userId });
      }
      
      return user;
    } catch (error) {
      logger.error('Error getting user with 2FA settings:', error);
      throw error;
    }
  }

  /**
   * Update user 2FA settings
   */
  async update2FASettings(userId: string, settings: any): Promise<void> {
    try {
      logger.debug('Updating 2FA settings', { userId });
      
      const { TwoFactorAuth } = require('../../models');
      
      await TwoFactorAuth.upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date()
      });
      
      logger.debug('2FA settings updated', { userId });
    } catch (error) {
      logger.error('Error updating 2FA settings:', error);
      throw error;
    }
  }

  /**
   * Get user login attempts
   */
  async getUserLoginAttempts(userId: string): Promise<any[]> {
    try {
      logger.debug('Getting user login attempts', { userId });
      
      const { LoginAttempt } = require('../../models');
      
      const attempts = await LoginAttempt.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 10
      });
      
      logger.debug('User login attempts retrieved', { userId, count: attempts.length });
      return attempts;
    } catch (error) {
      logger.error('Error getting user login attempts:', error);
      throw error;
    }
  }

  /**
   * Create login attempt record
   */
  async createLoginAttempt(attemptData: any): Promise<void> {
    try {
      logger.debug('Creating login attempt record', { userId: attemptData.user_id });
      
      const { LoginAttempt } = require('../../models');
      
      await LoginAttempt.create(attemptData);
      
      logger.debug('Login attempt record created', { userId: attemptData.user_id });
    } catch (error) {
      logger.error('Error creating login attempt record:', error);
      throw error;
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId: string): Promise<any[]> {
    try {
      logger.debug('Getting user sessions', { userId });
      
      const { UserSession } = require('../../models');
      
      const sessions = await UserSession.findAll({
        where: { user_id: userId },
        order: [['last_activity', 'DESC']]
      });
      
      logger.debug('User sessions retrieved', { userId, count: sessions.length });
      return sessions;
    } catch (error) {
      logger.error('Error getting user sessions:', error);
      throw error;
    }
  }

  /**
   * Create user session
   */
  async createUserSession(sessionData: any): Promise<any> {
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
   * Update user session
   */
  async updateUserSession(sessionId: string, updateData: any): Promise<void> {
    try {
      logger.debug('Updating user session', { sessionId });
      
      const { UserSession } = require('../../models');
      
      await UserSession.update(updateData, {
        where: { id: sessionId }
      });
      
      logger.debug('User session updated', { sessionId });
    } catch (error) {
      logger.error('Error updating user session:', error);
      throw error;
    }
  }

  /**
   * Delete user session
   */
  async deleteUserSession(sessionId: string): Promise<void> {
    try {
      logger.debug('Deleting user session', { sessionId });
      
      const { UserSession } = require('../../models');
      
      await UserSession.destroy({
        where: { id: sessionId }
      });
      
      logger.debug('User session deleted', { sessionId });
    } catch (error) {
      logger.error('Error deleting user session:', error);
      throw error;
    }
  }

  /**
   * Delete all user sessions
   */
  async deleteAllUserSessions(userId: string): Promise<void> {
    try {
      logger.debug('Deleting all user sessions', { userId });
      
      const { UserSession } = require('../../models');
      
      await UserSession.destroy({
        where: { user_id: userId }
      });
      
      logger.debug('All user sessions deleted', { userId });
    } catch (error) {
      logger.error('Error deleting all user sessions:', error);
      throw error;
    }
  }
}
