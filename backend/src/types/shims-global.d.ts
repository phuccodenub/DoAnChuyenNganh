// Global shims to reduce TS friction during incremental hardening

declare module 'express' {
  export interface Request { [key: string]: any }
  export interface Response { [key: string]: any }
  export interface NextFunction { (err?: any): void }
  export function Router(): any;
  const _default: any;
  export default _default;
}

declare module 'express-validator' {
  export const body: any;
  export const param: any;
  export const query: any;
  export type ValidationChain = any;
}

declare module 'sequelize' {
  export const QueryTypes: any;
  export interface QueryInterface {
    createTable(tableName: string, attributes: any, options?: any): Promise<void>;
    dropTable(tableName: string, options?: any): Promise<void>;
    addColumn(tableName: string, columnName: string, dataType: any, options?: any): Promise<void>;
    removeColumn(tableName: string, columnName: string, options?: any): Promise<void>;
    changeColumn(tableName: string, columnName: string, dataType: any, options?: any): Promise<void>;
    renameColumn(tableName: string, attrNameBefore: string, attrNameAfter: string, options?: any): Promise<void>;
    addIndex(tableName: string, attributes: any, options?: any): Promise<void>;
    removeIndex(tableName: string, indexName: string, options?: any): Promise<void>;
    addConstraint(tableName: string, options: any): Promise<void>;
    removeConstraint(tableName: string, constraintName: string, options?: any): Promise<void>;
    [key: string]: any;
  }
  export const DataTypes: any;
}

// Jest globals (for any stray imports during build)
declare const jest: any;
declare function describe(name: string, fn: () => void): void;
declare function test(name: string, fn: () => any): void;
declare function afterEach(fn: () => any): void;
declare function expect(val: any): any;

// Buffer/Node shims
declare const Buffer: {
  from(data: any, encoding?: string): any;
  alloc(size: number): any;
  [key: string]: any;
};

declare module 'crypto' {
  export function randomBytes(size: number): {
    toString(encoding: string): string;
    readUInt32BE(offset: number): number;
    [key: string]: any;
  };
  export function createHash(algorithm: string): any;
  export function createHmac(algorithm: string, key: any): any;
  export function pbkdf2Sync(password: any, salt: any, iterations: number, keylen: number, digest: string): Buffer;
  export const timingSafeEqual: any;
}


