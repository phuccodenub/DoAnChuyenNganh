/**
 * Migrations Index
 * Centralized migration management
 */

import { Sequelize, QueryInterface } from 'sequelize';
import logger from '../utils/logger.util';

// Import migration files
import { createUsersTable } from './001-create-users-table';
import { createCoursesTable } from './002-create-courses-table';
import { createEnrollmentsTable } from './003-create-enrollments-table';
import { createChatMessagesTable } from './004-create-chat-messages-table';
import { addIndexesToUsersTable } from './005-add-indexes-to-users-table';
import { addIndexesToCoursesTable } from './006-add-indexes-to-courses-table';
import { addIndexesToEnrollmentsTable } from './007-add-indexes-to-enrollments-table';
import { addIndexesToChatMessagesTable } from './008-add-indexes-to-chat-messages-table';
import { createExtendedLmsTables, dropExtendedLmsTables } from './009-create-extended-lms-tables';

// Migration interface
export interface Migration {
  up: (queryInterface: QueryInterface) => Promise<void>;
  down: (queryInterface: QueryInterface) => Promise<void>;
  version: string;
  description: string;
}

// Migration registry
export const migrations: Migration[] = [
  {
    version: '001',
    description: 'Create users table',
    up: createUsersTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.dropTable('users');
    }
  },
  {
    version: '002',
    description: 'Create courses table',
    up: createCoursesTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.dropTable('courses');
    }
  },
  {
    version: '003',
    description: 'Create enrollments table',
    up: createEnrollmentsTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.dropTable('enrollments');
    }
  },
  {
    version: '004',
    description: 'Create chat messages table',
    up: createChatMessagesTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.dropTable('chat_messages');
    }
  },
  {
    version: '005',
    description: 'Add indexes to users table',
    up: addIndexesToUsersTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.removeIndex('users', 'idx_users_email');
      await queryInterface.removeIndex('users', 'idx_users_username');
      await queryInterface.removeIndex('users', 'idx_users_phone');
      await queryInterface.removeIndex('users', 'idx_users_role');
      await queryInterface.removeIndex('users', 'idx_users_status');
    }
  },
  {
    version: '006',
    description: 'Add indexes to courses table',
    up: addIndexesToCoursesTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.removeIndex('courses', 'idx_courses_instructor_id');
      await queryInterface.removeIndex('courses', 'idx_courses_status');
      await queryInterface.removeIndex('courses', 'idx_courses_category');
    }
  },
  {
    version: '007',
    description: 'Add indexes to enrollments table',
    up: addIndexesToEnrollmentsTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.removeIndex('enrollments', 'idx_enrollments_user_id');
      await queryInterface.removeIndex('enrollments', 'idx_enrollments_course_id');
      await queryInterface.removeIndex('enrollments', 'idx_enrollments_status');
    }
  },
  {
    version: '008',
    description: 'Add indexes to chat messages table',
    up: addIndexesToChatMessagesTable,
    down: async (queryInterface: QueryInterface) => {
      await queryInterface.removeIndex('chat_messages', 'idx_chat_messages_course_id');
      await queryInterface.removeIndex('chat_messages', 'idx_chat_messages_user_id');
      await queryInterface.removeIndex('chat_messages', 'idx_chat_messages_created_at');
    }
  }
  ,
  {
    version: '009',
    description: 'Create extended LMS tables and alter existing ones',
    up: createExtendedLmsTables,
    down: dropExtendedLmsTables
  }
];

