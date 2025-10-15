/**
 * Hybrid Cache Strategy
 * Combines memory and Redis caching for optimal performance
 */

import logger from '../../utils/logger.util';
import { CacheStrategy, CacheStats, CacheOptions, CacheKeyOptions } from './cache.strategy';
import { RedisCacheStrategy } from './redis.strategy';
import { MemoryCacheStrategy } from './memory.strategy';

export interface HybridCacheOptions extends CacheOptions {
  memorySize?: number;
  memoryTTL?: number;
  redisTTL?: number;
  fallbackToRedis?: boolean;
  writeThrough?: boolean;
  writeBehind?: boolean;
}

export class HybridCacheStrategy implements CacheStrategy {
  private memoryCache: MemoryCacheStrategy;
  private redisCache: RedisCacheStrategy;
  private options: HybridCacheOptions;

  constructor(options: HybridCacheOptions = {}) {
    this.options = {
      memorySize: 1000,
      memoryTTL: 300, // 5 minutes
      redisTTL: 3600, // 1 hour
      fallbackToRedis: true,
      writeThrough: true,
      writeBehind: false,
      ...options
    };

    // Initialize memory cache
    this.memoryCache = new MemoryCacheStrategy({
      maxSize: this.options.memorySize,
      ttl: this.options.memoryTTL,
      evictionPolicy: 'lru'
    });

    // Initialize Redis cache
    this.redisCache = new RedisCacheStrategy({
      ttl: this.options.redisTTL
    });
  }

