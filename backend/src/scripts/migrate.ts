#!/usr/bin/env node

/**
 * Migration CLI Tool
 * Command-line interface for managing database migrations
 */

import 'dotenv-flow/config';
import { Sequelize } from 'sequelize';
import { MigrationManager } from '../migrations/index';
import { SeederManager } from '../seeders/index';
import logger from '../utils/logger.util';

// Database configuration
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://lms_user:123456@localhost:5432/lms_db',
  {
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: true,
      paranoid: false
    },
    timezone: '+00:00'
  }
);

// CLI Commands
const commands = {
  migrate: 'Run all pending migrations',
  rollback: 'Rollback the last migration',
  rollbackAll: 'Rollback all migrations',
  status: 'Show migration status',
  seed: 'Run all pending seeders',
  seedRollback: 'Rollback the last seeder',
  seedRollbackAll: 'Rollback all seeders',
  seedStatus: 'Show seeder status',
  reset: 'Reset database (rollback all + migrate + seed)',
  help: 'Show help information'
};

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';

// Help function
function showHelp(): void {
  console.log('\n📊 Database Migration & Seeder CLI\n');
  console.log('Usage: npm run migrate <command>\n');
  console.log('Commands:');
  Object.entries(commands).forEach(([cmd, desc]) => {
    console.log(`  ${cmd.padEnd(20)} ${desc}`);
  });
  console.log('\nExamples:');
  console.log('  npm run migrate migrate      # Run all pending migrations');
  console.log('  npm run migrate rollback     # Rollback last migration');
  console.log('  npm run migrate seed         # Run all pending seeders');
  console.log('  npm run migrate reset        # Reset database completely');
  console.log('  npm run migrate status       # Show migration status');
  console.log('');
}

// Main execution function
async function main(): Promise<void> {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    const migrationManager = new MigrationManager(sequelize);
    const seederManager = new SeederManager(sequelize);

    switch (command) {
      case 'migrate':
        logger.info('Running migrations...');
        await migrationManager.migrate();
        logger.info('✅ Migrations completed successfully');
        break;

      case 'rollback':
        logger.info('Rolling back last migration...');
        await migrationManager.rollback();
        logger.info('✅ Rollback completed successfully');
        break;

      case 'rollbackAll':
        logger.info('Rolling back all migrations...');
        await migrationManager.rollbackAll();
        logger.info('✅ All migrations rolled back successfully');
        break;

      case 'status':
        const migrationStatus = await migrationManager.getStatus();
        console.log('\n📊 Migration Status:');
        console.log(`  Total: ${migrationStatus.total}`);
        console.log(`  Executed: ${migrationStatus.executed}`);
        console.log(`  Pending: ${migrationStatus.pending}`);
        console.log(`  Executed: ${migrationStatus.executedMigrations.join(', ') || 'None'}`);
        console.log(`  Pending: ${migrationStatus.pendingMigrations.join(', ') || 'None'}`);
        break;

      case 'seed':
        logger.info('Running seeders...');
        await seederManager.seed();
        logger.info('✅ Seeders completed successfully');
        break;

      case 'seedRollback':
        logger.info('Rolling back last seeder...');
        await seederManager.rollback();
        logger.info('✅ Seeder rollback completed successfully');
        break;

      case 'seedRollbackAll':
        logger.info('Rolling back all seeders...');
        await seederManager.rollbackAll();
        logger.info('✅ All seeders rolled back successfully');
        break;

      case 'seedStatus':
        const seederStatus = await seederManager.getStatus();
        console.log('\n🌱 Seeder Status:');
        console.log(`  Total: ${seederStatus.total}`);
        console.log(`  Executed: ${seederStatus.executed}`);
        console.log(`  Pending: ${seederStatus.pending}`);
        console.log(`  Executed: ${seederStatus.executedSeeders.join(', ') || 'None'}`);
        console.log(`  Pending: ${seederStatus.pendingSeeders.join(', ') || 'None'}`);
        break;

      case 'reset':
        logger.info('Resetting database...');
        logger.info('Step 1: Rolling back all migrations...');
        await migrationManager.rollbackAll();
        logger.info('Step 2: Running migrations...');
        await migrationManager.migrate();
        logger.info('Step 3: Running seeders...');
        await seederManager.seed();
        logger.info('✅ Database reset completed successfully');
        break;

      case 'help':
      default:
        showHelp();
        break;
    }

  } catch (error: unknown) {
    logger.error('Migration/Seeder operation failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

