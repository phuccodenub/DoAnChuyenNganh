/**
 * Enhanced Cache Middleware
 * Integrates cache performance analysis, configuration management, and invalidation
 */

import { Request, Response, NextFunction } from 'express';
import { CacheStrategy } from './strategies/cache.strategy';
import { MemoryCacheStrategy } from './strategies/memory.strategy';
import { RedisCacheStrategy } from './strategies/redis.strategy';
import { CachePerformanceAnalyzer } from './cache-performance.analyzer';
import { CacheConfigurationManager, CacheContext } from './cache-configuration.manager';
import { CacheInvalidationManager } from './cache-invalidation.manager';
import { MetricsService } from '../monitoring/metrics/metrics.service';
import logger from '../utils/logger.util';

export interface CacheMiddlewareOptions {
  strategy: 'memory' | 'redis' | 'hybrid';
  enablePerformanceAnalysis?: boolean;
  enableConfigurationManagement?: boolean;
  enableInvalidation?: boolean;
  defaultTTL?: number;
  maxSize?: number;
}

export class EnhancedCacheMiddleware {
  private cacheStrategy: CacheStrategy;
  private performanceAnalyzer?: CachePerformanceAnalyzer;
  private configurationManager?: CacheConfigurationManager;
  private invalidationManager?: CacheInvalidationManager;
  private metricsService: MetricsService;
  private options: CacheMiddlewareOptions;

  constructor(metricsService: MetricsService, options: CacheMiddlewareOptions = { strategy: 'hybrid' }) {
    this.metricsService = metricsService;
    this.options = {
      enablePerformanceAnalysis: true,
      enableConfigurationManagement: true,
      enableInvalidation: true,
      defaultTTL: 3600,
      maxSize: 1000,
      ...options
    };

    this.initializeCacheStrategy();
    this.initializeManagers();
  }

  /**
   * Initialize cache strategy
   */
  private initializeCacheStrategy(): void {
    switch (this.options.strategy) {
      case 'memory':
        this.cacheStrategy = new MemoryCacheStrategy({
          ttl: this.options.defaultTTL,
          maxSize: this.options.maxSize
        });
        break;
      case 'redis':
        this.cacheStrategy = new RedisCacheStrategy({
          ttl: this.options.defaultTTL,
          maxSize: this.options.maxSize! * 10
        });
        break;
      case 'hybrid':
        // Use memory for hot data, Redis for everything else
        this.cacheStrategy = new MemoryCacheStrategy({
          ttl: this.options.defaultTTL,
          maxSize: this.options.maxSize
        });
        break;
      default:
        throw new Error(`Unsupported cache strategy: ${this.options.strategy}`);
    }

    logger.info('Cache strategy initialized', { strategy: this.options.strategy });
  }

  /**
   * Initialize managers
   */
  private initializeManagers(): void {
    if (this.options.enablePerformanceAnalysis) {
      this.performanceAnalyzer = new CachePerformanceAnalyzer(this.metricsService);
      logger.info('Cache performance analyzer initialized');
    }

    if (this.options.enableConfigurationManagement) {
      this.configurationManager = new CacheConfigurationManager();
      logger.info('Cache configuration manager initialized');
    }

    if (this.options.enableInvalidation) {
      this.invalidationManager = new CacheInvalidationManager(this.cacheStrategy, this.metricsService);
      logger.info('Cache invalidation manager initialized');
    }
  }

  /**
   * Main cache middleware
   */
  public cache = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    // Skip cache for non-GET requests or if explicitly disabled
    if (req.method !== 'GET' || req.headers['x-skip-cache'] === 'true') {
      return next();
    }

    // Build cache context
    const context = this.buildCacheContext(req);
    
    // Check if cache should be skipped
    if (this.configurationManager?.shouldSkipCache(context)) {
      return next();
    }

    // Build cache key
    const cacheKey = this.buildCacheKey(req, context);
    
