import * as userRepository from '../../repositories/user.repository';
import { CacheService } from './cache.service';
import logger from '../../utils/logger.util';

export class GlobalUserService {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService();
  }

  // ===== USER CRUD OPERATIONS (Shared across modules) =====

  // Get user by ID
  async getUserById(userId: string): Promise<any> {
    try {
      // Try cache first
      const cachedUser = await this.cacheService.get(`user:${userId}`);
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
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<any> {
    try {
      // Try cache first
      const cachedUser = await this.cacheService.get(`user:email:${email}`);
      if (cachedUser) {
        return cachedUser;
      }

      // Get from database
      const user = await userRepository.findUserByEmail(email);
      if (user) {
        // Cache for future requests
        await this.cacheUser((user as any).id, user);
        await this.cacheService.set(`user:email:${email}`, user, 300); // 5 minutes
      }
      
      return user;
    } catch (error) {
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

      const userPermissions = rolePermissions[(user as any).role] || [];
      return userPermissions.includes('*') || userPermissions.includes(permission);
    } catch (error) {
      logger.error('Error checking user permission:', error);
      return false;
    }
  }

  // Check if user has specific role
  async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      return (user as any).role === role;
    } catch (error) {
      logger.error('Error checking user role:', error);
      return false;
    }
  }

  // ===== USER CACHE OPERATIONS (Shared across modules) =====

  // Cache user data
  async cacheUser(userId: string, userData: any): Promise<void> {
    try {
      await this.cacheService.set(`user:${userId}`, userData, 600); // 10 minutes
    } catch (error) {
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
        await this.cacheService.delete(`user:email:${(user as any).email}`);
      }
    } catch (error) {
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
        token_version: (user as any).token_version + 1
      });

      // Clear cache after updating token version
      await this.clearUserCache(userId);
    } catch (error) {
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

      return (user as any).status === 'active';
    } catch (error) {
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
    } catch (error) {
      logger.error('Error updating last login:', error);
      // Don't throw error for this operation
    }
  }
}