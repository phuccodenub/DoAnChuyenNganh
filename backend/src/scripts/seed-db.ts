/**
 * Database Seeder Script
 * Run seeders to populate database with sample data
 */

import { getSequelize } from '../config/db';
import { SeederManager } from '../seeders/index';
import logger from '../utils/logger.util';

async function runSeeders() {
  try {
    logger.info('Starting database seeding...');
    
    const sequelize = getSequelize();
    
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Create seeder manager and run seeders
    const seederManager = new SeederManager(sequelize);
    await seederManager.seed();
    
    logger.info('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error: unknown) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

runSeeders();