    // Try to get from cache
    this.getFromCache(cacheKey, context, req, res, next, startTime);
  };

  /**
   * Build cache context from request
   */
  private buildCacheContext(req: Request): CacheContext {
    const userRole = this.extractUserRole(req);
    const isAuthenticated = !!req.headers.authorization;
    const isAdmin = userRole?.role === 'admin';

    return {
      endpoint: req.path,
      method: req.method,
      userRole,
      isAuthenticated,
      isAdmin,
      requestHeaders: req.headers as Record<string, string>,
      queryParams: req.query as Record<string, any>
    };
  }

  /**
   * Extract user role from request
   */
  private extractUserRole(req: Request): any {
    // This would typically extract from JWT token or session
    const authHeader = req.headers.authorization;
    if (!authHeader) return undefined;

    // Mock user role extraction - replace with actual JWT parsing
    const roleHeader = req.headers['x-user-role'] as string;
    if (roleHeader) {
      return {
        role: roleHeader,
        permissions: this.getPermissionsForRole(roleHeader),
        cacheLevel: this.getCacheLevelForRole(roleHeader)
      };
    }

    return undefined;
  }

  /**
   * Get permissions for role
   */
  private getPermissionsForRole(role: string): string[] {
    const permissions: Record<string, string[]> = {
      admin: ['read', 'write', 'delete', 'admin'],
      instructor: ['read', 'write'],
      student: ['read'],
      guest: ['read']
    };
    return permissions[role] || ['read'];
  }

  /**
   * Get cache level for role
   */
  private getCacheLevelForRole(role: string): 'full' | 'limited' | 'minimal' {
    const cacheLevels: Record<string, 'full' | 'limited' | 'minimal'> = {
      admin: 'minimal',
      instructor: 'limited',
      student: 'full',
      guest: 'full'
    };
    return cacheLevels[role] || 'full';
  }

  /**
   * Build cache key
   */
  private buildCacheKey(req: Request, context: CacheContext): string {
    const baseKey = `${req.method}:${req.path}`;
    
    if (this.configurationManager) {
      return this.configurationManager.buildCacheKey(baseKey, context);
    }
    
    return baseKey;
  }

  /**
   * Get data from cache
   */
  private async getFromCache(
    cacheKey: string,
    context: CacheContext,
    req: Request,
    res: Response,
    next: NextFunction,
    startTime: number
  ): Promise<void> {
    try {
      const cachedData = await this.cacheStrategy.get(cacheKey);
      
      if (cachedData) {
        // Cache hit
        const cacheResponseTime = Date.now() - startTime;
        
        // Track performance
        this.performanceAnalyzer?.trackEndpointPerformance(
          context.endpoint,
          context.method,
          true,
          cacheResponseTime,
          cacheResponseTime
        );

        // Set cache headers
        this.setCacheHeaders(res, context, true);
        
        // Send cached response
        res.json(cachedData);
        return;
      }

      // Cache miss - continue to next middleware
      this.handleCacheMiss(cacheKey, context, req, res, next, startTime);
    } catch (error) {
      logger.error('Cache get error', { cacheKey, error: error.message });
      next();
    }
  }

  /**
   * Handle cache miss
   */
  private async handleCacheMiss(
    cacheKey: string,
    context: CacheContext,
    req: Request,
    res: Response,
    next: NextFunction,
    startTime: number
  ): Promise<void> {
    // Override res.json to capture response
    const originalJson = res.json;
    const originalSend = res.send;
    
    res.json = function(body: any) {
      // Store in cache
      this.storeInCache(cacheKey, body, context);
      
      // Track performance
      const dbResponseTime = Date.now() - startTime;
      this.performanceAnalyzer?.trackEndpointPerformance(
        context.endpoint,
        context.method,
        false,
        dbResponseTime,
        undefined,
        dbResponseTime
      );

      // Set cache headers
      this.setCacheHeaders(res, context, false);
      
      return originalJson.call(this, body);
    }.bind(this);

    res.send = function(body: any) {
      // Store in cache
      this.storeInCache(cacheKey, body, context);
      
      // Track performance
      const dbResponseTime = Date.now() - startTime;
      this.performanceAnalyzer?.trackEndpointPerformance(
        context.endpoint,
        context.method,
        false,
        dbResponseTime,
        undefined,
        dbResponseTime
      );

      // Set cache headers
      this.setCacheHeaders(res, context, false);
      
      return originalSend.call(this, body);
    }.bind(this);

    next();
  }

  /**
   * Store data in cache
   */
  private async storeInCache(cacheKey: string, data: any, context: CacheContext): Promise<void> {
    try {
      const ttl = this.configurationManager?.getCacheTTL(context) || this.options.defaultTTL!;
      const tags = this.configurationManager?.getCacheTags(context) || ['default'];
      
      await this.cacheStrategy.set(cacheKey, data, ttl);
      
      // Store tags for invalidation
      if (this.invalidationManager && tags.length > 0) {
        await this.cacheStrategy.set(`${cacheKey}:tags`, tags, ttl);
      }
      
      logger.debug('Data stored in cache', { cacheKey, ttl, tags });
    } catch (error) {
      logger.error('Cache store error', { cacheKey, error: error.message });
    }
  }

  /**
   * Set cache headers
   */
  private setCacheHeaders(res: Response, context: CacheContext, isHit: boolean): void {
    const ttl = this.configurationManager?.getCacheTTL(context) || this.options.defaultTTL!;
    const maxAge = Math.floor(ttl * 0.8); // 80% of TTL for max-age
    
    res.set('X-Cache', isHit ? 'HIT' : 'MISS');
    res.set('Cache-Control', `public, max-age=${maxAge}`);
    res.set('X-Cache-TTL', ttl.toString());
    
    if (context.userRole) {
      res.set('X-Cache-Role', context.userRole.role);
    }
  }

  /**
   * Invalidate cache for entity
   */
  public async invalidateEntity(entity: string, entityId: string, operation: 'create' | 'update' | 'delete'): Promise<void> {
    if (this.invalidationManager) {
      await this.invalidationManager.invalidateEntity(entity, entityId, operation);
    }
  }

  /**
   * Invalidate cache by pattern
   */
  public async invalidateByPattern(pattern: string, reason?: string): Promise<void> {
    if (this.invalidationManager) {
      await this.invalidationManager.invalidateByPattern(pattern, reason);
    }
  }

  /**
   * Invalidate cache by tags
   */
  public async invalidateByTags(tags: string[], reason?: string): Promise<void> {
    if (this.invalidationManager) {
      await this.invalidationManager.invalidateByTags(tags, reason);
    }
  }

  /**
   * Get cache performance report
   */
  public getPerformanceReport() {
    return this.performanceAnalyzer?.generatePerformanceReport();
  }

  /**
   * Get hot endpoints
   */
  public getHotEndpoints() {
    return this.performanceAnalyzer?.getHotEndpoints();
  }

  /**
   * Get cache statistics
   */
  public async getCacheStats() {
    return await this.cacheStrategy.getStats();
  }

  /**
   * Clear all cache
   */
  public async clearAllCache(): Promise<void> {
    await this.cacheStrategy.clear();
    logger.info('All cache cleared');
  }

  /**
   * Get cache configuration
   */
  public getCacheConfiguration() {
    return this.configurationManager?.exportConfiguration();
  }

  /**
   * Update cache configuration
   */
  public updateCacheConfiguration(config: any): void {
    this.configurationManager?.importConfiguration(config);
  }

  /**
   * Get invalidation statistics
   */
  public getInvalidationStats() {
    return this.invalidationManager?.getInvalidationStats();
  }

  /**
   * Stop all managers
   */
  public stop(): void {
    this.performanceAnalyzer?.stop();
    logger.info('Enhanced cache middleware stopped');
  }
}

// Export singleton instance
export const enhancedCacheMiddleware = new EnhancedCacheMiddleware(
  new MetricsService(),
  {
    strategy: 'hybrid',
    enablePerformanceAnalysis: true,
    enableConfigurationManagement: true,
    enableInvalidation: true
  }
);
