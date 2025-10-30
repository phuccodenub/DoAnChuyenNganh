import { Request, Response, NextFunction } from 'express';
import { jwtUtils } from '../utils/jwt.util';
import { JWTPayload } from '../config/jwt.config';
import { RESPONSE_CONSTANTS } from '../constants/response.constants';
import logger from '../utils/logger.util';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Authentication middleware
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED,
        error: RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED,
        data: null
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwtUtils.verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error: unknown) {
      logger.error('Token verification failed:', error);
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_CONSTANTS.ERROR.TOKEN_INVALID,
        error: RESPONSE_CONSTANTS.ERROR.TOKEN_INVALID,
        data: null
      });
      return;
    }
  } catch (error: unknown) {
    logger.error('Auth middleware error:', error);
    res.status(RESPONSE_CONSTANTS.STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: RESPONSE_CONSTANTS.ERROR.INTERNAL_SERVER_ERROR,
      error: RESPONSE_CONSTANTS.ERROR.INTERNAL_SERVER_ERROR,
      data: null
    });
  }
};

// Role-based authorization middleware
export const authorizeRoles = (...roles: string[] | [string[]]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED,
        error: RESPONSE_CONSTANTS.ERROR.UNAUTHORIZED,
        data: null
      });
      return;
    }

    const allowed = Array.isArray(roles[0]) ? (roles[0] as string[]) : (roles as string[]);
    if (!allowed.includes(req.user.role)) {
      res.status(RESPONSE_CONSTANTS.STATUS_CODE.FORBIDDEN).json({
        success: false,
        message: RESPONSE_CONSTANTS.ERROR.ACCESS_DENIED,
        error: RESPONSE_CONSTANTS.ERROR.ACCESS_DENIED,
        data: null
      });
      return;
    }

    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwtUtils.verifyAccessToken(token);
        req.user = decoded;
      } catch (error: unknown) {
        // Ignore token errors for optional auth
        logger.debug('Optional auth token verification failed:', error);
      }
    }
    
    next();
  } catch (error: unknown) {
    logger.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};


