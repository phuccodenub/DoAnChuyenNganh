import winston from 'winston';
import path from 'path';
import { context, trace } from '@opentelemetry/api';

// Extend Winston Logger interface
interface CustomLogger {
  info: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
  debug: (message: string, meta?: any) => void;
  logError: (message: string, error?: Error) => void;
  logInfo: (message: string, meta?: any) => void;
  logWarning: (message: string, meta?: any) => void;
  logDebug: (message: string, meta?: any) => void;
}

// Logger utility functions
export interface LoggerOptions {
  level?: string;
  // Loosen types to avoid coupling to winston type namespace
  format?: any;
  transports?: any[];
  silent?: boolean;
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  metadata?: any;
}

// Get tracing context for correlation
function getTracingContext() {
  try {
    const span = trace.getActiveSpan();
    if (span) {
      const spanContext = span.spanContext();
      return {
        traceId: spanContext.traceId,
        spanId: spanContext.spanId,
        traceFlags: spanContext.traceFlags
      };
    }
  } catch (error) {
    // Ignore tracing errors
  }
  return {
    traceId: undefined,
    spanId: undefined,
    traceFlags: undefined
  };
}

// Log format configuration
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info: any) => {
    const tracingContext = getTracingContext();
    return JSON.stringify({
      ...info,
      traceId: tracingContext.traceId,
      spanId: tracingContext.spanId
    });
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }: any) => {
    const tracingContext = getTracingContext();
    const traceInfo = tracingContext.traceId ? ` traceId=${tracingContext.traceId} spanId=${tracingContext.spanId}` : '';
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }${traceInfo}`;
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
      filename: path.join(process.cwd(), 'src', 'logs', 'error.log'),
      level: 'error',
      handleExceptions: true,
      handleRejections: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'src', 'logs', 'combined.log'),
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

// Helper functions for different log levels
const customLogger: CustomLogger = logger as unknown as CustomLogger;

function attachCorrelation(meta: any = {}): any {
  try {
    const span = trace.getSpan(context.active());
    const spanContext = span?.spanContext();
    const traceId = spanContext?.traceId;
    const spanId = spanContext?.spanId;
    const enriched = { ...meta } as any;
    if (traceId) enriched.traceId = traceId;
    if (spanId) enriched.spanId = spanId;
    // requestId may be injected by upstream middleware into meta
    return enriched;
  } catch {
    return meta;
  }
}

customLogger.logError = (message: string, error?: Error) => {
  if (error) {
    logger.error(message, { error: error.message, stack: error.stack });
  } else {
    logger.error(message);
  }
};

customLogger.logInfo = (message: string, meta: any = {}) => {
  logger.info(message, attachCorrelation(meta));
};

customLogger.logWarning = (message: string, meta: any = {}) => {
  logger.warn(message, attachCorrelation(meta));
};

customLogger.logDebug = (message: string, meta: any = {}) => {
  logger.debug(message, attachCorrelation(meta));
};

// Export logger utilities
export const loggerUtils = {
  // Create logger instance
  createLogger(options: LoggerOptions = {}): any {
    const {
      level = 'info',
      format = winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports = [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ],
      silent = false
    } = options;

    return winston.createLogger({
      level,
      format,
      transports,
      silent
    });
  },

  // Format log message
  formatMessage(level: string, message: string, metadata?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = metadata ? ` ${JSON.stringify(attachCorrelation(metadata))}` : '';
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaStr}`;
  },

  // Parse log entry
  parseLogEntry(logLine: string): LogEntry | null {
    try {
      const match = logLine.match(/^\[([^\]]+)\] \[([^\]]+)\]: (.+)$/);
      if (!match) return null;

      const [, timestamp, level, message] = match;
      return {
        level: level.toLowerCase(),
        message,
        timestamp
      };
    } catch {
      return null;
    }
  },

  // Filter logs by level
  filterLogsByLevel(logs: LogEntry[], level: string): LogEntry[] {
    const levelPriority = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    const targetPriority = levelPriority[level as keyof typeof levelPriority] ?? 2;
    
    return logs.filter(log => {
      const logPriority = levelPriority[log.level as keyof typeof levelPriority] ?? 2;
      return logPriority <= targetPriority;
    });
  },

  // Mask sensitive data in logs
  maskSensitiveData(data: any): any {
    if (typeof data === 'string') {
      // Mask emails
      data = data.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
      
      // Mask phone numbers
      data = data.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
      
      // Mask credit card numbers
      data = data.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD]');
      
      // Mask SSN
      data = data.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
      
      return data;
    }

    if (typeof data === 'object' && data !== null) {
      const masked = { ...data };
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'];
      
      for (const key of Object.keys(masked)) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          masked[key] = '[MASKED]';
        } else if (typeof masked[key] === 'object') {
          masked[key] = this.maskSensitiveData(masked[key]);
        }
      }
      
      return masked;
    }

    return data;
  }
};

export default customLogger;
