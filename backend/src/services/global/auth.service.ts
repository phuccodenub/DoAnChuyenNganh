import { jwtUtils } from '../../utils/jwt.util';
import { comparePassword, hashPassword } from '../../utils';
import logger from '../../utils/logger.util';

export class GlobalAuthService {
  // ===== JWT UTILITIES (Shared across modules) =====

  // Generate tokens for any user
  async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      return jwtUtils.generateTokenPair(user);
    } catch (error: unknown) {
      logger.error('Error generating tokens:', error);
      throw error;
    }
  }

  // Verify access token
  async verifyAccessToken(token: string): Promise<any> {
    try {
      return await jwtUtils.verifyAccessToken(token);
    } catch (error: unknown) {
      logger.error('Error verifying access token:', error);
      throw error;
    }
  }

  // Verify refresh token
  async verifyRefreshToken(token: string): Promise<any> {
    try {
      return await jwtUtils.verifyRefreshToken(token);
    } catch (error: unknown) {
      logger.error('Error verifying refresh token:', error);
      throw error;
    }
  }

  // ===== PASSWORD UTILITIES (Shared across modules) =====

  // Hash password with standard settings
  async hashPassword(password: string): Promise<string> {
    try {
      return await hashPassword(password);
    } catch (error: unknown) {
      logger.error('Error hashing password:', error);
      throw error;
    }
  }

  // Compare password with hash
  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await comparePassword(plainPassword, hashedPassword);
    } catch (error: unknown) {
      logger.error('Error comparing password:', error);
      return false;
    }
  }

  // ===== TOKEN VALIDATION UTILITIES (Shared across modules) =====

  // Validate JWT token format
  validateTokenFormat(token: string): boolean {
    try {
      const parts = token.split('.');
      return parts.length === 3;
    } catch (error: unknown) {
      return false;
    }
  }

  // Decode JWT token (without verification)
  decodeToken(token: string): any {
    try {
      return jwtUtils.decodeToken(token);
    } catch (error: unknown) {
      logger.error('Error decoding token:', error);
      return null;
    }
  }
}

