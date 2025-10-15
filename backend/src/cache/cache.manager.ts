/**
 * Cache Manager
 * Centralized cache management with multiple strategies
 */

import logger from '../utils/logger.util';
import { CacheStrategy, CacheStats, CacheOptions, CacheKeyOptions } from './strategies/cache.strategy';
import { RedisCacheStrategy } from './strategies/redis.strategy';
import { MemoryCacheStrategy } from './strategies/memory.strategy';
import { HybridCacheStrategy, HybridCacheOptions } from './strategies/hybrid.strategy';

export type CacheStrategyType = 'redis' | 'memory' | 'hybrid';

export interface CacheManagerOptions {
  defaultStrategy: CacheStrategyType;
  strategies: {
    redis?: CacheOptions;
    memory?: CacheOptions;
    hybrid?: HybridCacheOptions;
  };
  keyOptions?: CacheKeyOptions;
  enableMetrics?: boolean;
  enableLogging?: boolean;
}

export class CacheManager {
  private strategies: Map<CacheStrategyType, CacheStrategy> = new Map();
  private defaultStrategy: CacheStrategyType;
  private options: CacheManagerOptions;
  private metrics: Map<string, number> = new Map();

  constructor(options: CacheManagerOptions) {
    this.options = {
      enableMetrics: true,
      enableLogging: true,
      ...options
    };

    this.defaultStrategy = options.defaultStrategy;
    this.initializeStrategies();
  }

