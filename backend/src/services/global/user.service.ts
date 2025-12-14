import * as userRepository from '../../repositories/user.repository';
import { CacheService } from './cache.service';
import logger from '../../utils/logger.util';
import { QueryTypes } from 'sequelize';
// Use lightweight user types for hard-fail users build
import type { UserInstance, UserCreationAttributes, UserAttributes } from '../../types/model.types';
import { getModelSequelize } from '../../utils/model-extension.util';

const sequelize = getModelSequelize();

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

  // ===== ADMIN DASHBOARD STATISTICS =====

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<any> {
    try {
      const totalUsers = await userRepository.countUsers();
      const activeUsers = await userRepository.countUsers({ status: 'active' });
      const students = await userRepository.countUsers({ role: 'student' });
      const instructors = await userRepository.countUsers({ role: 'instructor' });

      return {
        total_users: totalUsers,
        active_users: activeUsers,
        students,
        instructors,
        last_updated: new Date()
      };
    } catch (error: unknown) {
      logger.error('Error getting dashboard stats:', error);
      return {
        total_users: 0,
        active_users: 0,
        students: 0,
        instructors: 0,
        last_updated: new Date()
      };
    }
  }

  /**
   * Get recent activities from activity logs
   */
  async getRecentActivities(limit: number = 10): Promise<any> {
    try {
      const { UserActivityLog, User } = await import('../../models');
      
      const rows = await UserActivityLog.findAll({
        order: [['createdAt', 'DESC']],
        limit,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email', 'avatar'],
            required: false,
          },
        ],
      });

      return rows.map((row: any) => {
        const user = row.user;
        const userName = user 
          ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email 
          : 'Hệ thống';
        const action = row.action || row.activity_type || 'activity';
        const resourceType = row.resource_type || 'system';
        
        // Build description based on action and resource type
        let description = '';
        switch (action) {
          case 'login':
            description = 'đã đăng nhập vào hệ thống';
            break;
          case 'logout':
            description = 'đã đăng xuất khỏi hệ thống';
            break;
          case 'create':
            description = `đã tạo ${resourceType}`;
            break;
          case 'update':
            description = `đã cập nhật ${resourceType}`;
            break;
          case 'delete':
            description = `đã xóa ${resourceType}`;
            break;
          default:
            description = `hoạt động: ${action}`;
        }

        return {
          id: row.id,
          type: action,
          action,
          resource_type: resourceType,
          description,
          user_id: row.user_id,
          user_name: userName,
          user_avatar: user?.avatar || null,
          status: row.status || 'success',
          created_at: row.createdAt || row.created_at,
          timestamp: row.createdAt || row.created_at
        };
      });
    } catch (error: unknown) {
      logger.error('Error getting recent activities:', error);
      return [];
    }
  }

  /**
   * Get user growth data for the last N days
   */
  async getUserGrowth(days: number = 30): Promise<any[]> {
    try {
      const safeDays = Math.max(1, Math.min(365, Number.isFinite(days) ? days : 30));
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (safeDays - 1));
      startDate.setHours(0, 0, 0, 0);

      const rows = (await sequelize.query(
        `
        SELECT
          DATE_TRUNC('day', created_at)::date AS date,
          COUNT(*)::integer AS count
        FROM users
        WHERE created_at BETWEEN :startDate AND :endDate
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date ASC
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { startDate, endDate },
        },
      )) as any[];

      const map = new Map<string, number>();
      for (const r of rows) {
        const d = r?.date ? new Date(r.date) : null;
        const key = d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : String(r?.date ?? '');
        map.set(key, Number(r?.count ?? 0));
      }

      const out: Array<{ date: string; count: number }> = [];
      for (let i = 0; i < safeDays; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        out.push({ date: key, count: map.get(key) ?? 0 });
      }

      return out;
    } catch (error: unknown) {
      logger.error('Error getting user growth:', error);
      return [];
    }
  }

  /**
   * Get enrollment trend data
   */
  async getEnrollmentTrend(days: number = 30): Promise<any[]> {
    try {
      const safeDays = Math.max(1, Math.min(365, Number.isFinite(days) ? days : 30));
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (safeDays - 1));
      startDate.setHours(0, 0, 0, 0);

      const rows = (await sequelize.query(
        `
        SELECT
          DATE_TRUNC('day', created_at)::date AS date,
          COUNT(*)::integer AS enrollments
        FROM enrollments
        WHERE created_at BETWEEN :startDate AND :endDate
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date ASC
        `,
        {
          type: QueryTypes.SELECT,
          replacements: { startDate, endDate },
        },
      )) as any[];

      const map = new Map<string, number>();
      for (const r of rows) {
        const d = r?.date ? new Date(r.date) : null;
        const key = d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : String(r?.date ?? '');
        map.set(key, Number(r?.enrollments ?? 0));
      }

      const out: Array<{ date: string; enrollments: number }> = [];
      for (let i = 0; i < safeDays; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        out.push({ date: key, enrollments: map.get(key) ?? 0 });
      }

      return out;
    } catch (error: unknown) {
      logger.error('Error getting enrollment trend:', error);
      return [];
    }
  }

  /**
   * Get top instructors by enrollment count
   */
  async getTopInstructors(limit: number = 5): Promise<any[]> {
    try {
      // Get top instructors based on course enrollments
      return await userRepository.getTopInstructors(limit);
    } catch (error: unknown) {
      logger.error('Error getting top instructors:', error);
      return [];
    }
  }
}
