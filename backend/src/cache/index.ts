/**
 * Cache Module
 * Centralized exports for caching components
 */

// Strategies
export * from './strategies/cache.strategy';
export { RedisCacheStrategy } from './strategies/redis.strategy';
export { MemoryCacheStrategy } from './strategies/memory.strategy';
export { HybridCacheStrategy } from './strategies/hybrid.strategy';
export type { HybridCacheOptions } from './strategies/hybrid.strategy';

// Manager and Middleware
export { CacheManager } from './cache.manager';
export type { CacheManagerOptions, CacheStrategyType } from './cache.manager';

export { CacheMiddleware, cacheMiddleware } from './cache.middleware';
export type { CacheMiddlewareOptions } from './cache.middleware';

// Re-export types
export type {
  CacheStrategy,
  CacheStats,
  CacheOptions,
  CacheKeyOptions,
  CacheMetadata
} from './strategies/cache.strategy';
