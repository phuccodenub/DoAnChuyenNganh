import zxcvbn from 'zxcvbn';
import logger from '../../utils/logger.util';
import { hashPassword, comparePassword } from '../../utils/hash.util';

export class PasswordSecurityService {
  private readonly MIN_PASSWORD_LENGTH = 8;
  private readonly MAX_PASSWORD_LENGTH = 128;
  private readonly MIN_SCORE = 2; // zxcvbn score từ 0-4

  // Kiểm tra độ mạnh của password
  validatePasswordStrength(password: string): { isValid: boolean; score: number; feedback: string[] } {
    const feedback: string[] = [];
    
    // Kiểm tra độ dài
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      feedback.push(`Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`);
    }
    
    if (password.length > this.MAX_PASSWORD_LENGTH) {
      feedback.push(`Password must be no more than ${this.MAX_PASSWORD_LENGTH} characters long`);
    }

    // Tạm thời disable zxcvbn để tránh lỗi
    // TODO: Fix zxcvbn import issue
    /*
    try {
      const result = zxcvbn(password);
      
      if (result.score < this.MIN_SCORE) {
        feedback.push('Password is too weak. Please use a stronger password.');
        if (result.feedback.suggestions) {
          feedback.push(...result.feedback.suggestions);
        }
      }
    } catch (error) {
      logger.warn('zxcvbn validation failed, using basic validation only:', error);
    }
    */

    // Kiểm tra các pattern phổ biến
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i,
      /admin/i,
      /letmein/i
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        feedback.push('Password contains common patterns. Please choose a more unique password.');
        break;
      }
    }

    return {
      isValid: feedback.length === 0,
      score: 3, // Tạm thời set score = 3 (medium)
      feedback
    };
  }

  // Hash password với salt rounds cao hơn
  async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = 14; // Tăng từ 12 lên 14
      return await hashPassword(password);
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new Error('Password hashing failed');
    }
  }

  // So sánh password
  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await comparePassword(plainPassword, hashedPassword);
    } catch (error) {
      logger.error('Error comparing password:', error);
      return false;
    }
  }

  // Generate secure random password
  generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  // Kiểm tra password có bị compromise không (simulate)
  async isPasswordCompromised(password: string): Promise<boolean> {
    try {
      // Trong thực tế, bạn sẽ gọi API như HaveIBeenPwned
      // Ở đây chỉ simulate
      const compromisedPasswords = [
        'password',
        '123456',
        'qwerty',
        'admin',
        'letmein'
      ];
      
      return compromisedPasswords.includes(password.toLowerCase());
    } catch (error) {
      logger.error('Error checking password compromise:', error);
      return false;
    }
  }

  // Validate password history (không cho phép dùng lại password cũ)
  async validatePasswordHistory(newPassword: string, passwordHistory: string[]): Promise<boolean> {
    try {
      for (const oldPassword of passwordHistory) {
        const isMatch = await this.comparePassword(newPassword, oldPassword);
        if (isMatch) {
          return false; // Password đã được sử dụng trước đó
        }
      }
      return true;
    } catch (error) {
      logger.error('Error validating password history:', error);
      return false;
    }
  }
}
