import { Request } from 'express';
import { UserRole } from '../constants/roles.enum';

// Extended Request interface with user
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
  };
}

// Common API response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: any;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
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
export interface BaseService<T, CreateDto, UpdateDto> {
  create(data: CreateDto): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(options?: any): Promise<T[]>;
  update(id: string, data: UpdateDto): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

// Common controller interfaces
export interface BaseController<T, CreateDto, UpdateDto> {
  create(req: any, res: any, next: any): Promise<void>;
  findById(req: any, res: any, next: any): Promise<void>;
  findAll(req: any, res: any, next: any): Promise<void>;
  update(req: any, res: any, next: any): Promise<void>;
  delete(req: any, res: any, next: any): Promise<void>;
}

// Common validation schemas
export interface ValidationSchema {
  body?: any;
  query?: any;
  params?: any;
}

// Common error types
export interface ServiceError {
  code: string;
  message: string;
  details?: any;
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
  filters?: Record<string, any>;
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
  attachments?: any[];
}

// Cache interfaces
export interface CacheOptions {
  ttl?: number;
  key?: string;
}
