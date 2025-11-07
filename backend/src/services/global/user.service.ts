import * as userRepository from '../../repositories/user.repository';
import { CacheService } from './cache.service';
import logger from '../../utils/logger.util';
// Use lightweight user types for hard-fail users build
import type { UserInstance, UserCreationAttributes, UserAttributes } from '../../types/model.types';

// DTOs for user operations
export interface UserUpdateDTO {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  last_login?: Date;
  token_version?: number;
  // Student fields
  student_id?: string;
  class?: string;
  major?: string;
  year?: number;
  gpa?: number;
  // Instructor fields
  instructor_id?: string;
  department?: string;
  specialization?: string;
  experience_years?: number;
  education_level?: 'bachelor' | 'master' | 'phd' | 'professor';
  research_interests?: string;
  // Other fields
  date_of_birth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface UserStatistics {
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

export interface GetUsersOptions {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

export interface PaginatedUserResponse {
  data: UserInstance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class GlobalUserService {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService();
  }

  // ===== USER CRUD OPERATIONS (Shared across modules) =====

  // Get user by ID
  async getUserById(userId: string): Promise<UserInstance | null> {
    try {
      // Try cache first
      const cachedUser = await this.cacheService.getCachedUser<UserInstance>(userId);
      if (cachedUser) {
        return cachedUser;
      }

      // Get from database
      const user = await userRepository.findUserById(userId);
      if (user) {
        // Cache for future requests
        await this.cacheUser(userId, user);
      }
      
      return user;
    } catch (error: unknown) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<UserInstance | null> {
    try {
      // Try cache first
      const cachedUser = await this.cacheService.get<UserInstance>(`user:email:${email}`);
      if (cachedUser) {
        return cachedUser;
      }

      // Get from database
      const user = await userRepository.findUserByEmail(email);
      if (user) {
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
      if (!user) return false;

      // For now, implement basic role-based permissions
      // You can extend this with a proper permission system later
      const rolePermissions: { [key: string]: string[] } = {
        'super_admin': ['*'], // All permissions
        'admin': ['user:read', 'user:write', 'course:read', 'course:write'],
        'instructor': ['course:read', 'course:write', 'student:read'],
        'student': ['course:read', 'profile:read', 'profile:write']
      };

      const userPermissions = rolePermissions[user.role] || [];
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
      if (!user) return false;

      return user.role === role;
    } catch (error: unknown) {
      logger.error('Error checking user role:', error);
      return false;
    }
  }

  // ===== USER CACHE OPERATIONS (Shared across modules) =====

  // Cache user data
  async cacheUser(userId: string, userData: UserInstance): Promise<void> {
    try {
      // CRITICAL SECURITY: Never cache password_hash!
      // Create a sanitized copy without sensitive data
      const sanitizedUser = { ...userData.toJSON() };
      delete (sanitizedUser as any).password_hash;
      delete (sanitizedUser as any).password;
      
      await this.cacheService.cacheUser(userId, sanitizedUser as UserInstance);
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
      if (user) {
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
      if (!user) return false;

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
  async addUser(userData: UserCreationAttributes | (UserCreationAttributes & { password?: string })): Promise<UserInstance> {
    try {
      // Map plain `password` to hashed `password_hash` if provided
      const dataToCreate: Record<string, unknown> = { ...userData } as Record<string, unknown>;
      if (typeof (dataToCreate as any).password === 'string' && (dataToCreate as any).password.length > 0) {
        const plain = (dataToCreate as any).password as string;
        // Hash using centralized util, keep strict typing
        const { hashPassword } = await import('../../utils/hash.util');
        const hashed = await hashPassword(plain);
        delete (dataToCreate as any).password;
        (dataToCreate as any).password_hash = hashed;
      }

      // Normalize date_of_birth to Date if provided as string
      if (typeof (dataToCreate as any).date_of_birth === 'string') {
        (dataToCreate as any).date_of_birth = new Date((dataToCreate as any).date_of_birth);
      }

      const user = await userRepository.createUser(dataToCreate as UserCreationAttributes);
      if (user) {
        await this.cacheUser(user.id, user);
      }
      return user;
    } catch (error: unknown) {
      logger.error('Error adding user:', error);
      throw error;
    }
  }

  // Update user info
  async updateUserInfo(userId: string, updateData: UserUpdateDTO): Promise<UserInstance | null> {
    try {
      const user = await userRepository.updateUser(userId, updateData);
      if (user) {
        await this.cacheUser(userId, user);
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
  async getAllUsers(options: GetUsersOptions): Promise<PaginatedUserResponse> {
    try {
      // Translate high-level filter options to Sequelize FindOptions
      const { page = 1, limit = 10, role, status, search } = options || {};

      const { Op } = require('sequelize');

      const where: Record<string, unknown> = {};
      if (role) {
        where.role = role;
      }
      if (status) {
        where.status = status;
      }
      if (search && String(search).trim().length > 0) {
        const term = String(search).trim();
        // Case-insensitive match against common user fields
        where[Op.or] = [
          { first_name: { [Op.iLike]: `%${term}%` } },
          { last_name: { [Op.iLike]: `%${term}%` } },
          { email: { [Op.iLike]: `%${term}%` } },
          { username: { [Op.iLike]: `%${term}%` } }
        ];
      }

      return await userRepository.findAllUsers({
        page,
        limit,
        where
      });
    } catch (error: unknown) {
      logger.error('Error getting all users:', error);
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role: string): Promise<UserInstance[]> {
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
  async changeUserStatus(userId: string, status: string): Promise<UserInstance | null> {
    try {
      const user = await userRepository.updateUser(userId, { status });
      if (user) {
        await this.cacheUser(userId, user);
      }
      return user;
    } catch (error: unknown) {
      logger.error('Error changing user status:', error);
      throw error;
    }
  }
}
