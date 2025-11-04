/**
 * Sequelize Type Definitions for Sequelize 6
 * Re-export types that are not directly exported from sequelize
 */

import { Model } from 'sequelize';

// ModelStatic is not exported in Sequelize 6, define it ourselves
export type ModelStatic<M extends Model = Model> = typeof Model & {
  new (): M;
  findAll(options?: any): Promise<M[]>;
  findByPk(id: string | number, options?: any): Promise<M | null>;
  findOne(options?: any): Promise<M | null>;
  create(values: any, options?: any): Promise<M>;
  update(values: any, options?: any): Promise<[number, M[]]>;
  destroy(options?: any): Promise<number>;
  count(options?: any): Promise<number>;
  bulkCreate(values: any[], options?: any): Promise<M[]>;
};

// WhereOptions - not exported in Sequelize 6
export type WhereOptions<T = any> = Record<string, any>;

// Optional - not exported in Sequelize 6, use utility type
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Attributes and CreationAttributes - not exported in Sequelize 6
export type Attributes<T> = T;
export type CreationAttributes<T> = Partial<T>;

// BulkCreateOptions - not exported, define it
export interface BulkCreateOptions {
  ignoreDuplicates?: boolean;
  updateOnDuplicate?: string[];
  returning?: boolean;
  validate?: boolean;
  transaction?: any;
}

// Re-export commonly used types
export type FindOptions<T = any> = any;
export type CreateOptions<T = any> = any;
export type UpdateOptions<T = any> = any;
export type DestroyOptions<T = any> = any;

