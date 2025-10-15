/**
 * Redis Metrics Collection
 * Tracks Redis operations, cache hits/misses, and performance metrics
 */

import { RedisClientType } from 'redis';
import { MetricsService } from './metrics.service';
import logger from '../../utils/logger.util';

export class RedisMetrics {
  private metricsService: MetricsService;
  private redisClient: RedisClientType;
  private operationTimers: Map<string, number> = new Map();

  constructor(metricsService: MetricsService, redisClient: RedisClientType) {
    this.metricsService = metricsService;
    this.redisClient = redisClient;
    this.setupRedisHooks();
  }

  /**
   * Setup Redis operation hooks
   */
  private setupRedisHooks(): void {
    // Track Redis operations
    const originalSendCommand = this.redisClient.sendCommand.bind(this.redisClient);
    
    this.redisClient.sendCommand = async (command: any, ...args: any[]) => {
      const startTime = Date.now();
      const operation = command.name || command[0] || 'unknown';
      
      try {
        const result = await originalSendCommand(command, ...args);
        
        const duration = Date.now() - startTime;
        this.recordRedisOperation(operation, duration, 'success');
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        this.recordRedisOperation(operation, duration, 'error', error);
        throw error;
      }
    };
  }

  /**
   * Record Redis operation metrics
   */
  private recordRedisOperation(
    operation: string, 
    duration: number, 
    status: 'success' | 'error',
    error?: any
  ): void {
    // Increment operation counter
    this.metricsService.incrementCounter('redis_operations_total', {
      operation: operation.toLowerCase(),
      status
    });

    // Record operation duration
    this.metricsService.recordHistogram('redis_operation_duration_seconds', duration / 1000, {
      operation: operation.toLowerCase(),
      status
    });

    // Track specific operation types
    switch (operation.toLowerCase()) {
      case 'get':
        this.metricsService.incrementCounter('redis_get_operations_total', { status });
        break;
      case 'set':
        this.metricsService.incrementCounter('redis_set_operations_total', { status });
        break;
      case 'del':
        this.metricsService.incrementCounter('redis_del_operations_total', { status });
        break;
      case 'exists':
        this.metricsService.incrementCounter('redis_exists_operations_total', { status });
        break;
      case 'expire':
        this.metricsService.incrementCounter('redis_expire_operations_total', { status });
        break;
      case 'keys':
        this.metricsService.incrementCounter('redis_keys_operations_total', { status });
        break;
      case 'flushdb':
        this.metricsService.incrementCounter('redis_flushdb_operations_total', { status });
        break;
    }

    // Track errors
    if (status === 'error' && error) {
      this.metricsService.incrementCounter('redis_errors_total', {
        operation: operation.toLowerCase(),
        error_type: error.name || 'unknown'
      });

      logger.warn('Redis operation failed', {
        operation,
        duration,
        error: error.message,
        errorType: error.name
      });
    }
  }

  /**
   * Track cache hit
   */
  public trackCacheHit(cacheType: 'memory' | 'redis', key?: string): void {
    this.metricsService.incrementCounter(`${cacheType}_cache_hits_total`);
    
    if (key) {
      this.metricsService.incrementCounter('cache_hits_total', {
        cache_type: cacheType,
        key_pattern: this.extractKeyPattern(key)
      });
    }
  }

  /**
   * Track cache miss
   */
  public trackCacheMiss(cacheType: 'memory' | 'redis', key?: string): void {
    this.metricsService.incrementCounter(`${cacheType}_cache_misses_total`);
    
    if (key) {
      this.metricsService.incrementCounter('cache_misses_total', {
        cache_type: cacheType,
        key_pattern: this.extractKeyPattern(key)
      });
    }
  }

  /**
   * Track cache set operation
   */
  public trackCacheSet(cacheType: 'memory' | 'redis', key: string, ttl?: number): void {
    this.metricsService.incrementCounter(`${cacheType}_cache_sets_total`);
    
    this.metricsService.incrementCounter('cache_sets_total', {
      cache_type: cacheType,
      key_pattern: this.extractKeyPattern(key),
      has_ttl: ttl ? 'true' : 'false'
    });
  }

  /**
   * Track cache delete operation
   */
  public trackCacheDelete(cacheType: 'memory' | 'redis', key: string): void {
    this.metricsService.incrementCounter(`${cacheType}_cache_deletes_total`);
    
    this.metricsService.incrementCounter('cache_deletes_total', {
      cache_type: cacheType,
      key_pattern: this.extractKeyPattern(key)
    });
  }

