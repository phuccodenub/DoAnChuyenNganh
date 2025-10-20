declare module 'sequelize' {
  export const Sequelize: any;
  export type Sequelize = any;
  export const DataTypes: any;
  export type Model = any;
  export type ModelCtor<T = any> = any;
  export type FindOptions = any;
  export type CreateOptions = any;
  export type UpdateOptions = any;
  export type DestroyOptions = any;
  export const Op: any;
}

declare module '../config/db' {
  export function getSequelize(): any;
}


