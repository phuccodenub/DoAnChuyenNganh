/**
 * Metrics Middleware
 * Collects HTTP request metrics
 */

import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';
import logger from '../../utils/logger.util';

export class MetricsMiddleware {
  private metricsService: MetricsService;

  constructor(metricsService: MetricsService) {
    this.metricsService = metricsService;
  }

  /**
   * Middleware to collect HTTP request metrics
   */
  public collectHttpMetrics = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const timer = this.metricsService.startTimer('http_requests_duration');
    
    // Increment total requests counter
    this.metricsService.incrementCounter('http_requests_total', {
      method: req.method,
      route: req.route?.path || req.path,
      status: 'unknown'
    });

    // Override res.end to capture response metrics
    const originalEnd = res.end.bind(res);
    res.end = ((chunk?: any, encoding?: any, cb?: any) => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode.toString();
      
      // Record response time
      timer();
      
      // Increment status-specific counters
      this.metricsService.incrementCounter('http_requests_total', {
        method: req.method,
        route: req.route?.path || req.path,
        status: statusCode
      });

      // Increment error counter if status >= 400
      if (res.statusCode >= 400) {
        this.metricsService.incrementCounter('http_errors_total', {
          method: req.method,
          route: req.route?.path || req.path,
          status: statusCode,
          error_type: res.statusCode >= 500 ? 'server_error' : 'client_error'
        });
      }

      // Record response size
      if (chunk) {
        const responseSize = Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk || '', encoding);
        this.metricsService.recordHistogram('http_response_size', responseSize, {
          method: req.method,
          route: req.route?.path || req.path,
          status: statusCode
        });
      }

      // Record request size
      const requestSize = req.get('content-length') ? parseInt(req.get('content-length')!) : 0;
      if (requestSize > 0) {
        this.metricsService.recordHistogram('http_request_size', requestSize, {
          method: req.method,
          route: req.route?.path || req.path
        });
      }

      // Call original end method and return Response
      return originalEnd(chunk as any, encoding as any, cb as any) as any;
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
      error_type: (error as Error).name || 'unknown_error',
      error_message: (error as Error).message || 'unknown_error'
    });

    // Record error details
    logger.error('HTTP error occurred', {
      error: (error as Error).message,
      stack: (error as Error).stack,
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
export const metricsMiddleware = new MetricsMiddleware(new MetricsService());

