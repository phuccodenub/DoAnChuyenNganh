/**
 * Cache Performance Analyzer
 * Analyzes cache hit/miss patterns and performance for hot endpoints
 */

import logger from '../utils/logger.util';
import { MetricsService } from '../monitoring/metrics/metrics.service';
import { CacheStrategy } from './strategies/cache.strategy';

export interface EndpointMetrics {
  endpoint: string;
  method: string;
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  averageResponseTime: number;
  cacheResponseTime: number;
  dbResponseTime: number;
  lastAccessed: Date;
  frequency: number; // requests per minute
}

export interface CachePerformanceReport {
  timestamp: Date;
  overallHitRate: number;
  hotEndpoints: EndpointMetrics[];
  coldEndpoints: EndpointMetrics[];
  recommendations: string[];
  cacheEfficiency: {
    memoryUsage: number;
    redisUsage: number;
    evictionRate: number;
    keyDistribution: Record<string, number>;
  };
}

export class CachePerformanceAnalyzer {
  private metricsService: MetricsService;
  private endpointMetrics: Map<string, EndpointMetrics> = new Map();
  private analysisInterval?: NodeJS.Timeout;
  private readonly analysisWindow = 5 * 60 * 1000; // 5 minutes

  constructor(metricsService: MetricsService) {
    this.metricsService = metricsService;
    this.startAnalysis();
  }

  /**
   * Track endpoint cache performance
   */
  public trackEndpointPerformance(
    endpoint: string,
    method: string,
    cacheHit: boolean,
    responseTime: number,
    cacheResponseTime?: number,
    dbResponseTime?: number
  ): void {
    const key = `${method}:${endpoint}`;
    const existing = this.endpointMetrics.get(key) || {
      endpoint,
      method,
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      averageResponseTime: 0,
      cacheResponseTime: 0,
      dbResponseTime: 0,
      lastAccessed: new Date(),
      frequency: 0
    };

    existing.totalRequests++;
    existing.lastAccessed = new Date();
    
    if (cacheHit) {
      existing.cacheHits++;
      if (cacheResponseTime) {
        existing.cacheResponseTime = (existing.cacheResponseTime + cacheResponseTime) / 2;
      }
    } else {
      existing.cacheMisses++;
      if (dbResponseTime) {
        existing.dbResponseTime = (existing.dbResponseTime + dbResponseTime) / 2;
      }
    }

    existing.hitRate = existing.cacheHits / existing.totalRequests;
    existing.averageResponseTime = (existing.averageResponseTime + responseTime) / 2;

    this.endpointMetrics.set(key, existing);

    // Track in metrics service
    this.metricsService.incrementCounter('cache_endpoint_requests_total', {
      endpoint: this.normalizeEndpoint(endpoint),
      method,
      cache_result: cacheHit ? 'hit' : 'miss'
    });

    this.metricsService.recordHistogram('cache_endpoint_response_time_seconds', responseTime / 1000, {
      endpoint: this.normalizeEndpoint(endpoint),
      method,
      cache_result: cacheHit ? 'hit' : 'miss'
    });
  }

  /**
   * Analyze cache performance and generate report
   */
  public generatePerformanceReport(): CachePerformanceReport {
    const now = new Date();
    const hotEndpoints: EndpointMetrics[] = [];
    const coldEndpoints: EndpointMetrics[] = [];
    let totalHits = 0;
    let totalRequests = 0;

    // Calculate frequency and categorize endpoints
    for (const [key, metrics] of this.endpointMetrics.entries()) {
      const timeDiff = now.getTime() - metrics.lastAccessed.getTime();
      metrics.frequency = timeDiff > 0 ? (metrics.totalRequests * 60000) / timeDiff : 0;

      totalHits += metrics.cacheHits;
      totalRequests += metrics.totalRequests;

      // Categorize as hot or cold based on frequency and hit rate
      if (metrics.frequency > 10 || metrics.totalRequests > 100) {
        hotEndpoints.push(metrics);
      } else {
        coldEndpoints.push(metrics);
      }
    }

    const overallHitRate = totalRequests > 0 ? totalHits / totalRequests : 0;

    // Generate recommendations
    const recommendations = this.generateRecommendations(hotEndpoints, coldEndpoints, overallHitRate);

    // Calculate cache efficiency metrics
    const cacheEfficiency = this.calculateCacheEfficiency();

    return {
      timestamp: now,
      overallHitRate,
      hotEndpoints: hotEndpoints.sort((a, b) => b.frequency - a.frequency),
      coldEndpoints: coldEndpoints.sort((a, b) => b.totalRequests - a.totalRequests),
      recommendations,
      cacheEfficiency
    };
  }

  /**
   * Get hot endpoints that need cache optimization
   */
  public getHotEndpoints(): EndpointMetrics[] {
    const report = this.generatePerformanceReport();
    return report.hotEndpoints.filter(endpoint => 
      endpoint.hitRate < 0.7 && endpoint.frequency > 5
    );
  }

  /**
   * Get cache performance metrics for specific endpoint
   */
  public getEndpointMetrics(endpoint: string, method: string): EndpointMetrics | null {
    const key = `${method}:${endpoint}`;
    return this.endpointMetrics.get(key) || null;
  }

