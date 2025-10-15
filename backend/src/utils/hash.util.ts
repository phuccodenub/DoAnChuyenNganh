import crypto from 'crypto';
import { bcryptUtils } from './bcrypt.util';
import { tokenUtils } from './token.util';
import { secureUtils } from './secure.util';
import logger from './logger.util';

/**
 * Hash and cryptographic utility functions
 * Aggregates functions from bcrypt, token, and secure utils
 * No circular dependencies - only imports from lower-level utils
 */
export const hashUtils = {
  // ===== PASSWORD HASHING (using bcryptUtils) =====
  password: {
    /**
     * Hash password using bcrypt with crypto fallback
     * @param password - Plain text password
     * @returns Hashed password string
     */
    async hashPassword(password: string): Promise<string> {
      try {
        const normalizedPassword = password.normalize('NFC');
        return await bcryptUtils.hashPassword(normalizedPassword);
      } catch (error: unknown) {
        logger.error('Password hashing failed:', error);
        throw new Error('Password hashing failed');
      }
    },

    /**
     * Compare password with hash using bcrypt with crypto fallback
     * @param password - Plain text password
     * @param hashedPassword - Hashed password to compare against
     * @returns True if passwords match, false otherwise
     */
    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
      try {
        const normalizedPassword = password.normalize('NFC');
        return await bcryptUtils.comparePassword(normalizedPassword, hashedPassword);
      } catch (error: unknown) {
        logger.error('Password comparison failed:', error);
        throw new Error('Password comparison failed');
      }
    },

    /**
     * Check if password needs rehashing
     * @param hashedPassword - Current hashed password
     * @param saltRounds - Desired salt rounds
     * @returns True if rehashing is needed
     */
    needsRehash(hashedPassword: string, saltRounds: number = 12): boolean {
      return bcryptUtils.needsRehash(hashedPassword, saltRounds);
    },

    /**
     * Rehash password if needed
     * @param password - Plain text password
     * @param currentHash - Current hashed password
     * @param saltRounds - Desired salt rounds
     * @returns New hashed password or current hash if no rehashing needed
     */
    async rehashIfNeeded(password: string, currentHash: string, saltRounds: number = 12): Promise<string> {
      return await bcryptUtils.rehashIfNeeded(password, currentHash, saltRounds);
    }
  },

  // ===== STRING HASHING (using crypto native) =====
  string: {
    /**
     * Hash string with SHA256
     * @param input - Input string to hash
     * @returns SHA256 hash string
     */
    hashStringSHA256(input: string): string {
      try {
        return crypto.createHash('sha256').update(input).digest('hex');
      } catch (error: unknown) {
        logger.error('SHA256 hashing failed:', error);
        throw new Error('String hashing failed');
      }
    },

    /**
     * Hash string with SHA512
     * @param input - Input string to hash
     * @returns SHA512 hash string
     */
    hashStringSHA512(input: string): string {
      try {
        return crypto.createHash('sha512').update(input).digest('hex');
      } catch (error: unknown) {
        logger.error('SHA512 hashing failed:', error);
        throw new Error('String hashing failed');
      }
    },

    /**
     * Hash string with MD5 (not recommended for security)
     * @param input - Input string to hash
     * @returns MD5 hash string
     */
    hashStringMD5(input: string): string {
      try {
        return crypto.createHash('md5').update(input).digest('hex');
      } catch (error: unknown) {
        logger.error('MD5 hashing failed:', error);
        throw new Error('String hashing failed');
      }
    },

    /**
     * Hash string with HMAC
     * @param input - Input string to hash
     * @param secret - Secret key for HMAC
     * @param algorithm - Hash algorithm (default: sha256)
     * @returns HMAC hash string
     */
    hashStringHMAC(input: string, secret: string, algorithm: string = 'sha256'): string {
      try {
        return crypto.createHmac(algorithm, secret).update(input).digest('hex');
      } catch (error: unknown) {
        logger.error('HMAC hashing failed:', error);
        throw new Error('HMAC hashing failed');
      }
    }
  },

  // ===== SECURE GENERATION (using secureUtils) =====
  secure: {
    /**
     * Generate UUID v4
     * @returns UUID v4 string
     */
    generateUUIDv4(): string {
      return secureUtils.generateUUIDv4();
    },

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
    },

    /**
     * Generate random bytes
     * @param length - Number of bytes to generate
     * @returns Random bytes as Buffer
     */
    generateRandomBytes(length: number): Buffer {
      return secureUtils.generateRandomBytes(length);
    },

    /**
     * Generate random hex string
     * @param length - Number of bytes to generate
     * @returns Random hex string
     */
    generateRandomHex(length: number): string {
      return secureUtils.generateRandomHex(length);
    },

    /**
     * Generate random base64 string
     * @param length - Number of bytes to generate
     * @returns Random base64 string
     */
    generateRandomBase64(length: number): string {
      return secureUtils.generateRandomBase64(length);
    }
  },

  // ===== TOKEN UTILITIES (using tokenUtils) =====
  token: {
    /**
     * Generate access token
     * @param userId - User ID
     * @param email - User email
     * @param role - User role
     * @returns Access token string
     */
    generateAccessToken(userId: string, email: string, role: string): string {
      return tokenUtils.jwt.generateAccessToken(userId, email, role);
    },

    /**
     * Verify access token
     * @param token - Access token to verify
     * @returns User data { userId, email, role }
     */
    verifyAccessToken(token: string): { userId: string; email: string; role: string } {
      return tokenUtils.jwt.verifyAccessToken(token);
    },

    /**
     * Generate refresh token
     * @param userId - User ID
     * @param tokenVersion - Token version
     * @returns Refresh token string
     */
    generateRefreshToken(userId: string, tokenVersion: number): string {
      return tokenUtils.jwt.generateRefreshToken(userId, tokenVersion);
    },

    /**
     * Verify refresh token
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
     * Generate token pair (access + refresh)
     * @param user - User object
     * @returns Object with accessToken and refreshToken
     */
    generateTokenPair(user: any): { accessToken: string; refreshToken: string } {
      return tokenUtils.jwt.generateTokenPair(user);
    },

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
  }
};

// ===== LEGACY EXPORTS FOR BACKWARD COMPATIBILITY =====
export const hashPassword = hashUtils.password.hashPassword;
export const comparePassword = hashUtils.password.comparePassword;
export const generateRandomString = hashUtils.secure.generateSecureToken;
export const generateRandomNumber = hashUtils.secure.generateRandomNumber;
export const generateUUID = hashUtils.secure.generateUUIDv4;
export const hashString = hashUtils.string.hashStringSHA256;
export const generateSecureToken = hashUtils.secure.generateSecureToken;
export const generateVerificationCode = hashUtils.secure.generateVerificationCode;
export const generatePasswordResetToken = hashUtils.token.generatePasswordResetToken;
export const generateEmailVerificationToken = hashUtils.token.generateEmailVerificationToken;
