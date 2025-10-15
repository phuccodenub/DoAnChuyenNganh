/**
 * Cache Invalidation Manager
 * Manages cache invalidation patterns to ensure data consistency
 */

import logger from '../utils/logger.util';
import { CacheStrategy } from './strategies/cache.strategy';
import { MetricsService } from '../monitoring/metrics/metrics.service';

export interface InvalidationPattern {
  pattern: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dependencies: string[];
}

export interface InvalidationEvent {
  operation: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  userId?: string;
  timestamp: Date;
  affectedKeys: string[];
}

export interface CacheTag {
  name: string;
  pattern: string;
  description: string;
}

export class CacheInvalidationManager {
  private cacheStrategy: CacheStrategy;
  private metricsService: MetricsService;
  private invalidationPatterns: Map<string, InvalidationPattern> = new Map();
  private cacheTags: Map<string, CacheTag> = new Map();
  private invalidationQueue: InvalidationEvent[] = [];
  private processingQueue = false;

  constructor(cacheStrategy: CacheStrategy, metricsService: MetricsService) {
    this.cacheStrategy = cacheStrategy;
    this.metricsService = metricsService;
    this.initializePatterns();
    this.initializeTags();
  }

  /**
   * Initialize invalidation patterns
   */
  private initializePatterns(): void {
    // Course-related patterns
    this.addPattern({
      pattern: 'courses:*',
      description: 'All course-related cache',
      priority: 'high',
      dependencies: ['courses', 'enrollments', 'users']
    });

    this.addPattern({
      pattern: 'courses:list:*',
      description: 'Course listing cache',
      priority: 'high',
      dependencies: ['courses']
    });

    this.addPattern({
      pattern: 'courses:detail:*',
      description: 'Course detail cache',
      priority: 'high',
      dependencies: ['courses']
    });

    // Enrollment-related patterns
    this.addPattern({
      pattern: 'enrollments:*',
      description: 'All enrollment-related cache',
      priority: 'high',
      dependencies: ['enrollments', 'courses', 'users']
    });

    this.addPattern({
      pattern: 'enrollments:user:*',
      description: 'User enrollment cache',
      priority: 'medium',
      dependencies: ['enrollments', 'users']
    });

    this.addPattern({
      pattern: 'enrollments:course:*',
      description: 'Course enrollment cache',
      priority: 'medium',
      dependencies: ['enrollments', 'courses']
    });

    // User-related patterns
    this.addPattern({
      pattern: 'users:*',
      description: 'All user-related cache',
      priority: 'medium',
      dependencies: ['users', 'enrollments']
    });

    this.addPattern({
      pattern: 'users:profile:*',
      description: 'User profile cache',
      priority: 'medium',
      dependencies: ['users']
    });

    // API endpoint patterns
    this.addPattern({
      pattern: 'api:courses:*',
      description: 'Course API cache',
      priority: 'high',
      dependencies: ['courses']
    });

    this.addPattern({
      pattern: 'api:enrollments:*',
      description: 'Enrollment API cache',
      priority: 'high',
      dependencies: ['enrollments']
    });

    this.addPattern({
      pattern: 'api:users:*',
      description: 'User API cache',
      priority: 'medium',
      dependencies: ['users']
    });
  }

  /**
   * Initialize cache tags
   */
  private initializeTags(): void {
    this.addTag({
      name: 'courses',
      pattern: 'courses:*',
      description: 'Course-related cache entries'
    });

    this.addTag({
      name: 'enrollments',
      pattern: 'enrollments:*',
      description: 'Enrollment-related cache entries'
    });

    this.addTag({
      name: 'users',
      pattern: 'users:*',
      description: 'User-related cache entries'
    });

    this.addTag({
      name: 'api',
      pattern: 'api:*',
      description: 'API response cache entries'
    });

    this.addTag({
      name: 'public',
      pattern: 'public:*',
      description: 'Public cache entries'
    });

    this.addTag({
      name: 'user-specific',
      pattern: 'user:*',
      description: 'User-specific cache entries'
    });
  }

  /**
   * Add invalidation pattern
   */
  public addPattern(pattern: InvalidationPattern): void {
    this.invalidationPatterns.set(pattern.pattern, pattern);
    logger.info('Invalidation pattern added', { pattern: pattern.pattern, description: pattern.description });
  }

  /**
   * Add cache tag
   */
  public addTag(tag: CacheTag): void {
    this.cacheTags.set(tag.name, tag);
    logger.info('Cache tag added', { name: tag.name, pattern: tag.pattern });
  }