  /**
   * Analyze cache key patterns
   */
  public analyzeCacheKeyPatterns(cacheStrategy: CacheStrategy): Promise<{
    keyDistribution: Record<string, number>;
    keyLengths: Record<string, number>;
    ttlDistribution: Record<string, number>;
    accessPatterns: Record<string, number>;
  }> {
    return new Promise(async (resolve) => {
      try {
        const keyDistribution: Record<string, number> = {};
        const keyLengths: Record<string, number> = {};
        const ttlDistribution: Record<string, number> = {};
        const accessPatterns: Record<string, number> = {};

        // Get all keys (this is expensive, so we'll sample)
        const sampleKeys = await cacheStrategy.getKeysByPattern('*');
        const sampleSize = Math.min(sampleKeys.length, 1000);

        for (let i = 0; i < sampleSize; i++) {
          const key = sampleKeys[i];
          const keyParts = key.split(':');
          
          // Analyze key distribution by namespace
          const namespace = keyParts[1] || 'unknown';
          keyDistribution[namespace] = (keyDistribution[namespace] || 0) + 1;

          // Analyze key lengths
          const lengthRange = Math.floor(key.length / 10) * 10;
          keyLengths[`${lengthRange}-${lengthRange + 9}`] = (keyLengths[`${lengthRange}-${lengthRange + 9}`] || 0) + 1;

          // Analyze TTL distribution
          const ttl = await cacheStrategy.getTTL(key);
          if (ttl > 0) {
            const ttlRange = Math.floor(ttl / 300) * 300; // 5-minute buckets
            ttlDistribution[`${ttlRange}-${ttlRange + 299}`] = (ttlDistribution[`${ttlRange}-${ttlRange + 299}`] || 0) + 1;
          }
        }

        resolve({
          keyDistribution,
          keyLengths,
          ttlDistribution,
          accessPatterns
        });
      } catch (error) {
        logger.error('Cache key pattern analysis error', { error: error.message });
        resolve({
          keyDistribution: {},
          keyLengths: {},
          ttlDistribution: {},
          accessPatterns: {}
        });
      }
    });
  }

  /**
   * Generate cache optimization recommendations
   */
  private generateRecommendations(
    hotEndpoints: EndpointMetrics[],
    coldEndpoints: EndpointMetrics[],
    overallHitRate: number
  ): string[] {
    const recommendations: string[] = [];

    // Overall hit rate recommendations
    if (overallHitRate < 0.5) {
      recommendations.push('Overall cache hit rate is low. Consider increasing TTL for frequently accessed data.');
    } else if (overallHitRate > 0.9) {
      recommendations.push('Cache hit rate is very high. Consider reducing TTL to ensure data freshness.');
    }

    // Hot endpoint recommendations
    const lowHitRateHotEndpoints = hotEndpoints.filter(e => e.hitRate < 0.6);
    if (lowHitRateHotEndpoints.length > 0) {
      recommendations.push(`Hot endpoints with low hit rate: ${lowHitRateHotEndpoints.map(e => e.endpoint).join(', ')}. Consider caching these endpoints.`);
    }

    // Cold endpoint recommendations
    const highHitRateColdEndpoints = coldEndpoints.filter(e => e.hitRate > 0.8 && e.totalRequests < 10);
    if (highHitRateColdEndpoints.length > 0) {
      recommendations.push(`Cold endpoints with high hit rate: ${highHitRateColdEndpoints.map(e => e.endpoint).join(', ')}. Consider reducing TTL or removing cache.`);
    }

    // Response time recommendations
    const slowEndpoints = [...hotEndpoints, ...coldEndpoints].filter(e => e.averageResponseTime > 1000);
    if (slowEndpoints.length > 0) {
      recommendations.push(`Slow endpoints detected: ${slowEndpoints.map(e => e.endpoint).join(', ')}. Consider optimizing database queries or increasing cache TTL.`);
    }

    return recommendations;
  }

  /**
   * Calculate cache efficiency metrics
   */
  private calculateCacheEfficiency(): {
    memoryUsage: number;
    redisUsage: number;
    evictionRate: number;
    keyDistribution: Record<string, number>;
  } {
    // This would be implemented with actual cache stats
    return {
      memoryUsage: 0,
      redisUsage: 0,
      evictionRate: 0,
      keyDistribution: {}
    };
  }

  /**
   * Normalize endpoint for consistent tracking
   */
  private normalizeEndpoint(endpoint: string): string {
    return endpoint
      .replace(/\/\d+/g, '/:id')
      .replace(/\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, '/:uuid')
      .replace(/\?.*$/, '');
  }

  /**
   * Start periodic analysis
   */
  private startAnalysis(): void {
    this.analysisInterval = setInterval(() => {
      const report = this.generatePerformanceReport();
      
      logger.info('Cache performance analysis', {
        overallHitRate: report.overallHitRate,
        hotEndpointsCount: report.hotEndpoints.length,
        coldEndpointsCount: report.coldEndpoints.length,
        recommendations: report.recommendations.length
      });

      // Log recommendations
      if (report.recommendations.length > 0) {
        logger.warn('Cache optimization recommendations', {
          recommendations: report.recommendations
        });
      }
    }, this.analysisWindow);
  }

  /**
   * Stop analysis
   */
  public stop(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = undefined;
    }
  }

  /**
   * Get current endpoint metrics
   */
  public getAllEndpointMetrics(): EndpointMetrics[] {
    return Array.from(this.endpointMetrics.values());
  }

  /**
   * Clear old metrics
   */
  public clearOldMetrics(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [key, metrics] of this.endpointMetrics.entries()) {
      if (metrics.lastAccessed.getTime() < cutoffTime) {
        this.endpointMetrics.delete(key);
      }
    }
  }
}
