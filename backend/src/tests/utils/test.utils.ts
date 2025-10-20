/**
 * Test Utilities
 * Common utilities for testing
 */

import { Sequelize } from 'sequelize';
import { hashUtils } from '../../utils/hash.util';

export interface TestUser {
  id: string;
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
}

export interface TestCourse {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  category: string;
  status: string;
  price: number;
}

export interface TestEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
}

/**
 * Create test database connection
 */
export function createTestDatabase(): Sequelize {
  return new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME_TEST || 'lms_db_test',
    username: process.env.DB_USER || 'lms_user',
    password: process.env.DB_PASSWORD || '123456',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: true,
      paranoid: false
    },
    timezone: '+00:00'
  });
}

/**
 * Generate test user data
 */
export function generateTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const id = generateUUID();
  return {
    id,
    email: `test-${id}@example.com`,
    username: `testuser-${id}`,
    password: 'TestPassword123!',
    first_name: 'Test',
    last_name: 'User',
    role: 'student',
    status: 'active',
    email_verified: true,
    two_factor_enabled: false,
    ...overrides
  };
}

/**
 * Generate test course data
 */
export function generateTestCourse(overrides: Partial<TestCourse> = {}): TestCourse {
  const id = generateUUID();
  return {
    id,
    title: `Test Course ${id}`,
    description: `Test course description ${id}`,
    instructor_id: generateUUID(),
    category: 'programming',
    status: 'active',
    price: 99.99,
    ...overrides
  };
}

/**
 * Generate test enrollment data
 */
export function generateTestEnrollment(overrides: Partial<TestEnrollment> = {}): TestEnrollment {
  const id = generateUUID();
  return {
    id,
    user_id: generateUUID(),
    course_id: generateUUID(),
    status: 'enrolled',
    ...overrides
  };
}

/**
 * Generate UUID for testing
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Hash password for testing
 */
export async function hashTestPassword(password: string): Promise<string> {
  return await hashUtils.password.hashPassword(password);
}

/**
 * Generate JWT token for testing
 */
export function generateTestToken(payload: any = {}): string {
  const defaultPayload = {
    userId: generateUUID(),
    email: 'test@example.com',
    role: 'student',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  };
  
  // In a real test, you would use the actual JWT utility
  // For now, return a mock token
  return Buffer.from(JSON.stringify({ ...defaultPayload, ...payload })).toString('base64');
}

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create mock request object
 */
export function createMockRequest(overrides: any = {}): any {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides
  };
}

/**
 * Create mock response object
 */
export function createMockResponse(): any {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
}

/**
 * Create mock next function
 */
export function createMockNext(): any {
  return jest.fn();
}

/**
 * Assert that an error was thrown
 */
export function expectError(fn: () => any, errorMessage?: string): void {
  expect(fn).toThrow();
  if (errorMessage) {
    expect(fn).toThrow(errorMessage);
  }
}

/**
 * Assert that a promise rejects
 */
export async function expectRejection(promise: Promise<any>, errorMessage?: string): Promise<void> {
  await expect(promise).rejects.toThrow();
  if (errorMessage) {
    await expect(promise).rejects.toThrow(errorMessage);
  }
}

