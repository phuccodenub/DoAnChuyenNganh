/**
 * Cache Middleware
 * Provides caching for HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import { CacheManager } from './cache.manager';
import logger from '../utils/logger.util';
import { hashUtils } from '../utils/hash.util';

export interface CacheMiddlewareOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  skipCache?: (req: Request, res: Response) => boolean;
  cacheControl?: boolean;
  vary?: string[];
  strategy?: 'redis' | 'memory' | 'hybrid';
}

export class CacheMiddleware {
  private cacheManager: CacheManager;
  private options: CacheMiddlewareOptions;

  constructor(cacheManager: CacheManager, options: CacheMiddlewareOptions = {}) {
    this.cacheManager = cacheManager;
    this.options = {
      ttl: 300, // 5 minutes default
      cacheControl: true,
      vary: ['Accept', 'Authorization'],
      strategy: 'hybrid',
      ...options
    };
  }

  /**
   * Cache GET requests
   */
  public cacheGet(options: CacheMiddlewareOptions = {}) {
    const mergedOptions = { ...this.options, ...options };
    
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Check if should skip cache
      if (mergedOptions.skipCache && mergedOptions.skipCache(req, res)) {
        return next();
      }

      try {
        const cacheKey = this.generateCacheKey(req, mergedOptions);
        const cachedResponse = await this.cacheManager.get(cacheKey, mergedOptions.strategy);

        if (cachedResponse) {
          // Set cache headers
          if (mergedOptions.cacheControl) {
            res.set('Cache-Control', `public, max-age=${mergedOptions.ttl}`);
            res.set('X-Cache', 'HIT');
          }

          // Set Vary headers
          if (mergedOptions.vary && mergedOptions.vary.length > 0) {
            res.set('Vary', mergedOptions.vary.join(', '));
          }

          logger.debug('Cache hit', { key: cacheKey, url: req.url });
          res.json(cachedResponse);
          return;
        }

        // Cache miss - continue to handler
        logger.debug('Cache miss', { key: cacheKey, url: req.url });
        
        // Override res.json to cache response
        const originalJson = res.json;
        const cacheManager = this.cacheManager;
        res.json = function(body: any) {
          // Cache the response
          setImmediate(() => {
            cacheManager.set(cacheKey, body, mergedOptions.ttl, mergedOptions.strategy).catch((error: any) => {
              logger.error('Cache set error', { key: cacheKey, error: error.message });
            });
          });

          // Set cache headers
          if (mergedOptions.cacheControl) {
            res.set('Cache-Control', `public, max-age=${mergedOptions.ttl}`);
            res.set('X-Cache', 'MISS');
          }

          return originalJson.call(this, body);
        };

        next();
      } catch (error: unknown) {
        logger.error('Cache middleware error', { error: (error as Error).message, url: req.url });
        next();
      }
    };
  };

  /**
   * Cache POST requests (for idempotent operations)
   */
  public cachePost(options: CacheMiddlewareOptions = {}) {
    const mergedOptions = { ...this.options, ...options };
    
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // Only cache POST requests
      if (req.method !== 'POST') {
        return next();
      }

      // Check if should skip cache
      if (mergedOptions.skipCache && mergedOptions.skipCache(req, res)) {
        return next();
      }

      try {
        const cacheKey = this.generateCacheKey(req, mergedOptions);
        const cachedResponse = await this.cacheManager.get(cacheKey, mergedOptions.strategy);

        if (cachedResponse) {
          // Set cache headers
          if (mergedOptions.cacheControl) {
            res.set('Cache-Control', `public, max-age=${mergedOptions.ttl}`);
            res.set('X-Cache', 'HIT');
          }

          logger.debug('Cache hit for POST', { key: cacheKey, url: req.url });
          res.json(cachedResponse);
          return;
        }

        // Cache miss - continue to handler
        logger.debug('Cache miss for POST', { key: cacheKey, url: req.url });
        
        // Override res.json to cache response
        const originalJson = res.json;
        const cacheManager = this.cacheManager;
        res.json = function(body: any) {
          // Cache the response
          setImmediate(() => {
            cacheManager.set(cacheKey, body, mergedOptions.ttl, mergedOptions.strategy).catch(error => {
              logger.error('Cache set error', { key: cacheKey, error: (error as Error).message });
            });
          });

          // Set cache headers
          if (mergedOptions.cacheControl) {
            res.set('Cache-Control', `public, max-age=${mergedOptions.ttl}`);
            res.set('X-Cache', 'MISS');
          }

          return originalJson.call(this, body);
        };

        next();
      } catch (error: unknown) {
        logger.error('Cache middleware error', { error: (error as Error).message, url: req.url });
        next();
      }
    };
  };

  /**
   * Invalidate cache on write operations
   */
  public invalidateCache = (patterns: string[] = []) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // Only invalidate on write operations
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
      }

      try {
        // Override res.json to invalidate cache after successful response
        const originalJson = res.json;
        const cacheManager = this.cacheManager;
        res.json = function(body: any) {
          // Invalidate cache after successful response
          if (res.statusCode >= 200 && res.statusCode < 300) {
            setImmediate(() => {
              invalidateCachePatterns(patterns, req).catch(error => {
                logger.error('Cache invalidation error', { patterns, error: (error as Error).message });
              });
            });
          }

          return originalJson.call(this, body);
        };

        next();
      } catch (error: unknown) {
        logger.error('Cache invalidation middleware error', { error: (error as Error).message, url: req.url });
        next();
      }
    };
  };

  /**
   * Cache user-specific data
   */
  public cacheUserData(options: CacheMiddlewareOptions = {}) {
    const mergedOptions = { ...this.options, ...options };
    
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Check if user is authenticated
      const userId = (req as any).user?.id;
      if (!userId) {
        return next();
      }

      try {
        const cacheKey = this.generateUserCacheKey(req, userId, mergedOptions);
        const cachedResponse = await this.cacheManager.get(cacheKey, mergedOptions.strategy);

        if (cachedResponse) {
          // Set cache headers
          if (mergedOptions.cacheControl) {
            res.set('Cache-Control', `private, max-age=${mergedOptions.ttl}`);
            res.set('X-Cache', 'HIT');
          }

          logger.debug('User cache hit', { key: cacheKey, userId, url: req.url });
          res.json(cachedResponse);
          return;
        }

        // Cache miss - continue to handler
        logger.debug('User cache miss', { key: cacheKey, userId, url: req.url });
        
        // Override res.json to cache response
        const originalJson = res.json;
        const cacheManager = this.cacheManager;
        res.json = function(body: any) {
          // Cache the response
          setImmediate(() => {
            cacheManager.set(cacheKey, body, mergedOptions.ttl, mergedOptions.strategy).catch(error => {
              logger.error('User cache set error', { key: cacheKey, error: (error as Error).message });
            });
          });

          // Set cache headers
          if (mergedOptions.cacheControl) {
            res.set('Cache-Control', `private, max-age=${mergedOptions.ttl}`);
            res.set('X-Cache', 'MISS');
          }

          return originalJson.call(this, body);
        };

        next();
      } catch (error: unknown) {
        logger.error('User cache middleware error', { error: (error as Error).message, url: req.url });
        next();
      }
    };
  };

  /**
   * Generate cache key for request
   */
  private generateCacheKey(req: Request, options: CacheMiddlewareOptions): string {
    if (options.keyGenerator) {
      return options.keyGenerator(req);
    }

    const keyParts = [
      req.method,
      req.path,
      req.query && Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '',
      req.headers.authorization ? 'auth' : 'no-auth'
    ];

    const keyString = keyParts.filter(Boolean).join(':');
    return `http:${hashUtils.string.hashStringSHA256(keyString)}`;
  }

  /**
   * Generate user-specific cache key
   */
  private generateUserCacheKey(req: Request, userId: string, options: CacheMiddlewareOptions): string {
    const keyParts = [
      'user',
      userId,
      req.method,
      req.path,
      req.query && Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : ''
    ];

    const keyString = keyParts.filter(Boolean).join(':');
    return `user:${hashUtils.string.hashStringSHA256(keyString)}`;
  }
}

