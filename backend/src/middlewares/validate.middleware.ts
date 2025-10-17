import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { RESPONSE_CONSTANTS } from '../constants/response.constants';
import { responseUtils } from '../utils/response.util';

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

      // Validate query
      if (schema.query) {
        const parsedQuery = schema.query.parse(req.query);
        // Don't modify req.query directly, store parsed data in req.validatedQuery
        (req as any).validatedQuery = parsedQuery;
      }

      // Validate params
      if (schema.params) {
        req.params = schema.params.parse(req.params) as any;
      }

      next();
    } catch (error: unknown) {
      responseUtils.sendValidationError(
        res,
        RESPONSE_CONSTANTS.ERROR.VALIDATION_ERROR,
        (error as any).issues || [(error as any).message]
      );
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


