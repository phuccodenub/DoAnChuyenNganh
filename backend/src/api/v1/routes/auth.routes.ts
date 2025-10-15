/**
 * API v1 Authentication Routes
 * Version 1.0.0 - 1.2.0 compatible
 */

import { Router } from 'express';
import { authRoutes as v1AuthRoutes } from '../../../modules/auth';

const router = Router();

// Mount v1 auth routes
router.use('/', v1AuthRoutes);

export default router;

