/**
 * API v1 Routes
 * Centralized exports for v1 API routes
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import courseRoutes from './course.routes';
import enrollmentRoutes from './enrollment.routes';

const router = Router();

// Mount v1 routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);

export default router;
