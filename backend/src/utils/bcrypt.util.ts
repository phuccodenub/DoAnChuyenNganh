import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import logger from './logger.util';

/**
 * Password hashing and comparison utilities
 * Uses bcrypt with crypto native fallback
 */
export const bcryptUtils = {
  /**
   * Hash password using bcrypt with fallback to crypto
   * @param password - Plain text password
   * @param saltRounds - Number of salt rounds (default: 12)
   * @returns Hashed password string
   */
  async hashPassword(password: string, saltRounds: number = 12): Promise<string> {
    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      logger.warn('bcrypt failed, falling back to crypto:', error);
      // Fallback to crypto native hashing
      return this.hashPasswordWithCrypto(password);
    }
  },

  /**
   * Compare password with hash using bcrypt with fallback to crypto
   * @param password - Plain text password
   * @param hashedPassword - Hashed password to compare against
   * @returns True if passwords match, false otherwise
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.warn('bcrypt compare failed, falling back to crypto:', error);
      // Fallback to crypto native comparison
      return this.comparePasswordWithCrypto(password, hashedPassword);
    }
  },

  /**
   * Generate salt using bcrypt
   * @param saltRounds - Number of salt rounds
   * @returns Generated salt string
   */
  async generateSalt(saltRounds: number = 12): Promise<string> {
    try {
      return await bcrypt.genSalt(saltRounds);
    } catch (error) {
      logger.warn('bcrypt salt generation failed, falling back to crypto:', error);
      // Fallback to crypto native salt
      return crypto.randomBytes(16).toString('hex');
    }
  },

  /**
   * Check if password needs rehashing
   * @param hashedPassword - Current hashed password
   * @param saltRounds - Desired salt rounds
   * @returns True if rehashing is needed
   */
  needsRehash(hashedPassword: string, saltRounds: number = 12): boolean {
    try {
      // Extract rounds from bcrypt hash
      const rounds = parseInt(hashedPassword.split('$')[2]);
      return rounds < saltRounds;
    } catch (error) {
      logger.debug('Could not determine if rehashing needed:', error);
      return false;
    }
  },

  /**
   * Rehash password if needed
   * @param password - Plain text password
   * @param currentHash - Current hashed password
   * @param saltRounds - Desired salt rounds
   * @returns New hashed password or current hash if no rehashing needed
   */
  async rehashIfNeeded(password: string, currentHash: string, saltRounds: number = 12): Promise<string> {
    if (this.needsRehash(currentHash, saltRounds)) {
      logger.info('Rehashing password with higher salt rounds');
      return await this.hashPassword(password, saltRounds);
    }
    return currentHash;
  },

  // ===== CRYPTO NATIVE FALLBACK METHODS =====

  /**
   * Hash password using crypto native (fallback method)
   * @param password - Plain text password
   * @returns Hashed password string
   */
  hashPasswordWithCrypto(password: string): string {
    try {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = (crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512') as any).toString('hex');
      return `crypto:${salt}:${hash}`;
    } catch (error) {
      logger.error('Crypto native hashing failed:', error);
      throw new Error('Password hashing failed');
    }
  },

  /**
   * Compare password using crypto native (fallback method)
   * @param password - Plain text password
   * @param hashedPassword - Hashed password to compare against
   * @returns True if passwords match, false otherwise
   */
  comparePasswordWithCrypto(password: string, hashedPassword: string): boolean {
    try {
      if (!hashedPassword.startsWith('crypto:')) {
        return false; // Not a crypto hash
      }

      const parts = hashedPassword.split(':');
      if (parts.length !== 3) {
        return false;
      }

      const [, salt, hash] = parts;
      const testHash = (crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512') as any).toString('hex');
      
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
    } catch (error) {
      logger.error('Crypto native comparison failed:', error);
      return false;
    }
  }
};