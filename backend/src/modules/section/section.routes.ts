import express, { Request, Response, NextFunction } from 'express';
import { SectionController } from './section.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validate.middleware';
import { sectionSchemas } from './section.validate';

const router = express.Router();
const sectionController = new SectionController();

// All routes require authentication
router.use(authMiddleware);

// ===== SECTION MANAGEMENT ROUTES =====

// Get all sections (All authenticated users)
router.get(
  '/',
  validateQuery(sectionSchemas.sectionQuery),
  (req: Request, res: Response, next: NextFunction) => sectionController.getAllSections(req, res, next)
);

// Get section by ID (All authenticated users)
router.get(
  '/:id',
  validateParams(sectionSchemas.sectionId),
  (req: Request, res: Response, next: NextFunction) => sectionController.getSectionById(req, res, next)
);

// Create new section (Instructor/Admin only)
router.post(
  '/',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateBody(sectionSchemas.createSection),
  (req: Request, res: Response, next: NextFunction) => sectionController.createSection(req, res, next)
);

// Update section (Instructor/Admin only)
router.put(
  '/:id',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateParams(sectionSchemas.sectionId),
  validateBody(sectionSchemas.updateSection),
  (req: Request, res: Response, next: NextFunction) => sectionController.updateSection(req, res, next)
);

// Delete section (Instructor/Admin only)
router.delete(
  '/:id',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateParams(sectionSchemas.sectionId),
  (req: Request, res: Response, next: NextFunction) => sectionController.deleteSection(req, res, next)
);

export default router;
