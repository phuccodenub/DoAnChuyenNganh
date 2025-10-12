/**
 * Health Check Routes
 * Defines routes for health check endpoints
 */

import { Router } from 'express';
import { HealthController } from './health.controller';

const router = Router();
const healthController = new HealthController();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     description: Returns basic health status of the service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
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
 *                     status:
 *                       type: string
 *                       enum: [healthy, unhealthy, degraded]
 *                     timestamp:
 *                       type: string
 *                     uptime:
 *                       type: number
 *                     version:
 *                       type: string
 *                     environment:
 *                       type: string
 */
router.get('/', healthController.getHealth);

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check
 *     description: Returns detailed health status including all services
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health check completed
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
 *                     status:
 *                       type: string
 *                       enum: [healthy, unhealthy, degraded]
 *                     timestamp:
 *                       type: string
 *                     uptime:
 *                       type: number
 *                     version:
 *                       type: string
 *                     environment:
 *                       type: string
 *                     services:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: object
 *                         redis:
 *                           type: object
 *                         memory:
 *                           type: object
 *                     checks:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: boolean
 *                         redis:
 *                           type: boolean
 *                         memory:
 *                           type: boolean
 */
router.get('/detailed', healthController.getDetailedHealth);

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Kubernetes readiness probe endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
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
 *                     status:
 *                       type: string
 *                       enum: [ready, not_ready]
 *                     checks:
 *                       type: object
 *                     timestamp:
 *                       type: string
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', healthController.getReadiness);

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Kubernetes liveness probe endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
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
 *                     status:
 *                       type: string
 *                       enum: [alive, not_alive]
 *                     uptime:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *       503:
 *         description: Service is not alive
 */
router.get('/live', healthController.getLiveness);

/**
 * @swagger
 * /health/database:
 *   get:
 *     summary: Database health check
 *     description: Returns database health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Database is healthy
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
 *                     status:
 *                       type: string
 *                       enum: [healthy, unhealthy, degraded]
 *                     responseTime:
 *                       type: number
 *                     connectionPool:
 *                       type: object
 *                     queries:
 *                       type: object
 *       503:
 *         description: Database is unhealthy
 */
router.get('/database', healthController.getDatabaseHealth);

/**
 * @swagger
 * /health/redis:
 *   get:
 *     summary: Redis health check
 *     description: Returns Redis health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Redis is healthy
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
 *                     status:
 *                       type: string
 *                       enum: [healthy, unhealthy, degraded]
 *                     responseTime:
 *                       type: number
 *                     memory:
 *                       type: object
 *                     clients:
 *                       type: object
 *                     keyspace:
 *                       type: object
 *       503:
 *         description: Redis is unhealthy
 */
router.get('/redis', healthController.getRedisHealth);

/**
 * @swagger
 * /health/memory:
 *   get:
 *     summary: Memory health check
 *     description: Returns memory usage and health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Memory health check completed
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
 *                     status:
 *                       type: string
 *                       enum: [healthy, unhealthy, degraded]
 *                     usage:
 *                       type: object
 *                     percentage:
 *                       type: number
 *                     threshold:
 *                       type: object
 */
router.get('/memory', healthController.getMemoryHealth);

/**
 * @swagger
 * /health/metrics:
 *   get:
 *     summary: System metrics
 *     description: Returns comprehensive system metrics
 *     tags: [Health]
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
 *                     timestamp:
 *                       type: string
 *                     uptime:
 *                       type: number
 *                     memory:
 *                       type: object
 *                     cpu:
 *                       type: object
 *                     process:
 *                       type: object
 *                     environment:
 *                       type: string
 */
router.get('/metrics', healthController.getMetrics);

export default router;
