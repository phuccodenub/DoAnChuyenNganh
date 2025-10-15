import { getSequelize } from '../config/db';
import logger from '../utils/logger.util';

async function resetDatabase() {
  try {
    logger.info('Starting database reset...');
    
    // Drop all tables
    const sequelize = getSequelize();
    await sequelize.drop();
    logger.info('All tables dropped');
    
    // Sync database with new schema
    await sequelize.sync({ force: true });
    logger.info('Database schema created successfully');
    
    logger.info('Database reset completed!');
    process.exit(0);
  } catch (error: unknown) {
    logger.error('Database reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();

