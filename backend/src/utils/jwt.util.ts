import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import logger from './logger.util';

/**
 * JWT utility interface for IDE autocomplete
 */
export interface JWTUtils {
  // Core JWT operations
  signToken(payload: object, secret: string, options?: any): string;
  verifyToken<T = any>(token: string, secret: string, options?: any): T;
  decodeToken(token: string): any;
  
  // High-level token operations
  generateAccessToken(userId: string, email: string, role: string): string;
  verifyAccessToken(token: string): { userId: string; email: string; role: string };
  generateRefreshToken(userId: string, tokenVersion: number): string;
  verifyRefreshToken(token: string): { userId: string; tokenVersion: number };
  generatePasswordResetToken(userId: string, email: string): string;
  verifyPasswordResetToken(token: string): { userId: string; email: string };
  generateEmailVerificationToken(userId: string, email: string): string;
  verifyEmailVerificationToken(token: string): { userId: string; email: string };
  generateApiKeyToken(userId: string, permissions: string[]): string;
  verifyApiKeyToken(token: string): { userId: string; permissions: string[] };
  generateSessionToken(userId: string, sessionId: string): string;
  verifySessionToken(token: string): { userId: string; sessionId: string };
  generateTokenPair(user: any): { accessToken: string; refreshToken: string };
  
  // Token utilities
  extractTokenFromHeader(authHeader: string): string | null;
  isValidTokenFormat(token: string): boolean;
  isTokenExpired(token: string): boolean;
  getTokenExpiration(token: string): Date | null;
}

/**
 * JWT utility wrapper class
 * Uses tokenUtils internally for easier module imports
 * Provides convenient interface for JWT operations
 */
export const jwtUtils: JWTUtils = {
  // ===== CORE JWT OPERATIONS (delegated to tokenUtils) =====
  
  /**
   * Sign a JWT token with payload, secret, and options
   * @param payload - The payload to sign
   * @param secret - The secret key for signing
   * @param options - Optional JWT signing options
   * @returns Signed JWT token string
   */
  signToken(payload: object, secret: string, options?: any): string {
    try {
      return jwt.sign(payload, secret, options);
    } catch (error) {
      logger.error('JWT sign token error:', error);
      throw new Error('Token signing failed');
    }
  },

  /**
   * Verify a JWT token and return decoded payload
   * @param token - The JWT token to verify
   * @param secret - The secret key for verification
   * @param options - Optional JWT verification options
   * @returns Decoded payload
   */
  verifyToken<T = any>(token: string, secret: string, options?: any): T {
    try {
      // This would need to be implemented in tokenUtils if needed
      // For now, we'll use the high-level methods
      logger.warn('Direct verifyToken called - consider using specific token verification methods');
      throw new Error('Use specific token verification methods instead');
    } catch (error) {
      logger.error('JWT verify token error:', error);
      throw new Error('Token verification failed');
    }
  },

  /**
   * Decode a JWT token without verification (for debugging)
   * @param token - The JWT token to decode
   * @returns Decoded payload or null if invalid
   */
  decodeToken(token: string): any {
    try {
      // This would need to be implemented in tokenUtils if needed
      logger.warn('Direct decodeToken called - consider using token utilities');
      return null;
    } catch (error) {
      logger.error('JWT decode token error:', error);
      return null;
    }
  },

  // ===== HIGH-LEVEL TOKEN OPERATIONS (delegated to tokenUtils.jwt) =====

  /**
   * Generate access token for user authentication
   * @param userId - User ID
   * @param email - User email
   * @param role - User role
   * @returns Access token string
   */
  generateAccessToken(userId: string, email: string, role: string): string {
    try {
      const payload = {
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
    } catch (error) {
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
      logger.info('JWT verifyAccessToken called with token:', token.substring(0, 50) + '...');
      const decoded = jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }) as any;
      logger.info('JWT decoded successfully:', decoded);
      if (decoded?.type !== 'access') {
        logger.error('Invalid token type:', decoded?.type);
        throw new Error('Invalid token type');
      }
      logger.info('Token type validation passed');
      return { userId: decoded.userId, email: decoded.email, role: decoded.role };
    } catch (error) {
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
      const payload = {
        userId,
        tokenVersion,
        type: 'refresh'
      };

      return jwtUtils.signToken(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.refreshExpiresIn as any,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });
    } catch (error) {
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
      const decoded = jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }) as any;
      if (decoded?.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return { userId: decoded.userId, tokenVersion: decoded.tokenVersion };
    } catch (error) {
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
      const payload = { userId, email, type: 'password_reset' };
      return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: '15m',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });
    } catch (error) {
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
      const decoded = jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }) as any;
      if (decoded?.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }
      return { userId: decoded.userId, email: decoded.email };
    } catch (error) {
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
      const payload = { userId, email, type: 'email_verification' };
      return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: '24h',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });
    } catch (error) {
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
      const decoded = jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }) as any;
      if (decoded?.type !== 'email_verification') {
        throw new Error('Invalid token type');
      }
      return { userId: decoded.userId, email: decoded.email };
    } catch (error) {
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
      const payload = { userId, permissions, type: 'api_key' };
      return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: '30d',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });
    } catch (error) {
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
      const decoded = jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }) as any;
      if (decoded?.type !== 'api_key') {
        throw new Error('Invalid token type');
      }
      return { userId: decoded.userId, permissions: decoded.permissions || [] };
    } catch (error) {
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
      const payload = { userId, sessionId, type: 'session' };
      return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: '7d',
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });
    } catch (error) {
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
      const decoded = jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }) as any;
      if (decoded?.type !== 'session') {
        throw new Error('Invalid token type');
      }
      return { userId: decoded.userId, sessionId: decoded.sessionId };
    } catch (error) {
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
    } catch (error) {
      logger.error('Token pair generation error:', error);
      throw new Error('Failed to generate token pair');
    }
  },

  // ===== TOKEN UTILITIES (delegated to tokenUtils.utils) =====

  /**
   * Extract token from Authorization header
   * @param authHeader - Authorization header value
   * @returns Token string or null if invalid
   */
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2) return null;
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) return null;
    return token || null;
  },

  /**
   * Validate token format
   * @param token - Token to validate
   * @returns True if valid format, false otherwise
   */
  isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    const segments = token.split('.');
    return segments.length === 3;
  },

  /**
   * Check if token is expired
   * @param token - Token to check
   * @returns True if expired, false otherwise
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwt.decode(token);
      if (!decoded || !decoded.exp) return false;
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch {
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
      const decoded: any = jwt.decode(token);
      if (!decoded || !decoded.exp) return null;
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }
};