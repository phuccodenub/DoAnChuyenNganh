import { Router } from 'express';
import { AssignmentController } from './assignment.controller';
import { assignmentSchemas } from './assignment.validate';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UserRole } from '../../constants/roles.enum';

const router = Router();
const controller = new AssignmentController();

router.use(authMiddleware);

// Create assignment (instructor/admin)
router.post(
  '/',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate([assignmentSchemas.createAssignment]),
  controller.create
);

// Get assignment
router.get('/:id', validate([assignmentSchemas.assignmentId]), controller.getOne);

// Submit assignment (student)
router.post('/:assignmentId/submissions', controller.submit);

// Grade submission (instructor/admin)
router.post('/submissions/:submissionId/grade', authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]), controller.grade);

export default router;


























