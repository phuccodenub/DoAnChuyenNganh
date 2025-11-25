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

function toList(value: string | undefined, defaultValue: string[] = []): string[] {
  if (!value) return defaultValue;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
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
    allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5174,http://localhost:3001')
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
  },

  // ============================================
  // Livestream Configuration
  // ============================================
  livestream: {
    // HLS Base URL - URL để truy cập HLS streams
    // Format: http://localhost:8080/hls hoặc https://yourdomain.com/hls
    hlsBaseUrl: process.env.HLS_BASE_URL || 'http://localhost:8080/hls',
    
    // RTMP Server URL - URL để OBS connect
    // Format: rtmp://localhost:1935/live hoặc rtmp://yourdomain.com/live
    rtmpServerUrl: process.env.RTMP_SERVER_URL || 'rtmp://127.0.0.1/live',
    
    // RTMP Control URL - URL để control RTMP streams (drop publisher, etc.)
    // Format: http://localhost:8080/control
    // Note: Yêu cầu Nginx-RTMP control module được enable
    rtmpControlUrl: process.env.RTMP_CONTROL_URL || 'http://localhost:8080/control',
    
    // Stream key prefix - prefix cho stream keys (ví dụ: "LS-")
    streamKeyPrefix: process.env.STREAM_KEY_PREFIX || 'LS-',
    
    // Stream key length - độ dài stream key (không tính prefix)
    streamKeyLength: toInt(process.env.STREAM_KEY_LENGTH, 24),

    // WebRTC ICE servers (STUN/TURN) - used when ingest_type = webrtc
    webrtc: {
      stunServers: toList(process.env.WEBRTC_STUN_SERVERS, [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
      ]),
      turn: {
        urls: toList(process.env.WEBRTC_TURN_URLS),
        username: process.env.WEBRTC_TURN_USERNAME || process.env.TURN_SERVER_USERNAME,
        credential: process.env.WEBRTC_TURN_PASSWORD || process.env.WEBRTC_TURN_CREDENTIAL || process.env.TURN_SERVER_PASSWORD,
      },
    },
  }
};

export default env;


