declare module 'sequelize' {
  export const Sequelize: any;
  export type Sequelize = any;
  export const DataTypes: any;
  export type Model = any;
  export type ModelCtor<T = any> = any;
}

declare module '../config/db' {
  export function getSequelize(): any;
}


