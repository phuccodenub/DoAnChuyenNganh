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
    
    // Initialize ProxyPal Health Check
    logger.info('Initializing ProxyPal Health Check...');
    const proxyPalStatus = await proxyPalHealthCheck.checkStatus();
    if (proxyPalStatus.isOnline) {
      logger.info('✅ ProxyPal: Available (Local AI processing enabled)');
      logger.info(`   URL: ${process.env.PROXYPAL_BASE_URL || 'http://127.0.0.1:8317/v1'}`);
      logger.info(`   Models available: ${proxyPalStatus.availableModels.length}`);
    } else {
      logger.warn('⚠️  ProxyPal: Not available (video analysis disabled)');
      logger.warn('   To enable video analysis, start ProxyPal server');
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

startServer();

