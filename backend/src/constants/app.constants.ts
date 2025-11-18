// Application constants
export const APP_CONSTANTS = {
  // Application info
  NAME: 'LMS Backend',
  VERSION: '1.0.0',
  DESCRIPTION: 'Learning Management System Backend API',
  
  // Environment
  ENVIRONMENT: {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
    TEST: 'test'
  } as const,
  
  // API versions
  API_VERSION: {
    V1: 'v1'
  } as const,
  
  // System constants
  SYSTEM: {
    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    
    // File upload
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    
    // Rate limiting
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,
    
    // Cache TTL
    CACHE_TTL: {
      SHORT: 5 * 60, // 5 minutes
      MEDIUM: 30 * 60, // 30 minutes
      LONG: 60 * 60, // 1 hour
      VERY_LONG: 24 * 60 * 60 // 24 hours
    } as const
  } as const,
  
  // Security
  SECURITY: {
    BCRYPT_ROUNDS: 12,
    JWT_ALGORITHM: 'HS256',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_TOKEN_TIMEOUT: 7 * 24 * 60 * 60 * 1000 // 7 days
  } as const,
  
  // Logging
  LOGGING: {
    LEVELS: {
      ERROR: 'error',
      WARN: 'warn',
      INFO: 'info',
      DEBUG: 'debug'
    } as const,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_FILES: 5
  } as const,
  
  // CORS (read from centralized CORS_* envs with sensible defaults)
  CORS: {
    ALLOWED_ORIGINS: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5174,http://localhost:3001')
      .split(',')
      .map((o: string) => o.trim())
      .filter(Boolean),
    ALLOWED_METHODS: (process.env.CORS_ALLOWED_METHODS || 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
      .split(',')
      .map((m: string) => m.trim()) as string[],
    ALLOWED_HEADERS: (process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization,X-Requested-With')
      .split(',')
      .map((h: string) => h.trim()) as string[]
  } as const
} as const;

