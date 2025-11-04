/**
 * Test Utilities
 * Common utilities for testing
 */

import { Sequelize, QueryTypes } from 'sequelize';
import { hashUtils } from '../../utils/hash.util';
import { tokenUtils } from '../../utils/token.util';
// Ensure Postgres NUMERIC is parsed as float in tests to align with expectations
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { types } = require('pg');
  // OID 1700 is the numeric type in Postgres
  types.setTypeParser(1700, (val: string) => (val === null ? null : parseFloat(val)) as any);
} catch {
  // ignore if pg is not available in this context
}

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
export function applySequelizeSqlShim(): void {
  // Monkey-patch Sequelize.prototype.query globally (once) to support positional `?` placeholders by converting to $1..$n for Postgres
  const SequelizeAny = Sequelize as any;
  if (!SequelizeAny.__sqlShimApplied) {
    const proto: any = SequelizeAny.prototype;
    const original = proto.query;
    const coerceNumericRows = (res: unknown, opts?: any) => {
      try {
        const isSelect = opts && (opts.type === QueryTypes.SELECT || (typeof opts.type === 'string' && String(opts.type).toUpperCase().includes('SELECT')));
        if (isSelect && Array.isArray(res)) {
          for (const row of res as Array<Record<string, unknown>>) {
            if (row && typeof row === 'object') {
              for (const key of Object.keys(row)) {
                if (key === 'price' || key === 'gpa') {
                  const val = row[key];
                  if (typeof val === 'string' && /^-?\d+(?:\.\d+)?$/.test(val)) {
                    (row as any)[key] = parseFloat(val);
                  }
                }
              }
            }
          }
        }
      } catch {
        // ignore in tests
      }
      return res as any;
    };
    proto.query = function(sql: any, options?: any) {
      let sqlText = sql;
      let opts = options ?? {};

      if (typeof sqlText === 'string') {
        const hasQuestionMarks = sqlText.includes('?');

        // Normalize replacements -> bind
        if (opts && Array.isArray((opts as any).replacements)) {
          const reps = (opts as any).replacements as any[];
          let i = 0;
          const replacedSql = sqlText.replace(/\?/g, () => `$${++i}`);
          if (i === reps.length) {
            const newOpts = { ...opts } as any;
            delete newOpts.replacements;
            newOpts.bind = reps;
            // eslint-disable-next-line no-console
            console.log('[SQL_SHIM] replacements->bind', replacedSql);
            return (original.call(this, replacedSql, newOpts) as Promise<any>)
              .then((res: any) => coerceNumericRows(res, newOpts))
              .catch((err: any) => {
              // eslint-disable-next-line no-console
              console.error('[SQL_SHIM_ERROR] replacements->bind', err?.message, replacedSql);
              throw err;
            });
          }
        }

        // If using bind with ? placeholders, rewrite to $1..$n
        if (hasQuestionMarks && opts && Array.isArray((opts as any).bind)) {
          let j = 0;
          const replacedSql = sqlText.replace(/\?/g, () => `$${++j}`);
          // eslint-disable-next-line no-console
          console.log('[SQL_SHIM] bind passthrough', replacedSql);
          return (original.call(this, replacedSql, opts) as Promise<any>)
            .then((res: any) => coerceNumericRows(res, opts))
            .catch((err: any) => {
            // eslint-disable-next-line no-console
            console.error('[SQL_SHIM_ERROR] bind passthrough', err?.message, replacedSql);
            throw err;
          });
        }
      }

      return (original.call(this, sqlText, opts) as Promise<any>)
        .then((res: any) => coerceNumericRows(res, opts))
        .catch((err: any) => {
        // eslint-disable-next-line no-console
        console.error('[SQL_SHIM_ERROR] default', err?.message, typeof sqlText === 'string' ? sqlText : '<<non-string-sql>>');
        throw err;
      });
    };
    SequelizeAny.__sqlShimApplied = true;
  }
}

