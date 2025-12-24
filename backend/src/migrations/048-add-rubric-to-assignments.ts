import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('assignments', 'rubric', {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Default rubric for AI grading'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('assignments', 'rubric');
}
