/**
 * Cache Module
 * Centralized exports for caching components
 */

// Strategies
export * from './strategies/cache.strategy';
export { RedisCacheStrategy } from './strategies/redis.strategy';
export { MemoryCacheStrategy } from './strategies/memory.strategy';
export { HybridCacheStrategy, HybridCacheOptions } from './strategies/hybrid.strategy';

// Manager and Middleware
export { CacheManager, CacheManagerOptions, CacheStrategyType } from './cache.manager';
export { CacheMiddleware, CacheMiddlewareOptions, cacheMiddleware } from './cache.middleware';

// Re-export types
export type {
  CacheStrategy,
  CacheStats,
  CacheOptions,
  CacheKeyOptions,
  CacheMetadata
} from './strategies/cache.strategy';
