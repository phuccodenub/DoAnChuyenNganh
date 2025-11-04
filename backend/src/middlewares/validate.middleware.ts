import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { RESPONSE_CONSTANTS } from '../constants/response.constants';
import { responseUtils } from '../utils/response.util';
import logger from '../utils/logger.util';

// Validation middleware factory
export const validateRequest = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query - coerce types since query params are always strings
      if (schema.query) {
        // Create a mutable copy of query to avoid readonly issues
        const queryData = { ...req.query } as any;
        const validated = schema.query.parse(queryData) as any;
        // Mutate existing req.query object instead of reassigning (Express 5 has getter-only property)
        Object.keys(req.query || {}).forEach((k) => {
          // remove existing keys to avoid stale values
          delete (req.query as any)[k];
        });
        Object.entries(validated).forEach(([k, v]) => {
          (req.query as any)[k] = v;
        });
      }

      // Validate params
      if (schema.params) {
        req.params = schema.params.parse(req.params) as any;
      }

      next();
    } catch (error: unknown) {
      // If it's a Zod validation error, respond with 400 Bad Request
      if (error instanceof ZodError) {
        const details = error.issues?.map(i => ({
          path: i.path,
          message: i.message,
          code: i.code,
          expected: (i as any).expected,
          received: (i as any).received,
          values: (i as any).options || (i as any).values
        }));
        // Add targeted debug log to identify why validation fails in tests (avoid logging sensitive body content)
        try {
          logger.error('Zod validation error', {
            method: req.method,
            path: req.path,
            issues: details
          });
        } catch {}
        responseUtils.sendValidationError(
          res,
          RESPONSE_CONSTANTS.ERROR.VALIDATION_ERROR,
          details || []
        );
        return;
      }

      // Otherwise, defer to the global error handler
      next(error);
    }
  };
};

// Body validation middleware
export const validateBody = (schema: ZodSchema) => {
  return validateRequest({ body: schema });
};

// Query validation middleware
export const validateQuery = (schema: ZodSchema) => {
  return validateRequest({ query: schema });
};

// Params validation middleware
// Returns 404 for UUID format errors since invalid IDs mean the resource doesn't exist
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error: any) {
      // Check if the error is a UUID format error
      const isUUIDError = error.issues?.some((issue: any) => 
        issue.message?.includes('Invalid') && 
        (issue.message?.includes('ID') || issue.message?.includes('uuid'))
      );
      
      if (isUUIDError) {
        // Return 404 for invalid UUID formats in params
        responseUtils.sendNotFound(res, 'Resource not found');
      } else {
        // Return 400 for other validation errors
        responseUtils.sendValidationError(
          res,
          RESPONSE_CONSTANTS.ERROR.VALIDATION_ERROR,
          error.issues || [error.message]
        );
      }
    }
  };
};

// Legacy validate function for express-validator compatibility
export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    responseUtils.sendValidationError(
      res,
      RESPONSE_CONSTANTS.ERROR.VALIDATION_ERROR,
      errors.array()
    );
  };
};


