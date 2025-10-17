/**
 * API v1 Authentication Routes
 * Version 1.0.0 - 1.2.0 compatible
 */

import express from 'express';
import { authRoutes as v1AuthRoutes } from '../../../modules/auth';

const router = express.Router();

// Mount v1 auth routes
router.use('/', v1AuthRoutes);

export default router;
