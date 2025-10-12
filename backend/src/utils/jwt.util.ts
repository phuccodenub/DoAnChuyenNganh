import { tokenUtils } from './token.util';
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
      // This would need to be implemented in tokenUtils if needed
      // For now, we'll use the high-level methods
      logger.warn('Direct signToken called - consider using specific token generation methods');
      throw new Error('Use specific token generation methods instead');
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
    return tokenUtils.jwt.generateAccessToken(userId, email, role);
  },

  /**
   * Verify access token and return user data
   * @param token - Access token to verify
   * @returns User data { userId, email, role }
   */
  verifyAccessToken(token: string): { userId: string; email: string; role: string } {
    return tokenUtils.jwt.verifyAccessToken(token);
  },

  /**
   * Generate refresh token for token renewal
   * @param userId - User ID
   * @param tokenVersion - Token version for invalidation
   * @returns Refresh token string
   */
  generateRefreshToken(userId: string, tokenVersion: number): string {
    return tokenUtils.jwt.generateRefreshToken(userId, tokenVersion);
  },

  /**
   * Verify refresh token and return user data
   * @param token - Refresh token to verify
   * @returns User data { userId, tokenVersion }
   */
  verifyRefreshToken(token: string): { userId: string; tokenVersion: number } {
    return tokenUtils.jwt.verifyRefreshToken(token);
  },

  /**
   * Generate password reset token
   * @param userId - User ID
   * @param email - User email
   * @returns Password reset token string
   */
  generatePasswordResetToken(userId: string, email: string): string {
    return tokenUtils.jwt.generatePasswordResetToken(userId, email);
  },

  /**
   * Verify password reset token
   * @param token - Password reset token to verify
   * @returns User data { userId, email }
   */
  verifyPasswordResetToken(token: string): { userId: string; email: string } {
    return tokenUtils.jwt.verifyPasswordResetToken(token);
  },

  /**
   * Generate email verification token
   * @param userId - User ID
   * @param email - User email
   * @returns Email verification token string
   */
  generateEmailVerificationToken(userId: string, email: string): string {
    return tokenUtils.jwt.generateEmailVerificationToken(userId, email);
  },

  /**
   * Verify email verification token
   * @param token - Email verification token to verify
   * @returns User data { userId, email }
   */
  verifyEmailVerificationToken(token: string): { userId: string; email: string } {
    return tokenUtils.jwt.verifyEmailVerificationToken(token);
  },

  /**
   * Generate API key token
   * @param userId - User ID
   * @param permissions - Array of permissions
   * @returns API key token string
   */
  generateApiKeyToken(userId: string, permissions: string[] = []): string {
    return tokenUtils.jwt.generateApiKeyToken(userId, permissions);
  },

  /**
   * Verify API key token
   * @param token - API key token to verify
   * @returns User data { userId, permissions }
   */
  verifyApiKeyToken(token: string): { userId: string; permissions: string[] } {
    return tokenUtils.jwt.verifyApiKeyToken(token);
  },

  /**
   * Generate session token
   * @param userId - User ID
   * @param sessionId - Session ID
   * @returns Session token string
   */
  generateSessionToken(userId: string, sessionId: string): string {
    return tokenUtils.jwt.generateSessionToken(userId, sessionId);
  },

  /**
   * Verify session token
   * @param token - Session token to verify
   * @returns User data { userId, sessionId }
   */
  verifySessionToken(token: string): { userId: string; sessionId: string } {
    return tokenUtils.jwt.verifySessionToken(token);
  },

  /**
   * Generate both access and refresh tokens for a user
   * @param user - User object with id, email, role, token_version
   * @returns Object with accessToken and refreshToken
   */
  generateTokenPair(user: any): { accessToken: string; refreshToken: string } {
    return tokenUtils.jwt.generateTokenPair(user);
  },

  // ===== TOKEN UTILITIES (delegated to tokenUtils.utils) =====

  /**
   * Extract token from Authorization header
   * @param authHeader - Authorization header value
   * @returns Token string or null if invalid
   */
  extractTokenFromHeader(authHeader: string): string | null {
    return tokenUtils.utils.extractTokenFromHeader(authHeader);
  },

  /**
   * Validate token format
   * @param token - Token to validate
   * @returns True if valid format, false otherwise
   */
  isValidTokenFormat(token: string): boolean {
    return tokenUtils.utils.isValidTokenFormat(token);
  },

  /**
   * Check if token is expired
   * @param token - Token to check
   * @returns True if expired, false otherwise
   */
  isTokenExpired(token: string): boolean {
    return tokenUtils.utils.isTokenExpired(token);
  },

  /**
   * Get token expiration time
   * @param token - Token to check
   * @returns Expiration date or null if invalid
   */
  getTokenExpiration(token: string): Date | null {
    return tokenUtils.utils.getTokenExpiration(token);
  }
};