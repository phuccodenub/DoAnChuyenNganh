/**
 * Seeders Index
 * Centralized seeder management
 */

import { Sequelize } from 'sequelize';
import logger from '../utils/logger.util';
import { hashUtils } from '../utils/hash.util';

// Import seeder functions
import { seedUsers } from './001-seed-users';
import { seedCategories } from './001a-seed-categories';
import { seedCourses } from './002-seed-courses';
import { seedEnrollments } from './003-seed-enrollments';
import { seedChatMessages } from './004-seed-chat-messages';

// Seeder interface
export interface Seeder {
  up: (sequelize: Sequelize) => Promise<void>;
  down: (sequelize: Sequelize) => Promise<void>;
  version: string;
  description: string;
}

// Seeder registry
export const seeders: Seeder[] = [
  {
    version: '001',
    description: 'Seed users',
    up: seedUsers,
    down: async (sequelize: Sequelize) => {
      await sequelize.query('DELETE FROM users WHERE email LIKE \'%@example.com\'');
    }
  },
  {
    version: '001a',
    description: 'Seed categories',
    up: seedCategories,
    down: async (sequelize: Sequelize) => {
      await sequelize.query("DELETE FROM categories WHERE id in ('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000101','10000000-0000-0000-0000-000000000102','10000000-0000-0000-0000-000000000103','10000000-0000-0000-0000-000000000201','10000000-0000-0000-0000-000000000301')");
    }
  },
  {
    version: '002',
    description: 'Seed courses',
    up: seedCourses,
    down: async (sequelize: Sequelize) => {
      await sequelize.query('DELETE FROM courses WHERE title LIKE \'Sample Course%\'');
    }
  },
  {
    version: '003',
    description: 'Seed enrollments',
    up: seedEnrollments,
    down: async (sequelize: Sequelize) => {
      await sequelize.query('DELETE FROM enrollments WHERE id IN (SELECT id FROM enrollments LIMIT 50)');
    }
  },
  {
    version: '004',
    description: 'Seed chat messages',
    up: seedChatMessages,
    down: async (sequelize: Sequelize) => {
      await sequelize.query('DELETE FROM chat_messages WHERE content LIKE \'Sample message%\'');
    }
  }
];

// Seeder management class
export class SeederManager {
  private sequelize: Sequelize;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
  }

  /**
   * Initialize seeder tracking table
   */
  async initialize(): Promise<void> {
    const queryInterface = this.sequelize.getQueryInterface();
    
    try {
      await queryInterface.createTable('seeders', {
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

      logger.info('Seeder tracking table created');
    } catch (error: unknown) {
      // Table might already exist
      logger.info('Seeder tracking table already exists');
    }
  }

  /**
   * Get executed seeders
   */
  async getExecutedSeeders(): Promise<string[]> {
    try {
      const [results] = await this.sequelize.query(
        'SELECT version FROM seeders ORDER BY version'
      );
      return (results as any[]).map(row => row.version);
    } catch (error: unknown) {
      logger.error('Error getting executed seeders:', error);
      return [];
    }
  }

  /**
   * Mark seeder as executed
   */
  async markSeederExecuted(version: string, description: string): Promise<void> {
    await this.sequelize.query(
      'INSERT INTO seeders (version, description, executed_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      {
        replacements: [version, description]
      }
    );
  }

  /**
   * Remove seeder from executed list
   */
  async unmarkSeederExecuted(version: string): Promise<void> {
    await this.sequelize.query(
      'DELETE FROM seeders WHERE version = ?',
      {
        replacements: [version]
      }
    );
  }

  /**
   * Run all pending seeders
   */
  async seed(): Promise<void> {
    await this.initialize();
    
    const executedSeeders = await this.getExecutedSeeders();
    const pendingSeeders = seeders.filter(
      seeder => !executedSeeders.includes(seeder.version)
    );

    if (pendingSeeders.length === 0) {
      logger.info('No pending seeders');
      return;
    }

    logger.info(`Running ${pendingSeeders.length} pending seeders`);

    for (const seeder of pendingSeeders) {
      try {
        logger.info(`Running seeder ${seeder.version}: ${seeder.description}`);
        
        await seeder.up(this.sequelize);
        await this.markSeederExecuted(seeder.version, seeder.description);
        
        logger.info(`Seeder ${seeder.version} completed successfully`);
      } catch (error: unknown) {
        logger.error(`Seeder ${seeder.version} failed:`, error);
        throw error;
      }
    }

    logger.info('All seeders completed successfully');
  }

  /**
   * Rollback last seeder
   */
  async rollback(): Promise<void> {
    const executedSeeders = await this.getExecutedSeeders();
    
    if (executedSeeders.length === 0) {
      logger.info('No seeders to rollback');
      return;
    }

    const lastSeederVersion = executedSeeders[executedSeeders.length - 1];
    const seeder = seeders.find(s => s.version === lastSeederVersion);

    if (!seeder) {
      logger.error(`Seeder ${lastSeederVersion} not found`);
      return;
    }

    try {
      logger.info(`Rolling back seeder ${seeder.version}: ${seeder.description}`);
      
      await seeder.down(this.sequelize);
      await this.unmarkSeederExecuted(seeder.version);
      
      logger.info(`Seeder ${seeder.version} rolled back successfully`);
    } catch (error: unknown) {
      logger.error(`Rollback of seeder ${seeder.version} failed:`, error);
      throw error;
    }
  }

  /**
   * Rollback all seeders
   */
  async rollbackAll(): Promise<void> {
    const executedSeeders = await this.getExecutedSeeders();
    
    if (executedSeeders.length === 0) {
      logger.info('No seeders to rollback');
      return;
    }

    logger.info(`Rolling back ${executedSeeders.length} seeders`);

    // Rollback in reverse order
    for (let i = executedSeeders.length - 1; i >= 0; i--) {
      const version = executedSeeders[i];
      const seeder = seeders.find(s => s.version === version);

      if (!seeder) {
        logger.error(`Seeder ${version} not found`);
        continue;
      }

      try {
        logger.info(`Rolling back seeder ${seeder.version}: ${seeder.description}`);
        
        await seeder.down(this.sequelize);
        await this.unmarkSeederExecuted(seeder.version);
        
        logger.info(`Seeder ${seeder.version} rolled back successfully`);
      } catch (error: unknown) {
        logger.error(`Rollback of seeder ${seeder.version} failed:`, error);
        throw error;
      }
    }

    logger.info('All seeders rolled back successfully');
  }

  /**
   * Get seeder status
   */
  async getStatus(): Promise<{
    total: number;
    executed: number;
    pending: number;
    executedSeeders: string[];
    pendingSeeders: string[];
  }> {
    const executedSeeders = await this.getExecutedSeeders();
    const pendingSeeders = seeders
      .filter(seeder => !executedSeeders.includes(seeder.version))
      .map(seeder => seeder.version);

    return {
      total: seeders.length,
      executed: executedSeeders.length,
      pending: pendingSeeders.length,
      executedSeeders,
      pendingSeeders
    };
  }
}