  /**
   * Initialize cache strategies
   */
  private initializeStrategies(): void {
    try {
      // Initialize Redis strategy
      if (this.options.strategies.redis) {
        const redisStrategy = new RedisCacheStrategy(
          this.options.strategies.redis,
          this.options.keyOptions
        );
        this.strategies.set('redis', redisStrategy);
      }

      // Initialize Memory strategy
      if (this.options.strategies.memory) {
        const memoryStrategy = new MemoryCacheStrategy(
          this.options.strategies.memory,
          this.options.keyOptions
        );
        this.strategies.set('memory', memoryStrategy);
      }

      // Initialize Hybrid strategy
      if (this.options.strategies.hybrid) {
        const hybridStrategy = new HybridCacheStrategy(this.options.strategies.hybrid);
        this.strategies.set('hybrid', hybridStrategy);
      }

      logger.info('Cache strategies initialized', { 
        strategies: Array.from(this.strategies.keys()),
        default: this.defaultStrategy
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Cache strategy initialization error', { error: err.message });
      throw error;
    }
  }

  /**
   * Get cache strategy
   */
  private getStrategy(strategy?: CacheStrategyType): CacheStrategy {
    const strategyType = strategy || this.defaultStrategy;
    const strategyInstance = this.strategies.get(strategyType);
    
    if (!strategyInstance) {
      throw new Error(`Cache strategy '${strategyType}' not found`);
    }
    
    return strategyInstance;
  }

  /**
   * Get value from cache
   */
  public async get<T>(key: string, strategy?: CacheStrategyType): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      const cacheStrategy = this.getStrategy(strategy);
      const result = await cacheStrategy.get<T>(key);
      
      if (this.options.enableMetrics) {
        this.incrementMetric('cache_get_total');
        this.incrementMetric(result !== null ? 'cache_hits_total' : 'cache_misses_total');
      }
      
      if (this.options.enableLogging) {
        logger.debug('Cache get', { 
          key, 
          strategy: strategy || this.defaultStrategy,
          hit: result !== null,
          duration: Date.now() - startTime
        });
      }
      
      return result;
    } catch (error) {
      if (this.options.enableMetrics) {
        this.incrementMetric('cache_errors_total');
      }
      
      const err = error as Error;
      logger.error('Cache get error', { key, strategy, error: err.message });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  public async set<T>(key: string, value: T, ttl?: number, strategy?: CacheStrategyType): Promise<void> {
    const startTime = Date.now();
    
    try {
      const cacheStrategy = this.getStrategy(strategy);
      await cacheStrategy.set(key, value, ttl);
      
      if (this.options.enableMetrics) {
        this.incrementMetric('cache_set_total');
      }
      
      if (this.options.enableLogging) {
        logger.debug('Cache set', { 
          key, 
          strategy: strategy || this.defaultStrategy,
          ttl,
          duration: Date.now() - startTime
        });
      }
    } catch (error) {
      if (this.options.enableMetrics) {
        this.incrementMetric('cache_errors_total');
      }
      
      const err = error as Error;
      logger.error('Cache set error', { key, strategy, error: err.message });
      throw error;
    }
  }

  /**
   * Delete value from cache
   */
  public async delete(key: string, strategy?: CacheStrategyType): Promise<void> {
    const startTime = Date.now();
    
    try {
      const cacheStrategy = this.getStrategy(strategy);
      await cacheStrategy.delete(key);
      
      if (this.options.enableMetrics) {
        this.incrementMetric('cache_delete_total');
      }
      
      if (this.options.enableLogging) {
        logger.debug('Cache delete', { 
          key, 
          strategy: strategy || this.defaultStrategy,
          duration: Date.now() - startTime
        });
      }
    } catch (error) {
      if (this.options.enableMetrics) {
        this.incrementMetric('cache_errors_total');
      }
      
      const err = error as Error;
      logger.error('Cache delete error', { key, strategy, error: err.message });
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  public async exists(key: string, strategy?: CacheStrategyType): Promise<boolean> {
    try {
      const cacheStrategy = this.getStrategy(strategy);
      return await cacheStrategy.exists(key);
    } catch (error) {
      const err = error as Error;
      logger.error('Cache exists error', { key, strategy, error: err.message });
      return false;
    }
  }

  /**
   * Clear all cache
   */
  public async clear(strategy?: CacheStrategyType): Promise<void> {
    try {
      if (strategy) {
        const cacheStrategy = this.getStrategy(strategy);
        await cacheStrategy.clear();
      } else {
        // Clear all strategies
        const clearPromises = Array.from(this.strategies.values()).map(s => s.clear());
        await Promise.all(clearPromises);
      }
      
      if (this.options.enableMetrics) {
        this.incrementMetric('cache_clear_total');
      }
      
      logger.info('Cache cleared', { strategy: strategy || 'all' });
    } catch (error) {
      const err = error as Error;
      logger.error('Cache clear error', { strategy, error: err.message });
      throw error;
    }
  }

  /**
   * Get multiple values
   */
  public async mget<T>(keys: string[], strategy?: CacheStrategyType): Promise<(T | null)[]> {
    try {
      const cacheStrategy = this.getStrategy(strategy);
      return await cacheStrategy.mget<T>(keys);
    } catch (error) {
      const err = error as Error;
      logger.error('Cache mget error', { keys, strategy, error: err.message });
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple values
   */
  public async mset<T>(keyValuePairs: Array<{ key: string; value: T; ttl?: number }>, strategy?: CacheStrategyType): Promise<void> {
    try {
      const cacheStrategy = this.getStrategy(strategy);
      await cacheStrategy.mset(keyValuePairs);
      
      if (this.options.enableMetrics) {
        this.incrementMetric('cache_mset_total');
      }
    } catch (error) {
      const err = error as Error;
      logger.error('Cache mset error', { keyValuePairs, strategy, error: err.message });
      throw error;
    }
  }

  /**
   * Delete multiple keys
   */
  public async mdel(keys: string[], strategy?: CacheStrategyType): Promise<void> {
    try {
      const cacheStrategy = this.getStrategy(strategy);
      await cacheStrategy.mdel(keys);
      
      if (this.options.enableMetrics) {
        this.incrementMetric('cache_mdel_total');
      }
    } catch (error) {
      const err = error as Error;
      logger.error('Cache mdel error', { keys, strategy, error: err.message });
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  public async getStats(strategy?: CacheStrategyType): Promise<CacheStats> {
    try {
      if (strategy) {
        const cacheStrategy = this.getStrategy(strategy);
        return await cacheStrategy.getStats();
      } else {
        // Aggregate stats from all strategies
        const statsPromises = Array.from(this.strategies.values()).map(s => s.getStats());
        const allStats = await Promise.all(statsPromises);
        
        return allStats.reduce((acc, stats) => ({
          hits: acc.hits + stats.hits,
          misses: acc.misses + stats.misses,
          hitRate: 0, // Will be calculated
          size: acc.size + stats.size,
          memoryUsage: acc.memoryUsage + stats.memoryUsage,
          evictions: acc.evictions + stats.evictions,
          lastCleanup: new Date()
        }), {
          hits: 0,
          misses: 0,
          hitRate: 0,
          size: 0,
          memoryUsage: 0,
          evictions: 0,
          lastCleanup: new Date()
        });
      }
    } catch (error) {
      const err = error as Error;
      logger.error('Cache stats error', { strategy, error: err.message });
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
  public async getKeysByPattern(pattern: string, strategy?: CacheStrategyType): Promise<string[]> {
    try {
      const cacheStrategy = this.getStrategy(strategy);
      const fn = cacheStrategy.getKeysByPattern;
      if (fn) {
        return await fn.call(cacheStrategy, pattern);
      }
      return [];
    } catch (error) {
      const err = error as Error;
      logger.error('Cache keys pattern error', { pattern, strategy, error: err.message });
      return [];
    }
  }

  /**
   * Get TTL for key
   */
  public async getTTL(key: string, strategy?: CacheStrategyType): Promise<number> {
    try {
      const cacheStrategy = this.getStrategy(strategy);
      const fn = cacheStrategy.getTTL;
      if (fn) {
        return await fn.call(cacheStrategy, key);
      }
      return -1;
    } catch (error) {
      const err = error as Error;
      logger.error('Cache TTL error', { key, strategy, error: err.message });
      return -1;
    }
  }

  /**
   * Set TTL for key
   */
  public async setTTL(key: string, ttl: number, strategy?: CacheStrategyType): Promise<void> {
    try {
      const cacheStrategy = this.getStrategy(strategy);
      const fn = cacheStrategy.setTTL;
      if (fn) {
        await fn.call(cacheStrategy, key, ttl);
      }
    } catch (error) {
      const err = error as Error;
      logger.error('Cache set TTL error', { key, ttl, strategy, error: err.message });
      throw error;
    }
  }

  /**
   * Warm up cache
   */
  public async warmUp(data: Array<{ key: string; value: any; ttl?: number }>, strategy?: CacheStrategyType): Promise<void> {
    try {
      if (strategy === 'hybrid' || this.defaultStrategy === 'hybrid') {
        const hybridStrategy = this.getStrategy('hybrid') as HybridCacheStrategy;
        await hybridStrategy.warmUp(data);
      } else {
        const cacheStrategy = this.getStrategy(strategy);
        await cacheStrategy.mset(data);
      }
      
      logger.info('Cache warm-up completed', { count: data.length, strategy });
    } catch (error) {
      const err = error as Error;
      logger.error('Cache warm-up error', { strategy, error: err.message });
      throw error;
    }
  }

  /**
   * Preload data to memory cache
   */
  public async preloadToMemory(keys: string[]): Promise<void> {
    try {
      if (this.defaultStrategy === 'hybrid') {
        const hybridStrategy = this.getStrategy('hybrid') as HybridCacheStrategy;
        await hybridStrategy.preloadToMemory(keys);
      } else {
        logger.warn('Preload to memory only available for hybrid strategy');
      }
    } catch (error) {
      const err = error as Error;
      logger.error('Cache preload error', { error: err.message });
      throw error;
    }
  }

  /**
   * Get cache metrics
   */
  public getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Increment metric
   */
  private incrementMetric(metric: string): void {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + 1);
  }

  /**
   * Stop all strategies
   */
  public stop(): void {
    try {
      for (const strategy of this.strategies.values()) {
        if ('stop' in strategy && typeof strategy.stop === 'function') {
          strategy.stop();
        }
      }
      
      logger.info('Cache manager stopped');
    } catch (error) {
      const err = error as Error;
      logger.error('Cache manager stop error', { error: err.message });
    }
  }

  /**
   * Get available strategies
   */
  public getAvailableStrategies(): CacheStrategyType[] {
    return Array.from(this.strategies.keys()) as CacheStrategyType[];
  }

  /**
   * Switch default strategy
   */
  public switchStrategy(strategy: CacheStrategyType): void {
    if (!this.strategies.has(strategy)) {
      throw new Error(`Cache strategy '${strategy}' not available`);
    }
    
    this.defaultStrategy = strategy;
    logger.info('Default cache strategy switched', { strategy });
  }
}
