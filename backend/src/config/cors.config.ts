import cors, { CorsOptions } from 'cors';
import env from './env.config';
import logger from '../utils/logger.util';

// Log allowed origins on startup
logger.info('CORS allowed origins:', env.cors.allowedOrigins);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin) - e.g., mobile apps, Postman
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Check if origin is in whitelist
    if (env.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      logger.warn(`CORS: Allowing localhost origin in dev mode: ${origin}`);
      callback(null, true);
      return;
    }
    
    // Log and reject unknown origins
    logger.warn(`CORS: Rejecting origin: ${origin}`);
    callback(null, false); // Don't throw error, just reject
  },
  methods: env.cors.allowedMethods,
  allowedHeaders: [...env.cors.allowedHeaders, 'Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: env.cors.allowCredentials,
  optionsSuccessStatus: 204,
  preflightContinue: false,
  maxAge: 86400 // 24 hours
};

export const corsMiddleware = cors(corsOptions);
export const getCorsOptions = (): CorsOptions => corsOptions;


