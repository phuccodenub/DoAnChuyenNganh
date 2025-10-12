import 'dotenv-flow/config';
import app from './app';
import { connectRedis } from './config/redis.config';
import { connectDatabase } from './config/db';
import logger from './utils/logger.util';

// Import error handling system
import { ErrorHandler } from './errors/error.handler';

// Import all models to register them with sequelize
import './models';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Setup global error handlers
    ErrorHandler.setupGlobalHandlers();
    
    // Connect to database
    await connectDatabase();
    
    // Connect to Redis
    await connectRedis();
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
