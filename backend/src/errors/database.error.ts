/**
 * Database Error Class
 * For database-related errors
 */

import { BaseError, BaseErrorOptions } from './base.error';
import { ErrorCode, HttpStatusCode, ErrorType, ErrorSeverity } from './error.constants';

export interface DatabaseErrorOptions extends BaseErrorOptions {
  table?: string;
  column?: string;
  constraint?: string;
  query?: string;
  operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  recordId?: string;
  foreignKey?: string;
  referencedTable?: string;
}

export class DatabaseError extends BaseError {
  public readonly table?: string;
  public readonly column?: string;
  public readonly constraint?: string;
  public readonly query?: string;
  public readonly operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  public readonly recordId?: string;
  public readonly foreignKey?: string;
  public readonly referencedTable?: string;

  constructor(options: DatabaseErrorOptions = {}) {
    const {
      code = 'DATABASE_QUERY_FAILED',
      statusCode = 500,
      type = 'DATABASE',
      severity = 'HIGH',
      table,
      column,
      constraint,
      query,
      operation,
      recordId,
      foreignKey,
      referencedTable,
      ...baseOptions
    } = options;

    super({
      code,
      statusCode,
      type,
      severity,
      ...baseOptions
    });

    this.table = table;
    this.column = column;
    this.constraint = constraint;
    this.query = query;
    this.operation = operation;
    this.recordId = recordId;
    this.foreignKey = foreignKey;
    this.referencedTable = referencedTable;

    // Add database-specific context
    if (table) this.addContext('table', table);
    if (column) this.addContext('column', column);
    if (constraint) this.addContext('constraint', constraint);
    if (query) this.addContext('query', query);
    if (operation) this.addContext('operation', operation);
    if (recordId) this.addContext('recordId', recordId);
    if (foreignKey) this.addContext('foreignKey', foreignKey);
    if (referencedTable) this.addContext('referencedTable', referencedTable);
  }

  /**
   * Create connection failed error
   */
  static connectionFailed(details?: Record<string, any>): DatabaseError {
    return new DatabaseError({
      code: 'DATABASE_CONNECTION_FAILED',
      message: 'Database connection failed',
      statusCode: 503,
      type: 'DATABASE',
      severity: 'CRITICAL',
      details
    });
  }

  /**
   * Create query failed error
   */
  static queryFailed(
    query?: string,
    operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    details?: Record<string, any>
  ): DatabaseError {
    return new DatabaseError({
      code: 'DATABASE_QUERY_FAILED',
      message: 'Database query failed',
      statusCode: 500,
      type: 'DATABASE',
      severity: 'HIGH',
      query,
      operation,
      details
    });
  }

  /**
   * Create constraint violation error
   */
  static constraintViolation(
    constraint: string,
    table?: string,
    column?: string,
    details?: Record<string, any>
  ): DatabaseError {
    return new DatabaseError({
      code: 'DATABASE_CONSTRAINT_VIOLATION',
      message: `Database constraint violation: ${constraint}`,
      statusCode: 400,
      type: 'DATABASE',
      severity: 'MEDIUM',
      constraint,
      table,
      column,
      details
    });
  }

  /**
   * Create record not found error
   */
  static recordNotFound(
    table: string,
    recordId?: string,
    details?: Record<string, any>
  ): DatabaseError {
    return new DatabaseError({
      code: 'DATABASE_RECORD_NOT_FOUND',
      message: `Record not found in table: ${table}`,
      statusCode: 404,
      type: 'DATABASE',
      severity: 'MEDIUM',
      table,
      recordId,
      details
    });
  }

  /**
   * Create duplicate entry error
   */
  static duplicateEntry(
    table: string,
    column: string,
    value: any,
    details?: Record<string, any>
  ): DatabaseError {
    return new DatabaseError({
      code: 'DATABASE_DUPLICATE_ENTRY',
      message: `Duplicate entry in table: ${table}, column: ${column}`,
      statusCode: 409,
      type: 'DATABASE',
      severity: 'MEDIUM',
      table,
      column,
      details: { ...details, value }
    });
  }

  /**
   * Create foreign key violation error
   */
  static foreignKeyViolation(
    foreignKey: string,
    referencedTable: string,
    table?: string,
    details?: Record<string, any>
  ): DatabaseError {
    return new DatabaseError({
      code: 'DATABASE_FOREIGN_KEY_VIOLATION',
      message: `Foreign key constraint violation: ${foreignKey} -> ${referencedTable}`,
      statusCode: 400,
      type: 'DATABASE',
      severity: 'MEDIUM',
      foreignKey,
      referencedTable,
      table,
      details
    });
  }

  /**
   * Create from Sequelize error
   */
  static fromSequelizeError(sequelizeError: any): DatabaseError {
    const { name, message, table, column, constraint, query } = sequelizeError;

    switch (name) {
      case 'SequelizeValidationError':
        return new DatabaseError({
          code: 'DATABASE_CONSTRAINT_VIOLATION',
          message: 'Database validation error',
          statusCode: 400,
          type: 'DATABASE',
          severity: 'MEDIUM',
          table,
          column,
          constraint,
          details: { originalError: message }
        });

      case 'SequelizeUniqueConstraintError':
        return new DatabaseError({
          code: 'DATABASE_DUPLICATE_ENTRY',
          message: 'Duplicate entry',
          statusCode: 409,
          type: 'DATABASE',
          severity: 'MEDIUM',
          table,
          column,
          constraint,
          details: { originalError: message }
        });

      case 'SequelizeForeignKeyConstraintError':
        return new DatabaseError({
          code: 'DATABASE_FOREIGN_KEY_VIOLATION',
          message: 'Foreign key constraint violation',
          statusCode: 400,
          type: 'DATABASE',
          severity: 'MEDIUM',
          table,
          column,
          constraint,
          details: { originalError: message }
        });

      case 'SequelizeDatabaseError':
        return new DatabaseError({
          code: 'DATABASE_QUERY_FAILED',
          message: 'Database query failed',
          statusCode: 500,
          type: 'DATABASE',
          severity: 'HIGH',
          query,
          details: { originalError: message }
        });

      default:
        return new DatabaseError({
          code: 'DATABASE_QUERY_FAILED',
          message: 'Database error',
          statusCode: 500,
          type: 'DATABASE',
          severity: 'HIGH',
          details: { originalError: message, errorName: name }
        });
    }
  }

  /**
   * Convert to JSON with database-specific fields
   */
  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      table: this.table,
      column: this.column,
      constraint: this.constraint,
      query: this.query,
      operation: this.operation,
      recordId: this.recordId,
      foreignKey: this.foreignKey,
      referencedTable: this.referencedTable
    };
  }
}
