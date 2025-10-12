/**
 * API Version Routes
 * Provides version information and management endpoints
 */

import { Router } from 'express';
import { versionManager } from './version.config';

const router = Router();

/**
 * @swagger
 * /api/versions:
 *   get:
 *     summary: Get all API versions
 *     description: Returns information about all available API versions
 *     tags: [API Versioning]
 *     responses:
 *       200:
 *         description: All versions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     versions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           version:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [stable, beta, deprecated, sunset]
 *                           releaseDate:
 *                             type: string
 *                             format: date-time
 *                           sunsetDate:
 *                             type: string
 *                             format: date-time
 *                           description:
 *                             type: string
 *                     defaultVersion:
 *                       type: string
 *                     supportedVersions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     latestStable:
 *                       type: string
 */
router.get('/', versionManager.getAllVersionsEndpoint);

/**
 * @swagger
 * /api/versions/{version}:
 *   get:
 *     summary: Get specific API version information
 *     description: Returns detailed information about a specific API version
 *     tags: [API Versioning]
 *     parameters:
 *       - in: path
 *         name: version
 *         required: true
 *         schema:
 *           type: string
 *         description: API version (e.g., v1.0.0)
 *     responses:
 *       200:
 *         description: Version information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [stable, beta, deprecated, sunset]
 *                     releaseDate:
 *                       type: string
 *                       format: date-time
 *                     sunsetDate:
 *                       type: string
 *                       format: date-time
 *                     description:
 *                       type: string
 *                     changes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     breakingChanges:
 *                       type: array
 *                       items:
 *                         type: string
 *                     migrationGuide:
 *                       type: string
 *       404:
 *         description: Version not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.get('/:version', versionManager.getVersionInfoEndpoint);

export default router;
