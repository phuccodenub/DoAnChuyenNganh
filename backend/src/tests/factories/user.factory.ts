/**
 * User Factory
 * Factory for creating test users
 */

import { TestUser, generateTestUser, hashTestPassword } from '../utils/test.utils';

export class UserFactory {
  /**
   * Create a basic test user
   */
  static async create(overrides: Partial<TestUser> = {}): Promise<TestUser> {
    const user = generateTestUser(overrides);
    user.password = await hashTestPassword(user.password);
    return user;
  }

  /**
   * Create a super admin user
   */
  static async createSuperAdmin(overrides: Partial<TestUser> = {}): Promise<TestUser> {
    return this.create({
      email: 'superadmin@test.com',
      username: 'superadmin',
      password: 'SuperAdmin123!',
      first_name: 'Super',
      last_name: 'Admin',
      role: 'super_admin',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      ...overrides
    });
  }

  /**
   * Create an admin user
   */
  static async createAdmin(overrides: Partial<TestUser> = {}): Promise<TestUser> {
    return this.create({
      email: 'admin@test.com',
      username: 'admin',
      password: 'Admin123!',
      first_name: 'System',
      last_name: 'Admin',
      role: 'admin',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      ...overrides
    });
  }

  /**
   * Create an instructor user
   */
  static async createInstructor(overrides: Partial<TestUser> = {}): Promise<TestUser> {
    return this.create({
      email: 'instructor@test.com',
      username: 'instructor',
      password: 'Instructor123!',
      first_name: 'Test',
      last_name: 'Instructor',
      role: 'instructor',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      ...overrides
    });
  }

  /**
   * Create a student user
   */
  static async createStudent(overrides: Partial<TestUser> = {}): Promise<TestUser> {
    return this.create({
      email: 'student@test.com',
      username: 'student',
      password: 'Student123!',
      first_name: 'Test',
      last_name: 'Student',
      role: 'student',
      status: 'active',
      email_verified: true,
      two_factor_enabled: false,
      ...overrides
    });
  }

  /**
   * Create a pending user
   */
  static async createPending(overrides: Partial<TestUser> = {}): Promise<TestUser> {
    return this.create({
      email: 'pending@test.com',
      username: 'pending',
      password: 'Pending123!',
      first_name: 'Pending',
      last_name: 'User',
      role: 'student',
      status: 'pending',
      email_verified: false,
      two_factor_enabled: false,
      ...overrides
    });
  }

  /**
   * Create a suspended user
   */
  static async createSuspended(overrides: Partial<TestUser> = {}): Promise<TestUser> {
    return this.create({
      email: 'suspended@test.com',
      username: 'suspended',
      password: 'Suspended123!',
      first_name: 'Suspended',
      last_name: 'User',
      role: 'student',
      status: 'suspended',
      email_verified: true,
      two_factor_enabled: false,
      ...overrides
    });
  }

  /**
   * Create multiple users
   */
  static async createMany(count: number, overrides: Partial<TestUser> = {}): Promise<TestUser[]> {
    const users: TestUser[] = [];
    for (let i = 0; i < count; i++) {
      const user = await this.create({
        email: `test${i}@example.com`,
        username: `testuser${i}`,
        ...overrides
      });
      users.push(user);
    }
    return users;
  }

  /**
   * Create users with different roles
   */
  static async createWithRoles(): Promise<TestUser[]> {
    return Promise.all([
      this.createSuperAdmin(),
      this.createAdmin(),
      this.createInstructor(),
      this.createStudent(),
      this.createPending(),
      this.createSuspended()
    ]);
  }
}
