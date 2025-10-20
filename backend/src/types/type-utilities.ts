/**
 * TYPE UTILITIES FOR REMOVING 'as any'
 * Central utilities để thay thế việc sử dụng 'as any' trong toàn bộ dự án
 */

// ===================================
// SAFE TYPE CASTING
// ===================================

/**
 * Type-safe alternative to 'as any' for unknown objects
 */
export type SafeAny = unknown;

/**
 * Type-safe casting with runtime validation
 */
export function safeCast<T>(value: unknown, validator?: (val: unknown) => val is T): T | null {
  if (validator && !validator(value)) {
    return null;
  }
  return value as T;
}

/**
 * Safe object property access thay thế obj.prop khi không chắc type
 */
export function safeGet<T extends object, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue?: T[K]
): T[K] | undefined {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }
  return obj[key] ?? defaultValue;
}

/**
 * Safe nested property access: obj.a.b.c
 */
export function safeGetNested<T>(
  obj: unknown,
  path: string,
  defaultValue?: T
): T | undefined {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }
  
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object' || !(key in current)) {
      return defaultValue;
    }
    current = (current as Record<string, unknown>)[key];
  }
  
  return current as T;
}

// ===================================
// ERROR HANDLING UTILITIES
// ===================================

/**
 * Type-safe error property access
 */
export function getErrorProperty<T = unknown>(
  error: unknown,
  property: string,
  defaultValue?: T
): T | undefined {
  if (!error || typeof error !== 'object') {
    return defaultValue;
  }
  
  const errorObj = error as Record<string, unknown>;
  return (errorObj[property] as T) ?? defaultValue;
}

/**
 * Extract error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  
  // Try common error message properties
  const messageProps = ['message', 'msg', 'error', 'detail'];
  for (const prop of messageProps) {
    const msg = getErrorProperty<string>(error, prop);
    if (msg && typeof msg === 'string') {
      return msg;
    }
  }
  
  return 'Unknown error';
}

/**
 * Extract HTTP status code from error
 */
export function getErrorStatusCode(error: unknown): number {
  const statusCode = getErrorProperty<number>(error, 'statusCode') ||
                    getErrorProperty<number>(error, 'status') ||
                    getErrorProperty<number>(error, 'code');
  
  if (typeof statusCode === 'number' && statusCode >= 100 && statusCode < 600) {
    return statusCode;
  }
  
  return 500; // Default internal server error
}

// ===================================
// REQUEST/RESPONSE UTILITIES
// ===================================

/**
 * Safe Request property access
 */
export function getRequestProperty<T = unknown>(
  req: unknown,
  property: string,
  defaultValue?: T
): T | undefined {
  if (!req || typeof req !== 'object') {
    return defaultValue;
  }
  
  const request = req as Record<string, unknown>;
  return (request[property] as T) ?? defaultValue;
}

/**
 * Get user from authenticated request
 */
export function getRequestUser(req: unknown): unknown | null {
  return getRequestProperty(req, 'user', null);
}

/**
 * Get request ID for tracing
 */
export function getRequestId(req: unknown): string | undefined {
  return getRequestProperty<string>(req, 'requestId');
}

// ===================================
// ARRAY/OBJECT UTILITIES
// ===================================

/**
 * Type-safe array check and access
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Safe array element access
 */
export function safeArrayAccess<T>(
  arr: unknown,
  index: number,
  defaultValue?: T
): T | undefined {
  if (!isArray(arr) || index < 0 || index >= arr.length) {
    return defaultValue;
  }
  return arr[index] as T;
}

/**
 * Type-safe object check
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Safe object merge thay thế Object.assign với as any
 */
export function safeMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Array<Partial<T> | null | undefined>
): T {
  if (!isObject(target)) {
    throw new Error('Target must be an object');
  }
  
  for (const source of sources) {
    if (isObject(source)) {
      Object.keys(source).forEach(key => {
        const value = source[key];
        if (value !== undefined) {
          (target as Record<string, unknown>)[key] = value;
        }
      });
    }
  }
  
  return target;
}

// ===================================
// SEQUELIZE RESULT UTILITIES
// ===================================

/**
 * Extract Sequelize model attributes safely
 */
