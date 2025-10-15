/**
 * Metrics Routes
 * Defines routes for metrics endpoints
 */

import { Router } from 'express';
import { MetricsController } from './metrics.controller';
import { metricsMiddleware } from './metrics.middleware';

const router = Router();
// Use the SAME singleton MetricsService instance as the middleware
// to ensure counters/gauges recorded by middleware are visible to controllers
const sharedMetricsService: any = (metricsMiddleware as any)['metricsService'];
const databaseMetrics = metricsMiddleware.getDatabaseMetrics();
const redisMetrics = metricsMiddleware.getRedisMetrics();
const backgroundTasksMetrics = metricsMiddleware.getBackgroundTasksMetrics();
const metricsController = new MetricsController(
  sharedMetricsService,
  databaseMetrics,
  redisMetrics,
  backgroundTasksMetrics
);

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get all metrics
 *     description: Returns all collected metrics
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: All metrics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/', metricsController.getAllMetrics);

/**
 * @swagger
 * /metrics/summary:
 *   get:
 *     summary: Get application metrics summary
 *     description: Returns comprehensive application metrics summary
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Application metrics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     requests:
 *                       type: object
 *                     responseTime:
 *                       type: object
 *                     errors:
 *                       type: object
 *                     database:
 *                       type: object
 *                     redis:
 *                       type: object
 *                     memory:
 *                       type: object
 *                     uptime:
 *                       type: number
 *                     timestamp:
 *                       type: string
 */
router.get('/summary', metricsController.getApplicationMetrics);

/**
 * @swagger
 * /metrics/counters:
 *   get:
 *     summary: Get counter metrics
 *     description: Returns all counter metrics
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Counter metrics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 */
router.get('/counters', metricsController.getCounterMetrics);

/**
 * @swagger
 * /metrics/gauges:
 *   get:
 *     summary: Get gauge metrics
 *     description: Returns all gauge metrics
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Gauge metrics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 */
router.get('/gauges', metricsController.getGaugeMetrics);

/**
 * @swagger
 * /metrics/histograms:
 *   get:
 *     summary: Get histogram metrics
 *     description: Returns all histogram metrics with statistics
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Histogram metrics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       count:
 *                         type: number
 *                       sum:
 *                         type: number
 *                       average:
 *                         type: number
 *                       p50:
 *                         type: number
 *                       p95:
 *                         type: number
 *                       p99:
 *                         type: number
 */
router.get('/histograms', metricsController.getHistogramMetrics);

/**
 * @swagger
 * /metrics/timers:
 *   get:
 *     summary: Get timer metrics
 *     description: Returns all timer metrics with statistics
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Timer metrics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       count:
 *                         type: number
 *                       sum:
 *                         type: number
 *                       average:
 *                         type: number
 *                       p50:
 *                         type: number
 *                       p95:
 *                         type: number
 *                       p99:
 *                         type: number
 */
router.get('/timers', metricsController.getTimerMetrics);

/**
 * @swagger
 * /metrics/database:
 *   get:
 *     summary: Get database metrics
 *     description: Returns database-specific metrics including query counts, slow queries, and connection pool stats
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Database metrics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     queries:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         slow:
 *                           type: number
 *                         byType:
 *                           type: object
 *                     connections:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         idle:
 *                           type: number
 *                         using:
 *                           type: number
 *                         waiting:
 *                           type: number
 *                         utilization:
 *                           type: number
 *                     transactions:
 *                       type: object
 *                     migrations:
 *                       type: object
 *       404:
 *         description: Database metrics not initialized
 */
router.get('/database', metricsController.getDatabaseMetrics);

/**
 * @swagger
 * /metrics/redis:
 *   get:
 *     summary: Get Redis metrics
 *     description: Returns Redis-specific metrics including operations, cache hits/misses, and memory usage
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Redis metrics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     operations:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         byType:
 *                           type: object
 *                         errors:
 *                           type: number
 *                     cache:
 *                       type: object
 *                       properties:
 *                         hits:
 *                           type: number
 *                         misses:
 *                           type: number
 *                         hitRatio:
 *                           type: number
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: number
 *                         peak:
 *                           type: number
 *                         rss:
 *                           type: number
 *                     keys:
 *                       type: number
 *       404:
 *         description: Redis metrics not initialized
 */
router.get('/redis', metricsController.getRedisMetrics);

/**
 * @swagger
 * /metrics/background-tasks:
 *   get:
 *     summary: Get background tasks metrics
 *     description: Returns background tasks metrics including cron jobs, scheduled tasks, and job queue stats
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Background tasks metrics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         running:
 *                           type: number
 *                         byType:
 *                           type: object
 *                     executions:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         successful:
 *                           type: number
 *                         failed:
 *                           type: number
 *                     jobs:
 *                       type: object
 *                       properties:
 *                         enqueued:
 *                           type: number
 *                         processing:
 *                           type: number
 *                         completed:
 *                           type: number
 *                         failed:
 *                           type: number
 *                     schedules:
 *                       type: object
 *                       properties:
 *                         triggered:
 *                           type: number
 *                         byType:
 *                           type: object
 *       404:
 *         description: Background tasks metrics not initialized
 */
router.get('/background-tasks', metricsController.getBackgroundTasksMetrics);

/**
 * @swagger
 * /metrics/system:
 *   get:
 *     summary: Get comprehensive system metrics
 *     description: Returns all system metrics including application, database, Redis, and background tasks
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: System metrics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     application:
 *                       type: object
 *                     database:
 *                       type: object
 *                     redis:
 *                       type: object
 *                     backgroundTasks:
 *                       type: object
 *                     timestamp:
 *                       type: string
 */
router.get('/system', metricsController.getSystemMetrics);

/**
 * @swagger
 * /metrics/{name}:
 *   get:
 *     summary: Get specific metric by name
 *     description: Returns metrics for a specific metric name
 *     tags: [Metrics]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Metric name
 *     responses:
 *       200:
 *         description: Metric retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Metric not found
 */
// Place specific routes BEFORE the parameterized route to avoid conflicts
router.get('/prometheus', metricsController.getPrometheusMetrics);
router.post('/reset', metricsController.resetMetrics);
router.get('/:name', metricsController.getMetricByName);

/**
 * @swagger
 * /metrics/reset:
 *   post:
 *     summary: Reset all metrics
 *     description: Resets all collected metrics
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: All metrics reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: null
 */
// moved above

/**
 * @swagger
 * /metrics/prometheus:
 *   get:
 *     summary: Get Prometheus format metrics
 *     description: Returns metrics in Prometheus format
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Prometheus metrics retrieved
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
// moved above

export default router;
