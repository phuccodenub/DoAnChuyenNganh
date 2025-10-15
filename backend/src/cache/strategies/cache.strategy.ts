/**
 * Cache Strategy Interface
 * Defines the contract for different caching strategies
 */

export interface CacheStrategy {
  /**
   * Get value from cache
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Delete value from cache
   */
  delete(key: string): Promise<void>;

  /**
   * Check if key exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Clear all cache
   */
  clear(): Promise<void>;

  /**
   * Get multiple values
   */
  mget<T>(keys: string[]): Promise<(T | null)[]>;

  /**
   * Set multiple values
   */
  mset<T>(keyValuePairs: Array<{ key: string; value: T; ttl?: number }>): Promise<void>;

  /**
   * Delete multiple keys
   */
  mdel(keys: string[]): Promise<void>;

  /**
   * Get cache statistics
   */
  getStats(): Promise<CacheStats>;

  /**
   * Get keys by pattern
   */
  getKeysByPattern?(pattern: string): Promise<string[]>;

  /**
   * Get TTL for a key
   */
  getTTL?(key: string): Promise<number>;

  /**
   * Set TTL for a key
   */
  setTTL?(key: string, ttl: number): Promise<void>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  memoryUsage: number;
  evictions: number;
  lastCleanup: Date;
}

export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  evictionPolicy?: 'lru' | 'lfu' | 'fifo' | 'ttl';
  compression?: boolean;
  serialization?: 'json' | 'binary' | 'string';
}

export interface CacheKeyOptions {
  prefix?: string;
  namespace?: string;
  version?: string;
  tags?: string[];
}

export interface CacheMetadata {
  key: string;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  lastAccessed: Date;
  size: number;
  tags: string[];
}

