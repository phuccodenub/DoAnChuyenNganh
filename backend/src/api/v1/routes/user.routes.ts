/**
 * API v1 User Routes
 * Version 1.0.0 - 1.2.0 compatible
 */

import { Router } from 'express';
import { userModuleRoutes as v1UserRoutes } from '../../../modules/user';

const router = Router();

// Mount v1 user routes
router.use('/', v1UserRoutes);

export default router;

