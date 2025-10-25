/**
 * Metrics Controller
 * Provides metrics endpoints for monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';
import { responseUtils } from '../../utils/response.util';

export class MetricsController {
  private metricsService: MetricsService;

  constructor(metricsService: MetricsService) {
    this.metricsService = metricsService;
  }

  /**
   * Get all metrics
   * GET /metrics
   */
  public getAllMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = this.metricsService.getAllMetrics();
      responseUtils.sendSuccess(res, 'All metrics retrieved', metrics);
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
      const allMetrics = this.metricsService.getAllMetrics() as any[];
      const counterNames = new Set(
        allMetrics
          .filter((metric: any) => metric.type === 'counter')
          .map(metric => metric.name)
      );
      
      for (const name of counterNames) {
        counters[name] = this.metricsService.getCounter(name);
      }
      
      responseUtils.sendSuccess(res, 'Counter metrics retrieved', counters);
    } catch (error: unknown) {
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
      const allMetrics = this.metricsService.getAllMetrics() as any[];
      const gaugeNames = new Set(
        allMetrics
          .filter((metric: any) => metric.type === 'gauge')
          .map(metric => metric.name)
      );
      
      for (const name of gaugeNames) {
        gauges[name] = this.metricsService.getGauge(name);
      }
      
      responseUtils.sendSuccess(res, 'Gauge metrics retrieved', gauges);
    } catch (error: unknown) {
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
      const allMetrics = this.metricsService.getAllMetrics() as any[];
      const histogramNames = new Set(
        allMetrics
          .filter((metric: any) => metric.type === 'histogram')
          .map(metric => metric.name)
      );
      
      for (const name of histogramNames) {
        const stats = this.metricsService.getHistogramStats(name);
        if (stats) {
          histograms[name] = stats;
        }
      }
      
      responseUtils.sendSuccess(res, 'Histogram metrics retrieved', histograms);
    } catch (error: unknown) {
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
      const allMetrics = this.metricsService.getAllMetrics() as any[];
      const timerNames = new Set(
        allMetrics
          .filter((metric: any) => metric.type === 'timer')
          .map(metric => metric.name)
      );
      
      for (const name of timerNames) {
        const stats = this.metricsService.getTimerStats(name);
        if (stats) {
          timers[name] = stats;
        }
      }
      
      responseUtils.sendSuccess(res, 'Timer metrics retrieved', timers);
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
        const latestMetric = metrics[metrics.length - 1] as any;
        
        if (latestMetric.type === 'counter') {
          const value = this.metricsService.getCounter(name);
          prometheusOutput += `# HELP ${name} ${name} counter\n`;
          prometheusOutput += `# TYPE ${name} counter\n`;
          prometheusOutput += `${name} ${value}\n\n`;
        } else if ((latestMetric as any).type === 'gauge') {
          const value = this.metricsService.getGauge(name);
          prometheusOutput += `# HELP ${name} ${name} gauge\n`;
          prometheusOutput += `# TYPE ${name} gauge\n`;
          prometheusOutput += `${name} ${value}\n\n`;
        } else if ((latestMetric as any).type === 'histogram') {
          const stats = this.metricsService.getHistogramStats(name);
          if (stats) {
            prometheusOutput += `# HELP ${name} ${name} histogram\n`;
            prometheusOutput += `# TYPE ${name} histogram\n`;
            prometheusOutput += `${name}_count ${stats.count}\n`;
            prometheusOutput += `${name}_sum ${stats.sum}\n`;
            prometheusOutput += `${name}_bucket{le="+Inf"} ${stats.count}\n\n`;
          }
        }
      }
      
      res.set('Content-Type', 'text/plain');
      res.status(200).send(prometheusOutput);
    } catch (error: unknown) {
      next(error);
    }
  };
}

