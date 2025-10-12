import { Client } from 'pg';
import logger from '../utils/logger.util';

async function setupDatabase() {
  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123456', // Thay đổi password admin của bạn
    database: 'postgres'
  });

  try {
    await adminClient.connect();
    logger.info('Connected to PostgreSQL as admin');

    // Drop database first
    await adminClient.query('DROP DATABASE IF EXISTS lms_db');
    logger.info('Dropped existing lms_db');

    // Create or update user (don't drop, just alter)
    try {
      await adminClient.query(`ALTER USER lms_user WITH PASSWORD '123456' SUPERUSER`);
      logger.info('Updated lms_user password and privileges');
    } catch (e) {
      // If user doesn't exist, create it
      await adminClient.query(`CREATE USER lms_user WITH PASSWORD '123456' SUPERUSER`);
      logger.info('Created lms_user');
    }

    // Create database
    await adminClient.query('CREATE DATABASE lms_db OWNER lms_user');
    logger.info('Created lms_db');

    // Grant privileges
    await adminClient.query('GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user');
    logger.info('Granted privileges to lms_user');

    logger.info('Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await adminClient.end();
  }
}

setupDatabase();
