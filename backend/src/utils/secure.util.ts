import crypto from 'crypto';
import logger from './logger.util';

/**
 * Secure token and random generation utilities
 * Contains generic secure generation functions
 */
export const secureUtils = {
  /**
   * Generate secure random token
   * @param length - Token length (default: 32)
   * @param charset - Character set to use (default: alphanumeric + special chars)
   * @returns Secure random token string
   */
  generateSecureToken(length: number = 32, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'): string {
    try {
      const bytes = crypto.randomBytes(length);
      let result = '';
      
      for (let i = 0; i < length; i++) {
        result += charset[bytes[i] % charset.length];
      }
      
      return result;
    } catch (error) {
      logger.error('Secure token generation failed:', error);
      throw new Error('Failed to generate secure token');
    }
  },

  /**
   * Generate UUID v4
   * @returns UUID v4 string
   */
  generateUUIDv4(): string {
    try {
      return crypto.randomUUID();
    } catch (error) {
      logger.warn('crypto.randomUUID failed, using fallback:', error);
      // Fallback for older Node.js versions
      return this.generateUUIDv4Fallback();
    }
  },

  /**
   * Generate UUID v4 fallback implementation
   * @returns UUID v4 string
   */
  generateUUIDv4Fallback(): string {
    try {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    } catch (error) {
      logger.error('UUID v4 fallback generation failed:', error);
      throw new Error('Failed to generate UUID');
    }
  },

  /**
   * Generate random number within range
   * @param min - Minimum value (default: 100000)
   * @param max - Maximum value (default: 999999)
   * @returns Random number
   */
  generateRandomNumber(min: number = 100000, max: number = 999999): number {
    try {
      const range = max - min + 1;
      const randomBytes = crypto.randomBytes(4);
      const randomValue = randomBytes.readUInt32BE(0);
      return min + (randomValue % range);
    } catch (error) {
      logger.error('Random number generation failed:', error);
      // Fallback to Math.random
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  },

  /**
   * Generate verification code (6 digits)
   * @returns 6-digit verification code
   */
  generateVerificationCode(): string {
    return this.generateRandomNumber(100000, 999999).toString();
  },

  /**
   * Generate OTP (One-Time Password)
   * @param length - OTP length (default: 6)
   * @returns OTP string
   */
  generateOTP(length: number = 6): string {
    try {
      const bytes = crypto.randomBytes(length);
      let otp = '';
      
      for (let i = 0; i < length; i++) {
        otp += bytes[i] % 10;
      }
      
      return otp;
    } catch (error) {
      logger.error('OTP generation failed:', error);
      // Fallback
      return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
    }
  },

  /**
   * Generate secure random bytes
   * @param length - Number of bytes to generate
   * @returns Random bytes as Buffer
   */
  generateRandomBytes(length: number): Buffer {
    try {
      return crypto.randomBytes(length);
    } catch (error) {
      logger.error('Random bytes generation failed:', error);
      throw new Error('Failed to generate random bytes');
    }
  },

  /**
   * Generate secure random hex string
   * @param length - Number of bytes to generate (hex length will be 2x)
   * @returns Random hex string
   */
  generateRandomHex(length: number): string {
    try {
      return crypto.randomBytes(length).toString('hex');
    } catch (error) {
      logger.error('Random hex generation failed:', error);
      throw new Error('Failed to generate random hex');
    }
  },

  /**
   * Generate secure random base64 string
   * @param length - Number of bytes to generate
   * @returns Random base64 string
   */
  generateRandomBase64(length: number): string {
    try {
      return crypto.randomBytes(length).toString('base64');
    } catch (error) {
      logger.error('Random base64 generation failed:', error);
      throw new Error('Failed to generate random base64');
    }
  }
};
