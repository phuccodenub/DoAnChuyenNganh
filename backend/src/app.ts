import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import { healthRoutes, metricsRoutes, metricsMiddleware } from './monitoring';

// Import caching
import { cacheMiddleware } from './cache';

const app = express();

// Request ID middleware
app.use(requestIdMiddleware);

// Logger middleware
app.use(loggerMiddleware);

// Metrics middleware
app.use(metricsMiddleware.collectHttpMetrics);
app.use(metricsMiddleware.collectMemoryMetrics);
app.use(metricsMiddleware.collectCpuMetrics);
app.use(metricsMiddleware.collectUptimeMetrics);
app.use(metricsMiddleware.collectAuthMetrics);
app.use(metricsMiddleware.collectUserMetrics);
app.use(metricsMiddleware.collectCourseMetrics);

// Cache middleware
app.use(cacheMiddleware.cacheGet({ ttl: 300 })); // Cache GET requests for 5 minutes
app.use(cacheMiddleware.cacheUserData({ ttl: 600 })); // Cache user data for 10 minutes

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: APP_CONSTANTS.CORS.ALLOWED_ORIGINS,
  methods: APP_CONSTANTS.CORS.ALLOWED_METHODS,
  allowedHeaders: APP_CONSTANTS.CORS.ALLOWED_HEADERS,
  credentials: true
}));

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