export function createTestDatabase(): Sequelize {
  const db = new Sequelize({
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

  // Ensure shim is applied before any query usage
  applySequelizeSqlShim();

  // Instance-level wrapper to ensure shim and numeric coercion apply consistently
  const originalQuery = db.query.bind(db);
  const coerceNumericRows = (res: unknown, opts?: any, sqlForHint?: unknown) => {
    try {
      const isSelectLike = opts && (opts.type === QueryTypes.SELECT || (typeof opts.type === 'string' && String(opts.type).toUpperCase().includes('SELECT')))
        || (typeof sqlForHint === 'string' && (sqlForHint as string).toUpperCase().includes('RETURNING'));
      if (isSelectLike && Array.isArray(res)) {
        for (const row of res as Array<Record<string, unknown>>) {
          if (row && typeof row === 'object') {
            for (const key of Object.keys(row)) {
              if (key === 'price' || key === 'gpa') {
                const val = row[key];
                if (typeof val === 'string' && /^-?\d+(?:\.\d+)?$/.test(val)) {
                  (row as any)[key] = parseFloat(val);
                }
              }
            }
          }
        }
      }
    } catch {
      // ignore in tests
    }
    return res as any;
  };
  (db as any).query = (sql: any, options?: any) => {
    let sqlText = sql;
    let opts = options ?? {};

    // Only operate on string SQL with placeholders
    if (typeof sqlText === 'string') {
      const hasQuestionMarks = sqlText.includes('?');

      // Normalize to bind params if replacements were provided
      if (opts && Array.isArray((opts as any).replacements)) {
        const reps = (opts as any).replacements as any[];
        // Replace each ? with $1..$n
        let i = 0;
        const replacedSql = sqlText.replace(/\?/g, () => `$${++i}`);
        // If counts mismatch, fall back to original
        if (i === reps.length) {
          const newOpts = { ...opts } as any;
          delete newOpts.replacements;
          newOpts.bind = reps;
          if (process.env.JEST_WORKER_ID) {
            // eslint-disable-next-line no-console
            console.log('[SQL_SHIM] replacements->bind', replacedSql);
          }
          return (originalQuery(replacedSql, newOpts) as Promise<any>)
            .then((res: any) => coerceNumericRows(res, newOpts, replacedSql))
            .catch((err: any) => {
            if (process.env.JEST_WORKER_ID) {
              // eslint-disable-next-line no-console
              console.error('[SQL_SHIM_ERROR] replacements->bind', err?.message, replacedSql);
            }
            throw err;
          });
        }
      }

      // If using bind with ? placeholders, still rewrite to $1..$n
      if (hasQuestionMarks && opts && Array.isArray((opts as any).bind)) {
        let j = 0;
        const replacedSql = sqlText.replace(/\?/g, () => `$${++j}`);
        if (process.env.JEST_WORKER_ID) {
          // eslint-disable-next-line no-console
          console.log('[SQL_SHIM] bind passthrough', replacedSql);
        }
        return (originalQuery(replacedSql, opts) as Promise<any>)
          .then((res: any) => coerceNumericRows(res, opts, replacedSql))
          .catch((err: any) => {
          if (process.env.JEST_WORKER_ID) {
            // eslint-disable-next-line no-console
            console.error('[SQL_SHIM_ERROR] bind passthrough', err?.message, replacedSql);
          }
          throw err;
        });
      }
    }

    // Default path with lightweight numeric coercion for common decimal fields in tests
    return (originalQuery(sqlText, opts) as Promise<any>)
      .then((res: any) => coerceNumericRows(res, opts, sqlText))
      .catch((err: any) => {
        if (process.env.JEST_WORKER_ID) {
          // eslint-disable-next-line no-console
          console.error('[SQL_SHIM_ERROR] default', err?.message, typeof sqlText === 'string' ? sqlText : '<<non-string-sql>>');
        }
        throw err;
      });
  };

  return db;
}

/**
 * Generate test user data
 */
export function generateTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const id = generateUUID();
  // Ensure username stays within validation max length (<= 30)
  const shortId = id.replace(/-/g, '').slice(0, 12);
  return {
    id,
    email: `test-${id}@example.com`,
    username: `testuser_${shortId}`,
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
    status: 'draft',
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
export function generateTestToken(payload: Partial<{ userId: string; email: string; role: string }> = {}): string {
  const userId = payload.userId || generateUUID();
  const email = payload.email || 'test@example.com';
  const role = payload.role || 'student';

  // Generate a real JWT using the app's token utilities and configured secrets
  return tokenUtils.jwt.generateAccessToken(userId, email, role);
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

