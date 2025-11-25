import { QueryInterface, DataTypes } from 'sequelize';

const TABLE_NAME = 'live_sessions';
const INGEST_ENUM = 'enum_live_sessions_ingest_type';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn(TABLE_NAME, 'ingest_type', {
    type: DataTypes.ENUM('webrtc', 'rtmp'),
    allowNull: false,
    defaultValue: 'webrtc',
  } as any);

  await queryInterface.addColumn(TABLE_NAME, 'webrtc_room_id', {
    type: DataTypes.STRING(120),
    allowNull: true,
  });

  await queryInterface.addColumn(TABLE_NAME, 'webrtc_config', {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  });

  await queryInterface.addIndex(TABLE_NAME, ['ingest_type']);
  await queryInterface.addIndex(TABLE_NAME, ['webrtc_room_id']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex(TABLE_NAME, 'webrtc_room_id');
  await queryInterface.removeIndex(TABLE_NAME, 'ingest_type');
  await queryInterface.removeColumn(TABLE_NAME, 'webrtc_config');
  await queryInterface.removeColumn(TABLE_NAME, 'webrtc_room_id');
  await queryInterface.removeColumn(TABLE_NAME, 'ingest_type');
  await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${INGEST_ENUM}";`);
}


