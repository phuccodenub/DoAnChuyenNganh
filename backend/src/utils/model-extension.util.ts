/**
 * Type-safe Model Extension Utilities
 * Thay thế việc sử dụng 'as any' khi thêm methods vào Sequelize models
 */

import { Model, ModelStatic } from 'sequelize';

// ===================================
// TYPE-SAFE MODEL EXTENSION HELPERS
// ===================================

/**
 * Type-safe helper để thêm instance methods vào Sequelize model
 */
export function addInstanceMethod<
  TModel extends ModelStatic<Model>,
  TMethodName extends string,
  TMethod extends (this: InstanceType<TModel>, ...args: any[]) => any
>(
  model: TModel,
  methodName: TMethodName,
  method: TMethod
): asserts model is TModel & {
  prototype: InstanceType<TModel> & Record<TMethodName, TMethod>
} {
  (model.prototype as any)[methodName] = method;
}

/**
 * Type-safe helper để thêm static methods vào Sequelize model
 */
export function addStaticMethod<
  TModel extends ModelStatic<Model>,
  TMethodName extends string,
  TMethod extends (this: TModel, ...args: any[]) => any
>(
  model: TModel,
  methodName: TMethodName,
  method: TMethod
): asserts model is TModel & Record<TMethodName, TMethod> {
  (model as any)[methodName] = method;
}

/**
 * Type-safe helper để thêm multiple instance methods
 */
export function addInstanceMethods<
  TModel extends ModelStatic<Model>,
  TMethods extends Record<string, (this: InstanceType<TModel>, ...args: any[]) => any>
>(
  model: TModel,
  methods: TMethods
): asserts model is TModel & {
  prototype: InstanceType<TModel> & TMethods
} {
  for (const [methodName, method] of Object.entries(methods)) {
    (model.prototype as any)[methodName] = method;
  }
}

/**
 * Type-safe helper để thêm multiple static methods
 */
export function addStaticMethods<
  TModel extends ModelStatic<Model>,
  TMethods extends Record<string, (this: TModel, ...args: any[]) => any>
>(
  model: TModel,
  methods: TMethods
): asserts model is TModel & TMethods {
  for (const [methodName, method] of Object.entries(methods)) {
    (model as any)[methodName] = method;
  }
}

// ===================================
// TYPE-SAFE EXPORT HELPER
// ===================================

/**
 * Type-safe helper để export model với proper typing
 * Thay thế cho việc export Model as any
 */
export function exportModel<
  TModel extends ModelStatic<Model>,
  TInstanceMethods = {},
  TStaticMethods = {}
>(
  model: TModel
): TModel & TStaticMethods & {
  prototype: InstanceType<TModel> & TInstanceMethods
} {
  return model as TModel & TStaticMethods & {
    prototype: InstanceType<TModel> & TInstanceMethods
  };
}

// ===================================
// SEQUELIZE MODEL UTILITIES
// ===================================

/**
 * Type-safe wrapper cho việc call static method trên model khác
 */
export function callStaticMethod<T = any>(
  model: any,
  methodName: string,
  ...args: any[]
): Promise<T> | T {
  if (model && typeof model[methodName] === 'function') {
    return model[methodName](...args);
  }
  throw new Error(`Method ${methodName} not found on model`);
}

/**
 * Type-safe helper để kiểm tra và gọi method trên model khác
 */
export function safeCallMethod<T = any>(
  model: any,
  methodName: string,
  ...args: any[]
): Promise<T | null> | T | null {
  try {
    if (model && typeof model[methodName] === 'function') {
      return model[methodName](...args);
    }
    return null;
  } catch (error) {
    console.warn(`Error calling method ${methodName}:`, error);
    return null;
  }
}

// ===================================
// TYPE GUARDS
// ===================================

/**
 * Type guard để kiểm tra instance method
 */
export function hasInstanceMethod<T extends Model, K extends string>(
  instance: T,
  methodName: K
): instance is T & Record<K, Function> {
  return instance != null && typeof (instance as any)[methodName] === 'function';
}

/**
 * Type guard để kiểm tra static method
 */
export function hasStaticMethod<T extends ModelStatic<Model>, K extends string>(
  model: T,
  methodName: K
): model is T & Record<K, Function> {
  return model != null && typeof (model as any)[methodName] === 'function';
}

// ===================================
// ASSOCIATION HELPERS
// ===================================

/**
 * Type-safe helper để access associations
 */
export function getAssociation<T = any>(
  model: ModelStatic<Model>,
  associationName: string
): T | null {
  const associations = (model as any).associations;
  return associations && associations[associationName] ? associations[associationName] : null;
}

/**
 * Type-safe helper để kiểm tra association có tồn tại không
 */
export function hasAssociation(
  model: ModelStatic<Model>,
  associationName: string
): boolean {
  const associations = (model as any).associations;
  return Boolean(associations && associations[associationName]);
}

// ===================================
// ATTRIBUTE HELPERS
// ===================================

/**
 * Type-safe helper để lấy model attributes
 */
export function getModelAttributes(model: ModelStatic<Model>): Record<string, any> {
  return (model as any).rawAttributes || {};
}

/**
 * Type-safe helper để kiểm tra attribute có tồn tại không
 */
export function hasAttribute(
  model: ModelStatic<Model>,
  attributeName: string
): boolean {
  const attributes = getModelAttributes(model);
  return attributeName in attributes;
}

// ===================================
// TRANSACTION HELPERS
// ===================================

/**
 * Type-safe wrapper cho transaction operations
 */
export async function withTransaction<T>(
  sequelize: any,
  callback: (transaction: any) => Promise<T>
): Promise<T> {
  const transaction = await sequelize.transaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ===================================
// VALIDATION HELPERS
// ===================================

/**
 * Type-safe validation helper
 */
export function validateInstance<T extends Model>(
  instance: T,
  options?: { skip?: string[] }
): Promise<void> {
  return (instance as any).validate(options);
}

/**
 * Type-safe helper để lấy validation errors
 */
export function getValidationErrors<T extends Model>(
  instance: T
): any[] {
  try {
    return (instance as any).validationErrors || [];
  } catch {
    return [];
  }
}