/**
 * API v1 User Routes
 * Version 1.0.0 - 1.2.0 compatible
 */

import express, { Request, Response } from 'express';
import { userModuleRoutes as v1UserRoutes } from '../../../modules/user';
import logger from '../../../utils/logger.util';

const router = express.Router();

// Mount v1 user routes
logger.info('Mounting v1 user self-service routes', { hasRoutes: !!v1UserRoutes });
router.use('/', v1UserRoutes);

// Temporary debug endpoint to verify router is mounted (not used by tests)
router.get('/__v1_users_router_ok', (_req: Request, res: Response) => res.status(200).json({ ok: true }));

export default router;

