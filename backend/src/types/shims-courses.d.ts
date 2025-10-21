// Minimal shims for isolated courses lint build

declare module '../../repositories/base.repository' {
  export class BaseRepository<T = any> {
    protected modelName: string;
    protected model: any;
    constructor(model: any);
    findById(id: string | number, options?: any): Promise<T | null>;
    findOne(options: any): Promise<T | null>;
    findAll(options?: any): Promise<T[]>;
    findAndCountAll(options?: any): Promise<{ count: number; rows: T[] }>;
    create(data: any, options?: any): Promise<T>;
    update(id: string | number, data: any, options?: any): Promise<T>;
    delete(id: string | number, options?: any): Promise<void>;
    count(options?: any): Promise<number>;
  }
}

declare module '@repositories/base.repository' {
  export class BaseRepository<T = any> {
    protected modelName: string;
    protected model: any;
    constructor(model: any);
    findById(id: string | number, options?: any): Promise<T | null>;
    findOne(options: any): Promise<T | null>;
    findAll(options?: any): Promise<T[]>;
    findAndCountAll(options?: any): Promise<{ count: number; rows: T[] }>;
    create(data: any, options?: any): Promise<T>;
    update(id: string | number, data: any, options?: any): Promise<T>;
    delete(id: string | number, options?: any): Promise<void>;
    count(options?: any): Promise<number>;
  }
}

declare module '../../types/course.types' {
  export type CourseInstance = any;
}

declare module '../../models' {
  export const User: any;
  export const Enrollment: any;
  export const Course: any;
}

declare module 'sequelize' {
  export const Op: any;
  export const DataTypes: any;
}

declare module '@utils/logger.util' {
  const logger: any;
  export default logger;
}

declare module '@config/db' {
  export function getSequelize(): any;
}

declare var require: (path: string) => any;


