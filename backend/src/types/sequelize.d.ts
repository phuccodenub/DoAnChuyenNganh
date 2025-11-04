/**
 * UNIFIED SEQUELIZE TYPE SYSTEM
 * Central type definitions để loại bỏ 'as any' trong toàn bộ dự án
 * 
 * STRATEGY:
 * 1. Define proper interfaces cho mỗi model
 * 2. Tạo type-safe utilities
 * 3. Export typed models thay vì 'as any'
 */

import { Model, CreationOptional, InferAttributes, InferCreationAttributes, Transaction } from 'sequelize';
import type { ModelStatic, Optional, WhereOptions, Attributes, CreationAttributes, BulkCreateOptions } from './sequelize-types';

// Base model interface với common fields
export interface BaseModelAttributes {
  id: string;
  created_at: Date;
  updated_at: Date;
}

// Enhanced model interface
export interface EnhancedModel<TModelAttributes extends BaseModelAttributes> 
  extends Model<TModelAttributes, Optional<TModelAttributes, 'id' | 'created_at' | 'updated_at'>> {
  
  // Common instance methods
  toJSON(): TModelAttributes;
  reload(): Promise<this>;
  save(): Promise<this>;
  destroy(): Promise<void>;
  
  // Type-safe attribute access
  get<K extends keyof TModelAttributes>(key: K): TModelAttributes[K];
  set<K extends keyof TModelAttributes>(key: K, value: TModelAttributes[K]): this;
  
  // Readonly timestamps
  readonly created_at: CreationOptional<Date>;
  readonly updated_at: CreationOptional<Date>;
}

// Enhanced static model interface
export interface EnhancedModelStatic<TModel extends EnhancedModel<any>> extends ModelStatic<TModel> {
  // Common static methods với type safety
  findByPk(id: string): Promise<TModel | null>;
  findOne(options?: any): Promise<TModel | null>;
  findAll(options?: any): Promise<TModel[]>;
  create(values: any): Promise<TModel>;
  update(values: any, options: any): Promise<[number, TModel[]]>;
  destroy(options: any): Promise<number>;
  count(options?: any): Promise<number>;
}

// Specific model interfaces with proper typing

// User Model
export interface UserModelInstance extends EnhancedModel<import('./model.types').UserAttributes> {
  // Instance methods
  checkPassword(password: string): Promise<boolean>;
  generateTokens(): Promise<{ accessToken: string; refreshToken: string }>;
  getProfile(): Omit<import('./model.types').UserAttributes, 'password_hash' | 'token_version'>;
  hasRole(role: string): boolean;
  isActive(): boolean;
  incrementTokenVersion(): Promise<this>;
  
  // Associations
  getEnrollments?(): Promise<any[]>;
  getCourses?(): Promise<any[]>;
}

export interface UserModelStatic extends EnhancedModelStatic<UserModelInstance> {
  // Static methods
  findByEmail(email: string): Promise<UserModelInstance | null>;
  findByCredentials(email: string, password: string): Promise<UserModelInstance | null>;
  createWithProfile(userData: any): Promise<UserModelInstance>;
}

// Category Model
export interface CategoryModelInstance extends EnhancedModel<import('./model.types').CategoryAttributes> {
  // Instance methods
  isRootCategory(): boolean;
  getChildren(): Promise<CategoryModelInstance[]>;
  getParent(): Promise<CategoryModelInstance | null>;
  updateCourseCount(): Promise<number>;
}

export interface CategoryModelStatic extends EnhancedModelStatic<CategoryModelInstance> {
  // Static methods
  findActiveCategories(includeSubcategories?: boolean): Promise<CategoryModelInstance[]>;
  findBySlug(slug: string): Promise<CategoryModelInstance | null>;
  getRootCategories(): Promise<CategoryModelInstance[]>;
  getHierarchy(): Promise<CategoryModelInstance[]>;
}

// Lesson Material Model
export interface LessonMaterialModelInstance extends EnhancedModel<import('./model.types').LessonMaterialAttributes> {
  // Instance methods
  getFormattedSize(): string;
  incrementDownloadCount(): Promise<number>;
  isDownloadable(): boolean;
}

export interface LessonMaterialModelStatic extends EnhancedModelStatic<LessonMaterialModelInstance> {
  // Static methods
  findByLesson(lessonId: string): Promise<LessonMaterialModelInstance[]>;
  getTotalSizeByLesson(lessonId: string): Promise<number>;
  findDownloadableMaterials(lessonId: string): Promise<LessonMaterialModelInstance[]>;
}

// Notification Model
export interface NotificationModelInstance extends EnhancedModel<import('./model.types').NotificationAttributes> {
  // Instance methods
  isExpired(): boolean;
  canBeSeenBy(userId: string, userRole: string): Promise<boolean>;
  markAsRead(userId: string): Promise<void>;
  getRecipients(): Promise<any[]>;
}

