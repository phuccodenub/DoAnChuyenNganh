import { QueryInterface, DataTypes } from 'sequelize';

const TABLE_NAME = 'live_sessions';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Allow course_id to be nullable
  await queryInterface.changeColumn(TABLE_NAME, 'course_id', {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'courses', key: 'id' },
    onDelete: 'SET NULL',
  } as any);

  // Rename instructor_id -> host_user_id
  await queryInterface.renameColumn(TABLE_NAME, 'instructor_id', 'host_user_id');
  await queryInterface.changeColumn(TABLE_NAME, 'host_user_id', {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
  } as any);

  // Rename schedule/start/end columns
  await queryInterface.renameColumn(TABLE_NAME, 'scheduled_at', 'scheduled_start');
  await queryInterface.renameColumn(TABLE_NAME, 'started_at', 'actual_start');
  await queryInterface.renameColumn(TABLE_NAME, 'ended_at', 'actual_end');

  // New columns
  await queryInterface.addColumn(TABLE_NAME, 'scheduled_end', {
    type: DataTypes.DATE,
    allowNull: true,
  });

  await queryInterface.addColumn(TABLE_NAME, 'viewer_count', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  });

  await queryInterface.addColumn(TABLE_NAME, 'thumbnail_url', {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  await queryInterface.addColumn(TABLE_NAME, 'stream_key', {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  await queryInterface.addColumn(TABLE_NAME, 'playback_url', {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  await queryInterface.addColumn(TABLE_NAME, 'platform', {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'internal',
  });

  await queryInterface.addColumn(TABLE_NAME, 'max_participants', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  await queryInterface.addColumn(TABLE_NAME, 'is_public', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  });

  await queryInterface.addColumn(TABLE_NAME, 'is_recorded', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  await queryInterface.addColumn(TABLE_NAME, 'category', {
    type: DataTypes.STRING(100),
    allowNull: true,
  });

  await queryInterface.addColumn(TABLE_NAME, 'metadata', {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  });
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

