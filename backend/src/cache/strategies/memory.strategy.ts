/**
 * Memory Cache Strategy
 * Implements in-memory caching with LRU eviction
 */

import logger from '../../utils/logger.util';
import { CacheStrategy, CacheStats, CacheOptions, CacheKeyOptions, CacheMetadata } from './cache.strategy';

interface CacheEntry<T> {
  value: T;
  metadata: CacheMetadata;
  next?: CacheEntry<T>;
  prev?: CacheEntry<T>;
}

export class MemoryCacheStrategy implements CacheStrategy {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private head: CacheEntry<any> | null = null;
  private tail: CacheEntry<any> | null = null;
  
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
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options: CacheOptions = {}, keyOptions: CacheKeyOptions = {}) {
    this.options = {
      ttl: 3600, // 1 hour default
      maxSize: 1000,
      evictionPolicy: 'lru',
      compression: false,
      serialization: 'json',
      ...options
    };

    this.keyOptions = {
      prefix: 'lms',
      namespace: 'memory',
      version: 'v1',
      tags: [],
      ...keyOptions
    };

    this.startCleanupTimer();
  }

  /**
   * Get value from cache
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.buildKey(key);
      const entry = this.cache.get(cacheKey);
      
      if (!entry) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      // Check if expired
      if (this.isExpired(entry.metadata)) {
        this.delete(cacheKey);
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      // Move to head (LRU)
      this.moveToHead(entry);
      
      // Update access metadata
      entry.metadata.accessCount++;
      entry.metadata.lastAccessed = new Date();
      
      this.stats.hits++;
      this.updateHitRate();
      
      return entry.value;
    } catch (error: unknown) {
      logger.error('Memory cache get error', { key, error: (error as Error).message });
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
      const cacheTtl = ttl || this.options.ttl!;
      
      // Check if we need to evict
      if (this.cache.size >= this.options.maxSize!) {
        await this.evict();
      }
      
      const metadata: CacheMetadata = {
        key: cacheKey,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + cacheTtl * 1000),
        accessCount: 0,
        lastAccessed: new Date(),
        size: this.calculateSize(value),
        tags: this.keyOptions.tags || []
      };
      
      const entry: CacheEntry<T> = {
        value,
        metadata
      };
      
      // Remove existing entry if it exists
      if (this.cache.has(cacheKey)) {
        this.removeFromList(this.cache.get(cacheKey)!);
      }
      
      // Add to cache and list
      this.cache.set(cacheKey, entry);
      this.addToHead(entry);
      
      this.stats.size = this.cache.size;
      this.updateMemoryUsage();
    } catch (error: unknown) {
      logger.error('Memory cache set error', { key, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Delete value from cache
   */
  public async delete(key: string): Promise<void> {
    try {
      const cacheKey = this.buildKey(key);
      const entry = this.cache.get(cacheKey);
      
      if (entry) {
        this.cache.delete(cacheKey);
        this.removeFromList(entry);
        this.stats.size = this.cache.size;
        this.updateMemoryUsage();
      }
    } catch (error: unknown) {
      logger.error('Memory cache delete error', { key, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const cacheKey = this.buildKey(key);
      const entry = this.cache.get(cacheKey);
      
      if (!entry) {
        return false;
      }
      
      // Check if expired
      if (this.isExpired(entry.metadata)) {
        this.delete(cacheKey);
        return false;
      }
      
      return true;
    } catch (error: unknown) {
      logger.error('Memory cache exists error', { key, error: (error as Error).message });
      return false;
    }
  }

  /**
   * Clear all cache
   */
  public async clear(): Promise<void> {
    try {
      const size = this.cache.size;
      this.cache.clear();
      this.head = null;
      this.tail = null;
      
      this.stats.size = 0;
      this.stats.evictions += size;
      this.updateMemoryUsage();
      
      logger.info('Memory cache cleared', { keysCount: size });
    } catch (error: unknown) {
      logger.error('Memory cache clear error', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get multiple values
   */
  public async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const results: (T | null)[] = [];
      
      for (const key of keys) {
        const result = await this.get<T>(key);
        results.push(result);
      }
      
      return results;
    } catch (error: unknown) {
      logger.error('Memory cache mget error', { keys, error: (error as Error).message });
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple values
   */
  public async mset<T>(keyValuePairs: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    try {
      for (const { key, value, ttl } of keyValuePairs) {
        await this.set(key, value, ttl);
      }
    } catch (error: unknown) {
      logger.error('Memory cache mset error', { keyValuePairs, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Delete multiple keys
   */
  public async mdel(keys: string[]): Promise<void> {
    try {
      for (const key of keys) {
        await this.delete(key);
      }
    } catch (error: unknown) {
      logger.error('Memory cache mdel error', { keys, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  public async getStats(): Promise<CacheStats> {
    try {
      this.updateMemoryUsage();
      return { ...this.stats };
    } catch (error: unknown) {
      logger.error('Memory cache stats error', { error: (error as Error).message });
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
   * Check if entry is expired
   */
  private isExpired(metadata: CacheMetadata): boolean {
    return new Date() > metadata.expiresAt;
  }

  /**
   * Calculate size of value
   */
  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }

  /**
   * Update memory usage
   */
  private updateMemoryUsage(): void {
    try {
      const usage = process.memoryUsage();
      this.stats.memoryUsage = usage.heapUsed;
    } catch (error: unknown) {
      logger.error('Memory cache usage update error', { error: (error as Error).message });
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
   * Add entry to head of list
   */
  private addToHead(entry: CacheEntry<any>): void {
    if (!this.head) {
      this.head = entry;
      this.tail = entry;
    } else {
      entry.next = this.head;
      this.head.prev = entry;
      this.head = entry;
    }
  }

  /**
   * Move entry to head of list
   */
  private moveToHead(entry: CacheEntry<any>): void {
    if (entry === this.head) {
      return;
    }
    
    this.removeFromList(entry);
    this.addToHead(entry);
  }

  /**
   * Remove entry from list
   */
  private removeFromList(entry: CacheEntry<any>): void {
    if (entry.prev) {
      entry.prev.next = entry.next;
    } else {
      this.head = entry.next || null;
    }
    
    if (entry.next) {
      entry.next.prev = entry.prev;
    } else {
      this.tail = entry.prev || null;
    }
    
    entry.next = undefined;
    entry.prev = undefined;
  }

  /**
   * Evict entries based on policy
   */
  private async evict(): Promise<void> {
    try {
      const evictCount = Math.ceil(this.options.maxSize! * 0.1); // Evict 10%
      
      for (let i = 0; i < evictCount && this.tail; i++) {
        const entry = this.tail;
        this.cache.delete(entry.metadata.key);
        this.removeFromList(entry);
        this.stats.evictions++;
      }
      
      this.stats.size = this.cache.size;
      this.updateMemoryUsage();
    } catch (error: unknown) {
      logger.error('Memory cache eviction error', { error: (error as Error).message });
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    try {
      const now = new Date();
      const expiredKeys: string[] = [];
      
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.metadata.expiresAt) {
          expiredKeys.push(key);
        }
      }
      
      for (const key of expiredKeys) {
        this.cache.delete(key);
        this.removeFromList(this.cache.get(key)!);
      }
      
      this.stats.size = this.cache.size;
      this.stats.lastCleanup = new Date();
      this.updateMemoryUsage();
      
      if (expiredKeys.length > 0) {
        logger.info('Memory cache cleanup completed', { expiredCount: expiredKeys.length });
      }
    } catch (error: unknown) {
      logger.error('Memory cache cleanup error', { error: (error as Error).message });
    }
  }

  /**
   * Stop cleanup timer
   */
  public stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Get keys by pattern
   */
  public async getKeysByPattern(pattern: string): Promise<string[]> {
    try {
      const fullPattern = this.buildKey(pattern);
      const regex = new RegExp(fullPattern.replace(/\*/g, '.*'));
      
      return Array.from(this.cache.keys()).filter(key => regex.test(key));
    } catch (error: unknown) {
      logger.error('Memory cache keys pattern error', { pattern, error: (error as Error).message });
      return [];
    }
  }

  /**
   * Get TTL for key
   */
  public async getTTL(key: string): Promise<number> {
    try {
      const cacheKey = this.buildKey(key);
      const entry = this.cache.get(cacheKey);
      
      if (!entry) {
        return -1;
      }
      
      if (this.isExpired(entry.metadata)) {
        return -2; // Expired
      }
      
      return Math.floor((entry.metadata.expiresAt.getTime() - Date.now()) / 1000);
    } catch (error: unknown) {
      logger.error('Memory cache TTL error', { key, error: (error as Error).message });
      return -1;
    }
  }

  /**
   * Set TTL for key
   */
  public async setTTL(key: string, ttl: number): Promise<void> {
    try {
      const cacheKey = this.buildKey(key);
      const entry = this.cache.get(cacheKey);
      
      if (entry) {
        entry.metadata.expiresAt = new Date(Date.now() + ttl * 1000);
      }
    } catch (error: unknown) {
      logger.error('Memory cache set TTL error', { key, ttl, error: (error as Error).message });
      throw error;
    }
  }
}

