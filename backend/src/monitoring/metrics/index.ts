/**
 * Metrics Module
 * Exports metrics components
 */

export { MetricsService } from './metrics.service';
export { MetricsController } from './metrics.controller';
export { MetricsMiddleware, metricsMiddleware } from './metrics.middleware';
export { default as metricsRoutes } from './metrics.routes';

// Re-export types
export type {
  MetricData,
  CounterMetric,
  GaugeMetric,
  HistogramMetric,
  TimerMetric,
  ApplicationMetrics
} from './metrics.service';

