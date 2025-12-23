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
import { UserRole } from '../../../constants/roles.enum';


const router = Router();

// IMPORTANT: Specific routes MUST come BEFORE dynamic parameter routes
// Otherwise /:lessonId will match everything like "/proxypal/status" or "/queue"

// ProxyPal status - must be before /:lessonId
router.get(
  '/proxypal/status',
  authMiddleware,
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  getProxyPalStatus
);


// Queue management (admin only) - must be before /:lessonId
router.get(
  '/queue',
  authMiddleware,
  authorizeRoles([UserRole.ADMIN]),
  getAnalysisQueue
);


router.post(
  '/queue/process',
  authMiddleware,
  authorizeRoles([UserRole.ADMIN]),
  forceProcessQueue
);


// Lesson analysis endpoints - dynamic routes come LAST
router.post(
  '/:lessonId',
  authMiddleware,
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
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
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  deleteLessonAnalysis
);


export default router;