  /**
   * Invalidate cache by pattern
   */
  public async invalidateByPattern(pattern: string, reason?: string): Promise<void> {
    try {
      const keys = await this.cacheStrategy.getKeysByPattern(pattern);
      
      if (keys.length > 0) {
        await this.cacheStrategy.mdel(keys);
        
        // Track invalidation metrics
        this.metricsService.incrementCounter('cache_invalidations_total', {
          pattern,
          reason: reason || 'manual',
          keys_count: keys.length.toString()
        });

        logger.info('Cache invalidated by pattern', {
          pattern,
          keysCount: keys.length,
          reason
        });
      }
    } catch (error) {
      logger.error('Cache invalidation by pattern failed', {
        pattern,
        error: error.message,
        reason
      });
      throw error;
    }
  }

  /**
   * Invalidate cache by tags
   */
  public async invalidateByTags(tags: string[], reason?: string): Promise<void> {
    try {
      const keysToDelete: string[] = [];

      for (const tagName of tags) {
        const tag = this.cacheTags.get(tagName);
        if (tag) {
          const keys = await this.cacheStrategy.getKeysByPattern(tag.pattern);
          keysToDelete.push(...keys);
        }
      }

      if (keysToDelete.length > 0) {
        // Remove duplicates
        const uniqueKeys = [...new Set(keysToDelete)];
        await this.cacheStrategy.mdel(uniqueKeys);

        // Track invalidation metrics
        this.metricsService.incrementCounter('cache_invalidations_total', {
          tags: tags.join(','),
          reason: reason || 'manual',
          keys_count: uniqueKeys.length.toString()
        });

        logger.info('Cache invalidated by tags', {
          tags,
          keysCount: uniqueKeys.length,
          reason
        });
      }
    } catch (error) {
      logger.error('Cache invalidation by tags failed', {
        tags,
        error: error.message,
        reason
      });
      throw error;
    }
  }

