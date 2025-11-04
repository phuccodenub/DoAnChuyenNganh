import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../constants/roles.enum';
import { JWTPayload } from '../config/jwt.config';

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Common API response types
export type ApiErrorItem = {
  message: string;
  code?: string;
  field?: string;
  value?: unknown;
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: ApiErrorItem[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// Common entity interfaces
export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Timestamps {
  created_at: Date;
  updated_at: Date;
}

// Common service interfaces
export interface BaseService<T, CreateDto, UpdateDto, Options extends object = SearchOptions> {
  create(data: CreateDto): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(options?: Options): Promise<T[]>;
  update(id: string, data: UpdateDto): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

// Common controller interfaces
export interface BaseController<T, CreateDto, UpdateDto> {
  create(req: Request, res: Response, next: NextFunction): Promise<void>;
  findById(req: Request, res: Response, next: NextFunction): Promise<void>;
  findAll(req: Request, res: Response, next: NextFunction): Promise<void>;
  update(req: Request, res: Response, next: NextFunction): Promise<void>;
  delete(req: Request, res: Response, next: NextFunction): Promise<void>;
}

// Common validation schemas
export interface ValidationSchema<TBody = unknown, TQuery = unknown, TParams = unknown> {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
}

// Common error types
export interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
}

// Common pagination options
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Common search options
export interface SearchOptions extends PaginationOptions {
  search?: string;
  filters?: Record<string, unknown>;
}

// Configuration interfaces
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect: string;
  logging?: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
  issuer: string;
  audience: string;
}

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

// File upload interfaces
export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  destination?: string;
}

export interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

// Email interfaces
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: unknown[];
}

// Cache interfaces
export interface CacheOptions {
  ttl?: number;
  key?: string;
}

