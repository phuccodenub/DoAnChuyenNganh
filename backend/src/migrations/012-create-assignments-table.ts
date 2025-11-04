import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('assignments', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'courses', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    due_date: { type: DataTypes.DATE, allowNull: true },
    allow_late_submission: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    max_points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  await queryInterface.addIndex('assignments', ['course_id']);
  await queryInterface.addIndex('assignments', ['due_date']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('assignments');
}


