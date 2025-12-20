/**
 * AI Cache Service
 * Redis caching cho AI responses
 */

import { createClient, RedisClientType } from 'redis';
import logger from '../../../utils/logger.util';
import crypto from 'crypto';

export class AICacheService {
  private client: RedisClientType | null = null;
  private connected: boolean = false;
  private readonly keyPrefix = 'ai:cache:';
  private readonly defaultTTL = 3600; // 1 hour

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = createClient({
        url: redisUrl,
        database: 3, // Use database 3 for AI cache
      });

      this.client.on('error', (err) => {
        logger.error('[AICacheService] Redis error:', err);
        this.connected = false;
      });

      this.client.on('connect', () => {
        this.connected = true;
        logger.info('[AICacheService] Connected to Redis');
      });

      await this.client.connect();
    } catch (error) {
      logger.warn('[AICacheService] Redis not available, caching disabled');
      this.client = null;
      this.connected = false;
    }
  }

  /**
   * Generate cache key from prompt
   */
  private generateKey(prompt: string, context?: any): string {
    const data = JSON.stringify({ prompt, context });
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return `${this.keyPrefix}${hash}`;
  }

  /**
   * Get cached response
   */
  async get(prompt: string, context?: any): Promise<string | null> {
    if (!this.connected || !this.client) {
      return null;
    }

    try {
      const key = this.generateKey(prompt, context);
      const cached = await this.client.get(key);
      
      if (cached) {
        logger.debug(`[AICacheService] Cache hit for prompt: "${prompt.substring(0, 50)}..."`);
        return cached;
      }
      
      return null;
    } catch (error) {
      logger.error('[AICacheService] Error getting cached response:', error);
      return null;
    }
  }

  /**
   * Set cached response
   */
  async set(prompt: string, response: string, context?: any, ttl: number = this.defaultTTL): Promise<void> {
    if (!this.connected || !this.client) {
      return;
    }

    try {
      const key = this.generateKey(prompt, context);
      await this.client.setEx(key, ttl, response);
      
      logger.debug(`[AICacheService] Cached response for prompt: "${prompt.substring(0, 50)}..."`);
    } catch (error) {
      logger.error('[AICacheService] Error caching response:', error);
    }
  }

  /**
   * Clear all AI cache
   */
  async clearAll(): Promise<void> {
    if (!this.connected || !this.client) {
      return;
    }

    try {
      const keys = await this.client.keys(`${this.keyPrefix}*`);
      
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.info(`[AICacheService] Cleared ${keys.length} cached responses`);
      }
    } catch (error) {
      logger.error('[AICacheService] Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ totalKeys: number; memoryUsed: string }> {
    if (!this.connected || !this.client) {
      return { totalKeys: 0, memoryUsed: '0' };
    }

    try {
      const keys = await this.client.keys(`${this.keyPrefix}*`);
      const info = await this.client.info('memory');
      
      // Parse used_memory from info
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memoryUsed = memoryMatch ? memoryMatch[1] : '0';

      return {
        totalKeys: keys.length,
        memoryUsed,
      };
    } catch (error) {
      logger.error('[AICacheService] Error getting stats:', error);
      return { totalKeys: 0, memoryUsed: '0' };
    }
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    return this.connected;
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
      logger.info('[AICacheService] Disconnected from Redis');
    }
  }
}

// Singleton instance
export const aiCacheService = new AICacheService();
