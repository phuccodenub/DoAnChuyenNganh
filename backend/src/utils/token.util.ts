import { jwtConfig } from '../config/jwt.config';
import { jwtUtils } from './jwt.util';
import { secureUtils } from './secure.util';
import { dateUtils } from './date.util';
import logger from './logger.util';

/**
 * Token type definitions
 */
export type TokenType = 'access' | 'refresh' | 'email_verification' | 'password_reset' | 'session' | 'api_key';

/**
 * Token payload interfaces
 */
interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access';
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
  type: 'refresh';
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

interface EmailVerificationTokenPayload {
  userId: string;
  email: string;
  type: 'email_verification';
  iat?: number;
  exp?: number;
}

interface PasswordResetTokenPayload {
  userId: string;
  email: string;
  type: 'password_reset';
  iat?: number;
  exp?: number;
}

interface SessionTokenPayload {
  userId: string;
  sessionId: string;
  type: 'session';
  iat?: number;
  exp?: number;
}

interface ApiKeyTokenPayload {
  userId: string;
  permissions: string[];
  type: 'api_key';
  iat?: number;
  exp?: number;
}

/**
 * Higher-level token utility functions for business logic
 * Groups JWT-related functions for better organization
 */
export const tokenUtils = {
  // ===== JWT TOKEN OPERATIONS =====
  jwt: {
    /**
     * Generate access token for user authentication
     * @param userId - User ID
     * @param email - User email
     * @param role - User role
     * @returns Access token string
     */
    generateAccessToken(userId: string, email: string, role: string): string {
      try {
        const payload: AccessTokenPayload = {
          userId,
          email,
          role,
          type: 'access'
        };

        return jwtUtils.signToken(payload, jwtConfig.secret, {
          expiresIn: jwtConfig.expiresIn as any,
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience
        });
      } catch (error: unknown) {
        logger.error('Access token generation error:', error);
        throw new Error('Failed to generate access token');
      }
    },

    /**
     * Verify access token and return user data
     * @param token - Access token to verify
     * @returns User data { userId, email, role }
     */
    verifyAccessToken(token: string): { userId: string; email: string; role: string } {
      try {
        const payload = jwtUtils.verifyToken<AccessTokenPayload>(token, jwtConfig.secret, {
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience
        });

        if (payload.type !== 'access') {
          throw new Error('Invalid token type');
        }

        return {
          userId: payload.userId,
          email: payload.email,
          role: payload.role
        };
      } catch (error: unknown) {
        logger.error('Access token verification error:', error);
        throw new Error('Invalid access token');
      }
    },

    /**
     * Generate refresh token for token renewal
     * @param userId - User ID
     * @param tokenVersion - Token version for invalidation
     * @returns Refresh token string
     */
    generateRefreshToken(userId: string, tokenVersion: number): string {
      try {
        const payload: RefreshTokenPayload = {
          userId,
          tokenVersion,
          type: 'refresh'
        };

        return jwtUtils.signToken(payload, jwtConfig.secret, {
          expiresIn: jwtConfig.refreshExpiresIn as any,
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience
        });
      } catch (error: unknown) {
        logger.error('Refresh token generation error:', error);
        throw new Error('Failed to generate refresh token');
      }
    },

    /**
     * Verify refresh token and return user data
     * @param token - Refresh token to verify
     * @returns User data { userId, tokenVersion }
     */
    verifyRefreshToken(token: string): { userId: string; tokenVersion: number } {
      try {
        const payload = jwtUtils.verifyToken<RefreshTokenPayload>(token, jwtConfig.secret, {
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience
        });

        if (payload.type !== 'refresh') {
          throw new Error('Invalid token type');
        }

        return {
          userId: payload.userId,
          tokenVersion: payload.tokenVersion
        };
      } catch (error: unknown) {
        logger.error('Refresh token verification error:', error);
        throw new Error('Invalid refresh token');
      }
    },

    /**
     * Generate password reset token
     * @param userId - User ID
     * @param email - User email
     * @returns Password reset token string
     */
    generatePasswordResetToken(userId: string, email: string): string {
      try {
        const payload: PasswordResetTokenPayload = {
          userId,
          email,
          type: 'password_reset'
        };

        return jwtUtils.signToken(payload, jwtConfig.secret, {
          expiresIn: '1h'
        });
      } catch (error: unknown) {
        logger.error('Password reset token generation error:', error);
        throw new Error('Failed to generate password reset token');
      }
    },

    /**
     * Verify password reset token
     * @param token - Password reset token to verify
     * @returns User data { userId, email }
     */
    verifyPasswordResetToken(token: string): { userId: string; email: string } {
      try {
        const payload = jwtUtils.verifyToken<PasswordResetTokenPayload>(token, jwtConfig.secret);

        if (payload.type !== 'password_reset') {
          throw new Error('Invalid token type');
        }

        return {
          userId: payload.userId,
          email: payload.email
        };
      } catch (error: unknown) {
        logger.error('Password reset token verification error:', error);
        throw new Error('Invalid password reset token');
      }
    },

    /**
     * Generate email verification token
     * @param userId - User ID
     * @param email - User email
     * @returns Email verification token string
     */
    generateEmailVerificationToken(userId: string, email: string): string {
      try {
        const payload: EmailVerificationTokenPayload = {
          userId,
          email,
          type: 'email_verification'
        };

        return jwtUtils.signToken(payload, jwtConfig.secret, {
          expiresIn: '24h'
        });
      } catch (error: unknown) {
        logger.error('Email verification token generation error:', error);
        throw new Error('Failed to generate email verification token');
      }
    },

    /**
     * Verify email verification token
     * @param token - Email verification token to verify
     * @returns User data { userId, email }
     */
    verifyEmailVerificationToken(token: string): { userId: string; email: string } {
      try {
        const payload = jwtUtils.verifyToken<EmailVerificationTokenPayload>(token, jwtConfig.secret);

        if (payload.type !== 'email_verification') {
          throw new Error('Invalid token type');
        }

        return {
          userId: payload.userId,
          email: payload.email
        };
      } catch (error: unknown) {
        logger.error('Email verification token verification error:', error);
        throw new Error('Invalid email verification token');
      }
    },

    /**
     * Generate API key token
     * @param userId - User ID
     * @param permissions - Array of permissions
     * @returns API key token string
     */
    generateApiKeyToken(userId: string, permissions: string[] = []): string {
      try {
        const payload: ApiKeyTokenPayload = {
          userId,
          permissions,
          type: 'api_key'
        };

        return jwtUtils.signToken(payload, jwtConfig.secret, {
          expiresIn: '365d'
        });
      } catch (error: unknown) {
        logger.error('API key token generation error:', error);
        throw new Error('Failed to generate API key token');
      }
    },

    /**
     * Verify API key token
     * @param token - API key token to verify
     * @returns User data { userId, permissions }
     */
    verifyApiKeyToken(token: string): { userId: string; permissions: string[] } {
      try {
        const payload = jwtUtils.verifyToken<ApiKeyTokenPayload>(token, jwtConfig.secret);

        if (payload.type !== 'api_key') {
          throw new Error('Invalid token type');
        }

        return {
          userId: payload.userId,
          permissions: payload.permissions
        };
      } catch (error: unknown) {
        logger.error('API key token verification error:', error);
        throw new Error('Invalid API key token');
      }
    },

    /**
     * Generate session token
     * @param userId - User ID
     * @param sessionId - Session ID
     * @returns Session token string
     */
    generateSessionToken(userId: string, sessionId: string): string {
      try {
        const payload: SessionTokenPayload = {
          userId,
          sessionId,
          type: 'session'
        };

        return jwtUtils.signToken(payload, jwtConfig.secret, {
          expiresIn: '7d'
        });
      } catch (error: unknown) {
        logger.error('Session token generation error:', error);
        throw new Error('Failed to generate session token');
      }
    },

    /**
     * Verify session token
     * @param token - Session token to verify
     * @returns User data { userId, sessionId }
     */
    verifySessionToken(token: string): { userId: string; sessionId: string } {
      try {
        const payload = jwtUtils.verifyToken<SessionTokenPayload>(token, jwtConfig.secret);

        if (payload.type !== 'session') {
          throw new Error('Invalid token type');
        }

        return {
          userId: payload.userId,
          sessionId: payload.sessionId
        };
      } catch (error: unknown) {
        logger.error('Session token verification error:', error);
        throw new Error('Invalid session token');
      }
    },

    /**
     * Generate both access and refresh tokens for a user
     * @param user - User object with id, email, role, token_version
     * @returns Object with accessToken and refreshToken
     */
    generateTokenPair(user: any): { accessToken: string; refreshToken: string } {
      try {
        const accessToken = this.generateAccessToken(user.id, user.email, user.role);
        const refreshToken = this.generateRefreshToken(user.id, user.token_version);
        
        return { accessToken, refreshToken };
      } catch (error: unknown) {
        logger.error('Token pair generation error:', error);
        throw new Error('Failed to generate token pair');
      }
    }
  },

  // ===== TOKEN UTILITIES =====
  utils: {
    /**
     * Extract token from Authorization header
     * @param authHeader - Authorization header value
     * @returns Token string or null if invalid
     */
    extractTokenFromHeader(authHeader: string): string | null {
      try {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return null;
        }
        
        return authHeader.substring(7); // Remove 'Bearer ' prefix
      } catch (error: unknown) {
        logger.error('Token extraction error:', error);
        return null;
      }
    },

    /**
     * Validate token format
     * @param token - Token to validate
     * @returns True if valid format, false otherwise
     */
    isValidTokenFormat(token: string): boolean {
      try {
        if (!token || typeof token !== 'string') return false;
        
        // JWT should have 3 parts separated by dots
        const parts = token.split('.');
        return parts.length === 3;
      } catch (error: unknown) {
        logger.error('Token format validation error:', error);
        return false;
      }
    },

    /**
     * Check if token is expired
     * @param token - Token to check
     * @returns True if expired, false otherwise
     */
    isTokenExpired(token: string): boolean {
      try {
        const decoded = jwtUtils.decodeToken(token) as any;
        if (!decoded || !decoded.exp) return true;
        
        const currentTime = Math.floor(dateUtils.timestamp() / 1000);
        return decoded.exp < currentTime;
      } catch (error: unknown) {
        logger.error('Token expiration check error:', error);
        return true;
      }
    },

    /**
     * Get token expiration time
     * @param token - Token to check
     * @returns Expiration date or null if invalid
     */
    getTokenExpiration(token: string): Date | null {
      try {
        const decoded = jwtUtils.decodeToken(token) as any;
        if (!decoded || !decoded.exp) return null;
        
        return new Date(decoded.exp * 1000);
      } catch (error: unknown) {
        logger.error('Token expiration get error:', error);
        return null;
      }
    }
  },

  // ===== SECURE GENERATION (using secureUtils) =====
  secure: {
    /**
     * Generate secure random token
     * @param length - Token length
     * @returns Random token string
     */
    generateSecureToken(length: number = 32): string {
      return secureUtils.generateSecureToken(length);
    },

    /**
     * Generate verification code (6 digits)
     * @returns 6-digit verification code
     */
    generateVerificationCode(): string {
      return secureUtils.generateVerificationCode();
    },

    /**
     * Generate UUID v4
     * @returns UUID v4 string
     */
    generateUUIDv4(): string {
      return secureUtils.generateUUIDv4();
    },

    /**
     * Generate random number within range
     * @param min - Minimum value
     * @param max - Maximum value
     * @returns Random number
     */
    generateRandomNumber(min: number = 100000, max: number = 999999): number {
      return secureUtils.generateRandomNumber(min, max);
    },

    /**
     * Generate OTP (One-Time Password)
     * @param length - OTP length
     * @returns OTP string
     */
    generateOTP(length: number = 6): string {
      return secureUtils.generateOTP(length);
    }
  }
};
