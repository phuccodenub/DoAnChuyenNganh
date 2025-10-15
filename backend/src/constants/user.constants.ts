// User related constants
export const USER_CONSTANTS = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  
  // Name requirements
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  
  // Email requirements
  EMAIL_MAX_LENGTH: 255,
  
  // Profile requirements
  BIO_MAX_LENGTH: 500,
  AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Account status
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING: 'pending'
  } as const,
  
  // Verification status
  VERIFICATION_STATUS: {
    VERIFIED: 'verified',
    UNVERIFIED: 'unverified',
    PENDING: 'pending'
  } as const
} as const;

// Course related constants
export const COURSE_CONSTANTS = {
  // Course requirements
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
  
  // Course status
  STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
    SUSPENDED: 'suspended'
  } as const,
  
  // Course difficulty
  DIFFICULTY: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced'
  } as const,
  
  // Course type
  TYPE: {
    FREE: 'free',
    PAID: 'paid',
    SUBSCRIPTION: 'subscription'
  } as const
} as const;

// System constants
export const SYSTEM_CONSTANTS = {
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
} as const;

