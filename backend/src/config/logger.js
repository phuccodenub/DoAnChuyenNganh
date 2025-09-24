/**
 * Logger Configuration
 * Winston setup with different log levels and output formats
 */

const winston = require('winston');
const path = require('path');

// Log format configuration
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'lms-backend' },
  transports: [
    // File transports
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      handleExceptions: true,
      handleRejections: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      handleExceptions: true,
      handleRejections: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  exitOnError: false
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    handleExceptions: true,
    handleRejections: true
  }));
}

// Add production-specific transports
if (process.env.NODE_ENV === 'production') {
  // You can add external logging services here
  // Example: Loggly, Papertrail, CloudWatch, etc.
}

// Helper functions for different log levels
logger.logError = (message, error = null) => {
  if (error) {
    logger.error(message, { error: error.message, stack: error.stack });
  } else {
    logger.error(message);
  }
};

logger.logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

logger.logWarning = (message, meta = {}) => {
  logger.warn(message, meta);
};

logger.logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

// Socket.IO specific logging
logger.logSocket = (event, data = {}) => {
  logger.info(`Socket Event: ${event}`, {
    type: 'socket',
    event,
    ...data
  });
};

// API request logging
logger.logRequest = (method, path, statusCode, responseTime, userId = null) => {
  logger.info(`API Request: ${method} ${path}`, {
    type: 'api',
    method,
    path,
    statusCode,
    responseTime: `${responseTime}ms`,
    userId
  });
};

// Database query logging
logger.logQuery = (query, duration = null) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Database Query`, {
      type: 'database',
      query,
      duration: duration ? `${duration}ms` : null
    });
  }
};

module.exports = logger;