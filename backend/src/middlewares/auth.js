/**
 * Authentication Middleware
 * JWT token verification and user authorization
 */

const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

/**
 * Verify JWT token and attach user info to request
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request object
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    req.userName = decoded.name;
    
    next();
  } catch (error) {
    logger.logWarning('Invalid token attempt', { 
      token: token.substring(0, 20) + '...', 
      error: error.message 
    });
    
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Authorize specific roles
 * @param {string|Array} allowedRoles - Single role or array of roles
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(req.userRole)) {
      logger.logWarning('Unauthorized access attempt', { 
        userId: req.userId, 
        userRole: req.userRole,
        requiredRoles: roles 
      });
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Check if user is instructor (can be instructor or admin)
 */
const requireInstructor = (req, res, next) => {
  if (!req.userRole) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.userRole !== 'instructor' && req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Instructor access required'
    });
  }

  next();
};

/**
 * Check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.userRole) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Administrator access required'
    });
  }

  next();
};

/**
 * Check if user owns resource or has elevated permissions
 * @param {string} resourceUserIdField - Field name containing the user ID (e.g., 'instructor_id')
 */
const requireOwnershipOrElevated = (resourceUserIdField = 'user_id') => {
  return async (req, res, next) => {
    try {
      // Admin always has access
      if (req.userRole === 'admin') {
        return next();
      }

      // Get resource user ID from request params, body, or loaded resource
      let resourceUserId;
      
      if (req.resource && req.resource[resourceUserIdField]) {
        resourceUserId = req.resource[resourceUserIdField];
      } else if (req.body[resourceUserIdField]) {
        resourceUserId = req.body[resourceUserIdField];
      } else if (req.params[resourceUserIdField]) {
        resourceUserId = parseInt(req.params[resourceUserIdField]);
      }

      if (!resourceUserId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ownership cannot be determined'
        });
      }

      // Check if user owns the resource
      if (req.userId !== resourceUserId) {
        logger.logWarning('Unauthorized resource access attempt', { 
          userId: req.userId, 
          resourceUserId,
          resource: resourceUserIdField
        });
        
        return res.status(403).json({
          success: false,
          message: 'Access denied: insufficient permissions'
        });
      }

      next();
    } catch (error) {
      logger.logError('Error in ownership check', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization'
      });
    }
  };
};

/**
 * Optional authentication - doesn't fail if no token
 * But if token exists, validates it
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token provided, continue without authentication
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request object
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    req.userName = decoded.name;
    
    next();
  } catch (error) {
    // Invalid token, but don't fail - just continue without auth
    logger.logWarning('Invalid optional token', { error: error.message });
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  requireInstructor,
  requireAdmin,
  requireOwnershipOrElevated,
  optionalAuth
};