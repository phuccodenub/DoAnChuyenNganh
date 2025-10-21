// Minimal shims to isolate enrollments module during hard-fail linting

declare module 'sequelize' {
  export class DataTypes {
    static UUID: any;
    static UUIDV4: any;
    static STRING(length?: number): any;
    static TEXT: any;
    static BOOLEAN: any;
    static INTEGER: any;
    static DATE: any;
    static DATEONLY: any;
    static ENUM(...values: string[]): any;
    static DECIMAL(precision: number, scale: number): any;
    static JSON: any;
  }
  export class Model {
    get(key: string): any;
    toJSON(): any;
  }
  export interface ModelCtor<T extends Model> {
    define(modelName: string, attributes: any, options?: any): ModelCtor<T>;
    findByPk(id: string | number, options?: any): Promise<T | null>;
    findOne(options?: any): Promise<T | null>;
    findAll(options?: any): Promise<T[]>;
    count(options?: any): Promise<number>;
    update(data: any, options?: any): Promise<[number, T[]]> ;
    destroy(options?: any): Promise<number>;
    bulkCreate(data: any[], options?: any): Promise<T[]>;
    upsert(data: any, options?: any): Promise<[T, boolean | null]>;
    associate?(models: any): void;
    hasMany?(model: any, options: any): void;
    belongsTo?(model: any, options: any): void;
  }
  export const Op: any;
  export type FindOptions = any;
  export type CreateOptions = any;
  export type UpdateOptions = any;
  export type DestroyOptions = any;
}

declare module '@utils/logger.util' {
  const logger: any;
  export default logger;
}

declare module '@config/db' {
  export function getSequelize(): any;
}

// Relative import used from src/models/enrollment.model.ts
declare module '../config/db' {
  export function getSequelize(): any;
}

declare module '../../repositories/base.repository' {
  export class BaseRepository<T = any> {
    protected modelName: string;
    protected model: any;
    constructor(model: any);
    create(data: any, options?: any): Promise<T>;
    findById(id: string | number, options?: any): Promise<T | null>;
    findOne(options: any): Promise<T | null>;
    findAll(options?: any): Promise<T[]>;
    findAndCountAll(options?: any): Promise<{ count: number; rows: T[] }>;
    update(id: string | number, data: any, options?: any): Promise<T>;
    delete(id: string | number, options?: any): Promise<void>;
    count(options?: any): Promise<number>;
    exists(id: string | number): Promise<boolean>;
    paginate(page: number, limit: number, options?: any): Promise<any>;
  }
}

declare module '@repositories/base.repository' {
  export class BaseRepository<T = any> {
    protected modelName: string;
    protected model: any;
    constructor(model: any);
    create(data: any, options?: any): Promise<T>;
    findById(id: string | number, options?: any): Promise<T | null>;
    findOne(options: any): Promise<T | null>;
    findAll(options?: any): Promise<T[]>;
    findAndCountAll(options?: any): Promise<{ count: number; rows: T[] }>;
    update(id: string | number, data: any, options?: any): Promise<T>;
    delete(id: string | number, options?: any): Promise<void>;
    count(options?: any): Promise<number>;
    exists(id: string | number): Promise<boolean>;
    paginate(page: number, limit: number, options?: any): Promise<any>;
  }
}

declare module '../../models' {
  export const User: any;
  export const Course: any;
  export const Enrollment: any;
}

declare module '@constants/response.constants' {
  export const RESPONSE_CONSTANTS: any;
}

declare module '../../constants/response.constants' {
  export const RESPONSE_CONSTANTS: any;
}

declare module '../../middlewares/error.middleware' {
  export class ApiError extends Error {
    constructor(statusCode?: number, message?: string);
  }
}

declare module '../../utils/logger.util' {
  const logger: any;
  export default logger;
}

// Relative logger import used in enrollments module
declare module '../../utils/logger.util' {
  const logger: any;
  export default logger;
}

declare module '../../middlewares/error.middleware' {
  export class ApiError extends Error {
    constructor(message?: string, statusCode?: number);
  }
}

declare module '../../constants/response.constants' {
  export const RESPONSE_CONSTANTS: any;
}

declare module '../../types/enrollment.types' {
  export type EnrollmentInstance = any;
  export namespace EnrollmentTypes {
    type EnrollmentWithDetails = any;
    type EnrollmentFilterOptions = any;
    type EnrollmentStats = any;
    type CourseEnrollmentStats = any;
    type UserEnrollmentStats = any;
    type CreateEnrollmentPayload = any;
    type UpdateEnrollmentPayload = any;
  }
}

// Local types import path used by enrollments module files
declare module './enrollment.types' {
  export type EnrollmentInstance = any;
  export namespace EnrollmentTypes {
    type EnrollmentWithDetails = any;
    type EnrollmentFilterOptions = any;
    type EnrollmentStats = any;
    type CourseEnrollmentStats = any;
    type UserEnrollmentStats = any;
    type CreateEnrollmentPayload = any;
    type UpdateEnrollmentPayload = any;
  }
}

declare var require: (path: string) => any;


