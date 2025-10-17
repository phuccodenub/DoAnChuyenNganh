import { UserRepository } from '../../repositories/user.repository';
import { CacheService } from './cache.service';
import logger from '../../utils/logger.util';

export class GlobalUserService {
  private cacheService: CacheService;
  private userRepo: UserRepository;

  constructor() {
    this.cacheService = new CacheService();
    this.userRepo = new UserRepository();
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
      const user = await this.userRepo.findById(userId);
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
  async getUserByEmail(email: string): Promise<any> {
    try {
      // Try cache first
      const cachedUser = await this.cacheService.get(`user:email:${email}`);
      if (cachedUser) {
        return cachedUser;
      }

      // Get from database
      const user = await this.userRepo.findByEmail(email);
      if (user) {
        // Cache for future requests
        await this.cacheUser((user as any).id, user);
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

      const userPermissions = rolePermissions[(user as any).role] || [];
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

      return (user as any).role === role;
    } catch (error: unknown) {
      logger.error('Error checking user role:', error);
      return false;
    }
  }

  // ===== USER CACHE OPERATIONS (Shared across modules) =====

  // Cache user data
  async cacheUser(userId: string, userData: any): Promise<void> {
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
      const user = await this.userRepo.findById(userId);
      if (user) {
        await this.cacheService.delete(`user:email:${(user as any).email}`);
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
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await this.userRepo.update(userId, {
        token_version: (user as any).token_version + 1
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

      return (user as any).status === 'active';
    } catch (error: unknown) {
      logger.error('Error checking user status:', error);
      return false;
    }
  }

  // Update user last login
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.userRepo.update(userId, {
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
  async addUser(userData: any): Promise<any> {
    try {
      const user = await userRepository.createUser(userData);
      if (user) {
        await this.cacheUser((user as any).id, user);
      }
      return user;
    } catch (error: unknown) {
      logger.error('Error adding user:', error);
      throw error;
    }
  }

  // Update user info
  async updateUserInfo(userId: string, updateData: any): Promise<any> {
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
  async getAllUsers(options: any): Promise<any> {
    try {
      return await userRepository.findAllUsers(options);
    } catch (error: unknown) {
      logger.error('Error getting all users:', error);
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role: string): Promise<any> {
    try {
      return await userRepository.findUsersByRole(role);
    } catch (error: unknown) {
      logger.error('Error getting users by role:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStatistics(): Promise<any> {
    try {
      return await userRepository.getUserStatistics();
    } catch (error: unknown) {
      logger.error('Error getting user statistics:', error);
      throw error;
    }
  }

  // Change user status
  async changeUserStatus(userId: string, status: string): Promise<any> {
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
