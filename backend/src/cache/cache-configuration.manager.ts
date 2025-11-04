/**
 * Cache Configuration Manager
 * Manages cache TTL and skipCache policies based on user roles and context
 */

import logger from '../utils/logger.util';
import { CacheStrategy } from './strategies/cache.strategy';

export interface CachePolicy {
  ttl: number;
  skipCache: boolean;
  maxAge: number;
  staleWhileRevalidate: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface UserRole {
  role: string;
  permissions: string[];
  cacheLevel: 'full' | 'limited' | 'minimal';
}

export interface CacheContext {
  endpoint: string;
  method: string;
  userRole?: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  requestHeaders: Record<string, string>;
  queryParams: Record<string, any>;
}

export interface CacheRule {
  pattern: string;
  method?: string;
  userRole?: string;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  policy: CachePolicy;
  description: string;
}

export class CacheConfigurationManager {
  private rules: CacheRule[] = [];
  private defaultPolicy: CachePolicy;
  private userRoles: Map<string, UserRole> = new Map();

  constructor(defaultPolicy?: CachePolicy) {
    this.defaultPolicy = defaultPolicy || {
      ttl: 3600, // 1 hour
      skipCache: false,
      maxAge: 300, // 5 minutes
      staleWhileRevalidate: 60, // 1 minute
      tags: ['default'],
      priority: 'medium'
    };

    this.initializeDefaultRules();
    this.initializeUserRoles();
  }

  /**
   * Initialize default cache rules
   */
  private initializeDefaultRules(): void {
    // Public endpoints - cache aggressively
    this.addRule({
      pattern: '/api/v1.3.0/courses',
      method: 'GET',
      policy: {
        ttl: 1800, // 30 minutes
        skipCache: false,
        maxAge: 300,
        staleWhileRevalidate: 120,
        tags: ['courses', 'public'],
        priority: 'high'
      },
      description: 'Public course listings'
    });

    this.addRule({
      pattern: '/api/v1.3.0/courses/:id',
      method: 'GET',
      policy: {
        ttl: 3600, // 1 hour
        skipCache: false,
        maxAge: 600,
        staleWhileRevalidate: 300,
        tags: ['courses', 'public'],
        priority: 'high'
      },
      description: 'Individual course details'
    });

    // User-specific endpoints - cache with user context
    this.addRule({
      pattern: '/api/v1.3.0/users/profile',
      method: 'GET',
      isAuthenticated: true,
      policy: {
        ttl: 900, // 15 minutes
        skipCache: false,
        maxAge: 300,
        staleWhileRevalidate: 60,
        tags: ['users', 'profile'],
        priority: 'medium'
      },
      description: 'User profile data'
    });

    this.addRule({
      pattern: '/api/v1.3.0/enrollments',
      method: 'GET',
      isAuthenticated: true,
      policy: {
        ttl: 600, // 10 minutes
        skipCache: false,
        maxAge: 180,
        staleWhileRevalidate: 30,
        tags: ['enrollments', 'user-specific'],
        priority: 'medium'
      },
      description: 'User enrollments'
    });

    // Admin endpoints - minimal caching
    this.addRule({
      pattern: '/api/v1.3.0/admin/*',
      isAdmin: true,
      policy: {
        ttl: 60, // 1 minute
        skipCache: false,
        maxAge: 30,
        staleWhileRevalidate: 10,
        tags: ['admin'],
        priority: 'low'
      },
      description: 'Admin endpoints'
    });

    // Write operations - skip cache
    this.addRule({
      pattern: '*',
      method: 'POST',
      policy: {
        ttl: 0,
        skipCache: true,
        maxAge: 0,
        staleWhileRevalidate: 0,
        tags: ['write'],
        priority: 'low'
      },
      description: 'All POST operations'
    });

    this.addRule({
      pattern: '*',
      method: 'PUT',
      policy: {
        ttl: 0,
        skipCache: true,
        maxAge: 0,
        staleWhileRevalidate: 0,
        tags: ['write'],
        priority: 'low'
      },
      description: 'All PUT operations'
    });

    this.addRule({
      pattern: '*',
      method: 'DELETE',
      policy: {
        ttl: 0,
        skipCache: true,
        maxAge: 0,
        staleWhileRevalidate: 0,
        tags: ['write'],
        priority: 'low'
      },
      description: 'All DELETE operations'
    });

    // Authentication endpoints - no cache
    this.addRule({
      pattern: '/api/v1.3.0/auth/*',
      policy: {
        ttl: 0,
        skipCache: true,
        maxAge: 0,
        staleWhileRevalidate: 0,
        tags: ['auth'],
        priority: 'low'
      },
      description: 'Authentication endpoints'
    });

    // Health and metrics - short cache
    this.addRule({
      pattern: '/health*',
      policy: {
        ttl: 30, // 30 seconds
        skipCache: false,
        maxAge: 15,
        staleWhileRevalidate: 5,
        tags: ['health'],
        priority: 'low'
      },
      description: 'Health check endpoints'
    });

    this.addRule({
      pattern: '/metrics*',
      policy: {
        ttl: 60, // 1 minute
        skipCache: false,
        maxAge: 30,
        staleWhileRevalidate: 10,
        tags: ['metrics'],
        priority: 'low'
      },
      description: 'Metrics endpoints'
    });
  }

