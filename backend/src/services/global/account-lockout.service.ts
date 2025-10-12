import { CacheService } from './cache.service';
import logger from '../../utils/logger.util';

export class AccountLockoutService {
  private cacheService: CacheService;
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 phút

  constructor() {
    this.cacheService = new CacheService();
  }

  // Kiểm tra account có bị lock không
  async isAccountLocked(email: string): Promise<boolean> {
    try {
      const lockKey = `lockout:${email}`;
      const lockData = await this.cacheService.get<{ lockedUntil: Date; attempts: number }>(lockKey);
      
      if (!lockData) return false;
      
      if (new Date() < new Date(lockData.lockedUntil)) {
        return true;
      }
      
      // Lock đã hết hạn, xóa lock data
      await this.cacheService.delete(lockKey);
      return false;
    } catch (error) {
      logger.error('Error checking account lock:', error);
      return false; // Fail safe
    }
  }

  // Tăng số lần thử sai
  async incrementFailedAttempts(email: string): Promise<{ isLocked: boolean; remainingAttempts: number }> {
    try {
      const lockKey = `lockout:${email}`;
      const lockData = await this.cacheService.get<{ lockedUntil: Date; attempts: number }>(lockKey) || {
        attempts: 0,
        lockedUntil: new Date()
      };

      lockData.attempts += 1;

      if (lockData.attempts >= this.MAX_ATTEMPTS) {
        // Lock account
        lockData.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
        await this.cacheService.set(lockKey, lockData, this.LOCKOUT_DURATION / 1000);
        
        logger.warn(`Account ${email} locked due to ${lockData.attempts} failed attempts`);
        return { isLocked: true, remainingAttempts: 0 };
      }

      // Cache failed attempts for 15 minutes
      await this.cacheService.set(lockKey, lockData, 900);
      
      return { 
        isLocked: false, 
        remainingAttempts: this.MAX_ATTEMPTS - lockData.attempts 
      };
    } catch (error) {
      logger.error('Error incrementing failed attempts:', error);
      return { isLocked: false, remainingAttempts: this.MAX_ATTEMPTS };
    }
  }

  // Reset failed attempts (khi login thành công)
  async resetFailedAttempts(email: string): Promise<void> {
    try {
      const lockKey = `lockout:${email}`;
      await this.cacheService.delete(lockKey);
      logger.info(`Failed attempts reset for ${email}`);
    } catch (error) {
      logger.error('Error resetting failed attempts:', error);
    }
  }

  // Lấy thông tin lockout
  async getLockoutInfo(email: string): Promise<{ attempts: number; lockedUntil?: Date }> {
    try {
      const lockKey = `lockout:${email}`;
      const lockData = await this.cacheService.get<{ lockedUntil: Date; attempts: number }>(lockKey);
      
      if (!lockData) {
        return { attempts: 0 };
      }

      return {
        attempts: lockData.attempts,
        lockedUntil: new Date(lockData.lockedUntil)
      };
    } catch (error) {
      logger.error('Error getting lockout info:', error);
      return { attempts: 0 };
    }
  }
}
