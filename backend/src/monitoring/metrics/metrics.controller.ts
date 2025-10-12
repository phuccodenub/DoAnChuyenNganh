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
      
      res.status(200).json(responseUtils.success(metrics, 'All metrics retrieved'));
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
      
      res.status(200).json(responseUtils.success(metrics, 'Application metrics retrieved'));
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
      
      res.status(200).json(responseUtils.success(counters, 'Counter metrics retrieved'));
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
      
      res.status(200).json(responseUtils.success(gauges, 'Gauge metrics retrieved'));
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
      
      res.status(200).json(responseUtils.success(histograms, 'Histogram metrics retrieved'));
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
      
      res.status(200).json(responseUtils.success(timers, 'Timer metrics retrieved'));
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
        res.status(404).json(responseUtils.error(`Metric '${name}' not found`));
        return;
      }
      
      res.status(200).json(responseUtils.success(metrics, `Metric '${name}' retrieved`));
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
      
      res.status(200).json(responseUtils.success(null, 'All metrics reset'));
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
            prometheusOutput += `${name}_count ${stats.count}\n`;
            prometheusOutput += `${name}_sum ${stats.sum}\n`;
            prometheusOutput += `${name}_bucket{le="+Inf"} ${stats.count}\n\n`;
          }
        }
      }
      
      res.set('Content-Type', 'text/plain');
      res.status(200).send(prometheusOutput);
    } catch (error) {
      next(error);
    }
  };
}
