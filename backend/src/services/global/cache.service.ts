import { redisHelpers } from '../../config/redis.config';
import { APP_CONSTANTS } from '@constants/app.constants';
import logger from '@utils/logger.util';

export class CacheService {
  // Set cache with TTL
  async set(key: string, value: any, ttl: number = APP_CONSTANTS.SYSTEM.CACHE_TTL.MEDIUM): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'test') return; // disable redis in tests
      const serializedValue = JSON.stringify(value);
      await redisHelpers.set(key, serializedValue, ttl);
    } catch (error) {
      logger.error('Cache set error:', error);
      throw error;
    }
  }

  // Get cache
  async get<T>(key: string): Promise<T | null> {
    try {
      if (process.env.NODE_ENV === 'test') return null; // disable redis in tests
      const value = await redisHelpers.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      throw error;
    }
  }

  // Delete cache
  async delete(key: string): Promise<void> {
    try {
      if (process.env.NODE_ENV === 'test') return; // disable redis in tests
      await redisHelpers.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
      throw error;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'test') return false; // disable redis in tests
      return await redisHelpers.exists(key);
    } catch (error) {
      logger.error('Cache exists error:', error);
      throw error;
    }
  }

  // Set cache with pattern
  async setWithPattern(pattern: string, value: any, ttl?: number): Promise<void> {
    try {
      const key = this.generateCacheKey(pattern);
      await this.set(key, value, ttl);
    } catch (error) {
      logger.error('Cache set with pattern error:', error);
      throw error;
    }
  }

  // Get cache with pattern
  async getWithPattern<T>(pattern: string): Promise<T | null> {
    try {
      const key = this.generateCacheKey(pattern);
      return await this.get<T>(key);
    } catch (error) {
      logger.error('Cache get with pattern error:', error);
      throw error;
    }
  }

  // Delete cache with pattern
  async deleteWithPattern(pattern: string): Promise<void> {
    try {
      const key = this.generateCacheKey(pattern);
      await this.delete(key);
    } catch (error) {
      logger.error('Cache delete with pattern error:', error);
      throw error;
    }
  }

  // Cache user data
  async cacheUser(userId: string, userData: any): Promise<void> {
    try {
      const key = `user:${userId}`;
      await this.set(key, userData, APP_CONSTANTS.SYSTEM.CACHE_TTL.LONG);
    } catch (error) {
      logger.error('Cache user error:', error);
      throw error;
    }
  }

  // Get cached user
  async getCachedUser(userId: string): Promise<any> {
    try {
      const key = `user:${userId}`;
      return await this.get(key);
    } catch (error) {
      logger.error('Get cached user error:', error);
      throw error;
    }
  }

  // Cache course data
  async cacheCourse(courseId: string, courseData: any): Promise<void> {
    try {
      const key = `course:${courseId}`;
      await this.set(key, courseData, APP_CONSTANTS.SYSTEM.CACHE_TTL.LONG);
    } catch (error) {
      logger.error('Cache course error:', error);
      throw error;
    }
  }

  // Get cached course
  async getCachedCourse(courseId: string): Promise<any> {
    try {
      const key = `course:${courseId}`;
      return await this.get(key);
    } catch (error) {
      logger.error('Get cached course error:', error);
      throw error;
    }
  }

  // Cache session
  async cacheSession(sessionId: string, sessionData: any): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      await this.set(key, sessionData, APP_CONSTANTS.SYSTEM.CACHE_TTL.SHORT);
    } catch (error) {
      logger.error('Cache session error:', error);
      throw error;
    }
  }

  // Get cached session
  async getCachedSession(sessionId: string): Promise<any> {
    try {
      const key = `session:${sessionId}`;
      return await this.get(key);
    } catch (error) {
      logger.error('Get cached session error:', error);
      throw error;
    }
  }

  // Generate cache key
  private generateCacheKey(pattern: string): string {
    return `lms:${pattern}`;
  }

  // Clear all cache
  async clearAll(): Promise<void> {
    try {
      // In a real implementation, you would use Redis FLUSHDB or FLUSHALL
      // For now, we'll just log it
      logger.info('Clearing all cache');
    } catch (error) {
      logger.error('Clear all cache error:', error);
      throw error;
    }
  }
}