export interface NotificationModelStatic extends EnhancedModelStatic<NotificationModelInstance> {
  // Static methods
  findActiveNotifications(): Promise<NotificationModelInstance[]>;
  findForUser(userId: string, options?: any): Promise<NotificationModelInstance[]>;
  createForUsers(notificationData: any, userIds: string[]): Promise<NotificationModelInstance>;
  broadcast(notificationData: any, targetAudience?: string): Promise<NotificationModelInstance>;
}

// Chat Message Model
export interface ChatMessageModelInstance extends EnhancedModel<import('./model.types').ChatMessageAttributes> {
  // Instance methods
  isEdited(): boolean;
  isDeleted(): boolean;
  canBeEditedBy(userId: string): boolean;
  canBeDeletedBy(userId: string): boolean;
  getReplyChain(): Promise<ChatMessageModelInstance[]>;
}

export interface ChatMessageModelStatic extends EnhancedModelStatic<ChatMessageModelInstance> {
  // Static methods
  findByCourse(courseId: string, options?: any): Promise<ChatMessageModelInstance[]>;
  findReplies(messageId: string): Promise<ChatMessageModelInstance[]>;
  search(courseId: string, query: string): Promise<ChatMessageModelInstance[]>;
}

// Lesson Progress Model  
export interface LessonProgressModelInstance extends EnhancedModel<import('./model.types').LessonProgressAttributes> {
  // Instance methods
  isCompleted(): boolean;
  updateProgress(percentage: number, timeSpent?: number): Promise<this>;
  markAsCompleted(): Promise<this>;
}

export interface LessonProgressModelStatic extends EnhancedModelStatic<LessonProgressModelInstance> {
  // Static methods
  findByUser(userId: string, courseId?: string): Promise<LessonProgressModelInstance[]>;
  getProgressSummary(userId: string, courseId: string): Promise<any>;
  findOrCreateProgress(userId: string, lessonId: string): Promise<LessonProgressModelInstance>;
}

// Password Reset Token Model
export interface PasswordResetTokenModelInstance extends EnhancedModel<import('./model.types').PasswordResetTokenAttributes> {
  // Instance methods
  isExpired(): boolean;
  isUsed(): boolean;
  markAsUsed(): Promise<this>;
  isValid(): boolean;
}

export interface PasswordResetTokenModelStatic extends EnhancedModelStatic<PasswordResetTokenModelInstance> {
  // Static methods
  findValidToken(token: string): Promise<PasswordResetTokenModelInstance | null>;
  createForUser(userId: string, ipAddress?: string, userAgent?: string): Promise<PasswordResetTokenModelInstance>;
  cleanupExpiredTokens(): Promise<number>;
}

// Notification Recipient Model
export interface NotificationRecipientModelInstance extends EnhancedModel<import('./model.types').NotificationRecipientAttributes> {
  // Instance methods
  markAsRead(): Promise<this>;
  markAsUnread(): Promise<this>;
  archive(): Promise<this>;
  dismiss(): Promise<this>;
  trackClick(): Promise<this>;
  isRead(): boolean;
}

export interface NotificationRecipientModelStatic extends EnhancedModelStatic<NotificationRecipientModelInstance> {
  // Static methods
  findUnreadForUser(userId: string): Promise<NotificationRecipientModelInstance[]>;
  markAllAsReadForUser(userId: string): Promise<number>;
  getReadStatus(notificationId: string, userId: string): Promise<NotificationRecipientModelInstance | null>;
  getUserNotifications(userId: string, options?: {
    includeRead?: boolean;
    includeArchived?: boolean;
    limit?: number;
    offset?: number;
    category?: string;
  }): Promise<NotificationRecipientModelInstance[]>;
  createBatch(notificationId: string, recipients: Array<{user_id: string, role?: string}>): Promise<NotificationRecipientModelInstance[]>;
  getUnreadCountForUser(userId: string): Promise<number>;
  getUnreadCount(userId: string): Promise<number>;
  markAllAsRead(userId: string): Promise<void>;
  deleteByNotification(notificationId: string): Promise<number>;
  archiveOldNotifications(userId: string, daysOld?: number): Promise<[number]>;
  getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    read: number;
    archived: number;
    active: number;
  }>;
}

// Section Model
export interface SectionModelInstance extends EnhancedModel<import('./model.types').SectionAttributes> {
  // Instance methods
  getLessonCount(): Promise<number>;
  getCompletionRate(userId: string): Promise<number>;
  canUserAccess(userId: string): Promise<boolean>;
}

export interface SectionModelStatic extends EnhancedModelStatic<SectionModelInstance> {
  // Static methods
  findByCourse(courseId: string, includeUnpublished?: boolean): Promise<SectionModelInstance[]>;
  reorderSections(courseId: string, sectionOrders: { id: string, order_index: number }[]): Promise<boolean>;
  getProgress(userId: string, courseId: string): Promise<any[]>;
}

