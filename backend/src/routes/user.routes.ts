// Route global (thường dùng cho admin hoặc API hệ thống)
import express from 'express';
import { 
  getUserInfo, 
  getUserByEmailInfo, 
  createUser, 
  updateUser, 
  deleteUser,
  getAllUsersInfo,
  getUsersByRoleInfo,
  getUserStats,
  changeUserStatusInfo
} from '../controllers/user.controller';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles.enum';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import { userSchemas } from '../validates/user.validate';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Admin only routes
router.post(
  '/',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateBody(userSchemas.createUser),
  createUser
);

router.patch(
  '/:id',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateBody(userSchemas.updateUser),
  updateUser
);

router.delete(
  '/:id',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  deleteUser
);

router.get(
  '/stats',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getUserStats
);

// Admin/Instructor routes
router.get(
  '/',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validateQuery(userSchemas.userQuery),
  getAllUsersInfo
);

router.get(
  '/role/:role',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  getUsersByRoleInfo
);

// All authenticated users
router.get(
  '/:id',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT),
  getUserInfo
);

router.get(
  '/email/search',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  getUserByEmailInfo
);

router.patch(
  '/:id/status',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  changeUserStatusInfo
);

export default router;

