/**
 * Constants utility file
 * Caches regex patterns, charsets, and other constants for better performance
 */

// ===== REGEX PATTERNS =====
export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^(\+84|84|0)[1-9][0-9]{8}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  STUDENT_ID: /^[A-Z]{2}\d{6,8}$/,
  INSTRUCTOR_ID: /^[A-Z]{2}\d{4,6}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  VIETNAMESE_NAME: /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠưăâêôơ\s]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  MAC_ADDRESS: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
  CREDIT_CARD: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/,
  POSTAL_CODE: /^\d{5}(-\d{4})?$/,
  TIME_24H: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  DATETIME_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  JWT_TOKEN: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
  BASE64: /^[A-Za-z0-9+/]*={0,2}$/,
  HEX: /^[0-9A-Fa-f]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_WITH_SPACES: /^[a-zA-Z0-9\s]+$/,
  ALPHANUMERIC_WITH_DASHES: /^[a-zA-Z0-9-]+$/,
  ALPHANUMERIC_WITH_UNDERSCORES: /^[a-zA-Z0-9_]+$/,
  VIETNAMESE_TEXT: /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠưăâêôơ\s\d.,;:!?()-]+$/,
  PHONE_VN: /^(\+84|84|0)[1-9][0-9]{8}$/,
  PHONE_INTERNATIONAL: /^\+[1-9]\d{1,14}$/,
  PASSWORD_WEAK: /^.{6,}$/,
  PASSWORD_MEDIUM: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
} as const;

// ===== CHARACTER SETS =====
export const CHARSETS = {
  ALPHANUMERIC: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ALPHANUMERIC_UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  ALPHANUMERIC_LOWERCASE: 'abcdefghijklmnopqrstuvwxyz0123456789',
  ALPHABETIC: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  ALPHABETIC_UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ALPHABETIC_LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  NUMERIC: '0123456789',
  HEXADECIMAL: '0123456789ABCDEF',
  HEXADECIMAL_LOWERCASE: '0123456789abcdef',
  BASE64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  URL_SAFE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  PASSWORD_SAFE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
  VIETNAMESE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠưăâêôơ0123456789',
  SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  WHITESPACE: ' \t\n\r\f\v',
  PUNCTUATION: '.,;:!?()[]{}"\'`~@#$%^&*+=|\\/<>-_'
} as const;

// ===== COMMON VALUES =====
export const COMMON_VALUES = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_BIO_LENGTH: 10,
  MAX_BIO_LENGTH: 500,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  MIN_EMAIL_LENGTH: 5,
  MAX_EMAIL_LENGTH: 254,
  DEFAULT_TOKEN_LENGTH: 32,
  MAX_TOKEN_LENGTH: 64,
  DEFAULT_OTP_LENGTH: 6,
  MAX_OTP_LENGTH: 8,
  DEFAULT_UUID_LENGTH: 36,
  DEFAULT_SALT_ROUNDS: 12,
  MAX_SALT_ROUNDS: 15,
  MIN_SALT_ROUNDS: 8,
  DEFAULT_CACHE_TTL: 3600, // 1 hour
  MAX_CACHE_TTL: 86400, // 24 hours
  MIN_CACHE_TTL: 60, // 1 minute
  DEFAULT_RATE_LIMIT: 100,
  MAX_RATE_LIMIT: 1000,
  MIN_RATE_LIMIT: 10
} as const;

// ===== HTTP STATUS CODES =====
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

// ===== USER ROLES =====
export const USER_ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
} as const;

// ===== USER STATUSES =====
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
} as const;

// ===== TOKEN TYPES =====
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_resET',
  SESSION: 'session',
  API_KEY: 'api_key'
} as const;

// ===== DATE FORMATS =====
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DISPLAY_DATE: 'DD/MM/YYYY',
  DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm:ss',
  TIME_ONLY: 'HH:mm:ss',
  DATE_ONLY: 'DD/MM/YYYY',
  MONTH_YEAR: 'MM/YYYY',
  YEAR_ONLY: 'YYYY'
} as const;

// ===== FILE TYPES =====
export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  PRESENTATION: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  ARCHIVE: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  TEXT: ['text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript'],
  VIDEO: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'],
  AUDIO: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac']
} as const;

// ===== MIME TYPES =====
export const MIME_TYPES = {
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  SVG: 'image/svg+xml',
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT: 'application/vnd.ms-powerpoint',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ZIP: 'application/zip',
  RAR: 'application/x-rar-compressed',
  TXT: 'text/plain',
  CSV: 'text/csv',
  HTML: 'text/html',
  CSS: 'text/css',
  JS: 'text/javascript',
  JSON: 'application/json',
  XML: 'application/xml'
} as const;

// ===== ERROR MESSAGES =====
export const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone number format',
  INVALID_PASSWORD: 'Invalid password format',
  INVALID_NAME: 'Invalid name format',
  INVALID_URL: 'Invalid URL format',
  INVALID_UUID: 'Invalid UUID format',
  INVALID_DATE: 'Invalid date format',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size exceeds limit',
  REQUIRED_FIELD: 'This field is required',
  FIELD_TOO_SHORT: 'Field is too short',
  FIELD_TOO_LONG: 'Field is too long',
  FIELD_OUT_OF_RANGE: 'Field value is out of range',
  DUPLICATE_VALUE: 'Value already exists',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  INTERNAL_ERROR: 'Internal server error',
  NETWORK_ERROR: 'Network error',
  TIMEOUT_ERROR: 'Request timeout',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded'
} as const;

// ===== SUCCESS MESSAGES =====
export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  SAVED: 'Changes saved successfully',
  SENT: 'Message sent successfully',
  UPLOADED: 'File uploaded successfully',
  DOWNLOADED: 'File downloaded successfully',
  EXPORTED: 'Data exported successfully',
  IMPORTED: 'Data imported successfully',
  VALIDATED: 'Validation passed',
  AUTHENTICATED: 'Authentication successful',
  AUTHORIZED: 'Authorization successful',
  LOGGED_IN: 'Login successful',
  LOGGED_OUT: 'Logout successful',
  REGISTERED: 'Registration successful',
  VERIFIED: 'Verification successful',
  RESET: 'Password reset successful',
  CHANGED: 'Password changed successfully'
} as const;
