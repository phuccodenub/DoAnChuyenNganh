import { Router } from 'express';
import { UserAdminController } from './user.admin.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth.middleware';
import { UserRole } from '../../constants/roles.enum';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validate.middleware';
import { userValidation } from '../../validates/user.validate';

const router = Router();
const userAdminController = new UserAdminController();

// All routes require authentication
router.use(authMiddleware);

// ===== IMPORTANT: SPECIFIC ROUTES MUST COME BEFORE DYNAMIC ROUTES =====
// Routes with specific paths (like /stats, /email/search) MUST be defined
// BEFORE routes with parameters (like /:id) to prevent route matching issues

// ===== ADMIN-ONLY OPERATIONS =====

/**
 * Get user statistics
 * GET /admin/users/stats
 * Admin/Super Admin only
 * ⚠️ MUST BE BEFORE /:id route to prevent /stats being matched as an ID
 */
router.get(
  '/stats',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  (req, res, next) => userAdminController.getUserStats(req, res, next)
);

/**
 * Search user by email
 * GET /admin/users/email/search?email=xxx
 * Admin/Super Admin/Instructor
 * ⚠️ MUST BE BEFORE /:id route
 */
router.get(
  '/email/search',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  (req, res, next) => userAdminController.getUserByEmail(req, res, next)
);

/**
 * Get users by role
 * GET /admin/users/role/:role
 * Admin/Super Admin/Instructor
 * ⚠️ MUST BE BEFORE generic /:id route
 */
router.get(
  '/role/:role',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  (req, res, next) => userAdminController.getUsersByRole(req, res, next)
);

/**
 * Get all users with pagination
 * GET /admin/users
 * Admin/Super Admin/Instructor
 */
router.get(
  '/',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validateQuery(userValidation.userQuery),
  (req, res, next) => userAdminController.getAllUsers(req, res, next)
);

/**
 * Create new user
 * POST /admin/users
 * Admin/Super Admin only
 */
router.post(
  '/',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateBody(userValidation.createUser),
  (req, res, next) => userAdminController.createUser(req, res, next)
);

// ===== DYNAMIC ROUTES (MUST COME LAST) =====

/**
 * Get user by ID
 * GET /admin/users/:id
 * All authenticated users can view user profiles
 * ⚠️ This MUST come after all specific routes like /stats, /email/search, etc.
 */
// Dynamic authorization: broader access on true admin mount, admin-only on alias mount
router.get(
  '/:id',
  (req, res, next) => {
    const isAlias = req.baseUrl?.endsWith('/users') && !req.baseUrl.includes('/admin/users');
    const mw = isAlias
      ? authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
      : authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT);
    return mw(req, res, next);
  },
  validateParams(userValidation.userId),
  (req, res, next) => userAdminController.getUserInfo(req, res, next)
);

/**
 * Update user by ID
 * PATCH /admin/users/:id
 * Admin/Super Admin only
 */
router.patch(
  '/:id',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateParams(userValidation.userId),
  validateBody(userValidation.updateUser),
  (req, res, next) => userAdminController.updateUser(req, res, next)
);

/**
 * Delete user by ID
 * DELETE /admin/users/:id
 * Admin/Super Admin only
 */
router.delete(
  '/:id',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateParams(userValidation.userId),
  (req, res, next) => userAdminController.deleteUser(req, res, next)
);

/**
 * Change user status
 * PATCH /admin/users/:id/status
 * Admin/Super Admin only
 */
router.patch(
  '/:id/status',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateParams(userValidation.userId),
  validateBody(userValidation.updateStatus),
  (req, res, next) => userAdminController.changeUserStatus(req, res, next)
);

// Alias route to support PUT method for status updates (test expectations)
router.put(
  '/:id/status',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateParams(userValidation.userId),
  validateBody(userValidation.updateStatus),
  (req, res, next) => userAdminController.changeUserStatus(req, res, next)
);

// Update user role (alias route expected by tests)
router.put(
  '/:id/role',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateParams(userValidation.userId),
  validateBody(userValidation.updateRole),
  (req, res, next) => userAdminController.updateUser(req, res, next)
);

export default router;
