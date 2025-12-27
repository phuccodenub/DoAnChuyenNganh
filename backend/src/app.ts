// CRITICAL: Log immediately when app.ts loads
console.log('[APP] app.ts module loading...');

// Ensure runtime alias resolution for compiled JS (optional in tests/CI)
try { require('module-alias/register'); } catch { /* no-op for CI */ }
console.log('[APP] module-alias loaded');

import express, { Request, Response, NextFunction } from 'express';
console.log('[APP] express imported');

import { corsMiddleware } from './config/cors.config';
console.log('[APP] cors config imported');

import helmet from 'helmet';
console.log('[APP] helmet imported');

import rateLimit from 'express-rate-limit';
console.log('[APP] rateLimit imported');

import { startTracing } from './tracing/tracing';
console.log('[APP] tracing imported');

import { tracingMiddleware } from './middlewares/tracing.middleware';
console.log('[APP] tracing middleware imported');

import 'dotenv-flow/config';
console.log('[APP] dotenv-flow loaded');

// Import Swagger
import { specs, swaggerUi } from './config/swagger.config';
console.log('[APP] swagger config imported');

// Import middlewares
import { requestIdMiddleware, loggerMiddleware } from '@middlewares/logger.middleware';
console.log('[APP] logger middleware imported');

import { auditLogMiddleware } from './middlewares/audit-log.middleware';
console.log('[APP] audit log middleware imported');

import { errorHandler, notFoundHandler } from '@middlewares/error.middleware';
console.log('[APP] error middleware imported');

import logger from '@utils/logger.util';
console.log('[APP] logger imported');

// Import error handling system
import { ErrorHandler } from './errors/error.handler';
console.log('[APP] ErrorHandler imported');

// Import constants
import { APP_CONSTANTS } from '@constants/app.constants';
console.log('[APP] constants imported');

// Import API routes
console.log('[APP] Importing API routes...');
import { apiRoutes } from './api';
console.log('[APP] API routes imported');

// Import monitoring
console.log('[APP] Importing monitoring...');
import { healthRoutes, metricsRoutes, metricsMiddleware, pingRoutes } from './monitoring';
console.log('[APP] monitoring imported');

// Import caching
console.log('[APP] Importing cache...');
import { cacheMiddleware } from './cache';
console.log('[APP] cache imported');

// Initialize tracing once at app bootstrap
console.log('[APP] Starting tracing...');
startTracing().catch((err) => {
  console.error('[APP] Tracing failed:', err);
});
console.log('[APP] Tracing started (async)');

const app = express();
export { app };

// Request ID middleware
app.use(requestIdMiddleware);

// Logger middleware
app.use(loggerMiddleware);

// Tracing middleware (route-level spans)
app.use(tracingMiddleware);

// Security middleware
app.use(helmet());

// CORS configuration (centralized)
// Skip CORS for Socket.IO path (Socket.IO handles its own CORS)
app.use((req: Request, res: Response, next: NextFunction): void => {
  if (req.path?.startsWith('/socket.io')) {
    return next(); // Skip CORS middleware for Socket.IO
  }
  corsMiddleware(req as any, res as any, next);
});

// Metrics middleware (allow disabling via DISABLE_METRICS=true)
if (process.env.DISABLE_METRICS !== 'true') {
  app.use(metricsMiddleware.collectHttpMetrics);
  app.use(metricsMiddleware.collectMemoryMetrics);
  app.use(metricsMiddleware.collectCpuMetrics);
  app.use(metricsMiddleware.collectUptimeMetrics);
  app.use(metricsMiddleware.collectAuthMetrics);
  app.use(metricsMiddleware.collectUserMetrics);
  app.use(metricsMiddleware.collectCourseMetrics);
}

