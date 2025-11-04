/**
 * Metrics Middleware
 * Collects HTTP request metrics
 */

import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';
import { DatabaseMetrics } from './database.metrics';
import { RedisMetrics } from './redis.metrics';
import { BackgroundTasksMetrics } from './background-tasks.metrics';
import env from '../../config/env.config';
import logger from '../../utils/logger.util';

export class MetricsMiddleware {
  private metricsService: MetricsService;
  private databaseMetrics?: DatabaseMetrics;
  private redisMetrics?: RedisMetrics;
  private backgroundTasksMetrics: BackgroundTasksMetrics;

  constructor(metricsService: MetricsService) {
    this.metricsService = metricsService;
    this.backgroundTasksMetrics = new BackgroundTasksMetrics(metricsService);
    
    // Set global labels for all metrics
    this.metricsService.setDefaultLabels({
      service: 'lms-backend',
      env: env.nodeEnv,
      version: env.api.defaultVersion,
      instance: `${process.env.HOSTNAME || 'localhost'}:${env.port}`
    });
  }

  /**
   * Initialize database metrics
   */
  public initializeDatabaseMetrics(sequelize: any): void {
    this.databaseMetrics = new DatabaseMetrics(this.metricsService, sequelize);
    logger.info('Database metrics initialized');
  }

  /**
   * Initialize Redis metrics
   */
  public initializeRedisMetrics(redisClient: any): void {
    this.redisMetrics = new RedisMetrics(this.metricsService, redisClient);
    this.redisMetrics.startPeriodicCollection();
    logger.info('Redis metrics initialized');
  }

  /**
   * Get database metrics instance
   */
  public getDatabaseMetrics(): DatabaseMetrics | undefined {
    return this.databaseMetrics;
  }

  /**
   * Get Redis metrics instance
   */
  public getRedisMetrics(): RedisMetrics | undefined {
    return this.redisMetrics;
  }

  /**
   * Get background tasks metrics instance
   */
  public getBackgroundTasksMetrics(): BackgroundTasksMetrics {
    return this.backgroundTasksMetrics;
  }

  /**
   * Middleware to collect HTTP request metrics
   */
  public collectHttpMetrics = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const timer = this.metricsService.startTimer('http_requests_duration');
    

    // Override res.end to capture response metrics
    const originalEnd = res.end.bind(res);
    res.end = ((chunk?: any, encoding?: any, cb?: any) => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode.toString();
      
      // Record response time (as histogram in ms)
      timer();
      this.metricsService.recordHistogram('http_request_duration_seconds', duration / 1000, {
        method: req.method,
        route: normalizeRoute(req),
        status: statusGroup(statusCode)
      });
      
      // Increment status-specific counters
      this.metricsService.incrementCounter('http_requests_total', {
        method: req.method,
        route: normalizeRoute(req),
        status: statusGroup(statusCode)
      });

      // Increment error counter if status >= 400
      if (res.statusCode >= 400) {
        this.metricsService.incrementCounter('http_errors_total', {
          method: req.method,
          route: normalizeRoute(req),
          status: statusGroup(statusCode),
          error_type: res.statusCode >= 500 ? 'server_error' : 'client_error'
        });
      }

      // Record response size
      if (chunk) {
        const responseSize = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk || '', encoding as any);
        this.metricsService.recordHistogram('http_response_size', responseSize, {
          method: req.method,
          route: normalizeRoute(req),
          status: statusGroup(statusCode)
        });
      }

      // Record request size
      const requestSize = req.get('content-length') ? parseInt(req.get('content-length')!) : 0;
      if (requestSize > 0) {
        this.metricsService.recordHistogram('http_request_size', requestSize, {
          method: req.method,
          route: normalizeRoute(req)
        });
      }

