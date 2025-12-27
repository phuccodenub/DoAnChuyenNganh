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
console.log('[STARTUP] Loading models...');
import './models';
console.log('[STARTUP] Models loaded');

// Import Socket.IO gateways
import { ChatGateway, setChatGateway } from './modules/chat/chat.gateway';
import { WebRTCGateway } from './modules/webrtc/webrtc.gateway';
import { LiveStreamGateway } from './modules/livestream/livestream.gateway';
import { NotificationGateway, setNotificationGateway } from './modules/notifications/notifications.gateway';
import { ConversationGateway, setConversationGateway } from './modules/conversation';

// Import AI Services to check status on startup
import { AIService } from './modules/ai/ai.service';
import { AIChatGateway } from './modules/ai/gateways/ai-chat.gateway';
import { AIAnalysisQueueService } from './modules/ai/services/ai-analysis-queue-worker.service';
import { proxyPalHealthCheck } from './modules/ai/services/proxypal-health.service';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Log startup immediately
    console.log('🚀 Starting server...');
    console.log(`PORT: ${PORT}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    
    // Setup global error handlers
    console.log('Setting up error handlers...');
    ErrorHandler.setupGlobalHandlers();
    console.log('✅ Error handlers setup complete');
    
    // Connect to database with timeout
    console.log('Connecting to database...');
    logger.info('Connecting to database...');
    try {
      await Promise.race([
        connectDatabase(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout after 30s')), 30000)
        )
      ]);
      logger.info('✅ Database connected successfully');
    } catch (error: unknown) {
      logger.error('❌ Database connection failed:', error);
      throw error;
    }
    
    // Connect to Redis (allow disabling in local dev/tests)
    if (process.env.REDIS_DISABLED === 'true') {
      logger.info('Redis connection disabled via REDIS_DISABLED=true');
    } else {
      logger.info('Connecting to Redis...');
      try {
        await Promise.race([
          connectRedis(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Redis connection timeout after 10s')), 10000)
          )
        ]);
        logger.info('✅ Redis connected successfully');
      } catch (error: unknown) {
        logger.error('❌ Redis connection failed:', error);
        throw error;
      }
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
    const chatGateway = new ChatGateway(io);
    setChatGateway(chatGateway);
    
    new WebRTCGateway(io);
    const livestreamGateway = new LiveStreamGateway(io);
    // Export gateway instance for use in controllers/services
    (global as any).livestreamGateway = livestreamGateway;
    
    // Initialize NotificationGateway and store singleton for service usage
    const notificationGateway = new NotificationGateway(io);
    setNotificationGateway(notificationGateway);
    
    // Initialize ConversationGateway for DM functionality
    const conversationGateway = new ConversationGateway(io);
    setConversationGateway(conversationGateway);
    
    // Initialize AI Chat Gateway for AI Tutor
    const aiChatGateway = new AIChatGateway(io);
    logger.info('AI Chat Gateway initialized');
    
    logger.info('Socket.IO gateways initialized');
    
    // Initialize and check AI Service status
    logger.info('Initializing AI Service...');
    const aiService = new AIService();
    if (aiService.isAvailable()) {
      logger.info('✅ AI Service: Available (Gemini API connected)');
      logger.info(`   Model: ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`);
    } else {
      logger.warn('⚠️  AI Service: Not available (GEMINI_API_KEY not configured)');
      logger.warn('   To enable AI features, add GEMINI_API_KEY to your .env file');
      logger.warn('   Get your API key at: https://aistudio.google.com/');
    }
    
    // Initialize ProxyPal Health Check (only if enabled)
    if (process.env.PROXYPAL_ENABLED === 'true') {
      logger.info('Initializing ProxyPal Health Check...');
      try {
        const proxyPalStatus = await Promise.race([
          proxyPalHealthCheck.checkStatus(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('ProxyPal health check timeout after 5s')), 5000)
          )
        ]) as any;
        if (proxyPalStatus.isOnline) {
          logger.info('✅ ProxyPal: Available (Local AI processing enabled)');
          logger.info(`   URL: ${process.env.PROXYPAL_BASE_URL || 'http://127.0.0.1:8317/v1'}`);
          logger.info(`   Models available: ${proxyPalStatus.availableModels.length}`);
        } else {
          logger.warn('⚠️  ProxyPal: Not available (video analysis disabled)');
        }
      } catch (error: unknown) {
        logger.warn('⚠️  ProxyPal: Health check failed or timeout (video analysis disabled)');
        logger.warn(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      logger.info('ProxyPal: Disabled (PROXYPAL_ENABLED=false)');
    }
    
    // Start AI Analysis Queue Worker
    logger.info('Starting AI Analysis Queue Worker...');
    AIAnalysisQueueService.start();
    logger.info('✅ AI Analysis Queue Worker started (processing every 1 minute)');
    
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
  
  // Stop queue worker
  AIAnalysisQueueService.stop();
  logger.info('AI Analysis Queue Worker stopped');
  
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  // Stop queue worker
  AIAnalysisQueueService.stop();
  logger.info('AI Analysis Queue Worker stopped');
  
  process.exit(0);
});

console.log('Calling startServer()...');
startServer().catch((error) => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});

