/**
 * Global type declarations for packages without @types
 * These declarations are used when @types packages are not available during build
 */

declare module 'nodemailer' {
  export interface Transporter {
    sendMail(mailOptions: any): Promise<any>;
    verify(): Promise<boolean>;
  }
  
  interface Nodemailer {
    createTransport(options: any): Transporter;
  }
  
  const nodemailer: Nodemailer;
  export default nodemailer;
}

declare module 'swagger-ui-express' {
  import { RequestHandler } from 'express';
  export function setup(swaggerDoc: any, options?: any): RequestHandler[];
  export function serve(swaggerDoc: any, options?: any): RequestHandler[];
  export function serveFiles(swaggerDoc: any, options?: any): RequestHandler[];
  export function setup(swaggerDoc: any, options?: any): RequestHandler[];
}

declare module 'multer' {
  import { Request } from 'express';
  
  export interface File {
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

  export class MulterError extends Error {
    code: string;
    field?: string;
  }

  export interface StorageEngine {
    _handleFile(req: Request, file: File, callback: (error?: Error | null, info?: Partial<File>) => void): void;
    _removeFile(req: Request, file: File, callback: (error: Error | null) => void): void;
  }

  export interface Options {
    dest?: string;
    storage?: StorageEngine;
    limits?: {
      fileSize?: number;
      files?: number;
      fields?: number;
    };
    fileFilter?: (req: Request, file: File, callback: (error: Error | null, acceptFile: boolean) => void) => void;
  }

  export interface Multer {
    (options?: Options): any;
    diskStorage(options: {
      destination?: string | ((req: Request, file: File, callback: (error: Error | null, destination: string) => void) => void);
      filename?: (req: Request, file: File, callback: (error: Error | null, filename: string) => void) => void;
    }): StorageEngine;
    memoryStorage(): StorageEngine;
  }

  export type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

  interface MulterWithTypes extends Multer {
    MulterError: typeof MulterError;
  }
  
  const multer: MulterWithTypes;
  export default multer;
  
  // Export types as properties for namespace-like access
  export { File, FileFilterCallback, MulterError };
}

declare module 'zxcvbn' {
  export interface ZXCVBNResult {
    score: number;
    feedback: {
      warning: string;
      suggestions: string[];
    };
    crack_times_seconds: {
      online_throttling_100_per_hour: number;
      online_no_throttling_10_per_second: number;
      offline_slow_hashing_1e4_per_second: number;
      offline_fast_hashing_1e10_per_second: number;
    };
    crack_times_display: {
      online_throttling_100_per_hour: string;
      online_no_throttling_10_per_second: string;
      offline_slow_hashing_1e4_per_second: string;
      offline_fast_hashing_1e10_per_second: string;
    };
    calc_time: number;
  }

  export default function zxcvbn(password: string, userInputs?: string[]): ZXCVBNResult;
}

declare module 'qrcode' {
  export function toDataURL(text: string, options?: any): Promise<string>;
  export function toBuffer(text: string, options?: any): Promise<Buffer>;
  export function toString(text: string, options?: any): Promise<string>;
  export function toFile(path: string, text: string, options?: any): Promise<void>;
}

declare module 'jsonwebtoken' {
  export interface SignOptions {
    expiresIn?: string | number;
    issuer?: string;
    audience?: string;
    algorithm?: string;
  }

  export interface VerifyOptions {
    issuer?: string;
    audience?: string;
    algorithms?: string[];
  }

  export function sign(payload: any, secretOrPrivateKey: string, options?: SignOptions): string;
  export function verify(token: string, secretOrPublicKey: string, options?: VerifyOptions): any;
  export function decode(token: string, options?: any): any;
}

