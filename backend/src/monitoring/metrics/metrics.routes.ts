/**
 * Metrics Routes
 * Defines routes for metrics endpoints
 */

import { Router } from 'express';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

const router = Router();
const disableMetrics = process.env.DISABLE_METRICS === 'true' || process.env.NODE_ENV === 'test';

let metricsController: MetricsController | null = null;
if (!disableMetrics) {
	const metricsService = new MetricsService();
	metricsController = new MetricsController(metricsService);
}

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
if (metricsController) {
	router.get('/', metricsController.getAllMetrics);
}

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
if (metricsController) {
	router.get('/summary', metricsController.getApplicationMetrics);
}

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
if (metricsController) {
	router.get('/counters', metricsController.getCounterMetrics);
}

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
if (metricsController) {
	router.get('/gauges', metricsController.getGaugeMetrics);
}

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
if (metricsController) {
	router.get('/histograms', metricsController.getHistogramMetrics);
}

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
if (metricsController) {
	router.get('/timers', metricsController.getTimerMetrics);
}

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
if (metricsController) {
	router.get('/:name', metricsController.getMetricByName);
}

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
if (metricsController) {
	router.post('/reset', metricsController.resetMetrics);
}

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
if (metricsController) {
	router.get('/prometheus', metricsController.getPrometheusMetrics);
}

export default router;

