import express from 'express';
import { corsMiddleware } from './config/cors.config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { startTracing } from './tracing/tracing';
import { tracingMiddleware } from './middlewares/tracing.middleware';
import 'dotenv-flow/config';

// Import Swagger
import { specs, swaggerUi } from './config/swagger.config';

// Import middlewares
import { requestIdMiddleware, loggerMiddleware } from '@middlewares/logger.middleware';
import { errorHandler, notFoundHandler } from '@middlewares/error.middleware';

// Import error handling system
import { ErrorHandler } from './errors/error.handler';

// Import constants
import { APP_CONSTANTS } from '@constants/app.constants';

// Import API routes
import { apiRoutes } from './api';

// Import monitoring
import { healthRoutes, metricsRoutes, metricsMiddleware, pingRoutes } from './monitoring';

// Import caching
import { cacheMiddleware } from './cache';

// Initialize tracing once at app bootstrap
startTracing().catch(() => {});

const app = express();
export { app };

// Request ID middleware
app.use(requestIdMiddleware);

// Logger middleware
app.use(loggerMiddleware);

// Tracing middleware (route-level spans)
app.use(tracingMiddleware);

// Metrics middleware
app.use(metricsMiddleware.collectHttpMetrics);
app.use(metricsMiddleware.collectMemoryMetrics);
app.use(metricsMiddleware.collectCpuMetrics);
app.use(metricsMiddleware.collectUptimeMetrics);
app.use(metricsMiddleware.collectAuthMetrics);
app.use(metricsMiddleware.collectUserMetrics);
app.use(metricsMiddleware.collectCourseMetrics);

// Cache middleware
// Do NOT cache authenticated GET responses here (they will be cached by cacheUserData below)
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

// Security middleware
app.use(helmet());

// CORS configuration (centralized)
app.use(corsMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: APP_CONSTANTS.SYSTEM.RATE_LIMIT_WINDOW_MS,
  max: APP_CONSTANTS.SYSTEM.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

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

// Cache invalidation for write operations
app.use(cacheMiddleware.invalidateCache([
  'user:*',
  'course:*',
  'enrollment:*'
]));

// Error handling middleware
app.use(metricsMiddleware.collectErrorMetrics);
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

export default app;