/**
 * Invalidate cache patterns
 */
async function invalidateCachePatterns(patterns: string[], req: Request): Promise<void> {
  try {
    const cacheManager = (req as any).cacheManager as CacheManager;
    if (!cacheManager) {
      return;
    }

    for (const pattern of patterns) {
      // Replace placeholders with actual values
      let resolvedPattern = pattern;
      
      // Replace :userId with actual user ID
      if (resolvedPattern.includes(':userId') && (req as any).user?.id) {
        resolvedPattern = resolvedPattern.replace(':userId', (req as any).user.id);
      }
      
      // Replace :id with route parameter
      if (resolvedPattern.includes(':id') && req.params.id) {
        resolvedPattern = resolvedPattern.replace(':id', req.params.id);
      }

      // Get keys matching pattern
      const keys = await cacheManager.getKeysByPattern(resolvedPattern);
      
      if (keys.length > 0) {
        await cacheManager.mdel(keys);
        logger.info('Cache invalidated', { pattern: resolvedPattern, keysCount: keys.length });
      }
    }
  } catch (error: unknown) {
    logger.error('Cache pattern invalidation error', { patterns, error: (error as Error).message });
  }
}

// Export singleton instance
const disableCache = process.env.DISABLE_CACHE === 'true' || process.env.NODE_ENV === 'test';

let cacheMiddlewareInstance: CacheMiddleware;
if (disableCache) {
  // Build a no-op middleware to avoid initializing cache strategies/timers in tests
  const noop = {
    cacheGet: () => (_req: Request, _res: Response, next: NextFunction) => next(),
    cachePost: () => (_req: Request, _res: Response, next: NextFunction) => next(),
    cacheUserData: () => (_req: Request, _res: Response, next: NextFunction) => next(),
    invalidateCache: () => (_req: Request, _res: Response, next: NextFunction) => next(),
  } as unknown as CacheMiddleware;
  cacheMiddlewareInstance = noop;
} else {
  cacheMiddlewareInstance = new CacheMiddleware(
    new CacheManager({
      defaultStrategy: 'hybrid',
      strategies: {
        redis: { ttl: 3600 },
        memory: { maxSize: 1000, ttl: 300 },
        hybrid: { memorySize: 1000, memoryTTL: 300, redisTTL: 3600 }
      }
    })
  );
}

export const cacheMiddleware = cacheMiddlewareInstance;


