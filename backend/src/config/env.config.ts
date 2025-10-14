import 'dotenv-flow/config';

type Bool = boolean;

function toBool(value: string | undefined, defaultValue: Bool): Bool {
  if (value === undefined) return defaultValue;
  const v = value.toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

function toInt(value: string | undefined, defaultValue: number): number {
  const n = value ? parseInt(value, 10) : NaN;
  return Number.isFinite(n) ? n : defaultValue;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 3000),
  logLevel: process.env.LOG_LEVEL || 'info',

  databaseUrl: process.env.DATABASE_URL as string,
  redisUrl: process.env.REDIS_URL as string,

  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'lms-backend',
    audience: process.env.JWT_AUDIENCE || 'lms-frontend'
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  cors: {
    allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
      .split(',')
      .map(o => o.trim())
      .filter(Boolean),
    allowedMethods: (process.env.CORS_ALLOWED_METHODS || 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
      .split(',')
      .map(m => m.trim()),
    allowedHeaders: (process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization,X-Requested-With')
      .split(',')
      .map(h => h.trim()),
    allowCredentials: toBool(process.env.CORS_ALLOW_CREDENTIALS, true)
  },

  upload: {
    maxFileSize: toInt(process.env.MAX_FILE_SIZE, 10 * 1024 * 1024),
    path: process.env.UPLOAD_PATH || './uploads'
  },

  email: {
    host: process.env.MAIL_HOST || process.env.EMAIL_HOST || '',
    port: toInt(process.env.MAIL_PORT || process.env.EMAIL_PORT, 587),
    secure: toBool(process.env.MAIL_SECURE, false),
    user: process.env.MAIL_USER || process.env.EMAIL_USER || '',
    pass: process.env.MAIL_PASS || process.env.EMAIL_PASS || '',
    from: process.env.MAIL_FROM || process.env.EMAIL_FROM || 'LMS System <noreply@lms.com>'
  },

  rateLimit: {
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    maxRequests: toInt(process.env.RATE_LIMIT_MAX_REQUESTS, 100)
  },

  cacheTtl: {
    short: toInt(process.env.CACHE_TTL_SHORT, 300),
    medium: toInt(process.env.CACHE_TTL_MEDIUM, 1800),
    long: toInt(process.env.CACHE_TTL_LONG, 3600)
  },

  security: {
    bcryptRounds: toInt(process.env.BCRYPT_ROUNDS, 12),
    passwordMinLength: toInt(process.env.PASSWORD_MIN_LENGTH, 8),
    passwordMaxLength: toInt(process.env.PASSWORD_MAX_LENGTH, 128),
    sessionSecret: process.env.SESSION_SECRET || 'change-in-production',
    sessionMaxAge: toInt(process.env.SESSION_MAX_AGE, 86400000)
  },

  monitoring: {
    healthTimeout: toInt(process.env.HEALTH_CHECK_TIMEOUT, 5000),
    healthInterval: toInt(process.env.HEALTH_CHECK_INTERVAL, 30000),
    metricsEnabled: toBool(process.env.METRICS_ENABLED, true),
    metricsPort: toInt(process.env.METRICS_PORT, 9090)
  },

  api: {
    defaultVersion: process.env.DEFAULT_API_VERSION || 'v1.3.0',
    supportedVersions: (process.env.SUPPORTED_API_VERSIONS || 'v1.0.0,v1.1.0,v1.2.0,v2.0.0')
      .split(',')
      .map(v => v.trim())
  },

  dev: {
    debug: toBool(process.env.DEBUG, false),
    verboseLogging: toBool(process.env.VERBOSE_LOGGING, false),
    hotReload: toBool(process.env.HOT_RELOAD, true)
  }
};

export default env;


