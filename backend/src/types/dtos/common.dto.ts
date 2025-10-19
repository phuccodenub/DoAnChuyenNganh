/**
 * COMMON DTOs - Shared Data Transfer Objects
 */

// ===================================
// PAGINATION DTOs
// ===================================

export interface PaginationQueryDTO {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginationMetaDTO {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface PaginatedResponseDTO<T> {
  data: T[];
  meta: PaginationMetaDTO;
}

// ===================================
// API RESPONSE DTOs
// ===================================

export interface ApiMetaDTO {
  timestamp: string;
  requestId?: string;
  version?: string;
}

export interface ApiResponseDTO<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMetaDTO;
}

export interface ValidationErrorDTO {
  field: string;
  message: string;
  code: string;
}

export interface ApiErrorResponseDTO {
  success: false;
  message: string;
  errors?: ValidationErrorDTO[];
  code: string;
  meta?: ApiMetaDTO;
}

// ===================================
// FILE UPLOAD DTOs
// ===================================

export interface FileUploadDTO {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface FileResponseDTO {
  id: string;
  filename: string;
  original_name: string;
  mimetype: string;
  size: number;
  url: string;
  created_at: Date;
}

// ===================================
// SEARCH DTOs
// ===================================

export interface SearchQueryDTO {
  q: string;
  filters?: Record<string, unknown>;
  page?: number;
  limit?: number;
}

export interface SearchResultDTO<T> {
  results: T[];
  total: number;
  query: string;
  took_ms: number;
}
