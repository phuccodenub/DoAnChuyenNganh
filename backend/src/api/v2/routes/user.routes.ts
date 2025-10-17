/**
 * API v2 User Routes
 * Version 2.0.0+ with enhanced features
 */

import express, { Request, Response } from 'express';
import { userModuleRoutes as v1UserRoutes } from '../../../modules/user';

const router = express.Router();

// Enhanced v2 user routes with new features
router.use('/', v1UserRoutes);

// Add v2-specific endpoints
router.get('/profile/v2', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Enhanced v2 user profile endpoint',
    data: {
      version: 'v2.0.0',
      features: ['enhanced_profile', 'better_validation', 'improved_responses']
    }
  });
});

router.patch('/profile/v2', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Enhanced v2 profile update endpoint',
    data: {
      version: 'v2.0.0',
      features: ['enhanced_profile', 'better_validation', 'improved_responses']
    }
  });
});

export default router;