// Cache middleware (allow disabling in tests via DISABLE_CACHE=true)
// Do NOT cache authenticated GET responses here (they will be cached by cacheUserData below)
if (process.env.DISABLE_CACHE !== 'true') {
  app.use(
    cacheMiddleware.cacheGet({
      ttl: 300,
      skipCache: (req) => {
        // Bypass cache for authenticated requests and for monitoring endpoints
        const url = req.path || '';
        if (req.headers.authorization) return true;
        if (url.startsWith('/metrics') || url.startsWith('/health') || url.startsWith('/ping')) return true;
        return false;
      }
    })
  );
  app.use(cacheMiddleware.cacheUserData({ ttl: 600 })); // Cache user data for 10 minutes
}

// Rate limiting (allow disabling in tests via DISABLE_RATE_LIMIT=true)
// Skip rate limiting for Socket.IO path (Socket.IO handles its own rate limiting)
if (process.env.DISABLE_RATE_LIMIT !== 'true' && process.env.NODE_ENV !== 'test') {
  // Increase rate limit for development environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  const maxRequests = isDevelopment 
    ? APP_CONSTANTS.SYSTEM.RATE_LIMIT_MAX_REQUESTS * 3 // 300 requests in dev
    : APP_CONSTANTS.SYSTEM.RATE_LIMIT_MAX_REQUESTS; // 100 requests in production
  
  const limiter = rateLimit({
    windowMs: APP_CONSTANTS.SYSTEM.RATE_LIMIT_WINDOW_MS,
    max: maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for Socket.IO
      if (req.path?.startsWith('/socket.io')) return true;
      
      // Skip rate limiting for read-only GET endpoints that are frequently polled
      // These are safe to exclude as they don't modify data
      const readOnlyPaths = [
        '/conversations/online-status', // Online status polling
        '/chat/unread-count', // Unread count polling
      ];
      
      if (req.method === 'GET' && readOnlyPaths.some(path => req.path?.includes(path))) {
        return true;
      }
      
      return false;
    },
    // Better error handling
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('user-agent'),
      });
      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(APP_CONSTANTS.SYSTEM.RATE_LIMIT_WINDOW_MS / 1000),
      });
    },
  });
  app.use(limiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Monitoring routes
app.use('/health', healthRoutes);
app.use('/metrics', metricsRoutes);
app.use('/', pingRoutes);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .info .title { color: #3b82f6 }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 10px; border-radius: 5px }
    .swagger-ui .btn.authorize { background-color: #3b82f6; border-color: #3b82f6 }
    .swagger-ui .btn.authorize:hover { background-color: #2563eb }
    .swagger-ui .opblock.opblock-post { border-color: #10b981 }
    .swagger-ui .opblock.opblock-get { border-color: #3b82f6 }
    .swagger-ui .opblock.opblock-put { border-color: #f59e0b }
    .swagger-ui .opblock.opblock-delete { border-color: #ef4444 }
  `,
  customSiteTitle: 'LMS Backend API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
}));

// API routes with versioning
app.use('/api', apiRoutes);

// Audit log middleware (records write operations after auth)
// Must be placed after API routes to capture response status
app.use(auditLogMiddleware);

// Temporary: dump key API routes at startup to verify registration order
try {
  const stack: any[] = (apiRoutes as any).stack || [];
  const important = stack
    .map((layer: any) => {
      if (layer?.route) {
        const methods = Object.keys(layer.route.methods || {}).join(',').toUpperCase();
        return `${methods} ${layer.route.path}`;
      }
      if (layer?.name === 'router' && layer?.regexp) {
        return `USE ${layer.regexp?.toString()}`;
      }
      return null;
    })
    .filter(Boolean);
   
  console.log('[API_ROUTE_DEBUG_COUNT]', important.length);
   
  console.log('[API_ROUTE_DEBUG_LIST]', important.slice(0, 200));
} catch {}

// Cache invalidation for write operations
if (process.env.DISABLE_CACHE !== 'true') {
  app.use(cacheMiddleware.invalidateCache([
    'user:*',
    'course:*',
    'enrollment:*'
  ]));
}

// Error handling middleware
if (process.env.DISABLE_METRICS !== 'true') {
  app.use(metricsMiddleware.collectErrorMetrics);
}
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

export default app;