  /**
   * Get value from cache
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      // Try memory cache first
      const memoryValue = await this.memoryCache.get<T>(key);
      if (memoryValue !== null) {
        logger.debug('Cache hit in memory', { key });
        return memoryValue;
      }

      // Fallback to Redis
      if (this.options.fallbackToRedis) {
        const redisValue = await this.redisCache.get<T>(key);
        if (redisValue !== null) {
          // Write back to memory cache
          await this.memoryCache.set(key, redisValue, this.options.memoryTTL);
          logger.debug('Cache hit in Redis, written back to memory', { key });
          return redisValue;
        }
      }

      logger.debug('Cache miss', { key });
      return null;
    } catch (error: unknown) {
      logger.error('Hybrid cache get error', { key, error: (error as Error).message });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const cacheTtl = ttl || this.options.redisTTL!;
      const memoryTtl = Math.min(cacheTtl, this.options.memoryTTL!);

      if (this.options.writeThrough) {
        // Write to both caches simultaneously
        await Promise.all([
          this.memoryCache.set(key, value, memoryTtl),
          this.redisCache.set(key, value, cacheTtl)
        ]);
      } else if (this.options.writeBehind) {
        // Write to memory immediately, Redis asynchronously
        await this.memoryCache.set(key, value, memoryTtl);
        setImmediate(() => {
          this.redisCache.set(key, value, cacheTtl).catch(error => {
            logger.error('Write-behind Redis error', { key, error: (error as Error).message });
          });
        });
      } else {
        // Write to memory first, then Redis
        await this.memoryCache.set(key, value, memoryTtl);
        await this.redisCache.set(key, value, cacheTtl);
      }

      logger.debug('Cache set completed', { key });
    } catch (error: unknown) {
      logger.error('Hybrid cache set error', { key, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Delete value from cache
   */
  public async delete(key: string): Promise<void> {
    try {
      await Promise.all([
        this.memoryCache.delete(key),
        this.redisCache.delete(key)
      ]);

      logger.debug('Cache delete completed', { key });
    } catch (error: unknown) {
      logger.error('Hybrid cache delete error', { key, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  public async exists(key: string): Promise<boolean> {
    try {
      // Check memory first
      const memoryExists = await this.memoryCache.exists(key);
      if (memoryExists) {
        return true;
      }

      // Check Redis
      if (this.options.fallbackToRedis) {
        return await this.redisCache.exists(key);
      }

      return false;
    } catch (error: unknown) {
      logger.error('Hybrid cache exists error', { key, error: (error as Error).message });
      return false;
    }
  }

  /**
   * Clear all cache
   */
  public async clear(): Promise<void> {
    try {
      await Promise.all([
        this.memoryCache.clear(),
        this.redisCache.clear()
      ]);

      logger.info('Hybrid cache cleared');
    } catch (error: unknown) {
      logger.error('Hybrid cache clear error', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get multiple values
   */
  public async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const results: (T | null)[] = [];
      const missingKeys: string[] = [];

      // Try memory cache first
      const memoryResults = await this.memoryCache.mget<T>(keys);
      
      for (let i = 0; i < keys.length; i++) {
        if (memoryResults[i] !== null) {
          results[i] = memoryResults[i];
        } else {
          missingKeys.push(keys[i]);
        }
      }

      // Get missing keys from Redis
      if (missingKeys.length > 0 && this.options.fallbackToRedis) {
        const redisResults = await this.redisCache.mget<T>(missingKeys);
        
        // Write back to memory cache
        const writeBackPromises: Promise<void>[] = [];
        for (let i = 0; i < missingKeys.length; i++) {
          if (redisResults[i] !== null) {
            const keyIndex = keys.indexOf(missingKeys[i]);
            results[keyIndex] = redisResults[i];
            
            writeBackPromises.push(
              this.memoryCache.set(missingKeys[i], redisResults[i]!, this.options.memoryTTL)
            );
          }
        }
        
        await Promise.all(writeBackPromises);
      }

      return results;
    } catch (error: unknown) {
      logger.error('Hybrid cache mget error', { keys, error: (error as Error).message });
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple values
   */
  public async mset<T>(keyValuePairs: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    try {
      const memoryPairs = keyValuePairs.map(({ key, value, ttl }) => ({
        key,
        value,
        ttl: Math.min(ttl || this.options.redisTTL!, this.options.memoryTTL!)
      }));

      const redisPairs = keyValuePairs.map(({ key, value, ttl }) => ({
        key,
        value,
        ttl: ttl || this.options.redisTTL!
      }));

      if (this.options.writeThrough) {
        await Promise.all([
          this.memoryCache.mset(memoryPairs),
          this.redisCache.mset(redisPairs)
        ]);
      } else {
        await this.memoryCache.mset(memoryPairs);
        await this.redisCache.mset(redisPairs);
      }

      logger.debug('Hybrid cache mset completed', { count: keyValuePairs.length });
    } catch (error: unknown) {
      logger.error('Hybrid cache mset error', { keyValuePairs, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Delete multiple keys
   */
  public async mdel(keys: string[]): Promise<void> {
    try {
      await Promise.all([
        this.memoryCache.mdel(keys),
        this.redisCache.mdel(keys)
      ]);

      logger.debug('Hybrid cache mdel completed', { count: keys.length });
    } catch (error: unknown) {
      logger.error('Hybrid cache mdel error', { keys, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  public async getStats(): Promise<CacheStats> {
    try {
      const [memoryStats, redisStats] = await Promise.all([
        this.memoryCache.getStats(),
        this.redisCache.getStats()
      ]);

      return {
        hits: memoryStats.hits + redisStats.hits,
        misses: memoryStats.misses + redisStats.misses,
        hitRate: (memoryStats.hits + redisStats.hits) / (memoryStats.hits + redisStats.hits + memoryStats.misses + redisStats.misses),
        size: memoryStats.size + redisStats.size,
        memoryUsage: memoryStats.memoryUsage + redisStats.memoryUsage,
        evictions: memoryStats.evictions + redisStats.evictions,
        lastCleanup: new Date()
      };
    } catch (error: unknown) {
      logger.error('Hybrid cache stats error', { error: (error as Error).message });
      return {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        memoryUsage: 0,
        evictions: 0,
        lastCleanup: new Date()
      };
    }
  }

  /**
   * Get keys by pattern
   */
  public async getKeysByPattern(pattern: string): Promise<string[]> {
    try {
      const [memoryKeys, redisKeys] = await Promise.all([
        this.memoryCache.getKeysByPattern(pattern),
        this.redisCache.getKeysByPattern(pattern)
      ]);

      // Combine and deduplicate
      const allKeys = new Set([...memoryKeys, ...redisKeys]);
      return Array.from(allKeys);
    } catch (error: unknown) {
      logger.error('Hybrid cache keys pattern error', { pattern, error: (error as Error).message });
      return [];
    }
  }

  /**
   * Get TTL for key
   */
  public async getTTL(key: string): Promise<number> {
    try {
      // Check memory first
      const memoryTTL = await this.memoryCache.getTTL(key);
      if (memoryTTL > 0) {
        return memoryTTL;
      }

      // Check Redis
      if (this.options.fallbackToRedis) {
        return await this.redisCache.getTTL(key);
      }

      return -1;
    } catch (error: unknown) {
      logger.error('Hybrid cache TTL error', { key, error: (error as Error).message });
      return -1;
    }
  }

  /**
   * Set TTL for key
   */
  public async setTTL(key: string, ttl: number): Promise<void> {
    try {
      const memoryTtl = Math.min(ttl, this.options.memoryTTL!);
      
      await Promise.all([
        this.memoryCache.setTTL(key, memoryTtl),
        this.redisCache.setTTL(key, ttl)
      ]);
    } catch (error: unknown) {
      logger.error('Hybrid cache set TTL error', { key, ttl, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Warm up cache with frequently accessed data
   */
  public async warmUp(data: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      logger.info('Starting cache warm-up', { count: data.length });
      
      const promises = data.map(({ key, value, ttl }) => this.set(key, value, ttl));
      await Promise.all(promises);
      
      logger.info('Cache warm-up completed', { count: data.length });
    } catch (error: unknown) {
      logger.error('Cache warm-up error', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Preload data into memory cache
   */
  public async preloadToMemory(keys: string[]): Promise<void> {
    try {
      logger.info('Starting memory preload', { count: keys.length });
      
      const redisValues = await this.redisCache.mget(keys);
      const preloadPromises: Promise<void>[] = [];
      
      for (let i = 0; i < keys.length; i++) {
        if (redisValues[i] !== null) {
          preloadPromises.push(
            this.memoryCache.set(keys[i], redisValues[i], this.options.memoryTTL)
          );
        }
      }
      
      await Promise.all(preloadPromises);
      
      logger.info('Memory preload completed', { count: preloadPromises.length });
    } catch (error: unknown) {
      logger.error('Memory preload error', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Stop cleanup timers
   */
  public stop(): void {
    this.memoryCache.stop();
  }
}

