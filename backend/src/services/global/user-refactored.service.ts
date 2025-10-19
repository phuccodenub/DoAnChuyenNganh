import * as userRepository from '../../repositories/user.repository';
import { CacheService } from './cache.service';
import logger from '../../utils/logger.util';
import { UserAttributes } from '../../types/model.types';

// ===================================
// TYPE DEFINITIONS
// ===================================

interface CachedUser extends UserAttributes {
  // Additional cached properties nếu có
}

interface UserWithId extends UserAttributes {
  id: string;
}

interface RolePermissions {
  [role: string]: string[];
}

interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  students: number;
  instructors: number;
  admins: number;
  superAdmins: number;
  verifiedUsers: number;
  unverifiedUsers: number;
}

interface GetAllUsersOptions {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

interface PaginatedUsersResult {
  data: UserAttributes[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===================================
// TYPE GUARDS
// ===================================

function isUserWithId(user: unknown): user is UserWithId {
  return user !== null && typeof user === 'object' && 'id' in user && typeof (user as Record<string, unknown>).id === 'string';
}

function hasRole(user: unknown): user is UserAttributes & { role: string } {
  return user !== null && typeof user === 'object' && 'role' in user && typeof (user as Record<string, unknown>).role === 'string';
}

function hasStatus(user: unknown): user is UserAttributes & { status: string } {
  return user !== null && typeof user === 'object' && 'status' in user && typeof (user as Record<string, unknown>).status === 'string';
}

function hasEmail(user: unknown): user is UserAttributes & { email: string } {
  return user !== null && typeof user === 'object' && 'email' in user && typeof (user as Record<string, unknown>).email === 'string';
}

function hasTokenVersion(user: unknown): user is UserAttributes & { token_version: number } {
  return user !== null && typeof user === 'object' && 'token_version' in user && typeof (user as Record<string, unknown>).token_version === 'number';
}

// ===================================
// REFACTORED SERVICE CLASS
// ===================================

export class GlobalUserService {
  private cacheService: CacheService;
  private rolePermissions: RolePermissions;

  constructor() {
    this.cacheService = new CacheService();
    this.rolePermissions = {
      'super_admin': ['*'], // All permissions
      'admin': ['user:read', 'user:write', 'course:read', 'course:write'],
      'instructor': ['course:read', 'course:write', 'student:read'],
      'student': ['course:read', 'profile:read', 'profile:write']
    };
  }

  // ===== USER CRUD OPERATIONS (Shared across modules) =====

  // Get user by ID
  async getUserById(userId: string): Promise<UserAttributes | null> {
    try {
      // Try cache first
      const cachedUser = await this.cacheService.get<CachedUser>(`user:${userId}`);
      if (cachedUser) {
        return cachedUser;
      }

      // Get from database
      const user = await userRepository.findUserById(userId);
      if (user && isUserWithId(user)) {
        // Cache for future requests
        await this.cacheUser(user.id, user);
      }
      
      return user;
    } catch (error: unknown) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<UserAttributes | null> {
    try {
      // Try cache first
      const cachedUser = await this.cacheService.get<CachedUser>(`user:email:${email}`);
      if (cachedUser) {
        return cachedUser;
      }

      // Get from database
      const user = await userRepository.findUserByEmail(email);
      if (user && isUserWithId(user)) {
        // Cache for future requests
        await this.cacheUser(user.id, user);
        await this.cacheService.set(`user:email:${email}`, user, 300); // 5 minutes
      }
      
      return user;
    } catch (error: unknown) {
      logger.error('Error getting user by email:', error);
      throw error;
    }
  }

  // ===== USER PERMISSION OPERATIONS (Shared across modules) =====

  // Check if user has specific permission
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !hasRole(user)) return false;

      const userPermissions = this.rolePermissions[user.role] || [];
      return userPermissions.includes('*') || userPermissions.includes(permission);
    } catch (error: unknown) {
      logger.error('Error checking user permission:', error);
      return false;
    }
  }

  // Check if user has specific role
  async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !hasRole(user)) return false;