export function getModelAttributes<T extends Record<string, unknown>>(
  instance: unknown
): Partial<T> {
  if (!instance || typeof instance !== 'object') {
    return {};
  }
  
  const model = instance as Record<string, unknown>;
  
  // Try dataValues first (Sequelize instance)
  if (isObject(model.dataValues)) {
    return model.dataValues as Partial<T>;
  }
  
  // Try toJSON method
  if (typeof model.toJSON === 'function') {
    try {
      const json = (model.toJSON as () => unknown)();
      if (isObject(json)) {
        return json as Partial<T>;
      }
    } catch (error) {
      // Fall through to plain object return
    }
  }
  
  // Return as plain object
  return model as Partial<T>;
}

/**
 * Safe Sequelize operation result access
 */
export function getSequelizeResult<T>(
  result: unknown,
  expectArray: true
): T[] | null;
export function getSequelizeResult<T>(
  result: unknown,
  expectArray?: false
): T | null;
export function getSequelizeResult<T>(
  result: unknown,
  expectArray = false
): T | T[] | null {
  if (expectArray) {
    return isArray<T>(result) ? result : null;
  }
  
  return result as T || null;
}

// ===================================
// VALIDATION UTILITIES
// ===================================

/**
 * Type-safe validation result access
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
}

interface ZodIssue {
  path?: unknown[];
  message?: string;
  received?: unknown;
}

interface SequelizeValidationError {
  path?: string;
  field?: string;
  message?: string;
  value?: unknown;
}

export function extractValidationErrors(error: unknown): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: []
  };
  
  if (!error) {
    return result;
  }
  
  result.isValid = false;
  
  // Handle Zod errors
  const zodErrors = getErrorProperty(error, 'issues');
  if (isArray(zodErrors)) {
    result.errors = zodErrors.map((issue: unknown) => {
      const zodIssue = issue as ZodIssue;
      return {
        field: isArray(zodIssue.path) ? zodIssue.path.join('.') : 'unknown',
        message: zodIssue.message || 'Validation error',
        value: zodIssue.received
      };
    });
    return result;
  }
  
  // Handle Sequelize validation errors
  const sequelizeErrors = getErrorProperty(error, 'errors');
  if (isArray(sequelizeErrors)) {
    result.errors = sequelizeErrors.map((err: unknown) => {
      const seqError = err as SequelizeValidationError;
      return {
        field: seqError.path || seqError.field || 'unknown',
        message: seqError.message || 'Validation error',
        value: seqError.value
      };
    });
    return result;
  }
  
  // Handle generic validation error
  result.errors = [{
    field: 'general',
    message: getErrorMessage(error)
  }];
  
  return result;
}

// ===================================
// NESTED PROPERTY ACCESS (FOR course-content.service.ts)
// ===================================

/**
 * Safe nested property access với dot notation
 * Thay thế: (lesson as any).section?.course?.id
 * Dùng: getNestedProperty(lesson, 'section.course.id')
 * 
 * FIXES: 8 'as any' trong course-content.service.ts
 */
export function getNestedProperty<T = unknown>(
  obj: unknown,
  path: string,
  defaultValue?: T
): T | undefined {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }

  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result != null && typeof result === 'object') {
      result = (result as Record<string, unknown>)[key];
    } else {
      return defaultValue;
    }
  }

  return result as T | undefined;
}

/**
 * Alias cho getNestedProperty cho consistency
 */
export function getDeepProperty<T = unknown>(
  obj: unknown,
  path: string,
  defaultValue?: T
): T | undefined {
  return getNestedProperty(obj, path, defaultValue);
}

// ===================================
// REQUEST PROPERTY ACCESS WITH NESTED SUPPORT
// ===================================

/**
 * Safe nested request property access
 * Thay thế: (req as any).user?.id
 * Dùng: getRequestNestedProperty(req, 'user.id')
 * 
 * FIXES: 8 'as any' trong cache.middleware.ts & version.manager.ts
 */
export function getRequestNestedProperty<T = unknown>(
  req: unknown,
  path: string,
  defaultValue?: T
): T | undefined {
  return getNestedProperty(req, path, defaultValue);
}

/**
 * Set request property with nested path support
 * Dùng khi cần gán giá trị vào request object
 * Thay thế: (req as any).apiVersion = version
 */
