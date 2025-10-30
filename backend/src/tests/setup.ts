/**
 * Test Setup
 * Global test configuration and setup
 */

import 'dotenv-flow/config';
import path from 'path';
import dotenv from 'dotenv';
import { applySequelizeSqlShim } from './utils/test.utils';
import { Sequelize, Options } from 'sequelize';
import { getSequelize } from '../config/db';
import { MigrationManager } from '../migrations';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests

// For integration tests, load dedicated env and avoid mocking DB
const isIntegration = process.env.TEST_CATEGORY === 'integration';
if (isIntegration) {
  dotenv.config({ path: path.resolve(__dirname, 'integration', 'test.env'), override: true });
  // Ensure Postgres NUMERIC (OID 1700) is parsed as number before any connections are made
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { types } = require('pg');
    // Support both literal OID and builtins for compatibility
    const NUMERIC_OID = (types as any).builtins?.NUMERIC ?? 1700;
    types.setTypeParser(NUMERIC_OID, (val: string) => (val === null ? null : parseFloat(val)) as any);
  } catch {
    // no-op if pg not available
  }
  // Apply global Sequelize SQL shim early so any sequelize.query using `?` works with Postgres
  applySequelizeSqlShim();

  // Force early fallback to main database to avoid missing/permission-denied test DB issues
  // Rationale: Some model files call getSequelize() at import time (via app import in tests),
  // which occurs BEFORE any async beforeAll hooks run. If test DB doesn't exist, those imports
  // would bind a Sequelize instance pointing at a non-existent DB and cause early failures.
  // We therefore set DATABASE_URL and related envs to the primary DB up front for integration tests.
  (function forceEarlyDbFallback() {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = String(process.env.DB_PORT || '5432');
    const user = process.env.DB_USER_TEST || process.env.DB_USER || 'lms_user';
    const password = process.env.DB_PASSWORD_TEST || process.env.DB_PASSWORD || '123456';
    const fallbackDb = process.env.DB_NAME || 'lms_db';
    // Only switch if env explicitly targets a separate test DB name
    const currentDbName = process.env.DB_NAME_TEST || undefined;
    const databaseUrl = process.env.DATABASE_URL || '';
    const targetsTestDb = (currentDbName && currentDbName !== fallbackDb)
      || databaseUrl.includes('/lms_db_test')
      || /[?&]database=lms_db_test\b/.test(databaseUrl);
    if (targetsTestDb) {
      process.env.DATABASE_URL = `postgresql://${user}:${password}@${host}:${port}/${fallbackDb}`;
      process.env.DB_NAME_TEST = fallbackDb;
      process.env.DB_HOST = host;
      process.env.DB_PORT = port;
      process.env.DB_USER = user;
      process.env.DB_PASSWORD = password;
      process.env.__TEST_DB_FALLBACK_ENABLED = 'true';
      // eslint-disable-next-line no-console
      console.warn(`[TEST_SETUP] Using fallback main database "${fallbackDb}" for integration tests (early override)`);
    }
  })();
  // Ensure test database schema is migrated before any tests run
  beforeAll(async () => {
    // If we already forced early fallback, skip attempting to create the test DB
    if (process.env.__TEST_DB_FALLBACK_ENABLED === 'true') {
      const sequelize = getSequelize();
      await sequelize.authenticate();
      const migrator = new MigrationManager(sequelize);
      await migrator.migrate();
    } else {
      // Create the test database if it doesn't exist yet. This makes tests resilient
      // when the Postgres instance does not have lms_db_test pre-created.
      const targetDbName = process.env.DB_NAME_TEST || 'lms_db_test';
      const host = process.env.DB_HOST || 'localhost';
      const port = parseInt(process.env.DB_PORT || '5432');
      const user = process.env.DB_USER_TEST || process.env.DB_USER || 'lms_user';
      const password = process.env.DB_PASSWORD_TEST || process.env.DB_PASSWORD || '123456';
      const adminOptions: Options = {
        dialect: 'postgres',
        host,
        port,
        logging: false
      };

      // Connect to the default 'postgres' database to perform admin check/create
      const adminSequelize = new Sequelize('postgres', user, password, adminOptions);
      let willFallbackToMainDb = false;
      try {
        await adminSequelize.authenticate();
        const [{ exists }]: Array<{ exists: boolean } | any> = await adminSequelize.query(
          "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = :dbName) AS exists",
          { replacements: { dbName: targetDbName }, type: (adminSequelize as any).QueryTypes.SELECT }
        );
        if (!exists) {
          // NOTE: Identifiers are limited to alphanumerics/underscore in our known values
          // If your DB name contains special chars, adjust to use proper identifier quoting
          try {
            await adminSequelize.query(`CREATE DATABASE "${targetDbName}" OWNER "${user}"`);
          } catch (e: any) {
            const msg = String(e?.message || e);
            // Permission denied to create database -> fall back to main DB so tests can still run
            if (msg.toLowerCase().includes('permission denied')) {
              willFallbackToMainDb = true;
            } else {
              throw e;
            }
          }
        }
      } finally {
        await adminSequelize.close().catch(() => undefined);
      }

      if (willFallbackToMainDb) {
        const fallbackDb = process.env.DB_NAME || 'lms_db';
        // Prefer overriding DATABASE_URL so getSequelize() uses it
        const hostForUrl = host;
        const portForUrl = String(port);
        process.env.DATABASE_URL = `postgresql://${user}:${password}@${hostForUrl}:${portForUrl}/${fallbackDb}`;
        // Also align explicit test DB env used by createTestDatabase()
        process.env.DB_NAME_TEST = fallbackDb;
        process.env.DB_HOST = hostForUrl;
        process.env.DB_PORT = portForUrl;
        process.env.DB_USER = user;
        process.env.DB_PASSWORD = password;
        // eslint-disable-next-line no-console
        console.warn(`[TEST_SETUP] Falling back to main database "${fallbackDb}" due to insufficient privileges to create "${targetDbName}"`);
      }

      const sequelize = getSequelize();
      await sequelize.authenticate();
      const migrator = new MigrationManager(sequelize);
      await migrator.migrate();
    }
  });

  // Ensure a clean slate before each test to avoid unique constraint collisions across suites
  beforeEach(async () => {
    const sequelize = getSequelize();
    try {
      await sequelize.query('TRUNCATE TABLE enrollments RESTART IDENTITY CASCADE');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[TEST_SETUP] Failed to truncate enrollments:', (e as any)?.message || e);
    }
    try {
      await sequelize.query('TRUNCATE TABLE courses RESTART IDENTITY CASCADE');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[TEST_SETUP] Failed to truncate courses:', (e as any)?.message || e);
    }
    // Do NOT truncate users between tests to allow IDs created earlier in the suite to persist
    // This aligns with integration tests that create a user in one test and reference it in later tests
  });
} else {
  // Mock external services for unit tests and other categories
  jest.mock('../config/db', () => ({
    getSequelize: jest.fn(),
    connectDatabase: jest.fn()
  }));
}

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global error handler for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

