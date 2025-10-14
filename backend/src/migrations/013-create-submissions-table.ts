import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('submissions', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    assignment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'assignments', key: 'id' },
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
    submitted_at: { type: DataTypes.DATE, allowNull: true },
    graded_at: { type: DataTypes.DATE, allowNull: true },
    score: { type: DataTypes.DECIMAL(5,2), allowNull: true },
    feedback: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  });

  await queryInterface.addConstraint('submissions', {
    fields: ['assignment_id', 'user_id'],
    type: 'unique',
    name: 'ux_submissions_assignment_user'
  });

  await queryInterface.addIndex('submissions', ['assignment_id']);
  await queryInterface.addIndex('submissions', ['user_id']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('submissions');
}


