/**
 * Redis Cache Strategy
 * Implements cache operations using Redis
 */

import { redisClient } from '../../config/redis.config';
import logger from '../../utils/logger.util';
import { CacheStrategy, CacheStats, CacheOptions, CacheKeyOptions, CacheMetadata } from './cache.strategy';

export class RedisCacheStrategy implements CacheStrategy {
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    memoryUsage: 0,
    evictions: 0,
    lastCleanup: new Date()
  };

  private options: CacheOptions;
  private keyOptions: CacheKeyOptions;

  constructor(options: CacheOptions = {}, keyOptions: CacheKeyOptions = {}) {
    this.options = {
      ttl: 3600, // 1 hour default
      maxSize: 10000,
      evictionPolicy: 'lru',
      compression: false,
      serialization: 'json',
      ...options
    };

    this.keyOptions = {
      prefix: 'lms',
      namespace: 'cache',
      version: 'v1',
      tags: [],
      ...keyOptions
    };
  }

  /**
   * Get value from cache
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.buildKey(key);
      const value = await redisClient.get(cacheKey);
      
      if (value === null) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      // Update access metadata
      await this.updateAccessMetadata(cacheKey);
      
      this.stats.hits++;
      this.updateHitRate();
      
      return this.deserialize(value);
    } catch (error: unknown) {
      logger.error('Redis cache get error', { key, error: (error as Error).message });
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Set value in cache
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const cacheKey = this.buildKey(key);
      const serializedValue = this.serialize(value);
      const cacheTtl = ttl || this.options.ttl!;
      
      await redisClient.setEx(cacheKey, cacheTtl, serializedValue);
      
      // Store metadata
      await this.storeMetadata(cacheKey, cacheTtl);
      
      this.stats.size++;
    } catch (error: unknown) {
      logger.error('Redis cache set error', { key, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Delete value from cache
   */
  public async delete(key: string): Promise<void> {
    try {
      const cacheKey = this.buildKey(key);
      await redisClient.del(cacheKey);
      
      // Delete metadata
      await redisClient.del(`${cacheKey}:meta`);
      
      this.stats.size = Math.max(0, this.stats.size - 1);
    } catch (error: unknown) {
      logger.error('Redis cache delete error', { key, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const cacheKey = this.buildKey(key);
      const exists = await redisClient.exists(cacheKey);
      return exists === 1;
    } catch (error: unknown) {
      logger.error('Redis cache exists error', { key, error: (error as Error).message });
      return false;
    }
  }

  /**
   * Clear all cache
   */
  public async clear(): Promise<void> {
    try {
      const pattern = this.buildKey('*');
      const keys = await redisClient.keys(pattern);
      
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      
      this.stats.size = 0;
      this.stats.evictions += keys.length;
      
      logger.info('Redis cache cleared', { keysCount: keys.length });
    } catch (error: unknown) {
      logger.error('Redis cache clear error', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get multiple values
   */
  public async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const cacheKeys = keys.map(key => this.buildKey(key));
      const values = await redisClient.mget(cacheKeys);
      
      if (!values || !Array.isArray(values)) {
        return keys.map(() => null);
      }
      
      return values.map((value, index) => {
        if (value === null) {
          this.stats.misses++;
          return null;
        }
        
        this.stats.hits++;
        return this.deserialize(value as string);
      });
    } catch (error: unknown) {
      logger.error('Redis cache mget error', { keys, error: (error as Error).message });
      return keys.map(() => null);
    } finally {
      this.updateHitRate();
    }
  }

  /**
   * Set multiple values
   */
  public async mset<T>(keyValuePairs: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    try {
      const pipeline = (redisClient as any).pipeline();
      
      for (const { key, value, ttl } of keyValuePairs) {
        const cacheKey = this.buildKey(key);
        const serializedValue = this.serialize(value);
        const cacheTtl = ttl || this.options.ttl!;
        
        pipeline.setEx(cacheKey, cacheTtl, serializedValue);
        this.storeMetadata(cacheKey, cacheTtl);
      }
      
      await pipeline.exec();
      this.stats.size += keyValuePairs.length;
    } catch (error: unknown) {
      logger.error('Redis cache mset error', { keyValuePairs, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Delete multiple keys
   */
  public async mdel(keys: string[]): Promise<void> {
    try {
      const cacheKeys = keys.map(key => this.buildKey(key));
      await redisClient.del(cacheKeys);
      
      // Delete metadata
      const metaKeys = cacheKeys.map(key => `${key}:meta`);
      await redisClient.del(metaKeys);
      
      this.stats.size = Math.max(0, this.stats.size - keys.length);
    } catch (error: unknown) {
      logger.error('Redis cache mdel error', { keys, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  public async getStats(): Promise<CacheStats> {
    try {
      // Get Redis memory usage
      const info = await redisClient.info('memory');
      const memoryMatch = info.match(/used_memory:(\d+)/);
      this.stats.memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : 0;
      
      // Get key count
      const pattern = this.buildKey('*');
      const keys = await redisClient.keys(pattern);
      this.stats.size = keys.length;
      
      return { ...this.stats };
    } catch (error: unknown) {
      logger.error('Redis cache stats error', { error: (error as Error).message });
      return { ...this.stats };
    }
  }

  /**
   * Build cache key with prefix, namespace, and version
   */
  private buildKey(key: string): string {
    const parts = [
      this.keyOptions.prefix,
      this.keyOptions.namespace,
      this.keyOptions.version,
      key
    ].filter(Boolean);
    
    return parts.join(':');
  }

  /**
   * Serialize value based on strategy
   */
  private serialize<T>(value: T): string {
    switch (this.options.serialization) {
      case 'json':
        return JSON.stringify(value);
      case 'string':
        return String(value);
      case 'binary':
        return Buffer.from(JSON.stringify(value)).toString('base64');
      default:
        return JSON.stringify(value);
    }
  }

  /**
   * Deserialize value based on strategy
   */
  private deserialize<T>(value: string): T {
    switch (this.options.serialization) {
      case 'json':
        return JSON.parse(value);
      case 'string':
        return value as T;
      case 'binary':
        return JSON.parse(Buffer.from(value, 'base64').toString());
      default:
        return JSON.parse(value);
    }
  }

  /**
   * Store metadata for cache key
   */
  private async storeMetadata(key: string, ttl: number): Promise<void> {
    try {
      const metadata: CacheMetadata = {
        key,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + ttl * 1000),
        accessCount: 0,
        lastAccessed: new Date(),
        size: 0,
        tags: this.keyOptions.tags || []
      };
      
      await redisClient.setEx(`${key}:meta`, ttl, JSON.stringify(metadata));
    } catch (error: unknown) {
      logger.error('Redis cache metadata store error', { key, error: (error as Error).message });
    }
  }

  /**
   * Update access metadata
   */
  private async updateAccessMetadata(key: string): Promise<void> {
    try {
      const metaKey = `${key}:meta`;
      const metadataStr = await redisClient.get(metaKey);
      
      if (metadataStr) {
        const metadata: CacheMetadata = JSON.parse(metadataStr);
        metadata.accessCount++;
        metadata.lastAccessed = new Date();
        
        await redisClient.setEx(metaKey, await redisClient.ttl(key), JSON.stringify(metadata));
      }
    } catch (error: unknown) {
      logger.error('Redis cache metadata update error', { key, error: (error as Error).message });
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Get keys by pattern
   */
  public async getKeysByPattern(pattern: string): Promise<string[]> {
    try {
      const fullPattern = this.buildKey(pattern);
      return await redisClient.keys(fullPattern);
    } catch (error: unknown) {
      logger.error('Redis cache keys pattern error', { pattern, error: (error as Error).message });
      return [];
    }
  }

  /**
   * Get TTL for key
   */
  public async getTTL(key: string): Promise<number> {
    try {
      const cacheKey = this.buildKey(key);
      return await redisClient.ttl(cacheKey);
    } catch (error: unknown) {
      logger.error('Redis cache TTL error', { key, error: (error as Error).message });
      return -1;
    }
  }

  /**
   * Set TTL for key
   */
  public async setTTL(key: string, ttl: number): Promise<void> {
    try {
      const cacheKey = this.buildKey(key);
      await redisClient.expire(cacheKey, ttl);
    } catch (error: unknown) {
      logger.error('Redis cache set TTL error', { key, ttl, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Increment counter
   */
  public async increment(key: string, value: number = 1): Promise<number> {
    try {
      const cacheKey = this.buildKey(key);
      return Number(await redisClient.incrby(cacheKey, value));
    } catch (error: unknown) {
      logger.error('Redis cache increment error', { key, value, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Decrement counter
   */
  public async decrement(key: string, value: number = 1): Promise<number> {
    try {
      const cacheKey = this.buildKey(key);
      return Number(await redisClient.decrby(cacheKey, value));
    } catch (error: unknown) {
      logger.error('Redis cache decrement error', { key, value, error: (error as Error).message });
      throw error;
    }
  }
}

