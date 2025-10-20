/**
 * Authorization Error Class
 * For authorization-related errors
 */

import { BaseError, BaseErrorOptions } from './base.error';
import { ErrorCode, HttpStatusCode, ErrorType, ErrorSeverity } from './error.constants';

export interface AuthorizationErrorOptions extends BaseErrorOptions {
  userId?: string;
  requiredRole?: string;
  requiredPermission?: string;
  userRole?: string;
  resource?: string;
  action?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuthorizationError extends BaseError {
  public readonly userId?: string;
  public readonly requiredRole?: string;
  public readonly requiredPermission?: string;
  public readonly userRole?: string;
  public readonly resource?: string;
  public readonly action?: string;
  public readonly ipAddress?: string;
  public readonly userAgent?: string;

  constructor(messageOrOptions: string | AuthorizationErrorOptions = {}) {
    // Handle both string message and options object
    const options: AuthorizationErrorOptions = typeof messageOrOptions === 'string' 
      ? { message: messageOrOptions } 
      : messageOrOptions;
    const {
      code = 'AUTH_INSUFFICIENT_PERMISSIONS',
      statusCode = 403,
      type = 'AUTHORIZATION',
      severity = 'MEDIUM',
      userId,
      requiredRole,
      requiredPermission,
      userRole,
      resource,
      action,
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
    this.requiredRole = requiredRole;
    this.requiredPermission = requiredPermission;
    this.userRole = userRole;
    this.resource = resource;
    this.action = action;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;

    // Add authorization-specific context
    if (userId) this.addContext('userId', userId);
    if (requiredRole) this.addContext('requiredRole', requiredRole);
    if (requiredPermission) this.addContext('requiredPermission', requiredPermission);
    if (userRole) this.addContext('userRole', userRole);
    if (resource) this.addContext('resource', resource);
    if (action) this.addContext('action', action);
    if (ipAddress) this.addContext('ipAddress', ipAddress);
    if (userAgent) this.addContext('userAgent', userAgent);
  }

  /**
   * Create insufficient permissions error
   */
  static insufficientPermissions(
    requiredPermission: string,
    userRole?: string,
    userId?: string
  ): AuthorizationError {
    return new AuthorizationError({
      code: 'AUTH_INSUFFICIENT_PERMISSIONS',
      message: `Insufficient permissions. Required: ${requiredPermission}`,
      statusCode: 403,
      type: 'AUTHORIZATION',
      severity: 'MEDIUM',
      requiredPermission,
      userRole,
      userId
    });
  }

  /**
   * Create insufficient role error
   */
  static insufficientRole(
    requiredRole: string,
    userRole?: string,
    userId?: string
  ): AuthorizationError {
    return new AuthorizationError({
      code: 'AUTH_INSUFFICIENT_PERMISSIONS',
      message: `Insufficient role. Required: ${requiredRole}`,
      statusCode: 403,
      type: 'AUTHORIZATION',
      severity: 'MEDIUM',
      requiredRole,
      userRole,
      userId
    });
  }

  /**
   * Create resource access denied error
   */
  static resourceAccessDenied(
    resource: string,
    action: string,
    userId?: string
  ): AuthorizationError {
    return new AuthorizationError({
      code: 'AUTH_INSUFFICIENT_PERMISSIONS',
      message: `Access denied to ${resource} for action: ${action}`,
      statusCode: 403,
      type: 'AUTHORIZATION',
      severity: 'MEDIUM',
      resource,
      action,
      userId
    });
  }

  /**
   * Create admin only error
   */
  static adminOnly(userId?: string): AuthorizationError {
    return new AuthorizationError({
      code: 'AUTH_INSUFFICIENT_PERMISSIONS',
      message: 'Admin access required',
      statusCode: 403,
      type: 'AUTHORIZATION',
      severity: 'MEDIUM',
      requiredRole: 'admin',
      userId
    });
  }

  /**
   * Create instructor only error
   */
  static instructorOnly(userId?: string): AuthorizationError {
    return new AuthorizationError({
      code: 'AUTH_INSUFFICIENT_PERMISSIONS',
      message: 'Instructor access required',
      statusCode: 403,
      type: 'AUTHORIZATION',
      severity: 'MEDIUM',
      requiredRole: 'instructor',
      userId
    });
  }

  /**
   * Create student only error
   */
  static studentOnly(userId?: string): AuthorizationError {
    return new AuthorizationError({
      code: 'AUTH_INSUFFICIENT_PERMISSIONS',
      message: 'Student access required',
      statusCode: 403,
      type: 'AUTHORIZATION',
      severity: 'MEDIUM',
      requiredRole: 'student',
      userId
    });
  }

  /**
   * Convert to JSON with authorization-specific fields
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      userId: this.userId,
      requiredRole: this.requiredRole,
      requiredPermission: this.requiredPermission,
      userRole: this.userRole,
      resource: this.resource,
      action: this.action,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent
    };
  }
}

