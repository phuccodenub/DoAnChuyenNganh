import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

const TABLE_NAME = 'live_sessions';

// Helper function to check if column exists
async function columnExists(queryInterface: QueryInterface, table: string, column: string): Promise<boolean> {
  const [results] = await queryInterface.sequelize.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}'`,
    { type: QueryTypes.SELECT }
  ) as [{ column_name: string }[], unknown];
  return results !== undefined && (results as any).column_name === column;
}

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Allow course_id to be nullable
  await queryInterface.changeColumn(TABLE_NAME, 'course_id', {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'courses', key: 'id' },
    onDelete: 'SET NULL',
  } as any);

  // Rename instructor_id -> host_user_id (skip if already done)
  const hasHostUserId = await columnExists(queryInterface, TABLE_NAME, 'host_user_id');
  const hasInstructorId = await columnExists(queryInterface, TABLE_NAME, 'instructor_id');
  
  if (!hasHostUserId && hasInstructorId) {
    await queryInterface.renameColumn(TABLE_NAME, 'instructor_id', 'host_user_id');
  }
  
  if (hasHostUserId) {
    await queryInterface.changeColumn(TABLE_NAME, 'host_user_id', {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    } as any);
  }

  // Rename schedule/start/end columns (skip if target column already exists)
  const hasScheduledStart = await columnExists(queryInterface, TABLE_NAME, 'scheduled_start');
  const hasActualStart = await columnExists(queryInterface, TABLE_NAME, 'actual_start');
  const hasActualEnd = await columnExists(queryInterface, TABLE_NAME, 'actual_end');
  
  if (!hasScheduledStart && (await columnExists(queryInterface, TABLE_NAME, 'scheduled_at'))) {
    await queryInterface.renameColumn(TABLE_NAME, 'scheduled_at', 'scheduled_start');
  }
  if (!hasActualStart && (await columnExists(queryInterface, TABLE_NAME, 'started_at'))) {
    await queryInterface.renameColumn(TABLE_NAME, 'started_at', 'actual_start');
  }
  if (!hasActualEnd && (await columnExists(queryInterface, TABLE_NAME, 'ended_at'))) {
    await queryInterface.renameColumn(TABLE_NAME, 'ended_at', 'actual_end');
  }

  // New columns (skip if already exist)
  if (!(await columnExists(queryInterface, TABLE_NAME, 'scheduled_end'))) {
    await queryInterface.addColumn(TABLE_NAME, 'scheduled_end', {
      type: DataTypes.DATE,
      allowNull: true,
    });
  }

  if (!(await columnExists(queryInterface, TABLE_NAME, 'viewer_count'))) {
    await queryInterface.addColumn(TABLE_NAME, 'viewer_count', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  }

  if (!(await columnExists(queryInterface, TABLE_NAME, 'thumbnail_url'))) {
    await queryInterface.addColumn(TABLE_NAME, 'thumbnail_url', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  }

  if (!(await columnExists(queryInterface, TABLE_NAME, 'stream_key'))) {
    await queryInterface.addColumn(TABLE_NAME, 'stream_key', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  }

  if (!(await columnExists(queryInterface, TABLE_NAME, 'playback_url'))) {
    await queryInterface.addColumn(TABLE_NAME, 'playback_url', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  }

  if (!(await columnExists(queryInterface, TABLE_NAME, 'platform'))) {
    await queryInterface.addColumn(TABLE_NAME, 'platform', {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'internal',
    });
  }

  if (!(await columnExists(queryInterface, TABLE_NAME, 'max_participants'))) {
    await queryInterface.addColumn(TABLE_NAME, 'max_participants', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
  }

  if (!(await columnExists(queryInterface, TABLE_NAME, 'is_public'))) {
    await queryInterface.addColumn(TABLE_NAME, 'is_public', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  }

  if (!(await columnExists(queryInterface, TABLE_NAME, 'is_recorded'))) {
    await queryInterface.addColumn(TABLE_NAME, 'is_recorded', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  }

  if (!(await columnExists(queryInterface, TABLE_NAME, 'category'))) {
    await queryInterface.addColumn(TABLE_NAME, 'category', {
      type: DataTypes.STRING(100),
      allowNull: true,
    });
  }

  if (!(await columnExists(queryInterface, TABLE_NAME, 'metadata'))) {
    await queryInterface.addColumn(TABLE_NAME, 'metadata', {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn(TABLE_NAME, 'metadata');
  await queryInterface.removeColumn(TABLE_NAME, 'category');
  await queryInterface.removeColumn(TABLE_NAME, 'is_recorded');
  await queryInterface.removeColumn(TABLE_NAME, 'is_public');
  await queryInterface.removeColumn(TABLE_NAME, 'max_participants');
  await queryInterface.removeColumn(TABLE_NAME, 'platform');
  await queryInterface.removeColumn(TABLE_NAME, 'playback_url');
  await queryInterface.removeColumn(TABLE_NAME, 'stream_key');
  await queryInterface.removeColumn(TABLE_NAME, 'thumbnail_url');
  await queryInterface.removeColumn(TABLE_NAME, 'viewer_count');
  await queryInterface.removeColumn(TABLE_NAME, 'scheduled_end');

  await queryInterface.renameColumn(TABLE_NAME, 'actual_end', 'ended_at');
  await queryInterface.renameColumn(TABLE_NAME, 'actual_start', 'started_at');
  await queryInterface.renameColumn(TABLE_NAME, 'scheduled_start', 'scheduled_at');

  await queryInterface.changeColumn(TABLE_NAME, 'course_id', {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'courses', key: 'id' },
    onDelete: 'CASCADE',
  } as any);

  await queryInterface.changeColumn(TABLE_NAME, 'host_user_id', {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  } as any);
  await queryInterface.renameColumn(TABLE_NAME, 'host_user_id', 'instructor_id');
}