// Migration management class
export class MigrationManager {
  private sequelize: Sequelize;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
  }

  /**
   * Initialize migration tracking table
   */
  async initialize(): Promise<void> {
    const queryInterface = this.sequelize.getQueryInterface();
    
    try {
      await queryInterface.createTable('migrations', {
        id: {
          type: 'INTEGER',
          primaryKey: true,
          autoIncrement: true
        },
        version: {
          type: 'VARCHAR(10)',
          allowNull: false,
          unique: true
        },
        description: {
          type: 'TEXT',
          allowNull: false
        },
        executed_at: {
          type: 'TIMESTAMP',
          allowNull: false,
          defaultValue: this.sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      logger.info('Migration tracking table created');
    } catch (error: unknown) {
      // Table might already exist
      logger.info('Migration tracking table already exists');
    }
  }

  /**
   * Get executed migrations
   */
  async getExecutedMigrations(): Promise<string[]> {
    try {
      const [results] = await this.sequelize.query(
        'SELECT version FROM migrations ORDER BY version'
      );
      return (results as any[]).map(row => row.version);
    } catch (error: unknown) {
      logger.error('Error getting executed migrations:', error);
      return [];
    }
  }

  /**
   * Mark migration as executed
   */
  async markMigrationExecuted(version: string, description: string): Promise<void> {
    await this.sequelize.query(
      'INSERT INTO migrations (version, description, executed_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      {
        replacements: [version, description]
      }
    );
  }

  /**
   * Remove migration from executed list
   */
  async unmarkMigrationExecuted(version: string): Promise<void> {
    await this.sequelize.query(
      'DELETE FROM migrations WHERE version = ?',
      {
        replacements: [version]
      }
    );
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<void> {
    await this.initialize();
    
    const executedMigrations = await this.getExecutedMigrations();
    const pendingMigrations = migrations.filter(
      migration => !executedMigrations.includes(migration.version)
    );

    if (pendingMigrations.length === 0) {
      logger.info('No pending migrations');
      return;
    }

    logger.info(`Running ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      try {
        logger.info(`Running migration ${migration.version}: ${migration.description}`);
        
        await migration.up(this.sequelize.getQueryInterface());
        await this.markMigrationExecuted(migration.version, migration.description);
        
        logger.info(`Migration ${migration.version} completed successfully`);
      } catch (error: unknown) {
        logger.error(`Migration ${migration.version} failed:`, error);
        throw error;
      }
    }

    logger.info('All migrations completed successfully');
  }

  /**
   * Rollback last migration
   */
  async rollback(): Promise<void> {
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      logger.info('No migrations to rollback');
      return;
    }

    const lastMigrationVersion = executedMigrations[executedMigrations.length - 1];
    const migration = migrations.find(m => m.version === lastMigrationVersion);

    if (!migration) {
      logger.error(`Migration ${lastMigrationVersion} not found`);
      return;
    }

    try {
      logger.info(`Rolling back migration ${migration.version}: ${migration.description}`);
      
      await migration.down(this.sequelize.getQueryInterface());
      await this.unmarkMigrationExecuted(migration.version);
      
      logger.info(`Migration ${migration.version} rolled back successfully`);
    } catch (error: unknown) {
      logger.error(`Rollback of migration ${migration.version} failed:`, error);
      throw error;
    }
  }

  /**
   * Rollback all migrations
   */
  async rollbackAll(): Promise<void> {
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      logger.info('No migrations to rollback');
      return;
    }

    logger.info(`Rolling back ${executedMigrations.length} migrations`);

    // Rollback in reverse order
    for (let i = executedMigrations.length - 1; i >= 0; i--) {
      const version = executedMigrations[i];
      const migration = migrations.find(m => m.version === version);

      if (!migration) {
        logger.error(`Migration ${version} not found`);
        continue;
      }

      try {
        logger.info(`Rolling back migration ${migration.version}: ${migration.description}`);
        
        await migration.down(this.sequelize.getQueryInterface());
        await this.unmarkMigrationExecuted(migration.version);
        
        logger.info(`Migration ${migration.version} rolled back successfully`);
      } catch (error: unknown) {
        logger.error(`Rollback of migration ${migration.version} failed:`, error);
        throw error;
      }
    }

    logger.info('All migrations rolled back successfully');
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<{
    total: number;
    executed: number;
    pending: number;
    executedMigrations: string[];
    pendingMigrations: string[];
  }> {
    const executedMigrations = await this.getExecutedMigrations();
    const pendingMigrations = migrations
      .filter(migration => !executedMigrations.includes(migration.version))
      .map(migration => migration.version);

    return {
      total: migrations.length,
      executed: executedMigrations.length,
      pending: pendingMigrations.length,
      executedMigrations,
      pendingMigrations
    };
  }
}

