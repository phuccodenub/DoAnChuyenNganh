import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('assignment_submissions', 'ai_grader_last', {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Latest AI grader result payload'
  });

  await queryInterface.addColumn('assignment_submissions', 'ai_grader_history', {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'AI grader history entries (array)'
  });

  await queryInterface.addColumn('assignment_submissions', 'ai_grader_rubric', {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Last rubric used by AI grader'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('assignment_submissions', 'ai_grader_rubric');
  await queryInterface.removeColumn('assignment_submissions', 'ai_grader_history');
  await queryInterface.removeColumn('assignment_submissions', 'ai_grader_last');
}
