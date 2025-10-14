/**
 * API Routes Manager
 * Handles versioned API routing
 */

import { Router } from 'express';
import { versionManager, versionRoutes } from './versioning';
import { v1Routes } from './v1';
import { v2Routes } from './v2';
import env from '../config/env.config';

const router = Router();

// Mount version routes
router.use('/v1.0.0', v1Routes);
router.use('/v1.1.0', v1Routes);
router.use('/v1.2.0', v1Routes);
router.use('/v1.3.0', v1Routes);
router.use('/v2.0.0', v2Routes);

// Mount version information routes
router.use('/versions', versionManager.versionMiddleware, versionRoutes);

// Default route (dispatch based on resolved version)
router.use('/', versionManager.versionMiddleware, (req, res, next) => {
  const version = (req as any).apiVersion || env.api.defaultVersion;

  // Route to major version router
  if (version.startsWith('v1.')) {
    req.url = `/${version}${req.url}`;
    return v1Routes(req, res, next);
  }
  if (version.startsWith('v2.')) {
    req.url = `/${version}${req.url}`;
    return v2Routes(req, res, next);
  }

  // Fallback to default
  req.url = `/${env.api.defaultVersion}${req.url}`;
  return v1Routes(req, res, next);
});

export default router;
