import { Sequelize } from 'sequelize';

let sequelize: Sequelize | null = null;

export function getSequelize(): Sequelize {
  if (!sequelize) {
    // Prefer SQLite when explicitly requested (CI/seed scripts)
    let preferSqlite = (
      process.env.DB_DIALECT === 'sqlite' ||
      process.env.SQLITE === 'true' ||
      typeof process.env.SQLITE_PATH !== 'undefined' ||
      (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('sqlite'))
    );
    // In Jest test environment or when sqlite3 module is unavailable, do not use sqlite
    if (typeof process.env.JEST_WORKER_ID !== 'undefined' || process.env.NODE_ENV === 'test') {
      try { require('sqlite3'); } catch { preferSqlite = false; }
    }

    if (preferSqlite) {
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: process.env.SQLITE_PATH || (process.env.NODE_ENV === 'test' ? ':memory:' : './.tmp/dev.sqlite'),
        logging: false
      } as any);
      return sequelize;
    }

    // Prefer DATABASE_URL if provided; fallback to discrete DB_* variables
    const baseOptions = {
      dialect: 'postgres',
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
    };

    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl && databaseUrl.trim().length > 0) {
      sequelize = new Sequelize(databaseUrl, baseOptions as any);
    } else {
      // Detect test environment (Jest sets JEST_WORKER_ID). Prefer explicit NODE_ENV==='test' as well
      const isTestEnv = process.env.NODE_ENV === 'test' || typeof process.env.JEST_WORKER_ID !== 'undefined';

      const dbHost = process.env.DB_HOST || 'localhost';
      const dbPort = process.env.DB_PORT || '5432';
      // In test, prefer DB_NAME_TEST and DB_USER_TEST/DB_PASSWORD_TEST to mirror test harness defaults
      const dbName = isTestEnv
        ? (process.env.DB_NAME_TEST || 'lms_db_test')
        : (process.env.DB_NAME || 'lms_db');
      const dbUser = isTestEnv
        ? (process.env.DB_USER_TEST || process.env.DB_USER || 'lms_user')
        : (process.env.DB_USER || 'lms_user');
      const dbPassword = isTestEnv
        ? (process.env.DB_PASSWORD_TEST || process.env.DB_PASSWORD || '123456')
        : (process.env.DB_PASSWORD || 'lms_password');

      const connectionOptions = {
        ...baseOptions,
        host: dbHost,
        port: parseInt(dbPort)
      } as any;

      sequelize = new Sequelize(dbName, dbUser, dbPassword, connectionOptions);
    }
  }
  return sequelize;
}

export async function connectDatabase(): Promise<void> {
  try {
    const db = getSequelize();
    await db.authenticate();
    console.log('Database connection has been established successfully');
    
    // Setup model associations before sync
    const { setupAssociations } = await import('../models/associations');
    setupAssociations();
    console.log('✅ Model associations setup completed');
    
    const { setupExtendedAssociations } = await import('../models/associations-extended');
    setupExtendedAssociations();
    console.log('✅ Extended model associations setup completed');
    
    // Sync database - always sync in development to ensure tables exist
    // In production, use migrations instead
    // Note: On Supabase, tables may be owned by different users, so we disable
    // index creation during sync to avoid permission errors. Indexes should be
    // managed via migrations.
    if (process.env.NODE_ENV !== 'production') {
      // Using force: false prevents dropping tables
      // Using alter: false (implicit) prevents schema modifications
      // Sequelize may still try to create missing indexes, which can fail on Supabase
      // if the connected user doesn't own the table. We handle this gracefully.
      try {
        await db.sync({ force: false });
        console.log('Database models synchronized');
      } catch (syncError: any) {
        // Error code 42501 = insufficient privilege (e.g., not owner of table)
        // This typically happens with indexes on Supabase when tables are owned by a different user
        if (syncError?.parent?.code === '42501') {
          console.log('⚠️ Some database sync operations skipped due to permissions (this is normal on Supabase)');
          console.log('   Tables exist, indexes should be managed via migrations');
        } else {
          throw syncError;
        }
      }
    }
  } catch (error: unknown) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

