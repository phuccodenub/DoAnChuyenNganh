/**
 * Sync Database Models
 * Creates all tables and relationships based on Sequelize models
 */

import 'dotenv-flow/config';
import { getSequelize } from '../config/db';
import logger from '../utils/logger.util';

async function syncModels() {
  const sequelize = getSequelize();

  try {
    logger.info('🔄 Syncing database models...');
    
    // Test connection first
    await sequelize.authenticate();
    logger.info('✅ Database connection established');

    // Sync all models (create tables)
    await sequelize.sync({ alter: false });
    logger.info('✅ Database models synchronized successfully');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to sync database models:', error);
    process.exit(1);
  }
}

syncModels();
