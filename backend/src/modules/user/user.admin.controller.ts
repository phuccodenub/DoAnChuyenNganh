import { Request, Response, NextFunction } from 'express';
import { GlobalUserService } from '../../services/global/user.service';
import { responseUtils } from '../../utils/response.util';
import { RESPONSE_CONSTANTS } from '../../constants/response.constants';
import logger from '../../utils/logger.util';
import { userValidation } from '../../validates/user.validate';
import { baseValidation } from '../../validates/base.validate';
import { hashUtils } from '../../utils/hash.util';

/**
 * User Admin Controller
 * Handles admin/system-level user management operations
 * 
 * This controller is for:
 * - CRUD operations on any user (admin privilege)
 * - User statistics and analytics (admin)
 * - Bulk user operations (admin)
 * - User status management (admin)
 */
export class UserAdminController {
  private userService: GlobalUserService;

  constructor() {
    this.userService = new GlobalUserService();
  }

  /**
   * Get user info by ID
   * Admin can view any user's information
   */
  async getUserInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) {
        return responseUtils.sendNotFound(res, 'User not found');
      }
      // For admin alias mounted at /api/.../users (non-/admin path), wrap as { user }
      const isAlias = req.baseUrl?.endsWith('/users') && !req.baseUrl.includes('/admin/users');
      if (isAlias) {
        return responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, { user });
      }
      // Default admin shape returns the user object directly
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, user);
    } catch (error: unknown) {
      logger.error('Error getting user info:', error);
      next(error);
    }
  }

  /**
   * Get user info by email
   * Admin can search users by email
   */
  async getUserByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.userService.getUserByEmail(req.query.email as string);
      // Tests expect 200 with data=null when email not found
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, user ?? null);
    } catch (error: unknown) {
      logger.error('Error getting user by email:', error);
      next(error);
    }
  }

  /**
   * Create new user
   * Admin can create users directly
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate payload using admin create schema
      const parsed = userValidation.createUser.safeParse(req.body);
      if (!parsed.success) {
        return responseUtils.sendValidationError(res, 'Validation failed');
      }

      const data = parsed.data as any;
      
      // Generate username from email if not provided
      if (!data.username && data.email) {
        data.username = data.email.split('@')[0] + '_' + Date.now();
      }
      
      // Map plain password -> password_hash with strong hashing
      if (data.password) {
        try {
          data.password_hash = await hashUtils.password.hashPassword(data.password);
          delete data.password;
        } catch (e) {
          return responseUtils.sendError(res, 'Password hashing failed', RESPONSE_CONSTANTS.STATUS_CODE.BAD_REQUEST);
        }
      }

      const user = await this.userService.addUser(data);
      const isAlias = req.baseUrl?.endsWith('/users') && !req.baseUrl.includes('/admin/users');
      if (isAlias) {
        return responseUtils.sendCreated(res, RESPONSE_CONSTANTS.MESSAGE.CREATED, { user });
      }
      // Return created user object directly for admin routes
      responseUtils.sendCreated(res, RESPONSE_CONSTANTS.MESSAGE.CREATED, user);
    } catch (error: unknown) {
      logger.error('Error creating user:', error);
      next(error);
    }
  }

  /**
   * Update user
   * Admin can update any user's information
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate UUID param early to avoid DB errors
      const idCheck = baseValidation.uuid.safeParse(req.params.id);
      if (!idCheck.success) {
        return responseUtils.sendValidationError(res, 'Invalid user id');
      }

      const user = await this.userService.updateUserInfo(req.params.id, req.body);
      if (!user) {
        return responseUtils.sendNotFound(res, 'User not found');
      }
      const isAlias = req.baseUrl?.endsWith('/users') && !req.baseUrl.includes('/admin/users');
      if (isAlias) {
        return responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.UPDATED, { user });
      }
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.UPDATED, user);
    } catch (error: unknown) {
      logger.error('Error updating user:', error);
      // Map not found errors to 404
      if (error instanceof Error && /not found/i.test(error.message)) {
        return responseUtils.sendNotFound(res, 'User not found');
      }
      next(error);
    }
  }

  /**
   * Delete user
   * Admin can delete users
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate UUID param early to avoid DB errors
      const idCheck = baseValidation.uuid.safeParse(req.params.id);
      if (!idCheck.success) {
        return responseUtils.sendValidationError(res, 'Invalid user id');
      }

      await this.userService.removeUser(req.params.id);
      // Send proper 204 No Content with empty body
      responseUtils.sendNoContent(res);
    } catch (error: unknown) {
      logger.error('Error deleting user:', error);
      if (error instanceof Error && /not found/i.test(error.message)) {
        return responseUtils.sendNotFound(res, 'User not found');
      }
      next(error);
    }
  }

  /**
   * Get all users with pagination
   * Admin can list all users with filters
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        role: req.query.role as string | undefined,
        status: req.query.status as string | undefined,
        search: req.query.search as string | undefined
      };
      
      const result = await this.userService.getAllUsers(options);
      // Build full pagination object with hasNext/hasPrev to satisfy type and add helpful metadata
      const { page, limit, total, totalPages } = result.pagination;
      const pagination = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        ...(page < totalPages ? { nextPage: page + 1 } : {}),
        ...(page > 1 ? { prevPage: page - 1 } : {})
      } as const;

      const isAlias = req.baseUrl?.endsWith('/users') && !req.baseUrl.includes('/admin/users');
      if (isAlias) {
        // Tests for /api/users expect data.users and data.pagination nested
        return responseUtils.sendSuccess(
          res,
          RESPONSE_CONSTANTS.MESSAGE.SUCCESS,
          { users: result.data, pagination }
        );
      }
      // Default admin shape: top-level pagination and data array
      responseUtils.sendPaginated(
        res,
        result.data,
        pagination as any,
        RESPONSE_CONSTANTS.MESSAGE.SUCCESS,
        RESPONSE_CONSTANTS.STATUS_CODE.OK
      );
    } catch (error: unknown) {
      logger.error('Error getting all users:', error);
      next(error);
    }
  }

  /**
   * Get users by role
   * Admin can filter users by role
   */
  async getUsersByRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userService.getUsersByRole(req.params.role);
      // Return array directly in data
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, users);
    } catch (error: unknown) {
      logger.error('Error getting users by role:', error);
      next(error);
    }
  }

  /**
   * Get user statistics
   * Admin can view system-wide user statistics
   */
  async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.userService.getUserStatistics();
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.SUCCESS, stats);
    } catch (error: unknown) {
      logger.error('Error getting user stats:', error);
      next(error);
    }
  }

  /**
   * Change user status
   * Admin can activate/deactivate/suspend users
   */
  async changeUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate UUID param early to avoid DB errors
      const idCheck = baseValidation.uuid.safeParse(req.params.id);
      if (!idCheck.success) {
        return responseUtils.sendValidationError(res, 'Invalid user id');
      }

      // Validate status via schema
      const statusSchema = userValidation.updateUserStatus.safeParse(req.body);
      if (!statusSchema.success) {
        return responseUtils.sendValidationError(res, 'Validation failed');
      }

      const user = await this.userService.changeUserStatus(req.params.id, req.body.status);
      if (!user) {
        return responseUtils.sendNotFound(res, 'User not found');
      }
      const isAlias = req.baseUrl?.endsWith('/users') && !req.baseUrl.includes('/admin/users');
      if (isAlias) {
        return responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.UPDATED, { user });
      }
      responseUtils.sendSuccess(res, RESPONSE_CONSTANTS.MESSAGE.UPDATED, user);
    } catch (error: unknown) {
      logger.error('Error changing user status:', error);
      if (error instanceof Error && /not found/i.test(error.message)) {
        return responseUtils.sendNotFound(res, 'User not found');
      }
      next(error);
    }
  }
}
