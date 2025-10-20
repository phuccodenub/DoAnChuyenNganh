import express, { Request, Response, NextFunction } from 'express';
import { AssignmentController } from './assignment.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validate.middleware';
import { assignmentSchemas } from './assignment.validate';

const router = express.Router();
const assignmentController = new AssignmentController();

// All routes require authentication
router.use(authMiddleware);

// ===== ASSIGNMENT MANAGEMENT ROUTES =====

// Get all assignments (All authenticated users)
router.get(
  '/',
  validateQuery(assignmentSchemas.assignmentQuery),
  (req: Request, res: Response, next: NextFunction) => assignmentController.getAllAssignments(req, res, next)
);

// Get assignment by ID (All authenticated users)
router.get(
  '/:id',
  validateParams(assignmentSchemas.assignmentId),
  (req: Request, res: Response, next: NextFunction) => assignmentController.getAssignmentById(req, res, next)
);

// Create new assignment (Instructor/Admin only)
router.post(
  '/',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateBody(assignmentSchemas.createAssignment),
  (req: Request, res: Response, next: NextFunction) => assignmentController.createAssignment(req, res, next)
);

// Update assignment (Instructor/Admin only)
router.put(
  '/:id',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateParams(assignmentSchemas.assignmentId),
  validateBody(assignmentSchemas.updateAssignment),
  (req: Request, res: Response, next: NextFunction) => assignmentController.updateAssignment(req, res, next)
);

// Delete assignment (Instructor/Admin only)
router.delete(
  '/:id',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validateParams(assignmentSchemas.assignmentId),
  (req: Request, res: Response, next: NextFunction) => assignmentController.deleteAssignment(req, res, next)
);

export default router;