// Lesson Model
export interface LessonModelInstance extends EnhancedModel<import('./model.types').LessonAttributes> {
  // Instance methods
  getMaterialCount(): Promise<number>;
  getCompletionRate(): Promise<number>;
  canUserAccess(userId: string): Promise<boolean>;
  trackProgress(userId: string, progressPercentage: number): Promise<void>;
}

export interface LessonModelStatic extends EnhancedModelStatic<LessonModelInstance> {
  // Static methods
  findBySection(sectionId: string, includeUnpublished?: boolean): Promise<LessonModelInstance[]>;
  reorderLessons(sectionId: string, lessonOrders: { id: string, order_index: number }[]): Promise<boolean>;
  getCompletedLessons(userId: string, courseId: string): Promise<LessonModelInstance[]>;
  calculateCourseProgress(userId: string, courseId: string): Promise<number>;
}

// Generic type helpers
export type ModelInstance<T> = T extends EnhancedModel<infer U> ? T : never;
export type ModelAttributes<T> = T extends EnhancedModel<infer U> ? U : never;
export type ModelStatic<T> = T extends EnhancedModel<any> ? EnhancedModelStatic<T> : never;

// Connection pool type (for health service)
export interface ConnectionPoolInfo {
  size: number;
  available: number;
  used: number;
  waiting: number;
}

// Database connection with pool access
export interface DatabaseConnection {
  connectionManager: {
    pool: ConnectionPoolInfo;
  };
}

// ===================================
// TYPE UTILITIES & HELPERS
// ===================================

// Type guard để check model instance
export function isModelInstance<T extends EnhancedModel<any>>(
  obj: unknown,
  modelClass: EnhancedModelStatic<T>
): obj is T {
  return obj instanceof modelClass;
}

// Safe method caller thay thế 'as any'
export function hasMethod<T, K extends string>(
  obj: T,
  methodName: K
): obj is T & Record<K, Function> {
  return obj != null && typeof obj === 'object' && methodName in obj && typeof (obj as any)[methodName] === 'function';
}

export async function safeCallMethod<T, K extends string, R = any>(
  obj: T,
  methodName: K,
  ...args: any[]
): Promise<R | null> {
  if (hasMethod(obj, methodName)) {
    return await obj[methodName](...args);
  }
  return null;
}

// Type-safe property access
export function hasProperty<T, K extends string>(
  obj: T,
  propertyName: K
): obj is T & Record<K, unknown> {
  return obj != null && typeof obj === 'object' && propertyName in obj;
}

export function getProperty<T, K extends string, R = unknown>(
  obj: T,
  propertyName: K,
  defaultValue?: R
): R | undefined {
  if (hasProperty(obj, propertyName)) {
    return obj[propertyName] as R;
  }
  return defaultValue;
}

// ===================================
// MODEL EXTENSION UTILITIES
// ===================================

/**
 * Type-safe way để thêm instance methods vào Sequelize model
 */
export function addInstanceMethods<T extends ModelStatic<any>, M extends Record<string, Function>>(
  model: T,
  methods: M
): void {
  Object.keys(methods).forEach(methodName => {
    model.prototype[methodName] = methods[methodName];
  });
}

/**
 * Type-safe way để thêm static methods vào Sequelize model
 */
export function addStaticMethods<T extends ModelStatic<any>, M extends Record<string, Function>>(
  model: T,
  methods: M
): void {
  Object.keys(methods).forEach(methodName => {
    (model as any)[methodName] = methods[methodName];
  });
}

/**
 * Export model với proper typing thay vì 'as any'
 */
export function exportModel<
  TModel extends ModelStatic<any>,
  TInstanceMethods extends Record<string, Function>,
  TStaticMethods extends Record<string, Function>
>(model: TModel): TModel & TStaticMethods & {
  prototype: InstanceType<TModel> & TInstanceMethods;
} {
  return model as TModel & TStaticMethods & {
    prototype: InstanceType<TModel> & TInstanceMethods;
  };
}

// ===================================
// SEQUELIZE OPERATION TYPES
// ===================================

export interface TypedFindOptions<TAttributes = any> {
  where?: Partial<TAttributes>;
  include?: any[];
  order?: any[];
  limit?: number;
  offset?: number;
  attributes?: (keyof TAttributes)[] | { include?: (keyof TAttributes)[]; exclude?: (keyof TAttributes)[] };
  transaction?: Transaction;
}

export interface TypedUpdateOptions<TAttributes = any> {
  where: Partial<TAttributes>;
  transaction?: Transaction;
  returning?: boolean;
}

export interface TypedCreateOptions {
  transaction?: Transaction;
  returning?: boolean;
  validate?: boolean;
}

export interface TypedBulkCreateOptions extends TypedCreateOptions {
  ignoreDuplicates?: boolean;
  updateOnDuplicate?: string[];
}