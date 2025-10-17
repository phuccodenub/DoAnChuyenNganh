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