      return user.role === role;
    } catch (error: unknown) {
      logger.error('Error checking user role:', error);
      return false;
    }
  }

  // ===== USER CACHE OPERATIONS (Shared across modules) =====

  // Cache user data
  async cacheUser(userId: string, userData: UserAttributes): Promise<void> {
    try {
      await this.cacheService.set(`user:${userId}`, userData, 600); // 10 minutes
    } catch (error: unknown) {
      logger.error('Error caching user:', error);
      // Don't throw error for cache failures
    }
  }

  // Clear user cache
  async clearUserCache(userId: string): Promise<void> {
    try {
      await this.cacheService.delete(`user:${userId}`);
      // Also clear email cache if we have the user data
      const user = await userRepository.findUserById(userId);
      if (user && hasEmail(user)) {
        await this.cacheService.delete(`user:email:${user.email}`);
      }
    } catch (error: unknown) {
      logger.error('Error clearing user cache:', error);
      // Don't throw error for cache failures
    }
  }

  // ===== USER TOKEN OPERATIONS (Shared across modules) =====

  // Update user token version (for logout/invalidate all tokens)
  async updateTokenVersion(userId: string): Promise<void> {
    try {
      const user = await userRepository.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!hasTokenVersion(user)) {
        throw new Error('User token version not available');
      }

      await userRepository.updateUser(userId, {
        token_version: user.token_version + 1
      });

      // Clear cache after updating token version
      await this.clearUserCache(userId);
    } catch (error: unknown) {
      logger.error('Error updating token version:', error);
      throw error;
    }
  }

  // ===== USER STATUS OPERATIONS (Shared across modules) =====

  // Check if user is active
  async isUserActive(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !hasStatus(user)) return false;

      return user.status === 'active';
    } catch (error: unknown) {
      logger.error('Error checking user status:', error);
      return false;
    }
  }

  // Update user last login
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await userRepository.updateUser(userId, {
        last_login: new Date()
      });

      // Clear cache to force refresh
      await this.clearUserCache(userId);
    } catch (error: unknown) {
      logger.error('Error updating last login:', error);
      // Don't throw error for this operation
    }
  }

  // ===== MISSING METHODS FOR CONTROLLER =====

  // Add user
  async addUser(userData: Partial<UserAttributes>): Promise<UserAttributes | null> {
    try {
      const user = await userRepository.createUser(userData);
      if (user && isUserWithId(user)) {
        await this.cacheUser(user.id, user);
      }
      return user;
    } catch (error: unknown) {
      logger.error('Error adding user:', error);
      throw error;
    }
  }

  // Update user info
  async updateUserInfo(userId: string, updateData: Partial<UserAttributes>): Promise<UserAttributes | null> {
    try {
      const user = await userRepository.updateUser(userId, updateData);
      if (user && isUserWithId(user)) {
        await this.cacheUser(user.id, user);
      }
      return user;
    } catch (error: unknown) {
      logger.error('Error updating user info:', error);
      throw error;
    }
  }

  // Remove user
  async removeUser(userId: string): Promise<void> {
    try {
      await userRepository.deleteUser(userId);
      await this.clearUserCache(userId);
    } catch (error: unknown) {
      logger.error('Error removing user:', error);
      throw error;
    }
  }

  // Get all users with pagination
  async getAllUsers(options: GetAllUsersOptions): Promise<PaginatedUsersResult> {
    try {
      return await userRepository.findAllUsers(options);
    } catch (error: unknown) {
      logger.error('Error getting all users:', error);
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role: string): Promise<UserAttributes[]> {
    try {
      return await userRepository.findUsersByRole(role);
    } catch (error: unknown) {
      logger.error('Error getting users by role:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStatistics(): Promise<UserStatistics> {
    try {
      return await userRepository.getUserStatistics();
    } catch (error: unknown) {
      logger.error('Error getting user statistics:', error);
      throw error;
    }
  }

  // Change user status
  async changeUserStatus(userId: string, status: UserAttributes['status']): Promise<UserAttributes | null> {
    try {
      const user = await userRepository.updateUser(userId, { status });
      if (user && isUserWithId(user)) {
        await this.cacheUser(user.id, user);
      }
      return user;
    } catch (error: unknown) {
      logger.error('Error changing user status:', error);
      throw error;
    }
  }

  // ===== ADDITIONAL TYPE-SAFE HELPER METHODS =====

  /**
   * Type-safe method để lấy user với đảm bảo có đủ thông tin cần thiết
   */
  async getUserWithRequiredFields(userId: string): Promise<UserWithId | null> {
    const user = await this.getUserById(userId);
    return user && isUserWithId(user) ? user : null;
  }

  /**
   * Type-safe method để kiểm tra multiple permissions
   */
  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    for (const permission of permissions) {
      if (await this.hasPermission(userId, permission)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Type-safe method để kiểm tra multiple roles
   */
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user || !hasRole(user)) return false;

    return roles.includes(user.role);
  }
}