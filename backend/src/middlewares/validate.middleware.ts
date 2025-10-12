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
        req.query = schema.query.parse(req.query) as any;
      }

      // Validate params
      if (schema.params) {
        req.params = schema.params.parse(req.params) as any;
      }

      next();
    } catch (error) {
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
export const validateParams = (schema: ZodSchema) => {
  return validateRequest({ params: schema });
};
