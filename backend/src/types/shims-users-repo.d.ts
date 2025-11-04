declare module '../../types/user.types' {
  export type UserInstance = any;
}

declare module '../../repositories/user.repository' {
  export class UserRepository<T = any> {
    protected getModel(): any;
    protected getModelInstance(): any;
    create(data: any, options?: any): Promise<T>;
    findById(id: string | number, options?: any): Promise<T | null>;
    findOne(options: any): Promise<T | null>;
    findAll(options?: any): Promise<T[]>;
    findAndCountAll(options?: any): Promise<{ count: number; rows: T[] }>;
    update(id: string | number, data: any, options?: any): Promise<T>;
    delete(id: string | number, options?: any): Promise<void>;
    count(options?: any): Promise<number>;
    paginate(page: number, limit: number, options?: any): Promise<{
      data: T[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>;
  }
}

declare var require: (path: string) => any;

// Aliased module shims for isolated users lint build
declare module '@repositories/user.repository' {
  export class UserRepository<T = any> {
    protected getModel(): any;
    protected getModelInstance(): any;
    create(data: any, options?: any): Promise<T>;
    findById(id: string | number, options?: any): Promise<T | null>;
    findOne(options: any): Promise<T | null>;
    findAll(options?: any): Promise<T[]>;
    findAndCountAll(options?: any): Promise<{ count: number; rows: T[] }>;
    update(id: string | number, data: any, options?: any): Promise<T>;
    delete(id: string | number, options?: any): Promise<void>;
    count(options?: any): Promise<number>;
    paginate(page: number, limit: number, options?: any): Promise<{
      data: T[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>;
  }
}

declare module '@config/db' {
  export function getSequelize(): any;
}


