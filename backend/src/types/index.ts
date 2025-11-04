/**
 * UNIFIED TYPE SYSTEM FOR BACKEND
 * Central export point cho tất cả types trong dự án
 * 
 * STRATEGY TO ELIMINATE 'as any':
 * 1. Use sequelize.d.ts for all model type extensions
 * 2. Use type-utilities.ts for safe type operations  
 * 3. Export unified types from model.types.ts
 */

// ===================================
// CORE TYPES
// ===================================
export * from './common.types';
export * from './error.d';
export * from './express.d';

// ===================================
// MODEL TYPES (unified, no duplicates)
// ===================================
export * from './model.types';

// ===================================
// SEQUELIZE ENHANCED TYPES
// ===================================
export type {
  // Base interfaces
  BaseModelAttributes,
  EnhancedModel,
  EnhancedModelStatic,
  
  // Model instances - avoid conflict with model.types
  UserModelInstance,
  UserModelStatic,
  CategoryModelInstance,
  CategoryModelStatic,
  LessonMaterialModelInstance,
  LessonMaterialModelStatic,
  NotificationModelInstance,
  NotificationModelStatic,
  ChatMessageModelInstance,
  ChatMessageModelStatic,
  LessonProgressModelInstance,
  LessonProgressModelStatic,
  PasswordResetTokenModelInstance,
  PasswordResetTokenModelStatic,
  NotificationRecipientModelInstance,
  NotificationRecipientModelStatic,
  SectionModelInstance,
  SectionModelStatic,
  LessonModelInstance,
  LessonModelStatic,
  
  // Type definitions
  TypedFindOptions,
  TypedUpdateOptions,
  TypedCreateOptions,
  TypedBulkCreateOptions,
  ConnectionPoolInfo,
  DatabaseConnection
} from './sequelize.d';

// Utilities (value exports)
export {
  isModelInstance,
  hasMethod,
  safeCallMethod,
  hasProperty,
  getProperty,
  addInstanceMethods,
  addStaticMethods,
  exportModel,
} from './sequelize.d';

// ===================================
// TYPE UTILITIES FOR SAFE OPERATIONS
// ===================================
export * from './type-utilities';

// ===================================
// RE-EXPORTS FOR CONVENIENCE
// ===================================
// User types from model.types (removing duplication)
export type {
  UserAttributes,
  UserCreationAttributes, 
  UserInstance
} from './model.types';