  /**
   * Invalidate cache for specific entity
   */
  public async invalidateEntity(entity: string, entityId: string, operation: 'create' | 'update' | 'delete'): Promise<void> {
    try {
      const patterns = this.getEntityPatterns(entity);
      const keysToDelete: string[] = [];

      for (const pattern of patterns) {
        const keys = await this.cacheStrategy.getKeysByPattern(pattern);
        keysToDelete.push(...keys);
      }

      // Add specific entity key
      const entityKey = `${entity}:${entityId}`;
      keysToDelete.push(entityKey);

      if (keysToDelete.length > 0) {
        const uniqueKeys = [...new Set(keysToDelete)];
        await this.cacheStrategy.mdel(uniqueKeys);

        // Track invalidation metrics
        this.metricsService.incrementCounter('cache_invalidations_total', {
          entity,
          operation,
          keys_count: uniqueKeys.length.toString()
        });

        // Create invalidation event
        const event: InvalidationEvent = {
          operation,
          entity,
          entityId,
          timestamp: new Date(),
          affectedKeys: uniqueKeys
        };

        this.addInvalidationEvent(event);

        logger.info('Cache invalidated for entity', {
          entity,
          entityId,
          operation,
          keysCount: uniqueKeys.length
        });
      }
    } catch (error) {
      logger.error('Entity cache invalidation failed', {
        entity,
        entityId,
        operation,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Invalidate related entities
   */
  public async invalidateRelatedEntities(entity: string, entityId: string, operation: 'create' | 'update' | 'delete'): Promise<void> {
    try {
      const relatedPatterns = this.getRelatedEntityPatterns(entity);
      
      for (const relatedEntity of relatedPatterns) {
        await this.invalidateEntity(relatedEntity, '*', operation);
      }

      logger.info('Related entities cache invalidated', {
        entity,
        entityId,
        operation,
        relatedEntities: relatedPatterns
      });
    } catch (error) {
      logger.error('Related entities cache invalidation failed', {
        entity,
        entityId,
        operation,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Queue invalidation event
   */
  public queueInvalidation(event: InvalidationEvent): void {
    this.invalidationQueue.push(event);
    
    // Process queue if not already processing
    if (!this.processingQueue) {
      this.processInvalidationQueue();
    }
  }

  /**
   * Process invalidation queue
   */
  private async processInvalidationQueue(): Promise<void> {
    if (this.processingQueue) return;
    
    this.processingQueue = true;

    try {
      while (this.invalidationQueue.length > 0) {
        const event = this.invalidationQueue.shift();
        if (event) {
          await this.processInvalidationEvent(event);
        }
      }
    } catch (error) {
      logger.error('Invalidation queue processing failed', { error: error.message });
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Process single invalidation event
   */
  private async processInvalidationEvent(event: InvalidationEvent): Promise<void> {
    try {
      // Invalidate entity-specific cache
      await this.invalidateEntity(event.entity, event.entityId, event.operation);

      // Invalidate related entities
      await this.invalidateRelatedEntities(event.entity, event.entityId, event.operation);

      // Track event metrics
      this.metricsService.incrementCounter('cache_invalidation_events_total', {
        entity: event.entity,
        operation: event.operation
      });

      logger.info('Invalidation event processed', {
        entity: event.entity,
        entityId: event.entityId,
        operation: event.operation,
        affectedKeys: event.affectedKeys.length
      });
    } catch (error) {
      logger.error('Invalidation event processing failed', {
        event,
        error: error.message
      });
    }
  }

  /**
   * Get entity patterns
   */
  private getEntityPatterns(entity: string): string[] {
    const patterns: string[] = [];
    
    switch (entity) {
      case 'courses':
        patterns.push('courses:*', 'api:courses:*', 'courses:list:*', 'courses:detail:*');
        break;
      case 'enrollments':
        patterns.push('enrollments:*', 'api:enrollments:*', 'enrollments:user:*', 'enrollments:course:*');
        break;
      case 'users':
        patterns.push('users:*', 'api:users:*', 'users:profile:*');
        break;
      default:
        patterns.push(`${entity}:*`, `api:${entity}:*`);
    }
    
    return patterns;
  }

  /**
   * Get related entity patterns
   */
  private getRelatedEntityPatterns(entity: string): string[] {
    const related: string[] = [];
    
    switch (entity) {
      case 'courses':
        related.push('enrollments', 'users');
        break;
      case 'enrollments':
        related.push('courses', 'users');
        break;
      case 'users':
        related.push('enrollments');
        break;
    }
    
    return related;
  }

  /**
   * Add invalidation event
   */
  private addInvalidationEvent(event: InvalidationEvent): void {
    // Keep only recent events (last 1000)
    if (this.invalidationQueue.length > 1000) {
      this.invalidationQueue.splice(0, this.invalidationQueue.length - 1000);
    }
    
    this.invalidationQueue.push(event);
  }

  /**
   * Clear all cache
   */
  public async clearAllCache(): Promise<void> {
    try {
      await this.cacheStrategy.clear();
      
      this.metricsService.incrementCounter('cache_invalidations_total', {
        pattern: 'all',
        reason: 'clear_all',
        keys_count: '0'
      });

      logger.info('All cache cleared');
    } catch (error) {
      logger.error('Clear all cache failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get invalidation statistics
   */
  public getInvalidationStats(): {
    totalEvents: number;
    queueSize: number;
    patternsCount: number;
    tagsCount: number;
    recentEvents: InvalidationEvent[];
  } {
    const recentEvents = this.invalidationQueue.slice(-10); // Last 10 events
    
    return {
      totalEvents: this.invalidationQueue.length,
      queueSize: this.invalidationQueue.length,
      patternsCount: this.invalidationPatterns.size,
      tagsCount: this.cacheTags.size,
      recentEvents
    };
  }

  /**
   * Get all invalidation patterns
   */
  public getAllPatterns(): InvalidationPattern[] {
    return Array.from(this.invalidationPatterns.values());
  }

  /**
   * Get all cache tags
   */
  public getAllTags(): CacheTag[] {
    return Array.from(this.cacheTags.values());
  }

  /**
   * Remove invalidation pattern
   */
  public removePattern(pattern: string): void {
    this.invalidationPatterns.delete(pattern);
    logger.info('Invalidation pattern removed', { pattern });
  }

  /**
   * Remove cache tag
   */
  public removeTag(tagName: string): void {
    this.cacheTags.delete(tagName);
    logger.info('Cache tag removed', { tagName });
  }

  /**
   * Warm up cache for specific patterns
   */
  public async warmUpCache(patterns: string[]): Promise<void> {
    try {
      for (const pattern of patterns) {
        const keys = await this.cacheStrategy.getKeysByPattern(pattern);
        
        this.metricsService.incrementCounter('cache_warmup_total', {
          pattern,
          keys_count: keys.length.toString()
        });

        logger.info('Cache warmed up for pattern', { pattern, keysCount: keys.length });
      }
    } catch (error) {
      logger.error('Cache warm up failed', { patterns, error: error.message });
      throw error;
    }
  }
}
