import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApiError } from '../errors/api.error';

/**
 * Middleware to validate DTOs using class-validator
 * @param dtoClass - The DTO class to validate against
 * @returns Express middleware function
 */
export function ValidateDTO(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Convert plain object to class instance
      const dtoInstance = plainToInstance(dtoClass, req.body);

      // Validate the DTO instance
      const errors: ValidationError[] = await validate(dtoInstance, {
        whitelist: true, // Strip properties that don't have decorators
        forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
        skipMissingProperties: false, // Don't skip missing properties
      });

      if (errors.length > 0) {
        // Format validation errors
        const formattedErrors = errors.map(error => ({
          field: error.property,
          value: error.value,
          constraints: error.constraints || {},
          children: error.children || []
        }));

        throw ApiError.badRequest('Validation failed', { errors: formattedErrors });
      }

      // Replace req.body with validated DTO instance
      req.body = dtoInstance;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to validate query parameters using class-validator
 * @param dtoClass - The DTO class to validate against
 * @returns Express middleware function
 */
export function ValidateQuery(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Convert plain object to class instance
      const dtoInstance = plainToInstance(dtoClass, req.query);

      // Validate the DTO instance
      const errors: ValidationError[] = await validate(dtoInstance as object, {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
      });

      if (errors.length > 0) {
        // Format validation errors
        const formattedErrors = errors.map(error => ({
          field: error.property,
          value: error.value,
          constraints: error.constraints || {},
          children: error.children || []
        }));

        throw ApiError.badRequest('Query validation failed', { errors: formattedErrors });
      }

      // Replace req.query with validated DTO instance
      req.query = dtoInstance as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to validate URL parameters using class-validator
 * @param dtoClass - The DTO class to validate against
 * @returns Express middleware function
 */
export function ValidateParams(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Convert plain object to class instance
      const dtoInstance = plainToInstance(dtoClass, req.params);

      // Validate the DTO instance
      const errors: ValidationError[] = await validate(dtoInstance as object, {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
      });

      if (errors.length > 0) {
        // Format validation errors
        const formattedErrors = errors.map(error => ({
          field: error.property,
          value: error.value,
          constraints: error.constraints || {},
          children: error.children || []
        }));

        throw ApiError.badRequest('Parameter validation failed', { errors: formattedErrors });
      }

      // Replace req.params with validated DTO instance
      req.params = dtoInstance as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}
