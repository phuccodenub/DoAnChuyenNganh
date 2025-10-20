import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Grade components
  await queryInterface.createTable('grade_components', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'courses', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    component_key: { type: DataTypes.STRING(50), allowNull: false },
    component_name: { type: DataTypes.STRING(150), allowNull: false },
    weight_percent: { type: DataTypes.INTEGER, allowNull: false },
    display_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  // Unique (course_id, component_key) with safety check
  await queryInterface.sequelize.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ux_grade_components_course_key'
      ) THEN
        ALTER TABLE grade_components
        ADD CONSTRAINT ux_grade_components_course_key UNIQUE (course_id, component_key);
      END IF;
    END$$;
  `);
  // CHECK weight in [0,100]
  await queryInterface.sequelize.query(
    'ALTER TABLE grade_components ADD CONSTRAINT ck_grade_components_weight_range CHECK (weight_percent BETWEEN 0 AND 100)'
  );

  // Final grades
  await queryInterface.createTable('final_grades', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'courses', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    total_score: { type: DataTypes.DECIMAL(5,2), allowNull: true },
    letter_grade: { type: DataTypes.STRING(5), allowNull: true },
    computed_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  await queryInterface.addConstraint('final_grades', {
    fields: ['course_id', 'user_id'],
    type: 'unique',
    name: 'ux_final_grades_course_user'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    'ALTER TABLE IF EXISTS grade_components DROP CONSTRAINT IF EXISTS ck_grade_components_weight_range'
  );
  await queryInterface.sequelize.query(
    'ALTER TABLE IF EXISTS grade_components DROP CONSTRAINT IF EXISTS ux_grade_components_course_key'
  );
  await queryInterface.dropTable('final_grades');
  await queryInterface.dropTable('grade_components');
}


