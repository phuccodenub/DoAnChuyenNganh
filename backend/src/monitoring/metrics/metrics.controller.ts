/**
 * Metrics Controller
 * Provides metrics endpoints for monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';
import { DatabaseMetrics } from './database.metrics';
import { RedisMetrics } from './redis.metrics';
import { BackgroundTasksMetrics } from './background-tasks.metrics';
import { responseUtils } from '../../utils/response.util';

export class MetricsController {
  private metricsService: MetricsService;
  private databaseMetrics?: DatabaseMetrics;
  private redisMetrics?: RedisMetrics;
  private backgroundTasksMetrics?: BackgroundTasksMetrics;

  constructor(
    metricsService: MetricsService,
    databaseMetrics?: DatabaseMetrics,
    redisMetrics?: RedisMetrics,
    backgroundTasksMetrics?: BackgroundTasksMetrics
  ) {
    this.metricsService = metricsService;
    this.databaseMetrics = databaseMetrics;
    this.redisMetrics = redisMetrics;
    this.backgroundTasksMetrics = backgroundTasksMetrics;
  }

  /**
   * Get all metrics
   * GET /metrics
   */
  public getAllMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = this.metricsService.getAllMetrics();
      responseUtils.sendSuccess(res, 'All metrics retrieved', metrics);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get application metrics summary
   * GET /metrics/summary
   */
  public getApplicationMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = this.metricsService.getApplicationMetrics();
      responseUtils.sendSuccess(res, 'Application metrics retrieved', metrics);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get counter metrics
   * GET /metrics/counters
   */
  public getCounterMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counters: Record<string, number> = {};
      
      // Get all counter names from metrics
      const allMetrics = this.metricsService.getAllMetrics();
      const counterNames = new Set(
        allMetrics
          .filter(metric => metric.type === 'counter')
          .map(metric => metric.name)
      );
      
      for (const name of counterNames) {
        counters[name] = this.metricsService.getCounter(name);
      }
      responseUtils.sendSuccess(res, 'Counter metrics retrieved', counters);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get gauge metrics
   * GET /metrics/gauges
   */
  public getGaugeMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const gauges: Record<string, number> = {};
      
      // Get all gauge names from metrics
      const allMetrics = this.metricsService.getAllMetrics();
      const gaugeNames = new Set(
        allMetrics
          .filter(metric => metric.type === 'gauge')
          .map(metric => metric.name)
      );
      
      for (const name of gaugeNames) {
        gauges[name] = this.metricsService.getGauge(name);
      }
      responseUtils.sendSuccess(res, 'Gauge metrics retrieved', gauges);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get histogram metrics
   * GET /metrics/histograms
   */
  public getHistogramMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const histograms: Record<string, any> = {};
      
      // Get all histogram names from metrics
      const allMetrics = this.metricsService.getAllMetrics();
      const histogramNames = new Set(
        allMetrics
          .filter(metric => metric.type === 'histogram')
          .map(metric => metric.name)
      );
      
      for (const name of histogramNames) {
        const stats = this.metricsService.getHistogramStats(name);
        if (stats) {
          histograms[name] = stats;
        }
      }
      responseUtils.sendSuccess(res, 'Histogram metrics retrieved', histograms);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get timer metrics
   * GET /metrics/timers
   */
  public getTimerMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const timers: Record<string, any> = {};
      
      // Get all timer names from metrics
      const allMetrics = this.metricsService.getAllMetrics();
      const timerNames = new Set(
        allMetrics
          .filter(metric => metric.type === 'timer')
          .map(metric => metric.name)
      );
      
      for (const name of timerNames) {
        const stats = this.metricsService.getTimerStats(name);
        if (stats) {
          timers[name] = stats;
        }
      }
      responseUtils.sendSuccess(res, 'Timer metrics retrieved', timers);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get specific metric by name
   * GET /metrics/:name
   */
  public getMetricByName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const metrics = this.metricsService.getMetrics(name);
      
      if (metrics.length === 0) {
        responseUtils.sendNotFound(res, `Metric '${name}' not found`);
        return;
      }
      responseUtils.sendSuccess(res, `Metric '${name}' retrieved`, metrics);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset all metrics
   * POST /metrics/reset
   */
  public resetMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.metricsService.reset();
      responseUtils.sendSuccess(res, 'All metrics reset', null);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get database metrics
   * GET /metrics/database
   */
  public getDatabaseMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.databaseMetrics) {
        responseUtils.sendNotFound(res, 'Database metrics not initialized');
        return;
      }
      
      const metrics = this.databaseMetrics.getDatabaseMetrics();
      responseUtils.sendSuccess(res, 'Database metrics retrieved', metrics);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get Redis metrics
   * GET /metrics/redis
   */
  public getRedisMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.redisMetrics) {
        responseUtils.sendNotFound(res, 'Redis metrics not initialized');
        return;
      }
      
      const metrics = this.redisMetrics.getRedisMetrics();
      responseUtils.sendSuccess(res, 'Redis metrics retrieved', metrics);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get background tasks metrics
   * GET /metrics/background-tasks
   */
  public getBackgroundTasksMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.backgroundTasksMetrics) {
        responseUtils.sendNotFound(res, 'Background tasks metrics not initialized');
        return;
      }
      
      const metrics = this.backgroundTasksMetrics.getBackgroundTasksMetrics();
      responseUtils.sendSuccess(res, 'Background tasks metrics retrieved', metrics);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get comprehensive system metrics
   * GET /metrics/system
   */
  public getSystemMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const systemMetrics = {
        application: this.metricsService.getApplicationMetrics(),
        database: this.databaseMetrics?.getDatabaseMetrics(),
        redis: this.redisMetrics?.getRedisMetrics(),
        backgroundTasks: this.backgroundTasksMetrics?.getBackgroundTasksMetrics(),
        timestamp: new Date().toISOString()
      };
      
      responseUtils.sendSuccess(res, 'System metrics retrieved', systemMetrics);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get Prometheus format metrics
   * GET /metrics/prometheus
   */
  public getPrometheusMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allMetrics = this.metricsService.getAllMetrics();
      let prometheusOutput = '';
      
      // Group metrics by name
      const metricsByName = new Map<string, any[]>();
      for (const metric of allMetrics) {
        if (!metricsByName.has(metric.name)) {
          metricsByName.set(metric.name, []);
        }
        metricsByName.get(metric.name)!.push(metric);
      }
      
      // Convert to Prometheus format
      for (const [name, metrics] of metricsByName) {
        const latestMetric = metrics[metrics.length - 1];
        
        if (latestMetric.type === 'counter') {
          const value = this.metricsService.getCounter(name);
          prometheusOutput += `# HELP ${name} ${name} counter\n`;
          prometheusOutput += `# TYPE ${name} counter\n`;
          prometheusOutput += `${name} ${value}\n\n`;

          // Labeled counter series (if any)
          const labeled = this.metricsService.getLabeledCounters(name);
          for (const series of labeled) {
            const labelStr = Object.keys(series.labels)
              .map(k => `${k}="${series.labels[k]}"`)
              .join(',');
            prometheusOutput += `${name}{${labelStr}} ${series.value}\n`;
          }
          if (labeled.length > 0) {
            prometheusOutput += `\n`;
          }
        } else if (latestMetric.type === 'gauge') {
          const value = this.metricsService.getGauge(name);
          prometheusOutput += `# HELP ${name} ${name} gauge\n`;
          prometheusOutput += `# TYPE ${name} gauge\n`;
          prometheusOutput += `${name} ${value}\n\n`;
        } else if (latestMetric.type === 'histogram') {
          const stats = this.metricsService.getHistogramStats(name);
          if (stats) {
            prometheusOutput += `# HELP ${name} ${name} histogram\n`;
            prometheusOutput += `# TYPE ${name} histogram\n`;
            // For duration histogram, expose standard buckets
            if (name === 'http_request_duration_seconds') {
              const all = (this as any).metricsService['histograms'].get(name) as number[] | undefined;
              const boundaries = [0.1, 0.3, 0.5, 1, 2, 5];
              if (all && all.length > 0) {
                for (const le of boundaries) {
                  const c = all.filter(v => v <= le).length;
                  prometheusOutput += `${name}_bucket{le="${le}"} ${c}\n`;
                }
              }
            }
            prometheusOutput += `${name}_count ${stats.count}\n`;
            prometheusOutput += `${name}_sum ${stats.sum}\n`;
            prometheusOutput += `${name}_bucket{le="+Inf"} ${stats.count}\n\n`;
          }

          // Labeled histogram series (if any)
          const labeledH = this.metricsService.getLabeledHistogramStats(name);
          for (const series of labeledH) {
            const labelStr = Object.keys(series.labels)
              .map(k => `${k}="${series.labels[k]}"`)
              .join(',');
            if (name === 'http_request_duration_seconds') {
              const key = `${name}|` + Object.keys(series.labels).sort().map(k => `${k}=${series.labels[k]}`).join(',');
              const all = (this as any).metricsService['labeledHistograms'].get(key) as number[] | undefined;
              const boundaries = [0.1, 0.3, 0.5, 1, 2, 5];
              if (all && all.length > 0) {
                for (const le of boundaries) {
                  const c = all.filter(v => v <= le).length;
                  prometheusOutput += `${name}_bucket{${labelStr},le="${le}"} ${c}\n`;
                }
              }
            }
            prometheusOutput += `${name}_count{${labelStr}} ${series.stats.count}\n`;
            prometheusOutput += `${name}_sum{${labelStr}} ${series.stats.sum}\n`;
            prometheusOutput += `${name}_bucket{${labelStr},le="+Inf"} ${series.stats.count}\n`;
          }
          if (labeledH.length > 0) {
            prometheusOutput += `\n`;
          }
        }
      }
      
      // If no metrics yet, expose a minimal baseline so the endpoint is not empty
      if (!prometheusOutput) {
        const up = 1;
        prometheusOutput += `# HELP lms_up LMS service availability\n`;
        prometheusOutput += `# TYPE lms_up gauge\n`;
        prometheusOutput += `lms_up ${up}\n\n`;

        const uptimeSeconds = Math.floor(process.uptime());
        prometheusOutput += `# HELP lms_process_uptime_seconds Process uptime in seconds\n`;
        prometheusOutput += `# TYPE lms_process_uptime_seconds gauge\n`;
        prometheusOutput += `lms_process_uptime_seconds ${uptimeSeconds}\n\n`;

        const mem = process.memoryUsage();
        prometheusOutput += `# HELP lms_process_resident_memory_bytes Resident memory size in bytes\n`;
        prometheusOutput += `# TYPE lms_process_resident_memory_bytes gauge\n`;
        prometheusOutput += `lms_process_resident_memory_bytes ${mem.rss}\n`;
      }

      res.set('Content-Type', 'text/plain');
      res.status(200).send(prometheusOutput);
    } catch (error) {
      next(error);
    }
  };
}
