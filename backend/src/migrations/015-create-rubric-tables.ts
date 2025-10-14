import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('rubric_templates', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'courses', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    name: { type: DataTypes.STRING(150), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  await queryInterface.createTable('rubric_items', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    template_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'rubric_templates', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    criterion: { type: DataTypes.STRING(200), allowNull: false },
    weight_percent: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // CHECK weight in [0,100]
  await queryInterface.sequelize.query(
    'ALTER TABLE rubric_items ADD CONSTRAINT ck_rubric_items_weight_range CHECK (weight_percent BETWEEN 0 AND 100)'
  );
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    'ALTER TABLE IF EXISTS rubric_items DROP CONSTRAINT IF EXISTS ck_rubric_items_weight_range'
  );
  await queryInterface.dropTable('rubric_items');
  await queryInterface.dropTable('rubric_templates');
}


