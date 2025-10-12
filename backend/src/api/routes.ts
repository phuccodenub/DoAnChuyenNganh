/**
 * API Routes Manager
 * Handles versioned API routing
 */

import { Router } from 'express';
import { versionManager, versionRoutes } from './versioning';
import { v1Routes } from './v1';
import { v2Routes } from './v2';

const router = Router();

// Mount version routes
router.use('/v1.0.0', v1Routes);
router.use('/v1.1.0', v1Routes);
router.use('/v1.2.0', v1Routes);
router.use('/v2.0.0', v2Routes);

// Mount version information routes
router.use('/versions', versionManager.versionMiddleware, versionRoutes);

// Default route (latest stable version)
router.use('/', versionManager.versionMiddleware, (req, res, next) => {
  const version = (req as any).apiVersion;
  
  // Redirect to versioned route
  if (version === 'v1.0.0' || version === 'v1.1.0' || version === 'v1.2.0') {
    req.url = `/v1.2.0${req.url}`;
    return v1Routes(req, res, next);
  } else if (version === 'v2.0.0') {
    req.url = `/v2.0.0${req.url}`;
    return v2Routes(req, res, next);
  }
  
  // Fallback to latest stable
  req.url = `/v1.2.0${req.url}`;
  return v1Routes(req, res, next);
});

export default router;
