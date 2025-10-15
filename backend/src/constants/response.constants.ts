// HTTP Response constants
export const RESPONSE_CONSTANTS = {
  // Success messages
  SUCCESS: {
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    PASSWORD_RESET: 'Password reset successfully',
    EMAIL_SENT: 'Email sent successfully',
    DATA_RETRIEVED: 'Data retrieved successfully',
    OPERATION_SUCCESS: 'Operation completed successfully'
  } as const,

  // Common messages
  MESSAGE: {
    SUCCESS: 'Request successful',
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    PASSWORD_CHANGED: 'Password changed successfully',
    EMAIL_VERIFIED: 'Email verified successfully'
  } as const,
  
  // Error messages
  ERROR: {
    // Authentication errors
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    ACCESS_DENIED: 'Access denied',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Forbidden',
    NOT_FOUND: 'Resource not found',
    INVALID_TOKEN: 'Invalid or expired token',
    TOKEN_REVOKED: 'Token has been revoked',
    ACCOUNT_INACTIVE: 'Account is inactive',
    INVALID_PASSWORD: 'Invalid password',
    
    // User errors
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User already exists',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    EMAIL_EXISTS: 'Email already exists',
    INVALID_EMAIL_FORMAT: 'Invalid email format',
    WEAK_PASSWORD: 'Password is too weak',
    
    // Validation errors
    VALIDATION_ERROR: 'Validation error',
    REQUIRED_FIELD: 'This field is required',
    INVALID_FORMAT: 'Invalid format',
    FIELD_TOO_LONG: 'Field is too long',
    FIELD_TOO_SHORT: 'Field is too short',
    
    // Server errors
    INTERNAL_SERVER_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database error',
    SERVICE_UNAVAILABLE: 'Service unavailable',
    NETWORK_ERROR: 'Network error',
    
    // File upload errors
    FILE_TOO_LARGE: 'File is too large',
    INVALID_FILE_TYPE: 'Invalid file type',
    UPLOAD_FAILED: 'File upload failed'
  } as const,
  
  // HTTP Status codes
  STATUS_CODE: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  } as const
} as const;

