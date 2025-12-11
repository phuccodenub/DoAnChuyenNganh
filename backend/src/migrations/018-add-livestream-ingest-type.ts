import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

const TABLE_NAME = 'live_sessions';
const INGEST_ENUM = 'enum_live_sessions_ingest_type';

// Helper function to check if column exists
async function columnExists(queryInterface: QueryInterface, table: string, column: string): Promise<boolean> {
  const [results] = await queryInterface.sequelize.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}'`,
    { type: QueryTypes.SELECT }
  ) as [{ column_name: string }[], unknown];
  return results !== undefined && (results as any).column_name === column;
}

// Helper to check if index exists
async function indexExists(queryInterface: QueryInterface, indexName: string): Promise<boolean> {
  const [results] = await queryInterface.sequelize.query(
    `SELECT indexname FROM pg_indexes WHERE indexname = '${indexName}'`,
    { type: QueryTypes.SELECT }
  ) as [{ indexname: string }[], unknown];
  return results !== undefined && (results as any).indexname === indexName;
}

export async function up(queryInterface: QueryInterface): Promise<void> {
  if (!(await columnExists(queryInterface, TABLE_NAME, 'ingest_type'))) {
    await queryInterface.addColumn(TABLE_NAME, 'ingest_type', {
      type: DataTypes.ENUM('webrtc', 'rtmp'),
      allowNull: false,
      defaultValue: 'webrtc',
    } as any);
  }

  if (!(await columnExists(queryInterface, TABLE_NAME, 'webrtc_room_id'))) {
    await queryInterface.addColumn(TABLE_NAME, 'webrtc_room_id', {
      type: DataTypes.STRING(120),
      allowNull: true,
    });
  }

  if (!(await columnExists(queryInterface, TABLE_NAME, 'webrtc_config'))) {
    await queryInterface.addColumn(TABLE_NAME, 'webrtc_config', {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    });
  }

  if (!(await indexExists(queryInterface, 'live_sessions_ingest_type'))) {
    try { await queryInterface.addIndex(TABLE_NAME, ['ingest_type']); } catch (e) { /* ignore */ }
  }
  if (!(await indexExists(queryInterface, 'live_sessions_webrtc_room_id'))) {
    try { await queryInterface.addIndex(TABLE_NAME, ['webrtc_room_id']); } catch (e) { /* ignore */ }
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex(TABLE_NAME, 'webrtc_room_id');
  await queryInterface.removeIndex(TABLE_NAME, 'ingest_type');
  await queryInterface.removeColumn(TABLE_NAME, 'webrtc_config');
  await queryInterface.removeColumn(TABLE_NAME, 'webrtc_room_id');
  await queryInterface.removeColumn(TABLE_NAME, 'ingest_type');
  await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${INGEST_ENUM}";`);
}


