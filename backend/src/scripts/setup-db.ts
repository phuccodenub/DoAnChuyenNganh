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

    // Drop database first (to remove dependencies)
    await adminClient.query('DROP DATABASE IF EXISTS lms_db');
    logger.info('Dropped existing lms_db');

    // Revoke privileges and drop user if exists
    try {
      await adminClient.query('REVOKE ALL PRIVILEGES ON SCHEMA public FROM lms_user');
      await adminClient.query('REVOKE ALL PRIVILEGES ON DATABASE lms_db FROM lms_user');
    } catch (e) {
      // Ignore errors if user doesn't exist
    }
    
    await adminClient.query('DROP USER IF EXISTS lms_user');
    logger.info('Dropped existing lms_user');

    // Create user
    await adminClient.query(`CREATE USER lms_user WITH PASSWORD '123456'`);
    logger.info('Created lms_user');

    // Create database
    await adminClient.query('CREATE DATABASE lms_db OWNER lms_user');
    logger.info('Created lms_db');

    // Grant privileges
    await adminClient.query('GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user');
    await adminClient.query('GRANT ALL PRIVILEGES ON SCHEMA public TO lms_user');
    await adminClient.query('ALTER USER lms_user WITH SUPERUSER');
    logger.info('Granted privileges to lms_user');

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