  /**
   * Initialize user roles
   */
  private initializeUserRoles(): void {
    this.userRoles.set('admin', {
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin'],
      cacheLevel: 'minimal'
    });

    this.userRoles.set('instructor', {
      role: 'instructor',
      permissions: ['read', 'write'],
      cacheLevel: 'limited'
    });

    this.userRoles.set('student', {
      role: 'student',
      permissions: ['read'],
      cacheLevel: 'full'
    });

    this.userRoles.set('guest', {
      role: 'guest',
      permissions: ['read'],
      cacheLevel: 'full'
    });
  }

  /**
   * Add a cache rule
   */
  public addRule(rule: CacheRule): void {
    this.rules.push(rule);
    logger.info('Cache rule added', { pattern: rule.pattern, description: rule.description });
  }

  /**
   * Remove a cache rule
   */
  public removeRule(pattern: string, method?: string): void {
    this.rules = this.rules.filter(rule => 
      !(rule.pattern === pattern && (!method || rule.method === method))
    );
    logger.info('Cache rule removed', { pattern, method });
  }

  /**
   * Get cache policy for a given context
   */
  public getCachePolicy(context: CacheContext): CachePolicy {
    // Find matching rule
    const matchingRule = this.findMatchingRule(context);
    
    if (matchingRule) {
      // Apply user role modifications
      const policy = this.applyUserRoleModifications(matchingRule.policy, context.userRole);
      
      logger.debug('Cache policy applied', {
        endpoint: context.endpoint,
        method: context.method,
        userRole: context.userRole?.role,
        ttl: policy.ttl,
        skipCache: policy.skipCache
      });
      
      return policy;
    }

    // Return default policy with user role modifications
    return this.applyUserRoleModifications(this.defaultPolicy, context.userRole);
  }

  /**
   * Find matching rule for context
   */
  private findMatchingRule(context: CacheContext): CacheRule | null {
    // Sort rules by specificity (more specific rules first)
    const sortedRules = [...this.rules].sort((a, b) => {
      const aSpecificity = this.calculateRuleSpecificity(a);
      const bSpecificity = this.calculateRuleSpecificity(b);
      return bSpecificity - aSpecificity;
    });

    for (const rule of sortedRules) {
      if (this.matchesRule(rule, context)) {
        return rule;
      }
    }

    return null;
  }

  /**
   * Calculate rule specificity score
   */
  private calculateRuleSpecificity(rule: CacheRule): number {
    let score = 0;
    
    // Pattern specificity
    if (rule.pattern.includes(':')) score += 10; // Has parameters
    if (rule.pattern.endsWith('*')) score += 5; // Wildcard
    if (rule.pattern === '*') score += 1; // Catch-all
    
    // Method specificity
    if (rule.method) score += 20;
    
    // User role specificity
    if (rule.userRole) score += 15;
    
    // Authentication specificity
    if (rule.isAuthenticated !== undefined) score += 10;
    
    // Admin specificity
    if (rule.isAdmin !== undefined) score += 15;
    
    return score;
  }

  /**
   * Check if context matches rule
   */
  private matchesRule(rule: CacheRule, context: CacheContext): boolean {
    // Check pattern match
    if (!this.matchesPattern(rule.pattern, context.endpoint)) {
      return false;
    }

    // Check method match
    if (rule.method && rule.method !== context.method) {
      return false;
    }

    // Check user role match
    if (rule.userRole && context.userRole?.role !== rule.userRole) {
      return false;
    }

    // Check authentication match
    if (rule.isAuthenticated !== undefined && rule.isAuthenticated !== context.isAuthenticated) {
      return false;
    }

    // Check admin match
    if (rule.isAdmin !== undefined && rule.isAdmin !== context.isAdmin) {
      return false;
    }

    return true;
  }

