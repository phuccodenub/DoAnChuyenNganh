import { Sequelize } from 'sequelize';
import logger from '../utils/logger.util';

async function resetDatabase() {
  // Create new sequelize instance with explicit connection
  const sequelize = new Sequelize(
    'postgresql://lms_user:123456@localhost:5432/lms_db',
    {
      dialect: 'postgres',
      logging: (msg) => logger.debug(msg),
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
      retry: { max: 3 },
      define: { underscored: true, freezeTableName: true, timestamps: true, paranoid: false },
      timezone: '+00:00'
    }
  );

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
  } catch (error) {
    logger.error('Database reset failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

resetDatabase();
