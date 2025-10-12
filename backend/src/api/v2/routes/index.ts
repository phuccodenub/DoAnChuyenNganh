/**
 * API v2 Routes
 * Centralized exports for v2 API routes
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = Router();

// Mount v2 routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