  /**
   * Check if endpoint matches pattern
   */
  private matchesPattern(pattern: string, endpoint: string): boolean {
    if (pattern === '*') return true;
    
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/:\w+/g, '[^/]+');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(endpoint);
  }

  /**
   * Apply user role modifications to policy
   */
  private applyUserRoleModifications(policy: CachePolicy, userRole?: UserRole): CachePolicy {
    if (!userRole) {
      return policy;
    }

    const modifiedPolicy = { ...policy };

    // Adjust TTL based on user role
    switch (userRole.cacheLevel) {
      case 'minimal':
        modifiedPolicy.ttl = Math.min(policy.ttl, 300); // Max 5 minutes
        modifiedPolicy.maxAge = Math.min(policy.maxAge, 60); // Max 1 minute
        break;
      case 'limited':
        modifiedPolicy.ttl = Math.min(policy.ttl, 1800); // Max 30 minutes
        modifiedPolicy.maxAge = Math.min(policy.maxAge, 300); // Max 5 minutes
        break;
      case 'full':
        // Keep original TTL
        break;
    }

    // Add user role to tags
    modifiedPolicy.tags = [...policy.tags, `role:${userRole.role}`];

    return modifiedPolicy;
  }

  /**
   * Get cache key with user context
   */
  public buildCacheKey(baseKey: string, context: CacheContext): string {
    const parts = [baseKey];

    // Add user context for user-specific data
    if (context.isAuthenticated && context.userRole) {
      parts.push(`user:${context.userRole.role}`);
      
      // Add user ID if available in headers
      const userId = context.requestHeaders['x-user-id'];
      if (userId) {
        parts.push(`id:${userId}`);
      }
    }

    // Add query parameters for GET requests
    if (context.method === 'GET' && Object.keys(context.queryParams).length > 0) {
      const sortedParams = Object.keys(context.queryParams)
        .sort()
        .map(key => `${key}=${context.queryParams[key]}`)
        .join('&');
      parts.push(`params:${sortedParams}`);
    }

    return parts.join(':');
  }

  /**
   * Check if cache should be skipped
   */
  public shouldSkipCache(context: CacheContext): boolean {
    const policy = this.getCachePolicy(context);
    return policy.skipCache;
  }

  /**
   * Get cache TTL for context
   */
  public getCacheTTL(context: CacheContext): number {
    const policy = this.getCachePolicy(context);
    return policy.ttl;
  }

  /**
   * Get cache tags for context
   */
  public getCacheTags(context: CacheContext): string[] {
    const policy = this.getCachePolicy(context);
    return policy.tags;
  }

  /**
   * Add user role
   */
  public addUserRole(role: UserRole): void {
    this.userRoles.set(role.role, role);
    logger.info('User role added', { role: role.role, cacheLevel: role.cacheLevel });
  }

  /**
   * Get all cache rules
   */
  public getAllRules(): CacheRule[] {
    return [...this.rules];
  }

  /**
   * Get user role
   */
  public getUserRole(roleName: string): UserRole | undefined {
    return this.userRoles.get(roleName);
  }

  /**
   * Update default policy
   */
  public updateDefaultPolicy(policy: Partial<CachePolicy>): void {
    this.defaultPolicy = { ...this.defaultPolicy, ...policy };
    logger.info('Default cache policy updated', this.defaultPolicy);
  }

  /**
   * Clear all rules
   */
  public clearRules(): void {
    this.rules = [];
    logger.info('All cache rules cleared');
  }

  /**
   * Export configuration
   */
  public exportConfiguration(): {
    rules: CacheRule[];
    defaultPolicy: CachePolicy;
    userRoles: UserRole[];
  } {
    return {
      rules: this.rules,
      defaultPolicy: this.defaultPolicy,
      userRoles: Array.from(this.userRoles.values())
    };
  }

  /**
   * Import configuration
   */
  public importConfiguration(config: {
    rules: CacheRule[];
    defaultPolicy: CachePolicy;
    userRoles: UserRole[];
  }): void {
    this.rules = config.rules;
    this.defaultPolicy = config.defaultPolicy;
    
    this.userRoles.clear();
    for (const role of config.userRoles) {
      this.userRoles.set(role.role, role);
    }
    
    logger.info('Cache configuration imported', {
      rulesCount: this.rules.length,
      userRolesCount: this.userRoles.size
    });
  }
}