      // Call original end method
      return originalEnd(chunk as any, encoding as any, cb as any);
    }) as any;

    next();
  };

  /**
   * Middleware to collect database query metrics
   */
  public collectDatabaseMetrics = (req: Request, res: Response, next: NextFunction): void => {
    // This would be called from database service
    next();
  };

  /**
   * Middleware to collect Redis operation metrics
   */
  public collectRedisMetrics = (req: Request, res: Response, next: NextFunction): void => {
    // This would be called from Redis service
    next();
  };

  /**
   * Middleware to collect memory usage metrics
   */
  public collectMemoryMetrics = (req: Request, res: Response, next: NextFunction): void => {
    const memoryUsage = process.memoryUsage();
    
    this.metricsService.setGauge('memory_rss', memoryUsage.rss);
    this.metricsService.setGauge('memory_heap_total', memoryUsage.heapTotal);
    this.metricsService.setGauge('memory_heap_used', memoryUsage.heapUsed);
    this.metricsService.setGauge('memory_external', memoryUsage.external);
    this.metricsService.setGauge('memory_array_buffers', memoryUsage.arrayBuffers);

    next();
  };

  /**
   * Middleware to collect CPU usage metrics
   */
  public collectCpuMetrics = (req: Request, res: Response, next: NextFunction): void => {
    const cpuUsage = process.cpuUsage();
    const totalCpuTime = cpuUsage.user + cpuUsage.system;
    
    this.metricsService.setGauge('cpu_user_time', cpuUsage.user);
    this.metricsService.setGauge('cpu_system_time', cpuUsage.system);
    this.metricsService.setGauge('cpu_total_time', totalCpuTime);

    next();
  };

  /**
   * Middleware to collect uptime metrics
   */
  public collectUptimeMetrics = (req: Request, res: Response, next: NextFunction): void => {
    const uptime = process.uptime();
    
    this.metricsService.setGauge('process_uptime', uptime);
    this.metricsService.setGauge('process_uptime_hours', uptime / 3600);

    next();
  };

  /**
   * Middleware to collect error metrics
   */
  public collectErrorMetrics = (error: any, req: Request, res: Response, next: NextFunction): void => {
    // Increment error counter
    this.metricsService.incrementCounter('http_errors_total', {
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode?.toString() || '500',
      error_type: error.name || 'unknown_error',
      error_message: error.message || 'unknown_error'
    });

    // Record error details
    logger.error('HTTP error occurred', {
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    next(error);
  };

  /**
   * Middleware to collect authentication metrics
   */
  public collectAuthMetrics = (req: Request, res: Response, next: NextFunction): void => {
    // Track authentication attempts
    if (req.path.includes('/auth/login')) {
      this.metricsService.incrementCounter('auth_login_attempts_total', {
        method: req.method
      });
    }

    // Track authentication successes
    if (req.path.includes('/auth/login') && res.statusCode === 200) {
      this.metricsService.incrementCounter('auth_login_successes_total', {
        method: req.method
      });
    }

    // Track authentication failures
    if (req.path.includes('/auth/login') && res.statusCode >= 400) {
      this.metricsService.incrementCounter('auth_login_failures_total', {
        method: req.method,
        status: res.statusCode.toString()
      });
    }

    next();
  };

  /**
   * Middleware to collect user metrics
   */
  public collectUserMetrics = (req: Request, res: Response, next: NextFunction): void => {
    // Track user registrations
    if (req.path.includes('/auth/register') && res.statusCode === 201) {
      this.metricsService.incrementCounter('user_registrations_total', {
        method: req.method
      });
    }

    // Track user profile updates
    if (req.path.includes('/user/profile') && res.statusCode === 200) {
      this.metricsService.incrementCounter('user_profile_updates_total', {
        method: req.method
      });
    }

    next();
  };

  /**
   * Middleware to collect course metrics
   */
  public collectCourseMetrics = (req: Request, res: Response, next: NextFunction): void => {
    // Track course creations
    if (req.path.includes('/courses') && req.method === 'POST' && res.statusCode === 201) {
      this.metricsService.incrementCounter('course_creations_total', {
        method: req.method
      });
    }

    // Track course enrollments
    if (req.path.includes('/enroll') && res.statusCode === 201) {
      this.metricsService.incrementCounter('course_enrollments_total', {
        method: req.method
      });
    }

    next();
  };
}

// Export singleton instance
// In test environments, export a no-op middleware to avoid timers/open handles
const disableMetrics = process.env.DISABLE_METRICS === 'true' || process.env.NODE_ENV === 'test';

class NoopMetricsMiddleware {
  public collectHttpMetrics = (_req: Request, _res: Response, next: NextFunction) => next();
  public collectDatabaseMetrics = (_req: Request, _res: Response, next: NextFunction) => next();
  public collectRedisMetrics = (_req: Request, _res: Response, next: NextFunction) => next();
  public collectMemoryMetrics = (_req: Request, _res: Response, next: NextFunction) => next();
  public collectCpuMetrics = (_req: Request, _res: Response, next: NextFunction) => next();
  public collectUptimeMetrics = (_req: Request, _res: Response, next: NextFunction) => next();
  public collectErrorMetrics = (_err: unknown, _req: Request, _res: Response, next: NextFunction) => next();
  public collectAuthMetrics = (_req: Request, _res: Response, next: NextFunction) => next();
  public collectUserMetrics = (_req: Request, _res: Response, next: NextFunction) => next();
  public collectCourseMetrics = (_req: Request, _res: Response, next: NextFunction) => next();
}

export const metricsMiddleware = disableMetrics
  ? (new NoopMetricsMiddleware() as unknown as MetricsMiddleware)
  : new MetricsMiddleware(new MetricsService());

// Helpers
function normalizeRoute(req: Request): string {
  // Prefer Express route pattern if available; fallback to path with dynamic segments masked
  const pattern = (req as any).route?.path as string | undefined;
  if (pattern) return pattern;
  
  let path = req.path || '';
  
  // Mask UUIDs with :id
  path = path.replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, ':id');
  
  // Mask numeric IDs with :id
  path = path.replace(/\b\d+\b/g, ':id');
  
  // Mask common query patterns to reduce cardinality
  path = path.replace(/\/search\?.*$/, '/search');
  path = path.replace(/\/filter\?.*$/, '/filter');
  path = path.replace(/\/page=\d+.*$/, '/page=:page');
  path = path.replace(/\/limit=\d+.*$/, '/limit=:limit');
  path = path.replace(/\/sort=.*$/, '/sort=:sort');
  
  // Mask email-like patterns
  path = path.replace(/\/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '/:email');
  
  // Mask long strings (likely tokens or hashes)
  path = path.replace(/\/[a-zA-Z0-9]{32,}/g, '/:token');
  
  // Limit path depth to prevent excessive cardinality
  const segments = path.split('/').slice(0, 6); // Max 5 segments after root
  if (segments.length > 5) {
    segments[5] = '...';
  }
  
  return segments.join('/') || '/';
}

function statusGroup(status: string): string {
  if (status === '304' || status === '301' || status === '302' || status === '307' || status === '308') {
    return status === '304' ? 'not_modified' : 'redirect';
  }
  return status;
}
