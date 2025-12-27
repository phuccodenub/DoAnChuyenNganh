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
    // Pool configuration optimized for external databases (Supabase, etc.)
    // - max: Maximum number of connections in pool (increased for production)
    // - min: Minimum number of connections to maintain
    // - acquire: Maximum time (ms) to wait for a connection from pool
    // - idle: Maximum time (ms) a connection can be idle before being released
    // - evict: Interval to check for idle connections
    const poolMax = parseInt(process.env.DB_POOL_MAX || '10', 10);
    const poolMin = parseInt(process.env.DB_POOL_MIN || '2', 10);
    const poolAcquire = parseInt(process.env.DB_POOL_ACQUIRE || '60000', 10); // 60s
    const poolIdle = parseInt(process.env.DB_POOL_IDLE || '30000', 10); // 30s
    
    const baseOptions = {
      dialect: 'postgres',
      logging: false,
      pool: {
        max: poolMax,
        min: poolMin,
        acquire: poolAcquire,
        idle: poolIdle,
        evict: 10000, // Check for idle connections every 10s
      },
      define: {
        underscored: true,
        freezeTableName: true,
        timestamps: true,
        paranoid: false
      },
      timezone: '+00:00',
      // Add connection retry for production
      retry: {
        max: 3,
        match: [
          /ETIMEDOUT/,
          /EHOSTUNREACH/,
          /ECONNRESET/,
          /ECONNREFUSED/,
          /ETIMEDOUT/,
          /ESOCKETTIMEDOUT/,
          /EHOSTUNREACH/,
          /EPIPE/,
          /EAI_AGAIN/,
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/
        ]
      }
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

export async function connectDatabase(retries = 3, delay = 5000): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  
  // Log database URL (masked for security)
  if (databaseUrl) {
    const maskedUrl = databaseUrl.replace(/:[^:@]+@/, ':****@');
    console.log(`[DB] Attempting to connect to database: ${maskedUrl.substring(0, 50)}...`);
  } else {
    console.warn('[DB] ⚠️  DATABASE_URL is not set! Using fallback configuration.');
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const db = getSequelize();
      
      // Set connection timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database authentication timeout after 10s')), 10000);
      });
      
      await Promise.race([
        db.authenticate(),
        timeoutPromise
      ]);
      
      console.log('Database connection has been established successfully');
      
      // Log pool configuration
      const poolConfig = (db as any).config?.pool || {};
      console.log(`[DB] Connection pool configured: max=${poolConfig.max}, min=${poolConfig.min}, acquire=${poolConfig.acquire}ms, idle=${poolConfig.idle}ms`);
      
      // Monitor pool status periodically (only in production)
      if (process.env.NODE_ENV === 'production') {
        setInterval(() => {
          const pool = (db as any).connectionManager?.pool;
          if (pool) {
            const poolSize = pool.size || 0;
            const available = pool.available || 0;
            const waiting = pool.waiting || 0;
            const using = poolSize - available;
            
            if (waiting > 0 || using >= poolConfig.max * 0.8) {
              console.warn(`[DB] Pool status: size=${poolSize}, using=${using}, available=${available}, waiting=${waiting}`);
            }
          }
        }, 30000); // Check every 30s
      }
      
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
        const isExternalDb = !!(databaseUrl && databaseUrl.trim().length > 0);

        // For local Postgres (no DATABASE_URL), prefer running migrations to keep schema in sync.
        if (!isExternalDb) {
          const MigrationMod = await import('../migrations');
          const migrator = new MigrationMod.MigrationManager(db);
          await migrator.migrate();
        }
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
      
      return; // Success, exit function
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = (error as any)?.parent?.code || (error as any)?.code || 'UNKNOWN';
      
      console.error(`[DB] Connection attempt ${attempt}/${retries} failed:`, errorMessage);
      console.error(`[DB] Error code: ${errorCode}`);
      
      if (attempt < retries) {
        console.log(`[DB] Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Exponential backoff
        delay *= 1.5;
      } else {
        console.error('[DB] ❌ All connection attempts failed. Server will start but database operations will fail.');
        throw error;
      }
    }
  }
}