export function setRequestProperty(
  req: unknown,
  property: string,
  value: unknown
): void {
  if (!req || typeof req !== 'object') {
    return;
  }

  const keys = property.split('.');
  let current: Record<string, unknown> = req as Record<string, unknown>;

  // Navigate to parent object
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  // Set the final property
  current[keys[keys.length - 1]] = value;
}

// ===================================
// SEQUELIZE OPTIONS HELPER
// ===================================

/**
 * Type-safe Sequelize upsert options
 * Thay thế: { returning: true } as any
 * Dùng: createSequelizeUpsertOptions()
 * 
 * FIXES: 5 'as any' trong grade.repository.ts
 */
export function createSequelizeUpsertOptions() {
  return {
    returning: true,
    validate: true
  } as const;
}

/**
 * Create Sequelize include options safely
 * Thay thế: include: [...] as any
 */
export interface SequelizeIncludeOption {
  model: unknown;
  as?: string;
  required?: boolean;
  attributes?: string[];
}

export function createSequelizeIncludeOptions(
  options: SequelizeIncludeOption[]
): unknown[] {
  return options as unknown[]; // Typed to unknown because of Sequelize complexity
}

/**
 * Extract data from Sequelize model
 * Thay thế: const data = model as any
 */
export function extractModelData<T = unknown>(
  model: unknown,
  includedAssociations?: string[]
): T {
  if (!model) return {} as T;

  // If it has toJSON method (Sequelize instance)
  if (typeof (model as Record<string, unknown>).toJSON === 'function') {
    try {
      return ((model as Record<string, unknown>).toJSON as () => T)();
    } catch {
      // Fall through
    }
  }

  // If it has dataValues (Sequelize raw)
  if ((model as Record<string, unknown>).dataValues) {
    return (model as Record<string, unknown>).dataValues as T;
  }

  // Return as-is
  return model as T;
}

// ===================================
// ERROR HANDLING EXTENSIONS
// ===================================

/**
 * Enhanced error property access
 * Thay thế: (error as any).statusCode hoặc (error as any).code
 * 
 * FIXES: 7 'as any' trong error handling files
 */
export function getErrorStatusCodeSafe(error: unknown): number {
  const statusCode = 
    getErrorProperty<number>(error, 'statusCode') ||
    getErrorProperty<number>(error, 'status') ||
    getErrorProperty<number>(error, 'code') ||
    getErrorProperty<number>(error, 'statuscode');

  if (typeof statusCode === 'number' && statusCode >= 100 && statusCode < 600) {
    return statusCode;
  }

  return 500;
}

/**
 * Get all error properties in single call
 */
export function getErrorDetails(error: unknown) {
  return {
    message: getErrorMessage(error),
    statusCode: getErrorStatusCodeSafe(error),
    code: getErrorProperty<string>(error, 'code'),
    name: getErrorProperty<string>(error, 'name'),
    stack: getErrorProperty<string>(error, 'stack'),
    details: getErrorProperty<Record<string, unknown>>(error, 'details'),
  };
}

// ===================================
// VALIDATION ERROR HELPERS
// ===================================

/**
 * Safe middleware validation result parsing
 * Thay thế: req.query = schema.query.parse(req.query) as any
 */
export function parseValidationResult<T = unknown>(
  result: unknown,
  fallback?: T
): T | undefined {
  if (result === null || result === undefined) {
    return fallback;
  }
  return result as T;
}

/**
 * Extract Zod validation issues safely
 */
interface ZodValidationIssue {
  path?: unknown;
  message?: string;
  code?: string;
}

export function extractZodIssues(error: unknown): Array<{
  path: string;
  message: string;
  code: string;
}> {
  const issues = getErrorProperty<unknown[]>(error, 'issues', []);

  if (!isArray(issues)) {
    return [];
  }

  return issues.map((issue: unknown) => {
    const zodIssue = issue as ZodValidationIssue;
    return {
      path: isArray(zodIssue.path) ? zodIssue.path.join('.') : String(zodIssue.path || ''),
      message: zodIssue.message || 'Unknown error',
      code: zodIssue.code || 'unknown'
    };
  });
}

// ===================================
// EXPORT TYPE GUARDS
// ===================================

// Export type guards sẽ được import riêng từ sequelize.d.ts