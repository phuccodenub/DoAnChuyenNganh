import { QueryInterface, DataTypes } from 'sequelize';
import logger from '../utils/logger.util';

async function addIndexSafe(
  queryInterface: QueryInterface,
  tableName: string,
  fields: string[],
  options?: { name?: string; unique?: boolean }
): Promise<void> {
  try {
    await queryInterface.addIndex(tableName, fields, options);
  } catch (error) {
    logger.info('Index may already exist, skipping', { tableName, fields, options, error });
  }
}

async function removeIndexSafe(queryInterface: QueryInterface, tableName: string, indexName: string): Promise<void> {
  try {
    await queryInterface.removeIndex(tableName, indexName);
  } catch (error) {
    logger.info('Index may not exist, skipping', { tableName, indexName, error });
  }
}

/**
 * Extend user_activity_logs to support Admin activity log management.
 * Adds structured columns for filtering/sorting and keeps metadata JSON for details.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const table = await queryInterface.describeTable('user_activity_logs');

  if (!table.action) {
    await queryInterface.addColumn('user_activity_logs', 'action', {
      type: DataTypes.STRING(32),
      allowNull: true,
    });
  }

  if (!table.resource_type) {
    await queryInterface.addColumn('user_activity_logs', 'resource_type', {
      type: DataTypes.STRING(64),
      allowNull: true,
    });
  }

  if (!table.resource_id) {
    await queryInterface.addColumn('user_activity_logs', 'resource_id', {
      type: DataTypes.UUID,
      allowNull: true,
    });
  }

  if (!table.old_values) {
    await queryInterface.addColumn('user_activity_logs', 'old_values', {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    });
  }

  if (!table.new_values) {
    await queryInterface.addColumn('user_activity_logs', 'new_values', {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    });
  }

  if (!table.status) {
    await queryInterface.addColumn('user_activity_logs', 'status', {
      type: DataTypes.STRING(16),
      allowNull: true,
      defaultValue: 'success',
    });
  }

  if (!table.error_message) {
    await queryInterface.addColumn('user_activity_logs', 'error_message', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  }

  // Backfill action from legacy activity_type where possible
  try {
    await queryInterface.sequelize.query(
      `UPDATE user_activity_logs SET action = activity_type WHERE action IS NULL AND activity_type IS NOT NULL;`
    );
  } catch (error) {
    logger.warn('Failed to backfill action from activity_type', { error });
  }

  // Default status for legacy rows
  try {
    await queryInterface.sequelize.query(
      `UPDATE user_activity_logs SET status = 'success' WHERE status IS NULL;`
    );
  } catch (error) {
    logger.warn('Failed to backfill status', { error });
  }

  // Indexes for admin filters
  await addIndexSafe(queryInterface, 'user_activity_logs', ['action'], { name: 'idx_user_activity_logs_action' });
  await addIndexSafe(queryInterface, 'user_activity_logs', ['resource_type'], { name: 'idx_user_activity_logs_resource_type' });
  await addIndexSafe(queryInterface, 'user_activity_logs', ['status'], { name: 'idx_user_activity_logs_status' });
  await addIndexSafe(queryInterface, 'user_activity_logs', ['user_id', 'created_at'], { name: 'idx_user_activity_logs_user_id_created_at' });
  await addIndexSafe(queryInterface, 'user_activity_logs', ['resource_type', 'created_at'], { name: 'idx_user_activity_logs_resource_type_created_at' });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await removeIndexSafe(queryInterface, 'user_activity_logs', 'idx_user_activity_logs_action');
  await removeIndexSafe(queryInterface, 'user_activity_logs', 'idx_user_activity_logs_resource_type');
  await removeIndexSafe(queryInterface, 'user_activity_logs', 'idx_user_activity_logs_status');
  await removeIndexSafe(queryInterface, 'user_activity_logs', 'idx_user_activity_logs_user_id_created_at');
  await removeIndexSafe(queryInterface, 'user_activity_logs', 'idx_user_activity_logs_resource_type_created_at');

  const table = await queryInterface.describeTable('user_activity_logs');

  if (table.error_message) {
    await queryInterface.removeColumn('user_activity_logs', 'error_message');
  }
  if (table.status) {
    await queryInterface.removeColumn('user_activity_logs', 'status');
  }
  if (table.new_values) {
    await queryInterface.removeColumn('user_activity_logs', 'new_values');
  }
  if (table.old_values) {
    await queryInterface.removeColumn('user_activity_logs', 'old_values');
  }
  if (table.resource_id) {
    await queryInterface.removeColumn('user_activity_logs', 'resource_id');
  }
  if (table.resource_type) {
    await queryInterface.removeColumn('user_activity_logs', 'resource_type');
  }
  if (table.action) {
    await queryInterface.removeColumn('user_activity_logs', 'action');
  }
}
