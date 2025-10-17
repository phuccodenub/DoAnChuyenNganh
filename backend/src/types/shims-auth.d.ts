/**
 * Auth Module Shims
 * Minimal type declarations for auth module dependencies
 */

declare module './auth.types' {
  export namespace AuthTypes {
    interface LoginRequest {
      email: string;
      password: string;
      rememberMe?: boolean;
    }
    
    interface RegisterRequest {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }
    
    interface AuthResponse {
      user: any;
      tokens: {
        accessToken: string;
        refreshToken: string;
      };
    }
  }
}

declare module '../../services/global/auth.service' {
  export class AuthService {
    login(email: string, password: string): Promise<any>;
    register(userData: any): Promise<any>;
    refreshToken(token: string): Promise<any>;
    logout(userId: string): Promise<void>;
  }
}

declare module '../../services/global/user.service' {
  export class UserService {
    getUserById(userId: string): Promise<any>;
    getUserByEmail(email: string): Promise<any>;
    createUser(userData: any): Promise<any>;
    updateUser(userId: string, data: any): Promise<any>;
  }
}

declare module '../../utils/token.util' {
  export const tokenUtils: {
    jwt: {
      generateAccessToken(userId: string, email: string, role: string): string;
      verifyAccessToken(token: string): any;
      generateRefreshToken(userId: string, tokenVersion: number): string;
      verifyRefreshToken(token: string): any;
      isTokenExpired(token: string): boolean;
    };
  };
}

declare module '../../utils/password.util' {
  export const passwordUtils: {
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, hash: string): Promise<boolean>;
  };
}

declare module '../../utils/email.util' {
  export const emailUtils: {
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
  };
}

declare module '../../middlewares/auth.middleware' {
  export const authMiddleware: any;
  export const requireAuth: any;
  export const requireRole: (roles: string[]) => any;
}

declare module '../../constants/response.constants' {
  export const RESPONSE_CONSTANTS: {
    MESSAGE: {
      SUCCESS: string;
      CREATED: string;
      UPDATED: string;
      DELETED: string;
      LOGIN_SUCCESS: string;
      LOGOUT_SUCCESS: string;
      REGISTER_SUCCESS: string;
    };
    STATUS_CODE: {
      OK: number;
      CREATED: number;
      BAD_REQUEST: number;
      UNAUTHORIZED: number;
      FORBIDDEN: number;
      NOT_FOUND: number;
      INTERNAL_SERVER_ERROR: number;
    };
  };
}

declare module '../../utils/logger.util' {
  const logger: {
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
  };
  export default logger;
}

declare module '../../errors' {
  export class ApiError extends Error {
    constructor(message: string, statusCode: number, code?: string);
  }
}

declare module '../../utils/validators.util' {
  export const validatorsUtils: {
    isEmail(email: string): boolean;
    isStrongPassword(password: string): boolean;
    isValidName(name: string): boolean;
  };
}

declare module '../../utils/rate-limit.util' {
  export const rateLimitUtils: {
    createRateLimit(options: any): any;
  };
}

declare module '../../utils/cache.util' {
  export const cacheUtils: {
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
  };
}

declare module '../../config/db' {
  export function getSequelize(): any;
}

declare module '../../models' {
  export const User: any;
  export const Session: any;
}

// ==== Alias-based shims used by tsconfig.build.auth.json ====

declare module '@utils/response.util' {
  export const responseUtils: {
    sendSuccess: (res: any, message: string, data?: any) => void;
    sendCreated: (res: any, message: string, data?: any) => void;
    sendError: (res: any, error: any, statusCode?: number) => void;
  };
}

declare module '@middlewares/validate.middleware' {
  import { Request, Response, NextFunction } from 'express';
  import { ValidationChain } from 'express-validator';
  export const validateBody: (...schemas: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => void;
  export const validateQuery: (...schemas: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => void;
  export const validateParam: (...schemas: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => void;
}

declare module '@validates/auth.validate' {
  export const authSchemas: any;
}

declare module '@repositories/user.repository' {
  import { Model } from 'sequelize';
  export class BaseRepository<T extends Model = any> {
    findById(id: string): Promise<T | null>;
    findOne(options?: any): Promise<T | null>;
    findAll(options?: any): Promise<T[]>;
    findAndCountAll(options?: any): Promise<{ rows: T[]; count: number }>;
    create(values: any, options?: any): Promise<T>;
    update(id: string, values: any, options?: any): Promise<T>;
    delete(id: string): Promise<number>;
    count(options?: any): Promise<number>;
    paginate(page: number, limit: number, options?: any): Promise<{ data: T[]; pagination: any }>;
    exists(key: string | number): Promise<boolean>;
  }
  export class UserRepository extends BaseRepository<any> {
    findByUsername(username: string): Promise<any | null>;
    findByEmail(email: string): Promise<any | null>;
  }
}

declare module '@constants/response.constants' {
  export const RESPONSE_CONSTANTS: any;
}

declare module '@utils/logger.util' {
  const logger: any;
  export default logger;
}

declare module '@middlewares/error.middleware' {
  export class ApiError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string);
  }
}

declare module '@services/global' {
  export const globalServices: any;
}

declare module '@utils/user.util' {
  export const userUtils: any;
}

declare module '@middlewares/auth.middleware' {
  export const authMiddleware: any;
}

declare module '@middlewares/auth-rate-limit.middleware' {
  export const authRateLimit: any;
  export const passwordResetRateLimit: any;
  export const registrationRateLimit: any;
}

declare module '@utils/validators.util' {
  export const validatorsUtils: any;
}

// Node-style require for dynamic model imports in repository
declare var require: (path: string) => any;
