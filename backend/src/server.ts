// CRITICAL: Log immediately before any imports
console.log('========================================');
console.log('🚀 SERVER MODULE LOADING...');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`PORT: ${process.env.PORT || 'undefined'}`);
console.log('========================================');

import 'dotenv-flow/config';
console.log('[1] dotenv-flow loaded');
// Enable runtime resolution for TypeScript path aliases in compiled JS (optional in dev/test)
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  require('module-alias/register');
  console.log('[2] module-alias loaded');
} catch (error) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('module-alias/register not found; continuing without runtime aliases');
  }
}
console.log('[3] Starting imports...');
import { createServer } from 'http';
console.log('[4] http imported');
import { Server as SocketIOServer } from 'socket.io';
console.log('[5] socket.io imported');
import app from './app';
console.log('[6] app imported');
import { connectRedis } from './config/redis.config';
console.log('[7] redis config imported');
import { connectDatabase } from './config/db';
console.log('[8] db config imported');
import logger from './utils/logger.util';
console.log('[9] logger imported');
import { APP_CONSTANTS } from './constants/app.constants';
console.log('[10] constants imported');

// Import error handling system
import { ErrorHandler } from './errors/error.handler';
console.log('[11] error handler imported');

// Import all models to register them with sequelize
console.log('[12] Loading models...');
import './models';
console.log('[13] Models loaded');

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

// Log immediately when module loads
console.log('========================================');
console.log('🚀 SERVER STARTING...');
console.log(`PORT: ${PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log('========================================');

async function startServer() {
  try {
    // Log startup immediately
    console.log('[STARTUP] Starting server function...');
    console.log(`[STARTUP] PORT: ${PORT}`);
    console.log(`[STARTUP] NODE_ENV: ${process.env.NODE_ENV}`);
    
    // Setup global error handlers
    console.log('[STARTUP] Setting up error handlers...');
    ErrorHandler.setupGlobalHandlers();
    console.log('[STARTUP] ✅ Error handlers setup complete');
    
    // Connect to database with retry logic
    console.log('[STARTUP] Connecting to database...');
    logger.info('Connecting to database...');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim().length === 0) {
      console.error('[STARTUP] ❌ DATABASE_URL is not set! Please configure it in environment variables.');
      logger.error('DATABASE_URL is not set!');
      // Don't throw - allow app to start but database operations will fail
    } else {
      try {
        // connectDatabase() now has built-in retry logic (3 attempts with exponential backoff)
        await Promise.race([
          connectDatabase(3, 5000), // 3 retries, 5s initial delay
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database connection timeout after 60s')), 60000)
          )
        ]);
        console.log('[STARTUP] ✅ Database connected successfully');
        logger.info('✅ Database connected successfully');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = (error as any)?.parent?.code || (error as any)?.code || 'UNKNOWN';
        console.error('[STARTUP] ❌ Database connection failed after all retries:', errorMessage);
        console.error(`[STARTUP] Error code: ${errorCode}`);
        logger.error('Database connection failed after all retries:', { 
          message: errorMessage,
          code: errorCode
        });
        // Don't throw - allow app to start and retry connection later
        // This allows the server to start even if database is temporarily unavailable
        // Database operations will fail with clear error messages
      }
    }
    
    // Connect to Redis (allow disabling in local dev/tests)
    if (process.env.REDIS_DISABLED === 'true') {
      console.log('[STARTUP] Redis connection disabled via REDIS_DISABLED=true');
      logger.info('Redis connection disabled via REDIS_DISABLED=true');
    } else {
      console.log('[STARTUP] Connecting to Redis...');
      logger.info('Connecting to Redis...');
      try {
        await Promise.race([
          connectRedis(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Redis connection timeout after 10s')), 10000)
          )
        ]);
        console.log('[STARTUP] ✅ Redis connected successfully');
        logger.info('✅ Redis connected successfully');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('[STARTUP] ⚠️  Redis connection failed:', errorMessage);
        logger.warn('⚠️  Redis connection failed:', { message: errorMessage });
        // Don't throw - allow app to start and retry connection later
        // throw error;
      }
    }
    
    // Create HTTP server from Express app
    console.log('[STARTUP] Creating HTTP server...');
    const httpServer = createServer(app);
    console.log('[STARTUP] ✅ HTTP server created');
    
    // Create SINGLE Socket.IO server instance (shared by all gateways)
    console.log('[STARTUP] Creating Socket.IO server...');
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: APP_CONSTANTS.CORS.ALLOWED_ORIGINS,
        methods: APP_CONSTANTS.CORS.ALLOWED_METHODS,
        credentials: true
      },
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });
    
    console.log('[STARTUP] ✅ Socket.IO server created');
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
    const portNumber = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
    console.log(`[STARTUP] Starting HTTP server on port ${portNumber}...`);
    httpServer.listen(portNumber, '0.0.0.0', () => {
      console.log(`[STARTUP] 🚀 Server running on port ${PORT}`);
      console.log(`[STARTUP] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[STARTUP] 📡 Socket.IO available at ws://0.0.0.0:${PORT}/socket.io`);
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📡 Socket.IO available at ws://localhost:${PORT}/socket.io`);
    });
    
    console.log(`[STARTUP] HTTP server listen() called, waiting for bind...`);
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[STARTUP] ❌ Failed to start server:', errorMessage);
    logger.error('Failed to start server:', { message: errorMessage });
    // Give a moment for logs to flush before exiting
    setTimeout(() => process.exit(1), 1000);
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
startServer().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error('Fatal error starting server:', errorMessage);
  // Give a moment for logs to flush before exiting
  setTimeout(() => process.exit(1), 1000);
});

