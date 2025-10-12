import User from '../models/user.model';
import { UserInstance } from '../types/user.types';
import { BaseRepository } from './base.repository';
import logger from '../utils/logger.util';

export class UserRepository extends BaseRepository<UserInstance> {
  constructor() {
    super('User');
  }

  /**
   * Get the User model
   */
  protected getModel() {
    return User;
  }

  /**
   * Find user by username (for LMS login)
   */
  async findByUsername(username: string): Promise<UserInstance | null> {
    try {
      logger.debug('Finding user by username', { username });
      
      const user = await this.findOne({
        where: { username: username.toLowerCase() }
      });
      
      if (user) {
        logger.debug('User found by username', { username });
      } else {
        logger.debug('User not found by username', { username });
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user by username:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserInstance | null> {
    try {
      logger.debug('Finding user by email', { email });
      
      const user = await this.findOne({
        where: { email: email.toLowerCase() }
      });
      
      if (user) {
        logger.debug('User found by email', { email });
      } else {
        logger.debug('User not found by email', { email });
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by student ID
   */
  async findByStudentId(studentId: string): Promise<UserInstance | null> {
    try {
      logger.debug('Finding user by student ID', { studentId });
      
      const user = await this.findOne({
        where: { student_id: studentId }
      });
      
      if (user) {
        logger.debug('User found by student ID', { studentId });
      } else {
        logger.debug('User not found by student ID', { studentId });
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user by student ID:', error);
      throw error;
    }
  }

  /**
   * Find user by instructor ID
   */
  async findByInstructorId(instructorId: string): Promise<UserInstance | null> {
    try {
      logger.debug('Finding user by instructor ID', { instructorId });
      
      const user = await this.findOne({
        where: { instructor_id: instructorId }
      });
      
      if (user) {
        logger.debug('User found by instructor ID', { instructorId });
      } else {
        logger.debug('User not found by instructor ID', { instructorId });
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user by instructor ID:', error);
      throw error;
    }
  }

  /**
   * Find users by role
   */
  async findByRole(role: string, options?: any): Promise<UserInstance[]> {
    try {
      logger.debug('Finding users by role', { role });
      
      const users = await this.findAll({
        where: { role },
        ...options
      });
      
      logger.debug('Users found by role', { role, count: users.length });
      return users;
    } catch (error) {
      logger.error('Error finding users by role:', error);
      throw error;
    }
  }

  /**
   * Find users by status
   */
  async findByStatus(status: string, options?: any): Promise<UserInstance[]> {
    try {
      logger.debug('Finding users by status', { status });
      
      const users = await this.findAll({
        where: { status },
        ...options
      });
      
      logger.debug('Users found by status', { status, count: users.length });
      return users;
    } catch (error) {
      logger.error('Error finding users by status:', error);
      throw error;
    }
  }

  /**
   * Find users by department (for instructors)
   */
  async findByDepartment(department: string, options?: any): Promise<UserInstance[]> {
    try {
      logger.debug('Finding users by department', { department });
      
      const users = await this.findAll({
        where: { department },
        ...options
      });
      
      logger.debug('Users found by department', { department, count: users.length });
      return users;
    } catch (error) {
      logger.error('Error finding users by department:', error);
      throw error;
    }
  }

  /**
   * Find users by major (for students)
   */
  async findByMajor(major: string, options?: any): Promise<UserInstance[]> {
    try {
      logger.debug('Finding users by major', { major });
      
      const users = await this.findAll({
        where: { major },
        ...options
      });
      
      logger.debug('Users found by major', { major, count: users.length });
      return users;
    } catch (error) {
      logger.error('Error finding users by major:', error);
      throw error;
    }
  }

  /**
   * Find users by class (for students)
   */
  async findByClass(className: string, options?: any): Promise<UserInstance[]> {
    try {
      logger.debug('Finding users by class', { className });
      
      const users = await this.findAll({
        where: { class: className },
        ...options
      });
      
      logger.debug('Users found by class', { className, count: users.length });
      return users;
    } catch (error) {
      logger.error('Error finding users by class:', error);
      throw error;
    }
  }

  /**
   * Find users by year (for students)
   */
  async findByYear(year: number, options?: any): Promise<UserInstance[]> {
    try {
      logger.debug('Finding users by year', { year });
      
      const users = await this.findAll({
        where: { year },
        ...options
      });
      
      logger.debug('Users found by year', { year, count: users.length });
      return users;
    } catch (error) {
      logger.error('Error finding users by year:', error);
      throw error;
    }
  }

  /**
   * Search users by name or email
   */
  async searchUsers(searchTerm: string, options?: any): Promise<UserInstance[]> {
    try {
      logger.debug('Searching users', { searchTerm });
      
      const { Op } = require('sequelize');
      
      const users = await this.findAll({
        where: {
          [Op.or]: [
            { username: { [Op.iLike]: `%${searchTerm}%` } },
            { first_name: { [Op.iLike]: `%${searchTerm}%` } },
            { last_name: { [Op.iLike]: `%${searchTerm}%` } },
            { email: { [Op.iLike]: `%${searchTerm}%` } },
            { student_id: { [Op.iLike]: `%${searchTerm}%` } },
            { instructor_id: { [Op.iLike]: `%${searchTerm}%` } }
          ]
        },
        ...options
      });
      
      logger.debug('Users found by search', { searchTerm, count: users.length });
      return users;
    } catch (error) {
      logger.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    students: number;
    instructors: number;
    admins: number;
    superAdmins: number;
    verifiedUsers: number;
    unverifiedUsers: number;
  }> {
    try {
      logger.debug('Getting user statistics');
      
      const [
        total,
        active,
        inactive,
        students,
        instructors,
        admins,
        superAdmins,
        verified,
        unverified
      ] = await Promise.all([
        this.count(),
        this.count({ where: { status: 'active' } }),
        this.count({ where: { status: 'inactive' } }),
        this.count({ where: { role: 'student' } }),
        this.count({ where: { role: 'instructor' } }),
        this.count({ where: { role: 'admin' } }),
        this.count({ where: { role: 'super_admin' } }),
        this.count({ where: { email_verified: true } }),
        this.count({ where: { email_verified: false } })
      ]);
      
      const stats = {
        totalUsers: total,
        activeUsers: active,
        inactiveUsers: inactive,
        students,
        instructors,
        admins,
        superAdmins,
        verifiedUsers: verified,
        unverifiedUsers: unverified
      };
      
      logger.debug('User statistics retrieved', { stats });
      return stats;
    } catch (error) {
      logger.error('Error getting user statistics:', error);
      throw error;
    }
  }

  /**
   * Get users by role with pagination
   */
  async getUsersByRoleWithPagination(role: string, page: number, limit: number, options?: any): Promise<{
    data: UserInstance[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      logger.debug('Getting users by role with pagination', { role, page, limit });
      
      const result = await this.paginate(page, limit, {
        where: { role },
        ...options
      });
      
      logger.debug('Users by role with pagination retrieved', { role, page, limit, total: result.pagination.total });
      return result;
    } catch (error) {
      logger.error('Error getting users by role with pagination:', error);
      throw error;
    }
  }

  /**
   * Update user last login
   */
  async updateLastLogin(userId: string): Promise<UserInstance> {
    try {
      logger.debug('Updating user last login', { userId });
      
      const user = await this.update(userId, { last_login: new Date() });
      
      logger.debug('User last login updated', { userId });
      return user;
    } catch (error) {
      logger.error('Error updating user last login:', error);
      throw error;
    }
  }

  /**
   * Update user email verification status
   */
  async updateEmailVerification(userId: string, isVerified: boolean): Promise<UserInstance> {
    try {
      logger.debug('Updating user email verification', { userId, isVerified });
      
      const user = await this.update(userId, { 
        email_verified: isVerified,
        email_verified_at: isVerified ? new Date() : null
      });
      
      logger.debug('User email verification updated', { userId, isVerified });
      return user;
    } catch (error) {
      logger.error('Error updating user email verification:', error);
      throw error;
    }
  }

  /**
   * Update user status
   */
  async updateStatus(userId: string, status: string): Promise<UserInstance> {
    try {
      logger.debug('Updating user status', { userId, status });
      
      const user = await this.update(userId, { status });
      
      logger.debug('User status updated', { userId, status });
      return user;
    } catch (error) {
      logger.error('Error updating user status:', error);
      throw error;
    }
  }

  /**
   * Get users with enrollment details
   */
  async findWithEnrollments(userId: string): Promise<UserInstance | null> {
    try {
      logger.debug('Finding user with enrollments', { userId });
      
      const user = await this.findOne({
        where: { id: userId },
        include: [
          {
            model: require('../models').Enrollment,
            as: 'enrollments',
            include: [
              {
                model: require('../models').Course,
                as: 'course',
                attributes: ['id', 'title', 'description', 'thumbnail', 'status']
              }
            ]
          }
        ]
      });
      
      if (user) {
        logger.debug('User with enrollments found', { userId });
      } else {
        logger.debug('User with enrollments not found', { userId });
      }
      
      return user;
    } catch (error) {
      logger.error('Error finding user with enrollments:', error);
      throw error;
    }
  }
}