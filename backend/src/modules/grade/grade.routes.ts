import { Router } from 'express';
import { GradeController } from './grade.controller';
import { gradeValidation } from './grade.validate';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UserRole } from '../../constants/roles.enum';

const router = Router();
const controller = new GradeController();

router.use(authMiddleware);

// Upsert grade (instructor/admin)
router.post(
  '/',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(gradeValidation.upsertGrade),
  controller.upsertGrade
);

// Upsert final grade (instructor/admin)
router.post(
  '/final',
  authorizeRoles([UserRole.INSTRUCTOR, UserRole.ADMIN]),
  validate(gradeValidation.upsertFinal),
  controller.upsertFinalGrade
);

// Get user grades by course
router.get('/users/:userId/courses/:courseId', validate(gradeValidation.getUserGrades), controller.getUserGrades);

export default router;











