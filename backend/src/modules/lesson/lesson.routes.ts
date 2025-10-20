import express, { Request, Response, NextFunction } from 'express';
import { LessonController } from './lesson.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validate.middleware';
import { lessonSchemas } from './lesson.validate';

const router = express.Router();
const lessonController = new LessonController();

// All routes require authentication
router.use(authMiddleware);

// ===== LESSON MANAGEMENT ROUTES =====

// Get all lessons (All authenticated users)
router.get(
  '/',
  validateQuery(lessonSchemas.lessonQuery),
  (req: Request, res: Response, next: NextFunction) => lessonController.getAllLessons(req, res, next)
);

// Get lesson by ID (All authenticated users)
router.get(
  '/:id',
  validateParams(lessonSchemas.lessonId),
  (req: Request, res: Response, next: NextFunction) => lessonController.getLessonById(req, res, next)
);

// Create new lesson (Instructor/Admin only)
router.post(
  '/',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateBody(lessonSchemas.createLesson),
  (req: Request, res: Response, next: NextFunction) => lessonController.createLesson(req, res, next)
);

// Update lesson (Instructor/Admin only)
router.put(
  '/:id',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateParams(lessonSchemas.lessonId),
  validateBody(lessonSchemas.updateLesson),
  (req: Request, res: Response, next: NextFunction) => lessonController.updateLesson(req, res, next)
);

// Delete lesson (Instructor/Admin only)
router.delete(
  '/:id',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateParams(lessonSchemas.lessonId),
  (req: Request, res: Response, next: NextFunction) => lessonController.deleteLesson(req, res, next)
);

export default router;
