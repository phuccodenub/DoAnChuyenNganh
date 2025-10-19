/**
 * Type Utility Functions
 * Các hàm tiện ích để type checking và type guards
 */

// Basic type guards
export const typeUtils = {
  /**
   * Check if value is a string
   */
  isString: (value: unknown): value is string => {
    return typeof value === 'string';
  },

  /**
   * Check if value is a number
   */
  isNumber: (value: unknown): value is number => {
    return typeof value === 'number' && !isNaN(value);
  },

  /**
   * Check if value is boolean
   */
  isBoolean: (value: unknown): value is boolean => {
    return typeof value === 'boolean';
  },

  /**
   * Check if value is null
   */
  isNull: (value: unknown): value is null => {
    return value === null;
  },

  /**
   * Check if value is undefined
   */
  isUndefined: (value: unknown): value is undefined => {
    return value === undefined;
  },

  /**
   * Check if value is null or undefined
   */
  isNullish: (value: unknown): value is null | undefined => {
    return value === null || value === undefined;
  },

  /**
   * Check if value is an object (not null, not array)
   */
  isObject: (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  },

  /**
   * Check if value is an array
   */
  isArray: (value: unknown): value is unknown[] => {
    return Array.isArray(value);
  },

  /**
   * Check if value is a function
   */
  isFunction: (value: unknown): value is Function => {
    return typeof value === 'function';
  },

  /**
   * Check if value is a Date object
   */
  isDate: (value: unknown): value is Date => {
    return value instanceof Date && !isNaN(value.getTime());
  },

  /**
   * Check if value is a valid date string
   */
  isDateString: (value: unknown): value is string => {
    if (!typeUtils.isString(value)) return false;
    const date = new Date(value);
    return typeUtils.isDate(date);
  },

  /**
   * Check if object has a specific property
   */
  hasProperty: <T extends string>(
    obj: unknown,
    prop: T
  ): obj is Record<T, unknown> => {
    return typeUtils.isObject(obj) && prop in obj;
  },

  /**
   * Check if object has multiple properties
   */
  hasProperties: <T extends readonly string[]>(
    obj: unknown,
    props: T
  ): obj is Record<T[number], unknown> => {
    if (!typeUtils.isObject(obj)) return false;
    return props.every(prop => prop in obj);
  },

  /**
   * Check if value is a non-empty string
   */
  isNonEmptyString: (value: unknown): value is string => {
    return typeUtils.isString(value) && value.trim().length > 0;
  },

  /**
   * Check if value is a positive number
   */
  isPositiveNumber: (value: unknown): value is number => {
    return typeUtils.isNumber(value) && value > 0;
  },

  /**
   * Check if value is a non-negative number (>= 0)
   */
  isNonNegativeNumber: (value: unknown): value is number => {
    return typeUtils.isNumber(value) && value >= 0;
  },

  /**
   * Check if value is an integer
   */
  isInteger: (value: unknown): value is number => {
    return typeUtils.isNumber(value) && Number.isInteger(value);
  },

  /**
   * Check if value is a valid email format
   */
  isEmail: (value: unknown): value is string => {
    if (!typeUtils.isString(value)) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Check if value is a valid URL
   */
  isUrl: (value: unknown): value is string => {
    if (!typeUtils.isString(value)) return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if value is a valid UUID
   */
  isUUID: (value: unknown): value is string => {
    if (!typeUtils.isString(value)) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },

  /**
   * Type guard for Error objects
   */
  isError: (value: unknown): value is Error => {
    return value instanceof Error;
  },

  /**
   * Check if value is a plain object (created by {} or new Object())
   */
  isPlainObject: (value: unknown): value is Record<string, unknown> => {
    if (!typeUtils.isObject(value)) return false;
    
    // Objects created by the Object constructor
    if (Object.prototype.toString.call(value) !== '[object Object]') {
      return false;
    }

    // Objects with no prototype (created with Object.create(null))
    if (Object.getPrototypeOf(value) === null) {
      return true;
    }

    // Objects whose prototype is Object.prototype
    let proto = value;
    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }

    return Object.getPrototypeOf(value) === proto;
  },

  /**
   * Check if array is non-empty
   */
  isNonEmptyArray: <T>(value: unknown): value is [T, ...T[]] => {
    return typeUtils.isArray(value) && value.length > 0;
  },

  /**
   * Check if object is empty
   */
  isEmpty: (value: unknown): boolean => {
    if (typeUtils.isNullish(value)) return true;
    if (typeUtils.isString(value)) return value.length === 0;
    if (typeUtils.isArray(value)) return value.length === 0;
    if (typeUtils.isObject(value)) return Object.keys(value).length === 0;
    return false;
  },

  /**
   * Check if object is not empty
   */
  isNotEmpty: (value: unknown): boolean => {
    return !typeUtils.isEmpty(value);
  },

  /**
   * Safe JSON parse with type guard
   */
  safeJsonParse: <T = unknown>(value: string): T | null => {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  /**
   * Assert that value is of specific type (throws if not)
   */
  assert: <T>(
    value: unknown,
    predicate: (value: unknown) => value is T,
    message?: string
  ): asserts value is T => {
    if (!predicate(value)) {
      throw new Error(message || 'Type assertion failed');
    }
  },

  /**
   * Cast value to specific type with runtime check
   */
  safeCast: <T>(
    value: unknown,
    predicate: (value: unknown) => value is T,
    defaultValue: T
  ): T => {
    return predicate(value) ? value : defaultValue;
  }
};

// Specific type guards for application types
export const appTypeGuards = {
  /**
   * Check if value is a valid user role
   */
  isUserRole: (value: unknown): value is 'student' | 'instructor' | 'admin' | 'super_admin' => {
    return typeUtils.isString(value) && 
           ['student', 'instructor', 'admin', 'super_admin'].includes(value);
  },

  /**
   * Check if value is a valid user status
   */
  isUserStatus: (value: unknown): value is 'active' | 'inactive' | 'suspended' | 'pending' => {
    return typeUtils.isString(value) && 
           ['active', 'inactive', 'suspended', 'pending'].includes(value);
  },

  /**
   * Check if value is a valid course status
   */
  isCourseStatus: (value: unknown): value is 'draft' | 'published' | 'archived' => {
    return typeUtils.isString(value) && 
           ['draft', 'published', 'archived'].includes(value);
  },

  /**
   * Check if object has user-like properties
   */
  isUserLike: (value: unknown): value is { id: string; email: string; role: string } => {
    return typeUtils.isObject(value) &&
           typeUtils.hasProperties(value, ['id', 'email', 'role']) &&
           typeUtils.isString(value.id) &&
           typeUtils.isEmail(value.email) &&
           typeUtils.isString(value.role);
  },

  /**
   * Check if object is a valid pagination params
   */
  isPaginationParams: (value: unknown): value is { page: number; limit: number } => {
    return typeUtils.isObject(value) &&
           typeUtils.hasProperties(value, ['page', 'limit']) &&
           typeUtils.isPositiveNumber(value.page) &&
           typeUtils.isPositiveNumber(value.limit);
  },

  /**
   * Check if object is a valid sort params
   */
  isSortParams: (value: unknown): value is { field: string; order: 'ASC' | 'DESC' } => {
    return typeUtils.isObject(value) &&
           typeUtils.hasProperties(value, ['field', 'order']) &&
           typeUtils.isString(value.field) &&
           (value.order === 'ASC' || value.order === 'DESC');
  }
};

// Export all utilities
export default {
  ...typeUtils,
  ...appTypeGuards
};