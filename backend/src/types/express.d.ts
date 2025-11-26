/**
 * Extended Express Types
 * Định nghĩa các type extension cho Express Request/Response objects
 */

import { JWTPayload } from '../config/jwt.config';

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination?: string;
        filename?: string;
        path?: string;
        buffer?: Buffer;
      }
    }
    interface Request {
      // User information từ auth middleware
      user?: JWTPayload;

      // Request tracking
      requestId?: string;
      startTime?: number;

      // API versioning
      apiVersion?: string;

      // File upload (multer)
      file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      };

      files?: {
        [fieldname: string]: {
          fieldname: string;
          originalname: string;
          encoding: string;
          mimetype: string;
          size: number;
          destination: string;
          filename: string;
          path: string;
          buffer: Buffer;
        }[];
      } | {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }[];

      // Validation context
      validatedData?: Record<string, unknown>;
      
      // IP và User Agent đã có trong Express by default
      // ip: string (inherited)
      // get(name: 'User-Agent'): string | undefined (inherited)
    }

    interface Response {
      // Custom response properties có thể thêm sau
    }
  }
}

// Export để TypeScript recognize file này như module
export {};