import crypto from 'crypto';
import { CHARSETS } from '../constants.util';

/**
 * String cryptographic utilities
 * Contains functions for hashing, encoding, and cryptographic operations
 */
export const cryptoUtils = {
  /**
   * Hash string with SHA256
   * @param input - String to hash
   * @returns SHA256 hash
   */
  hashSHA256(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  },

  /**
   * Hash string with SHA512
   * @param input - String to hash
   * @returns SHA512 hash
   */
  hashSHA512(input: string): string {
    return crypto.createHash('sha512').update(input).digest('hex');
  },

  /**
   * Hash string with MD5
   * @param input - String to hash
   * @returns MD5 hash
   */
  hashMD5(input: string): string {
    return crypto.createHash('md5').update(input).digest('hex');
  },

  /**
   * Hash string with SHA1
   * @param input - String to hash
   * @returns SHA1 hash
   */
  hashSHA1(input: string): string {
    return crypto.createHash('sha1').update(input).digest('hex');
  },

  /**
   * Hash string with HMAC
   * @param input - String to hash
   * @param secret - Secret key
   * @param algorithm - Hash algorithm
   * @returns HMAC hash
   */
  hashHMAC(input: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(input).digest('hex');
  },

  /**
   * Generate checksum for string
   * @param input - String to generate checksum for
   * @param algorithm - Hash algorithm
   * @returns Checksum
   */
  generateChecksum(input: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(input).digest('hex');
  },

  /**
   * Encode string to Base64
   * @param input - String to encode
   * @returns Base64 encoded string
   */
  encodeBase64(input: string): string {
    return Buffer.from(input, 'utf8').toString('base64');
  },

  /**
   * Decode Base64 string
   * @param input - Base64 string to decode
   * @returns Decoded string
   */
  decodeBase64(input: string): string {
    try {
      return Buffer.from(input, 'base64').toString('utf8');
    } catch {
      return '';
    }
  },

  /**
   * Encode string to Base64 URL safe
   * @param input - String to encode
   * @returns Base64 URL safe encoded string
   */
  encodeBase64URL(input: string): string {
    return Buffer.from(input, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  },

  /**
   * Decode Base64 URL safe string
   * @param input - Base64 URL safe string to decode
   * @returns Decoded string
   */
  decodeBase64URL(input: string): string {
    try {
      // Add padding if needed
      const padded = input + '='.repeat((4 - input.length % 4) % 4);
      const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
      return Buffer.from(base64, 'base64').toString('utf8');
    } catch {
      return '';
    }
  },

  /**
   * Encode string to hexadecimal
   * @param input - String to encode
   * @returns Hexadecimal encoded string
   */
  encodeHex(input: string): string {
    return Buffer.from(input, 'utf8').toString('hex');
  },

  /**
   * Decode hexadecimal string
   * @param input - Hexadecimal string to decode
   * @returns Decoded string
   */
  decodeHex(input: string): string {
    try {
      return Buffer.from(input, 'hex').toString('utf8');
    } catch {
      return '';
    }
  },

  /**
   * Encode string to ASCII
   * @param input - String to encode
   * @returns ASCII encoded string
   */
  encodeASCII(input: string): string {
    return Buffer.from(input, 'utf8').toString('ascii');
  },

  /**
   * Decode ASCII string
   * @param input - ASCII string to decode
   * @returns Decoded string
   */
  decodeASCII(input: string): string {
    try {
      return Buffer.from(input, 'ascii').toString('utf8');
    } catch {
      return '';
    }
  },

  /**
   * Encode string to UTF8
   * @param input - String to encode
   * @returns UTF8 encoded string
   */
  encodeUTF8(input: string): string {
    return Buffer.from(input, 'utf8').toString('utf8');
  },

  /**
   * Decode UTF8 string
   * @param input - UTF8 string to decode
   * @returns Decoded string
   */
  decodeUTF8(input: string): string {
    try {
      return Buffer.from(input, 'utf8').toString('utf8');
    } catch {
      return '';
    }
  },

  /**
   * Generate random string with crypto
   * @param length - Length of random string
   * @param charset - Character set to use
   * @returns Random string
   */
  generateRandomString(length: number = 32, charset: string = CHARSETS.ALPHANUMERIC): string {
    const bytes = crypto.randomBytes(length);
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += charset[bytes[i] % charset.length];
    }
    
    return result;
  },

  /**
   * Generate secure random bytes
   * @param length - Number of bytes to generate
   * @returns Random bytes as Buffer
   */
  generateRandomBytes(length: number): Buffer {
    return crypto.randomBytes(length) as any;
  },

  /**
   * Generate secure random hex string
   * @param length - Number of bytes to generate
   * @returns Random hex string
   */
  generateRandomHex(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  },

  /**
   * Generate secure random base64 string
   * @param length - Number of bytes to generate
   * @returns Random base64 string
   */
  generateRandomBase64(length: number): string {
    return crypto.randomBytes(length).toString('base64');
  },

  /**
   * Generate UUID v4
   * @returns UUID v4 string
   */
  generateUUID(): string {
    return crypto.randomUUID();
  },

  /**
   * Generate UUID v4 fallback
   * @returns UUID v4 string
   */
  generateUUIDFallback(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  /**
   * Generate secure token
   * @param length - Token length
   * @returns Secure token
   */
  generateSecureToken(length: number = 32): string {
    return this.generateRandomString(length, CHARSETS.URL_SAFE);
  },

  /**
   * Generate verification code
   * @param length - Code length
   * @returns Verification code
   */
  generateVerificationCode(length: number = 6): string {
    return this.generateRandomString(length, CHARSETS.NUMERIC);
  },

  /**
   * Generate OTP
   * @param length - OTP length
   * @returns OTP string
   */
  generateOTP(length: number = 6): string {
    return this.generateVerificationCode(length);
  },

  /**
   * Generate API key
   * @param length - Key length
   * @returns API key
   */
  generateAPIKey(length: number = 32): string {
    return this.generateRandomString(length, CHARSETS.ALPHANUMERIC);
  },

  /**
   * Generate password
   * @param length - Password length
   * @param includeSpecialChars - Include special characters
   * @returns Generated password
   */
  generatePassword(length: number = 12, includeSpecialChars: boolean = true): string {
    const charset = includeSpecialChars ? CHARSETS.PASSWORD_SAFE : CHARSETS.ALPHANUMERIC;
    return this.generateRandomString(length, charset);
  },

  /**
   * Generate salt
   * @param length - Salt length
   * @returns Salt string
   */
  generateSalt(length: number = 16): string {
    return this.generateRandomHex(length);
  },

  /**
   * Generate nonce
   * @param length - Nonce length
   * @returns Nonce string
   */
  generateNonce(length: number = 16): string {
    return this.generateRandomHex(length);
  },

  /**
   * Generate session ID
   * @param length - Session ID length
   * @returns Session ID
   */
  generateSessionId(length: number = 32): string {
    return this.generateSecureToken(length);
  },

  /**
   * Generate CSRF token
   * @param length - Token length
   * @returns CSRF token
   */
  generateCSRFToken(length: number = 32): string {
    return this.generateSecureToken(length);
  },

  /**
   * Generate JWT secret
   * @param length - Secret length
   * @returns JWT secret
   */
  generateJWTSecret(length: number = 64): string {
    return this.generateRandomHex(length);
  },

  /**
   * Generate encryption key
   * @param length - Key length in bytes
   * @returns Encryption key
   */
  generateEncryptionKey(length: number = 32): Buffer {
    return this.generateRandomBytes(length);
  },

  /**
   * Generate IV (Initialization Vector)
   * @param length - IV length in bytes
   * @returns IV
   */
  generateIV(length: number = 16): Buffer {
    return this.generateRandomBytes(length);
  },

  /**
   * Encrypt string with AES
   * @param text - Text to encrypt
   * @param key - Encryption key
   * @param iv - Initialization vector
   * @returns Encrypted string
   */
  encryptAES(text: string, key: Buffer, iv: Buffer): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  },

  /**
   * Decrypt string with AES
   * @param encryptedText - Encrypted text
   * @param key - Decryption key
   * @param iv - Initialization vector
   * @returns Decrypted string
   */
  decryptAES(encryptedText: string, key: Buffer, iv: Buffer): string {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
};
