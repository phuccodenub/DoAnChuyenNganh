/**
 * Cache Management Routes
 * Provides endpoints for cache management, performance analysis, and configuration
 */

import express, { Request, Response, NextFunction } from 'express';
import { enhancedCacheMiddleware } from './enhanced-cache.middleware';
import { responseUtils } from '../utils/response.util';

const router = express.Router();

/**
 * @swagger
 * /cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     description: Returns cache performance statistics including hit rate, memory usage, and key distribution
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Cache statistics retrieved
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
 *                     hits:
 *                       type: number
 *                     misses:
 *                       type: number
 *                     hitRate:
 *                       type: number
 *                     size:
 *                       type: number
 *                     memoryUsage:
 *                       type: number
 *                     evictions:
 *                       type: number
 *                     lastCleanup:
 *                       type: string
 */
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await enhancedCacheMiddleware.getCacheStats();
    responseUtils.sendSuccess(res, 'Cache statistics retrieved', stats);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /cache/performance:
 *   get:
 *     summary: Get cache performance report
 *     description: Returns detailed cache performance analysis including hot endpoints and recommendations
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Cache performance report retrieved
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
 *                     overallHitRate:
 *                       type: number
 *                     hotEndpoints:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           endpoint:
 *                             type: string
 *                           method:
 *                             type: string
 *                           totalRequests:
 *                             type: number
 *                           cacheHits:
 *                             type: number
 *                           cacheMisses:
 *                             type: number
 *                           hitRate:
 *                             type: number
 *                           averageResponseTime:
 *                             type: number
 *                           frequency:
 *                             type: number
 *                     coldEndpoints:
 *                       type: array
 *                       items:
 *                         type: object
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *                     cacheEfficiency:
 *                       type: object
 */
router.get('/performance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = enhancedCacheMiddleware.getPerformanceReport();
    responseUtils.sendSuccess(res, 'Cache performance report retrieved', report);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /cache/hot-endpoints:
 *   get:
 *     summary: Get hot endpoints
 *     description: Returns endpoints that need cache optimization based on frequency and hit rate
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Hot endpoints retrieved
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
 *                     properties:
 *                       endpoint:
 *                         type: string
 *                       method:
 *                         type: string
 *                       hitRate:
 *                         type: number
 *                       frequency:
 *                         type: number
 *                       totalRequests:
 *                         type: number
 */
router.get('/hot-endpoints', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotEndpoints = enhancedCacheMiddleware.getHotEndpoints();
    responseUtils.sendSuccess(res, 'Hot endpoints retrieved', hotEndpoints);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /cache/configuration:
 *   get:
 *     summary: Get cache configuration
 *     description: Returns current cache configuration including rules, policies, and user roles
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Cache configuration retrieved
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
 *                     rules:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           pattern:
 *                             type: string
 *                           method:
 *                             type: string
 *                           policy:
 *                             type: object
 *                           description:
 *                             type: string
 *                     defaultPolicy:
 *                       type: object
 *                     userRoles:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/configuration', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = enhancedCacheMiddleware.getCacheConfiguration();
    responseUtils.sendSuccess(res, 'Cache configuration retrieved', config);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /cache/configuration:
 *   put:
 *     summary: Update cache configuration
 *     description: Updates cache configuration with new rules and policies
 *     tags: [Cache]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rules:
 *                 type: array
 *                 items:
 *                   type: object
 *               defaultPolicy:
 *                 type: object
 *               userRoles:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Cache configuration updated
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
router.put('/configuration', async (req: Request, res: Response, next: NextFunction) => {
  try {
    enhancedCacheMiddleware.updateCacheConfiguration(req.body);
    responseUtils.sendSuccess(res, 'Cache configuration updated', null);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /cache/invalidation/stats:
 *   get:
 *     summary: Get invalidation statistics
 *     description: Returns cache invalidation statistics including total events and recent activity
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Invalidation statistics retrieved
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
 *                     totalEvents:
 *                       type: number
 *                     queueSize:
 *                       type: number
 *                     patternsCount:
 *                       type: number
 *                     tagsCount:
 *                       type: number
 *                     recentEvents:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/invalidation/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = enhancedCacheMiddleware.getInvalidationStats();
    responseUtils.sendSuccess(res, 'Invalidation statistics retrieved', stats);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /cache/invalidate/pattern:
 *   post:
 *     summary: Invalidate cache by pattern
 *     description: Invalidates cache entries matching a specific pattern
 *     tags: [Cache]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pattern
 *             properties:
 *               pattern:
 *                 type: string
 *                 description: Cache key pattern to invalidate
 *               reason:
 *                 type: string
 *                 description: Reason for invalidation
 *     responses:
 *       200:
 *         description: Cache invalidated by pattern
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
router.post('/invalidate/pattern', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pattern, reason } = req.body;
    await enhancedCacheMiddleware.invalidateByPattern(pattern, reason);
    responseUtils.sendSuccess(res, 'Cache invalidated by pattern', null);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /cache/invalidate/tags:
 *   post:
 *     summary: Invalidate cache by tags
 *     description: Invalidates cache entries with specific tags
 *     tags: [Cache]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tags
 *             properties:
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Cache tags to invalidate
 *               reason:
 *                 type: string
 *                 description: Reason for invalidation
 *     responses:
 *       200:
 *         description: Cache invalidated by tags
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
router.post('/invalidate/tags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tags, reason } = req.body;
    await enhancedCacheMiddleware.invalidateByTags(tags, reason);
    responseUtils.sendSuccess(res, 'Cache invalidated by tags', null);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /cache/invalidate/entity:
 *   post:
 *     summary: Invalidate cache for entity
 *     description: Invalidates cache entries for a specific entity
 *     tags: [Cache]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entity
 *               - entityId
 *               - operation
 *             properties:
 *               entity:
 *                 type: string
 *                 description: Entity type (e.g., courses, users, enrollments)
 *               entityId:
 *                 type: string
 *                 description: Entity ID
 *               operation:
 *                 type: string
 *                 enum: [create, update, delete]
 *                 description: Operation type
 *     responses:
 *       200:
 *         description: Cache invalidated for entity
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
router.post('/invalidate/entity', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entity, entityId, operation } = req.body;
    await enhancedCacheMiddleware.invalidateEntity(entity, entityId, operation);
    responseUtils.sendSuccess(res, 'Cache invalidated for entity', null);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /cache/clear:
 *   post:
 *     summary: Clear all cache
 *     description: Clears all cache entries
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: All cache cleared
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
router.post('/clear', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await enhancedCacheMiddleware.clearAllCache();
    responseUtils.sendSuccess(res, 'All cache cleared', null);
  } catch (error) {
    next(error);
  }
});

export default router;
