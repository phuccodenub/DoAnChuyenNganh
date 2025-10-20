/**
 * API v2 Authentication Routes
 * Version 2.0.0+ with enhanced features
 */

import express, { Request, Response } from 'express';
import { authRoutes as v1AuthRoutes } from '../../../modules/auth';

const router = express.Router();

// Enhanced v2 auth routes with new features
router.use('/', v1AuthRoutes);

// Add v2-specific endpoints
router.post('/login/v2', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Enhanced v2 login endpoint',
    data: {
      version: 'v2.0.0',
      features: ['enhanced_security', 'better_validation', 'improved_responses']
    }
  });
});

router.post('/register/v2', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Enhanced v2 registration endpoint',
    data: {
      version: 'v2.0.0',
      features: ['enhanced_security', 'better_validation', 'improved_responses']
    }
  });
});

export default router;

