/**
 * Hash Utility Unit Tests
 * Test hash utility functions
 */

import { hashUtils } from '../../../utils/hash.util';

describe('Hash Utility Tests', () => {
  describe('hashUtils.password.hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await hashUtils.password.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt format
    });

    it('should hash different passwords differently', async () => {
      const password1 = 'Password1!';
      const password2 = 'Password2!';
      
      const hash1 = await hashUtils.password.hashPassword(password1);
      const hash2 = await hashUtils.password.hashPassword(password2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should hash the same password differently each time', async () => {
      const password = 'SamePassword123!';
      
      const hash1 = await hashUtils.password.hashPassword(password);
      const hash2 = await hashUtils.password.hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const password = '';
      const hashedPassword = await hashUtils.password.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
    });

    it('should handle very long password', async () => {
      const password = 'a'.repeat(1000) + '123!';
      const hashedPassword = await hashUtils.password.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
    });
  });

  describe('hashUtils.password.comparePassword', () => {
    it('should compare password correctly', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await hashUtils.password.hashPassword(password);
      
      const isValid = await hashUtils.password.comparePassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await hashUtils.password.hashPassword(password);
      
      const isValid = await hashUtils.password.comparePassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should handle empty password comparison', async () => {
      const password = '';
      const hashedPassword = await hashUtils.password.hashPassword(password);
      
      const isValid = await hashUtils.password.comparePassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should handle empty hash', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = '';
      
      const isValid = await hashUtils.password.comparePassword(password, hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should handle invalid hash format', async () => {
      const password = 'TestPassword123!';
      const invalidHash = 'invalid-hash-format';
      
      const isValid = await hashUtils.password.comparePassword(password, invalidHash);
      expect(isValid).toBe(false);
    });
  });

  describe('hashUtils.password.needsRehash', () => {
    it('should detect when rehash is needed', () => {
      const oldHash = '$2a$10$oldhashformat';
      const needsRehash = hashUtils.password.needsRehash(oldHash, 12);
      
      expect(needsRehash).toBe(true);
    });

    it('should detect when rehash is not needed', () => {
      const currentHash = '$2a$12$currenthashformat';
      const needsRehash = hashUtils.password.needsRehash(currentHash, 12);
      
      expect(needsRehash).toBe(false);
    });

    it('should handle invalid hash format', () => {
      const invalidHash = 'invalid-hash';
      const needsRehash = hashUtils.password.needsRehash(invalidHash, 12);
      
      expect(needsRehash).toBe(false); // Returns false for invalid hash format
    });
  });

  describe('hashUtils.password.rehashIfNeeded', () => {
    it('should rehash when needed', async () => {
      const password = 'TestPassword123!';
      const oldHash = '$2a$10$oldhashformat';
      
      const newHash = await hashUtils.password.rehashIfNeeded(password, oldHash, 12);
      
      expect(newHash).toBeDefined();
      expect(newHash).not.toBe(oldHash);
      expect(newHash).toMatch(/^\$2[aby]\$\d+\$/);
    });

    it('should not rehash when not needed', async () => {
      const password = 'TestPassword123!';
      const currentHash = await hashUtils.password.hashPassword(password);
      
      const newHash = await hashUtils.password.rehashIfNeeded(password, currentHash, 12);
      
      expect(newHash).toBe(currentHash);
    });

    it('should handle invalid current hash', async () => {
      const password = 'TestPassword123!';
      const invalidHash = 'invalid-hash';
      
      const newHash = await hashUtils.password.rehashIfNeeded(password, invalidHash, 12);
      
      expect(newHash).toBeDefined();
      expect(newHash).toBe(invalidHash); // Returns original hash when needsRehash returns false
    });
  });

  describe('hashUtils.secure.generateSecureToken', () => {
    it('should generate secure token of specified length', () => {
      const length = 10;
      const randomString = hashUtils.secure.generateSecureToken(length);
      
      expect(randomString).toBeDefined();
      expect(randomString.length).toBe(length);
    });

    it('should generate different strings each time', () => {
      const length = 10;
      const string1 = hashUtils.secure.generateSecureToken(length);
      const string2 = hashUtils.secure.generateSecureToken(length);
      
      expect(string1).not.toBe(string2);
    });

    it('should handle zero length', () => {
      const randomString = hashUtils.secure.generateSecureToken(0);
      
      expect(randomString).toBe('');
    });

    it('should handle large length', () => {
      const length = 1000;
      const randomString = hashUtils.secure.generateSecureToken(length);
      
      expect(randomString).toBeDefined();
      expect(randomString.length).toBe(length);
    });
  });

  describe('hashUtils.secure.generateRandomNumber', () => {
    it('should generate random number within range', () => {
      const min = 1;
      const max = 100;
      const randomNumber = hashUtils.secure.generateRandomNumber(min, max);
      
      expect(randomNumber).toBeGreaterThanOrEqual(min);
      expect(randomNumber).toBeLessThanOrEqual(max);
    });

    it('should generate different numbers each time', () => {
      const min = 1;
      const max = 1000;
      const number1 = hashUtils.secure.generateRandomNumber(min, max);
      const number2 = hashUtils.secure.generateRandomNumber(min, max);
      
      // Very unlikely to be the same
      expect(number1).not.toBe(number2);
    });

    it('should handle same min and max', () => {
      const min = 5;
      const max = 5;
      const randomNumber = hashUtils.secure.generateRandomNumber(min, max);
      
      expect(randomNumber).toBe(min);
    });

    it('should handle negative range', () => {
      const min = -100;
      const max = -1;
      const randomNumber = hashUtils.secure.generateRandomNumber(min, max);
      
      expect(randomNumber).toBeGreaterThanOrEqual(min);
      expect(randomNumber).toBeLessThanOrEqual(max);
    });
  });

  describe('hashUtils.secure.generateUUIDv4', () => {
    it('should generate valid UUID v4', () => {
      const uuid = hashUtils.secure.generateUUIDv4();
      
      expect(uuid).toBeDefined();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate different UUIDs each time', () => {
      const uuid1 = hashUtils.secure.generateUUIDv4();
      const uuid2 = hashUtils.secure.generateUUIDv4();
      
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('hashUtils.string.hashStringSHA256', () => {
    it('should hash string with SHA256', () => {
      const input = 'test string';
      const hash = hashUtils.string.hashStringSHA256(input);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(input);
      expect(hash).toMatch(/^[a-f0-9]{64}$/i); // SHA256 hex format
    });

    it('should hash same string consistently', () => {
      const input = 'consistent test string';
      const hash1 = hashUtils.string.hashStringSHA256(input);
      const hash2 = hashUtils.string.hashStringSHA256(input);
      
      expect(hash1).toBe(hash2);
    });

    it('should hash different strings differently', () => {
      const input1 = 'string 1';
      const input2 = 'string 2';
      const hash1 = hashUtils.string.hashStringSHA256(input1);
      const hash2 = hashUtils.string.hashStringSHA256(input2);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', () => {
      const input = '';
      const hash = hashUtils.string.hashStringSHA256(input);
      
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^[a-f0-9]{64}$/i);
    });

    it('should handle special characters', () => {
      const input = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = hashUtils.string.hashStringSHA256(input);
      
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^[a-f0-9]{64}$/i);
    });
  });

  describe('hashUtils.secure.generateSecureToken (default)', () => {
    it('should generate secure token', () => {
      const token = hashUtils.secure.generateSecureToken();
      
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate different tokens each time', () => {
      const token1 = hashUtils.secure.generateSecureToken();
      const token2 = hashUtils.secure.generateSecureToken();
      
      expect(token1).not.toBe(token2);
    });

    it('should generate token of reasonable length', () => {
      const token = hashUtils.secure.generateSecureToken();
      
      expect(token.length).toBeGreaterThan(10);
      expect(token.length).toBeLessThan(100);
    });
  });

  describe('hashUtils.secure.generateVerificationCode', () => {
    it('should generate verification code', () => {
      const code = hashUtils.secure.generateVerificationCode();
      
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThan(0);
    });

    it('should generate different codes each time', () => {
      const code1 = hashUtils.secure.generateVerificationCode();
      const code2 = hashUtils.secure.generateVerificationCode();
      
      expect(code1).not.toBe(code2);
    });

    it('should generate numeric code', () => {
      const code = hashUtils.secure.generateVerificationCode();
      
      expect(code).toMatch(/^\d+$/);
    });

    it('should generate code of reasonable length', () => {
      const code = hashUtils.secure.generateVerificationCode();
      
      expect(code.length).toBeGreaterThan(3);
      expect(code.length).toBeLessThan(10);
    });
  });
});

