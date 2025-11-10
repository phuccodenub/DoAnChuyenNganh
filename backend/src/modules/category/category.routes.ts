import { Router } from 'express';
import { CategoryController } from './category.controller';
import { categoryValidation } from './category.validate';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UserRole } from '../../constants/roles.enum';

const router = Router();
const controller = new CategoryController();

// Public list and get-by-id
router.get('/', validate(categoryValidation.list), controller.list);
router.get('/:id', validate(categoryValidation.idParam), controller.getById);

// Protected create/update/delete for admin roles
router.post(
  '/',
  authMiddleware,
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validate(categoryValidation.create),
  controller.create
);

router.put(
  '/:id',
  authMiddleware,
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validate(categoryValidation.update),
  controller.update
);

router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  validate(categoryValidation.idParam),
  controller.delete
);

export default router;


