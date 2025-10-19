/**
 * Repository Types - Type definitions for repository layer
 */

import { FindOptions, WhereOptions, Includeable } from 'sequelize';

// ===================================
// SEQUELIZE QUERY OPTIONS
// ===================================

export interface BaseQueryOptions {
  attributes?: string[];
  include?: Includeable[];
  order?: Array<[string, 'ASC' | 'DESC']>;
  limit?: number;
  offset?: number;
  raw?: boolean;
  nest?: boolean;
}

export interface FindManyOptions extends BaseQueryOptions {
  where?: WhereOptions;
}

export interface FindOneOptions extends BaseQueryOptions {
  where?: WhereOptions;
}

export interface CountOptions {
  where?: WhereOptions;
  distinct?: boolean;
}

// ===================================
// PAGINATION OPTIONS
// ===================================

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage?: number;
    prevPage?: number;
  };
}

// ===================================
// BULK OPERATIONS
// ===================================

export interface BulkCreateOptions {
  validate?: boolean;
  returning?: boolean;
  ignoreDuplicates?: boolean;
}

export interface BulkUpdateOptions {
  validate?: boolean;
  returning?: boolean;
}

export interface BulkDestroyOptions {
  force?: boolean; // Hard delete
  truncate?: boolean;
}

// ===================================
// TRANSACTION OPTIONS
// ===================================

export interface TransactionOptions {
  autocommit?: boolean;
  isolationLevel?: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
  type?: 'DEFERRED' | 'IMMEDIATE' | 'EXCLUSIVE';
}
