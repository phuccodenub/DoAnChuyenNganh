/**
 * Metrics Service
 * Collects and manages application metrics
 */

import logger from '../../utils/logger.util';
import { dateUtils } from '../../utils/date.util';

export interface MetricData {
  name: string;
  value: number;
  timestamp: string;
  labels?: Record<string, string>;
}

export interface CounterMetric extends MetricData {
  type: 'counter';
  increment: number;
}

export interface GaugeMetric extends MetricData {
  type: 'gauge';
  current: number;
}

export interface HistogramMetric extends MetricData {
  type: 'histogram';
  buckets: Record<string, number>;
  count: number;
  sum: number;
}

export interface TimerMetric extends MetricData {
  type: 'timer';
  duration: number;
  startTime: number;
  endTime: number;
}

export interface ApplicationMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    rate: number;
  };
  responseTime: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    rate: number;
  };
  database: {
    queries: number;
    slowQueries: number;
    connections: number;
  };
  redis: {
    operations: number;
    cacheHits: number;
    cacheMisses: number;
  };
  memory: {
    used: number;
    heapUsed: number;
    external: number;
  };
  uptime: number;
  timestamp: string;
}

export class MetricsService {
  private metrics: Map<string, MetricData[]> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private timers: Map<string, number[]> = new Map();
  
