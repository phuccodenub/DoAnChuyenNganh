import { AuthRepository } from './auth.repository';
import { AuthTypes } from './auth.types';
import { UserInstance } from '../../types/user.types';
import { globalServices } from '../../services/global';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import { ApiError } from '../../middlewares/error.middleware';
import { userUtils } from '../../utils/user.util';
import logger from '../../utils/logger.util';

/**
 * Auth Module Service
 * Handles authentication business logic specific to the auth module
 */
export class AuthModuleService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  /**
   * Register new user
   */
  async register(userData: AuthTypes.RegisterData): Promise<AuthTypes.UserProfile> {
    try {
      logger.info('Starting user registration', { email: userData.email });

      // Check if user already exists
      const existingUser = await this.authRepository.findUserForAuth(userData.email);
      if (existingUser) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.CONFLICT, 'Email already exists');
      }

      // Validate password strength
      const passwordValidation = globalServices.passwordSecurity.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST, passwordValidation.feedback.join(', '));
      }

      // Check if password is compromised
      const isCompromised = await globalServices.passwordSecurity.isPasswordCompromised(userData.password);
      if (isCompromised) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST, 'This password has been compromised. Please choose a different password.');
      }

      // Hash password
      const hashedPassword = await globalServices.auth.hashPassword(userData.password);

      // Create new user
      const newUser = await this.authRepository.createUserForAuth({
        ...userData,
        password_hash: hashedPassword
      });

      const userProfile = userUtils.getPublicProfile(newUser) as AuthTypes.UserProfile;
      
      // Cache the new user
      await globalServices.user.cacheUser(newUser.id, userProfile);

      logger.info('User registered successfully', { email: userData.email, userId: newUser.id });
      return userProfile;
    } catch (error) {
      logger.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials: AuthTypes.LoginCredentials, device: string, ipAddress: string, userAgent: string): Promise<{ user: AuthTypes.UserProfile; tokens: AuthTypes.AuthTokens }> {
    try {
      logger.info('Starting user login', { email: credentials.email });

      // Check if account is locked
      const isLocked = await globalServices.accountLockout.isAccountLocked(credentials.email);
      if (isLocked) {
        const lockoutInfo = await globalServices.accountLockout.getLockoutInfo(credentials.email);
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 
          `Account is locked due to multiple failed attempts. Try again after ${lockoutInfo.lockedUntil}`);
      }

      // Find user by email
      const user = await this.authRepository.findUserForAuth(credentials.email);
      
      if (!user) {
        // Increment failed attempts even for non-existent users
        await globalServices.accountLockout.incrementFailedAttempts(credentials.email);
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED, 'Invalid credentials');
      }

      // Check password
      const isPasswordValid = await globalServices.auth.comparePassword(credentials.password, user.password_hash);
      
      if (!isPasswordValid) {
        // Increment failed attempts
        const lockoutResult = await globalServices.accountLockout.incrementFailedAttempts(credentials.email);
        
        if (lockoutResult.isLocked) {
          throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 
            `Account locked due to ${lockoutResult.remainingAttempts} failed attempts`);
        }
        
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED, 
          `Invalid credentials. ${lockoutResult.remainingAttempts} attempts remaining`);
      }

      // Check if user is active
      if (!userUtils.isActive(user)) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN, 'Account is inactive');
      }

      // Check for suspicious activity
      const suspiciousActivity = await globalServices.sessionManagement.checkSuspiciousActivity(
        user.id, 
        ipAddress, 
        userAgent
      );
      
      if (suspiciousActivity.isSuspicious) {
        logger.warn('Suspicious activity detected', { 
          userId: user.id, 
          email: user.email, 
          reason: suspiciousActivity.reason 
        });
        // You might want to require additional verification here
      }

      // Reset failed attempts on successful login
      await globalServices.accountLockout.resetFailedAttempts(credentials.email);

      // Update last login
      await this.authRepository.updateLastLogin(user.id);

      // Generate tokens
      const tokens = await globalServices.auth.generateTokens(user);

      // Create session
      const session = await globalServices.sessionManagement.createSession(
        user.id,
        device,
        ipAddress,
        userAgent
      );

      // Cache user data
      const userProfile = userUtils.getPublicProfile(user) as AuthTypes.UserProfile;
      await globalServices.user.cacheUser(user.id, userProfile);

      // Cache session data
      const sessionData = {
        userId: user.id,
        email: user.email,
        role: user.role,
        loginTime: new Date(),
        tokenVersion: user.token_version,
        sessionId: session.id
      };
      await globalServices.cache.cacheSession(`session:${user.id}`, sessionData);

      logger.info('User logged in successfully', { email: user.email, userId: user.id });

      return {
        user: userProfile,
        tokens
      };
    } catch (error) {
      logger.error('Error logging in user:', error);
      throw error;
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTypes.AuthTokens> {
    try {
      logger.info('Refreshing token');

      const decoded = await globalServices.auth.verifyRefreshToken(refreshToken);
      
      // Try to get user from cache
      let user = await globalServices.user.getUserById(decoded.userId);
      
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED, 'Invalid token');
      }
      
      // Check token version
      if (decoded.tokenVersion !== user.token_version) {
        // Clear cache if token version mismatch
        await globalServices.user.clearUserCache(decoded.userId);
        await globalServices.cache.deleteWithPattern(`session:${decoded.userId}`);
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED, 'Token revoked');
      }

      const tokens = await globalServices.auth.generateTokens(user);
      
      logger.info('Token refreshed successfully', { userId: decoded.userId });
      return tokens;
    } catch (error) {
      logger.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, data: AuthTypes.ChangePasswordData): Promise<void> {
    try {
      logger.info('Changing password', { userId });

      const user = await this.authRepository.getUserForAuth(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await globalServices.auth.comparePassword(data.currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED, 'Invalid current password');
      }

      // Validate new password strength
      const passwordValidation = globalServices.passwordSecurity.validatePasswordStrength(data.newPassword);
      if (!passwordValidation.isValid) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST, passwordValidation.feedback.join(', '));
      }

      // Check if new password is compromised
      const isCompromised = await globalServices.passwordSecurity.isPasswordCompromised(data.newPassword);
      if (isCompromised) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST, 'This password has been compromised. Please choose a different password.');
      }

      // Hash new password
      const hashedNewPassword = await globalServices.auth.hashPassword(data.newPassword);

      // Update password and increment token version
      await this.authRepository.updateUserPassword(userId, hashedNewPassword, user.token_version + 1);

      logger.info('Password changed successfully', { userId });
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    try {
      logger.info('Logging out user', { userId });

      await this.authRepository.updateTokenVersion(userId);
      
      // Clear session cache
      await globalServices.cache.deleteWithPattern(`session:${userId}`);
      
      logger.info('User logged out successfully', { userId });
    } catch (error) {
      logger.error('Error logging out user:', error);
      throw error;
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(userId: string): Promise<void> {
    try {
      logger.info('Verifying email', { userId });

      const user = await this.authRepository.getUserForAuth(userId);
      if (!user) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.NOT_FOUND, 'User not found');
      }

      await this.authRepository.updateEmailVerification(userId, true);

      logger.info('Email verified successfully', { userId });
    } catch (error) {
      logger.error('Error verifying email:', error);
      throw error;
    }
  }

  /**
   * Enable Two-Factor Authentication
   */
  async enable2FA(userId: string): Promise<{ qrCode: string; secret: string; backupCodes: string[] }> {
    try {
      logger.info('Enabling 2FA', { userId });

      const user = await this.authRepository.getUserForAuth(userId);
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

      logger.info('2FA enabled successfully', { userId });

      return {
        qrCode,
        secret,
        backupCodes
      };
    } catch (error) {
      logger.error('Error enabling 2FA:', error);
      throw error;
    }
  }

  /**
   * Verify 2FA setup
   */
  async verify2FASetup(userId: string, code: string): Promise<boolean> {
    try {
      logger.info('Verifying 2FA setup', { userId });

      const secret = await globalServices.twoFactor.get2FASecret(userId);
      if (!secret) {
        throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST, '2FA is not enabled');
      }

      const isValid = globalServices.twoFactor.verifyTOTPCode(secret, code);
      
      if (isValid) {
        logger.info('2FA setup verified successfully', { userId });
      }

      return isValid;
    } catch (error) {
      logger.error('Error verifying 2FA setup:', error);
      throw error;
    }
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId: string, code: string): Promise<void> {
    try {
      logger.info('Disabling 2FA', { userId });

      const user = await this.authRepository.getUserForAuth(userId);
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

      logger.info('2FA disabled successfully', { userId });
    } catch (error) {
      logger.error('Error disabling 2FA:', error);
      throw error;
    }
  }

  /**
   * Login with 2FA
   */
  async loginWith2FA(credentials: AuthTypes.LoginCredentials, code: string, device: string, ipAddress: string, userAgent: string): Promise<{ user: AuthTypes.UserProfile; tokens: AuthTypes.AuthTokens }> {
    try {
      logger.info('Starting 2FA login', { email: credentials.email });

      // First, do regular login validation
      const loginResult = await this.login(credentials, device, ipAddress, userAgent);
      
      // Check if 2FA is enabled for this user
      const is2FAEnabled = await globalServices.twoFactor.is2FAEnabled(loginResult.user.id);
      
      if (is2FAEnabled) {
        // Verify 2FA code
        const secret = await globalServices.twoFactor.get2FASecret(loginResult.user.id);
        if (!secret) {
          throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.INTERNAL_SERVER_ERROR, '2FA secret not found');
        }

        const isValidCode = globalServices.twoFactor.verifyTOTPCode(secret, code);
        const isValidBackupCode = await globalServices.twoFactor.verifyBackupCode(loginResult.user.id, code);

        if (!isValidCode && !isValidBackupCode) {
          throw new ApiError(RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED, 'Invalid 2FA code');
        }
      }

      logger.info('2FA login successful', { email: credentials.email });
      return loginResult;
    } catch (error) {
      logger.error('Error logging in with 2FA:', error);
      throw error;
    }
  }
}