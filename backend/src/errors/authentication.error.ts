/**
 * Authentication Error Class
 * For authentication-related errors
 */

import { BaseError, BaseErrorOptions } from './base.error';
import { ErrorCode, HttpStatusCode, ErrorType, ErrorSeverity, HTTP_STATUS_CODES } from './error.constants';

export interface AuthenticationErrorOptions extends BaseErrorOptions {
  userId?: string;
  email?: string;
  attemptCount?: number;
  lockoutDuration?: number;
  tokenType?: 'access' | 'refresh' | 'reset' | 'verification';
  ipAddress?: string;
  userAgent?: string;
}

export class AuthenticationError extends BaseError {
  public readonly userId?: string;
  public readonly email?: string;
  public readonly attemptCount?: number;
  public readonly lockoutDuration?: number;
  public readonly tokenType?: 'access' | 'refresh' | 'reset' | 'verification';
  public readonly ipAddress?: string;
  public readonly userAgent?: string;

  constructor(options: AuthenticationErrorOptions = {}) {
    const {
      code = 'AUTH_INVALID_CREDENTIALS',
      statusCode = 401,
      type = 'AUTHENTICATION',
      severity = 'MEDIUM',
      userId,
      email,
      attemptCount,
      lockoutDuration,
      tokenType,
      ipAddress,
      userAgent,
      ...baseOptions
    } = options;

    super({
      code,
      statusCode,
      type,
      severity,
      ...baseOptions
    });

    this.userId = userId;
    this.email = email;
    this.attemptCount = attemptCount;
    this.lockoutDuration = lockoutDuration;
    this.tokenType = tokenType;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;

    // Add authentication-specific context
    if (userId) this.addContext('userId', userId);
    if (email) this.addContext('email', email);
    if (attemptCount) this.addContext('attemptCount', attemptCount);
    if (lockoutDuration) this.addContext('lockoutDuration', lockoutDuration);
    if (tokenType) this.addContext('tokenType', tokenType);
    if (ipAddress) this.addContext('ipAddress', ipAddress);
    if (userAgent) this.addContext('userAgent', userAgent);
  }

  /**
   * Create invalid credentials error
   */
  static invalidCredentials(email?: string, attemptCount?: number): AuthenticationError {
    return new AuthenticationError({
      code: 'AUTH_INVALID_CREDENTIALS',
      message: 'Invalid email or password',
      statusCode: 401,
      type: 'AUTHENTICATION',
      severity: 'MEDIUM',
      email,
      attemptCount
    });
  }

  /**
   * Create token expired error
   */
  static tokenExpired(tokenType: 'access' | 'refresh' | 'reset' | 'verification' = 'access'): AuthenticationError {
    return new AuthenticationError({
      code: 'AUTH_TOKEN_EXPIRED',
      message: `${tokenType} token has expired`,
      statusCode: 401,
      type: 'AUTHENTICATION',
      severity: 'MEDIUM',
      tokenType
    });
  }

  /**
   * Create invalid token error
   */
  static invalidToken(tokenType: 'access' | 'refresh' | 'reset' | 'verification' = 'access'): AuthenticationError {
    return new AuthenticationError({
      code: 'AUTH_TOKEN_INVALID',
      message: `Invalid ${tokenType} token`,
      statusCode: 401,
      type: 'AUTHENTICATION',
      severity: 'MEDIUM',
      tokenType
    });
  }

  /**
   * Create missing token error
   */
  static missingToken(tokenType: 'access' | 'refresh' | 'reset' | 'verification' = 'access'): AuthenticationError {
    return new AuthenticationError({
      code: 'AUTH_TOKEN_MISSING',
      message: `${tokenType} token is required`,
      statusCode: 401,
      type: 'AUTHENTICATION',
      severity: 'MEDIUM',
      tokenType
    });
  }

  /**
   * Create account locked error
   */
  static accountLocked(email?: string, lockoutDuration?: number): AuthenticationError {
    return new AuthenticationError({
      code: 'AUTH_ACCOUNT_LOCKED',
      message: 'Account is locked due to multiple failed login attempts',
      statusCode: HTTP_STATUS_CODES.LOCKED,
      type: 'AUTHENTICATION',
      severity: 'HIGH',
      email,
      lockoutDuration
    });
  }

  /**
   * Create account suspended error
   */
  static accountSuspended(email?: string, userId?: string): AuthenticationError {
    return new AuthenticationError({
      code: 'AUTH_ACCOUNT_SUSPENDED',
      message: 'Account is suspended',
      statusCode: 403,
      type: 'AUTHENTICATION',
      severity: 'HIGH',
      email,
      userId
    });
  }

  /**
   * Create email not verified error
   */
  static emailNotVerified(email?: string): AuthenticationError {
    return new AuthenticationError({
      code: 'AUTH_EMAIL_NOT_VERIFIED',
      message: 'Email address is not verified',
      statusCode: 403,
      type: 'AUTHENTICATION',
      severity: 'MEDIUM',
      email
    });
  }

  /**
   * Create 2FA required error
   */
  static twoFactorRequired(userId?: string): AuthenticationError {
    return new AuthenticationError({
      code: 'AUTH_2FA_REQUIRED',
      message: 'Two-factor authentication is required',
      statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
      type: 'AUTHENTICATION',
      severity: 'MEDIUM',
      userId
    });
  }

  /**
   * Create invalid 2FA error
   */
  static invalidTwoFactor(userId?: string): AuthenticationError {
    return new AuthenticationError({
      code: 'AUTH_2FA_INVALID',
      message: 'Invalid two-factor authentication code',
      statusCode: 401,
      type: 'AUTHENTICATION',
      severity: 'MEDIUM',
      userId
    });
  }

  /**
   * Convert to JSON with authentication-specific fields
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      email: this.email,
      attemptCount: this.attemptCount,
      lockoutDuration: this.lockoutDuration,
      tokenType: this.tokenType,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent
    };
  }
}