  private readonly maxMetricsPerType = 1000;
  private readonly cleanupInterval = 5 * 60 * 1000; // 5 minutes
  private cleanupTimer?: NodeJS.Timeout;

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Increment a counter metric
   */
  public incrementCounter(name: string, labels?: Record<string, string>): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + 1);
    
    this.addMetric({
      name,
      type: 'counter',
      value: current + 1,
      timestamp: dateUtils.formatDate(new Date()),
      labels,
      increment: 1
    } as CounterMetric);
  }

  /**
   * Set a gauge metric value
   */
  public setGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.gauges.set(name, value);
    
    this.addMetric({
      name,
      type: 'gauge',
      value,
      timestamp: dateUtils.formatDate(new Date()),
      labels,
      current: value
    } as GaugeMetric);
  }

  /**
   * Record a histogram value
   */
  public recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const values = this.histograms.get(name) || [];
    values.push(value);
    
    // Keep only recent values
    if (values.length > this.maxMetricsPerType) {
      values.splice(0, values.length - this.maxMetricsPerType);
    }
    
    this.histograms.set(name, values);
    
    this.addMetric({
      name,
      type: 'histogram',
      value,
      timestamp: dateUtils.formatDate(new Date()),
      labels,
      buckets: this.calculateBuckets(values),
      count: values.length,
      sum: values.reduce((sum, val) => sum + val, 0)
    } as HistogramMetric);
  }

  /**
   * Start a timer
   */
  public startTimer(name: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.recordTimer(name, duration);
    };
  }

  /**
   * Record a timer value
   */
  public recordTimer(name: string, duration: number, labels?: Record<string, string>): void {
    const values = this.timers.get(name) || [];
    values.push(duration);
    
    // Keep only recent values
    if (values.length > this.maxMetricsPerType) {
      values.splice(0, values.length - this.maxMetricsPerType);
    }
    
    this.timers.set(name, values);
    
    this.addMetric({
      name,
      type: 'timer',
      value: duration,
      timestamp: dateUtils.formatDate(new Date()),
      labels,
      duration,
      startTime: Date.now() - duration,
      endTime: Date.now()
    } as TimerMetric);
  }

  /**
   * Get counter value
   */
  public getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  /**
   * Get gauge value
   */
  public getGauge(name: string): number {
    return this.gauges.get(name) || 0;
  }

  /**
   * Get histogram statistics
   */
  public getHistogramStats(name: string): { count: number; sum: number; average: number; p50: number; p95: number; p99: number } | null {
    const values = this.histograms.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((total, val) => total + val, 0);
    const average = sum / count;

    return {
      count,
      sum,
      average,
      p50: this.getPercentile(sorted, 50),
      p95: this.getPercentile(sorted, 95),
      p99: this.getPercentile(sorted, 99)
    };
  }

  /**
   * Get timer statistics
   */
  public getTimerStats(name: string): { count: number; sum: number; average: number; p50: number; p95: number; p99: number } | null {
    return this.getHistogramStats(name);
  }

  /**
   * Get all metrics
   */
  public getAllMetrics(): MetricData[] {
    const allMetrics: MetricData[] = [];
    
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }
    
    return allMetrics;
  }

  /**
   * Get application metrics summary
   */
  public getApplicationMetrics(): ApplicationMetrics {
    const requestStats = this.getHistogramStats('http_requests_duration') || { count: 0, sum: 0, average: 0, p50: 0, p95: 0, p99: 0 };
    const errorCount = this.getCounter('http_errors_total');
    const successCount = this.getCounter('http_requests_total') - errorCount;
    const totalRequests = this.getCounter('http_requests_total');
    
    const memoryUsage = process.memoryUsage();
    
    return {
      requests: {
        total: totalRequests,
        successful: successCount,
        failed: errorCount,
        rate: totalRequests / (Date.now() / 1000) // requests per second
      },
      responseTime: {
        average: requestStats.average,
        p50: requestStats.p50,
        p95: requestStats.p95,
        p99: requestStats.p99
      },
      errors: {
        total: errorCount,
        byType: this.getErrorTypes(),
        rate: errorCount / (Date.now() / 1000)
      },
      database: {
        queries: this.getCounter('database_queries_total'),
        slowQueries: this.getCounter('database_slow_queries_total'),
        connections: this.getCounter('database_connections_active')
      },
      redis: {
        operations: this.getCounter('redis_operations_total'),
        cacheHits: this.getCounter('redis_cache_hits_total'),
        cacheMisses: this.getCounter('redis_cache_misses_total')
      },
      memory: {
        used: memoryUsage.rss,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      },
      uptime: Date.now() - process.uptime(),
      timestamp: dateUtils.formatDate(new Date())
    };
  }

  /**
   * Reset all metrics
   */
  public reset(): void {
    this.metrics.clear();
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.timers.clear();
  }

  /**
   * Get metrics for a specific name
   */
  public getMetrics(name: string): MetricData[] {
    return this.metrics.get(name) || [];
  }

  /**
   * Add a metric to storage
   */
  private addMetric(metric: MetricData): void {
    const metrics = this.metrics.get(metric.name) || [];
    metrics.push(metric);
    
    // Keep only recent metrics
    if (metrics.length > this.maxMetricsPerType) {
      metrics.splice(0, metrics.length - this.maxMetricsPerType);
    }
    
    this.metrics.set(metric.name, metrics);
  }

  /**
   * Calculate histogram buckets
   */
  private calculateBuckets(values: number[]): Record<string, number> {
    const buckets: Record<string, number> = {};
    const bucketBoundaries = [0.1, 0.5, 1, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000];
    
    for (const boundary of bucketBoundaries) {
      buckets[`le_${boundary}`] = values.filter(val => val <= boundary).length;
    }
    
    buckets['le_inf'] = values.length;
    return buckets;
  }

  /**
   * Get percentile value
   */
  private getPercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }

  /**
   * Get error types
   */
  private getErrorTypes(): Record<string, number> {
    const errorTypes: Record<string, number> = {};
    
    for (const [name, value] of this.counters.entries()) {
      if (name.includes('error') && name.includes('by_type')) {
        const type = name.split('_by_type_')[1];
        if (type) {
          errorTypes[type] = value;
        }
      }
    }
    
    return errorTypes;
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Cleanup old metrics
   */
  private cleanup(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [name, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(metric => {
        const metricTime = new Date(metric.timestamp).getTime();
        return metricTime > cutoffTime;
      });
      
      if (filtered.length === 0) {
        this.metrics.delete(name);
      } else {
        this.metrics.set(name, filtered);
      }
    }
    
    logger.info('Metrics cleanup completed', { 
      metricsCount: this.metrics.size,
      timestamp: dateUtils.formatDate(new Date())
    });
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
}

