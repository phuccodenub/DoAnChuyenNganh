import { getSequelize } from '../config/db';
import logger from '../utils/logger.util';

async function resetDatabase() {
  // Use the centralized database configuration
  const sequelize = getSequelize();

  try {
    logger.info('Starting database reset...');
    
    // Test connection first
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Drop all tables
    await sequelize.drop();
    logger.info('All tables dropped');
    
    // Import models to register them
    await import('../models/user.model');
    
    // Sync database with new schema
    await sequelize.sync({ force: true });
    logger.info('Database schema created successfully');
    
    logger.info('Database reset completed!');
    process.exit(0);
  } catch (error: unknown) {
    logger.error('Database reset failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

resetDatabase();

