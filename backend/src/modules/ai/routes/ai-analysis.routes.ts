/**
 * AI Analysis Routes
 * 
 * Routes for AI lesson analysis functionality
 */

import { Router } from 'express';
import {
  requestLessonAnalysis,
  getLessonAnalysis,
  deleteLessonAnalysis,
  getProxyPalStatus,
  getAnalysisQueue,
  forceProcessQueue,
} from '../controllers/ai-analysis.controller';
import { authMiddleware, authorizeRoles } from '../../../middlewares/auth.middleware';

const router = Router();

// Lesson analysis endpoints (mounted at /ai/analysis)
router.post(
  '/:lessonId',
  authMiddleware,
  authorizeRoles(['instructor', 'admin']),
  requestLessonAnalysis
);

router.get(
  '/:lessonId',
  authMiddleware,
  getLessonAnalysis
);

router.delete(
  '/:lessonId',
  authMiddleware,
  authorizeRoles(['instructor', 'admin']),
  deleteLessonAnalysis
);

// ProxyPal status
router.get(
  '/proxypal/status',
  authMiddleware,
  authorizeRoles(['instructor', 'admin']),
  getProxyPalStatus
);

// Queue management (admin only)
router.get(
  '/queue',
  authMiddleware,
  authorizeRoles(['admin']),
  getAnalysisQueue
);

router.post(
  '/queue/process',
  authMiddleware,
  authorizeRoles(['admin']),
  forceProcessQueue
);

export default router;