  /**
   * Track cache clear operation
   */
  public trackCacheClear(cacheType: 'memory' | 'redis'): void {
    this.metricsService.incrementCounter(`${cacheType}_cache_clears_total`);
    
    this.metricsService.incrementCounter('cache_clears_total', {
      cache_type: cacheType
    });
  }

  /**
   * Extract key pattern from cache key
   */
  private extractKeyPattern(key: string): string {
    // Mask dynamic parts of cache keys
    return key
      .replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, ':uuid')
      .replace(/\b\d+\b/g, ':id')
      .replace(/[a-zA-Z0-9]{32,}/g, ':hash')
      .substring(0, 50); // Limit length
  }

  /**
   * Track Redis memory usage
   */
  public async trackMemoryUsage(): Promise<void> {
    try {
      const info = await this.redisClient.info('memory');
      const lines = info.split('\r\n');
      
      for (const line of lines) {
        if (line.includes('used_memory:')) {
          const memory = parseInt(line.split(':')[1]);
          this.metricsService.setGauge('redis_memory_used_bytes', memory);
        } else if (line.includes('used_memory_peak:')) {
          const peakMemory = parseInt(line.split(':')[1]);
          this.metricsService.setGauge('redis_memory_peak_bytes', peakMemory);
        } else if (line.includes('used_memory_rss:')) {
          const rssMemory = parseInt(line.split(':')[1]);
          this.metricsService.setGauge('redis_memory_rss_bytes', rssMemory);
        }
      }
    } catch (error) {
      logger.error('Failed to track Redis memory usage', { error: error.message });
    }
  }

  /**
   * Track Redis key count
   */
  public async trackKeyCount(): Promise<void> {
    try {
      const keyCount = await this.redisClient.dbSize();
      this.metricsService.setGauge('redis_keys_total', keyCount);
    } catch (error) {
      logger.error('Failed to track Redis key count', { error: error.message });
    }
  }

  /**
   * Start periodic Redis metrics collection
   */
  public startPeriodicCollection(): void {
    // Collect Redis metrics every 30 seconds
    const timer = setInterval(async () => {
      await Promise.all([
        this.trackMemoryUsage(),
        this.trackKeyCount()
      ]);
    }, 30000);
    // Prevent keeping process alive
    (timer as unknown as { unref?: () => void }).unref?.();
  }

  /**
   * Get Redis metrics summary
   */
  public getRedisMetrics(): {
    operations: { total: number; byType: Record<string, number>; errors: number };
    cache: { hits: number; misses: number; hitRatio: number };
    memory: { used: number; peak: number; rss: number };
    keys: number;
  } {
    const totalOperations = this.metricsService.getCounter('redis_operations_total');
    const totalErrors = this.metricsService.getCounter('redis_errors_total');
    
    const memoryHits = this.metricsService.getCounter('memory_cache_hits_total');
    const memoryMisses = this.metricsService.getCounter('memory_cache_misses_total');
    const redisHits = this.metricsService.getCounter('redis_cache_hits_total');
    const redisMisses = this.metricsService.getCounter('redis_cache_misses_total');
    
    const totalHits = memoryHits + redisHits;
    const totalMisses = memoryMisses + redisMisses;
    const hitRatio = totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses)) * 100 : 0;

    return {
      operations: {
        total: totalOperations,
        byType: this.getOperationTypeStats(),
        errors: totalErrors
      },
      cache: {
        hits: totalHits,
        misses: totalMisses,
        hitRatio
      },
      memory: {
        used: this.metricsService.getGauge('redis_memory_used_bytes'),
        peak: this.metricsService.getGauge('redis_memory_peak_bytes'),
        rss: this.metricsService.getGauge('redis_memory_rss_bytes')
      },
      keys: this.metricsService.getGauge('redis_keys_total')
    };
  }

  /**
   * Get operation type statistics
   */
  private getOperationTypeStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    const labeledCounters = this.metricsService.getLabeledCounters('redis_operations_total');
    
    for (const counter of labeledCounters) {
      const operation = counter.labels.operation || 'unknown';
      stats[operation] = (stats[operation] || 0) + counter.value;
    }
    
    return stats;
  }
}
