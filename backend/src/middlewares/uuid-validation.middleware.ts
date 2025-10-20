import { Request, Response, NextFunction } from 'express';
import { RESPONSE_CONSTANTS } from '../constants/response.constants';
import { responseUtils } from '../utils/response.util';

/**
 * UUID Validation Middleware
 * Validates that route parameters are valid UUIDs
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID
 */
export const isValidUUID = (value: string): boolean => {
  return UUID_REGEX.test(value);
};

/**
 * Middleware to validate UUID parameters
 * @param paramNames - Array of parameter names to validate
 * Returns 404 for invalid UUIDs since a resource with an invalid ID cannot exist
 */
export const validateUUIDParams = (...paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const paramName of paramNames) {
      const paramValue = req.params[paramName];
      
      // If parameter exists and is not a valid UUID, treat as resource not found
      if (paramValue && !isValidUUID(paramValue)) {
        responseUtils.sendNotFound(
          res,
          `Resource not found`
        );
        return;
      }
    }

    next();
  };
};

/**
 * Middleware to validate a single UUID parameter (commonly 'id')
 */
export const validateUUID = validateUUIDParams('id');

/**
 * Middleware to validate courseId parameter
 */
export const validateCourseId = validateUUIDParams('courseId');

/**
 * Middleware to validate userId parameter
 */
export const validateUserId = validateUUIDParams('userId');

/**
 * Middleware to validate instructorId parameter
 */
export const validateInstructorId = validateUUIDParams('instructorId');

/**
 * Middleware to validate enrollmentId parameter
 */
export const validateEnrollmentId = validateUUIDParams('enrollmentId');

