import { Client } from 'pg';
import logger from '../utils/logger.util';

async function setupDatabase() {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
  const dbPassword = process.env.DB_PASSWORD || '123456';
  const dbName = process.env.DB_NAME || 'lms_db';
  const dbUser = process.env.DB_USER || 'lms_user';
  const dbAdminUser = process.env.DB_ADMIN_USER || process.env.DB_USER || 'lms_user';

  const adminClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbAdminUser,
    password: dbPassword,
    database: 'postgres'
  });

  try {
    logger.info(`Connecting to PostgreSQL at ${dbHost}:${dbPort}...`);
    await adminClient.connect();
    logger.info('Connected to PostgreSQL as admin');

    // Drop database first
    await adminClient.query(`DROP DATABASE IF EXISTS ${dbName}`);
    logger.info(`Dropped existing ${dbName}`);

    // Create or update user (don't drop, just alter)
    try {
      await adminClient.query(`ALTER USER ${dbUser} WITH PASSWORD '${dbPassword}' SUPERUSER`);
      logger.info(`Updated ${dbUser} password and privileges`);
    } catch (e) {
      // If user doesn't exist, create it
      await adminClient.query(`CREATE USER ${dbUser} WITH PASSWORD '${dbPassword}' SUPERUSER`);
      logger.info(`Created ${dbUser}`);
    }

    // Create database
    await adminClient.query(`CREATE DATABASE ${dbName} OWNER ${dbUser}`);
    logger.info(`Created ${dbName}`);

    // Grant privileges
    await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser}`);
    logger.info(`Granted privileges to ${dbUser}`);

    logger.info('Database setup completed successfully!');
    process.exit(0);
  } catch (error: unknown) {
    logger.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await adminClient.end();
  }
}

setupDatabase();

