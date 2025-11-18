import 'dotenv-flow/config';
// Enable runtime resolution for TypeScript path aliases in compiled JS (optional in dev/test)
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  require('module-alias/register');
} catch (error) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('module-alias/register not found; continuing without runtime aliases');
  }
}
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { connectRedis } from './config/redis.config';
import { connectDatabase } from './config/db';
import logger from './utils/logger.util';
import { APP_CONSTANTS } from './constants/app.constants';

// Import error handling system
import { ErrorHandler } from './errors/error.handler';

// Import all models to register them with sequelize
import './models';

// Import Socket.IO gateways
import { ChatGateway } from './modules/chat/chat.gateway';
import { WebRTCGateway } from './modules/webrtc/webrtc.gateway';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Setup global error handlers
    ErrorHandler.setupGlobalHandlers();
    
    // Connect to database
    await connectDatabase();
    
    // Connect to Redis (allow disabling in local dev/tests)
    if (process.env.REDIS_DISABLED === 'true') {
      logger.info('Redis connection disabled via REDIS_DISABLED=true');
    } else {
      await connectRedis();
    }
    
    // Create HTTP server from Express app
    const httpServer = createServer(app);
    
    // Create SINGLE Socket.IO server instance (shared by all gateways)
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: APP_CONSTANTS.CORS.ALLOWED_ORIGINS,
        methods: APP_CONSTANTS.CORS.ALLOWED_METHODS,
        credentials: true
      },
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });
    
    logger.info('Socket.IO server created');
    
    // Initialize Socket.IO gateways with shared server instance
    logger.info('Initializing Socket.IO gateways...');
    new ChatGateway(io);
    new WebRTCGateway(io);
    logger.info('Socket.IO gateways initialized');
    
    // Start HTTP server (this will also start Socket.IO)
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📡 Socket.IO available at ws://localhost:${PORT}/socket.io`);
    });
    
  } catch (error: unknown) {
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

