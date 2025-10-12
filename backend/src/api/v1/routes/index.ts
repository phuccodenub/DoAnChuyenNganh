/**
 * API v1 Routes
 * Centralized exports for v1 API routes
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = Router();

// Mount v1 routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
