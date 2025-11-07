import { Sequelize, Options } from 'sequelize';

let sequelize: Sequelize | null = null;

export function getSequelize(): Sequelize {
  if (!sequelize) {
    // Prefer DATABASE_URL if provided; fallback to discrete DB_* variables
    const baseOptions: Options = {
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
      sequelize = new Sequelize(databaseUrl, baseOptions);
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

      const connectionOptions: Options = {
        ...baseOptions,
        host: dbHost,
        port: parseInt(dbPort)
      };

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
    if (process.env.NODE_ENV !== 'production') {
      //      await db.sync({ alter: true }); // force: false
      await db.sync({ force: false }); // Use existing tables without altering
      console.log('Database models synchronized');
    }
  } catch (error: unknown) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

