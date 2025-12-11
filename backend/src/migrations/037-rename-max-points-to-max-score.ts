import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Rename max_points to max_score and change type to DECIMAL(5,2)
 * Reason: Model định nghĩa max_score nhưng migration ban đầu tạo max_points
 * This migration fixes the mismatch between model and database schema
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Check if column exists before renaming
  const tableDescription = await queryInterface.describeTable('assignments');
  
  if (tableDescription.max_points) {
    // Rename column from max_points to max_score
    await queryInterface.renameColumn('assignments', 'max_points', 'max_score');
    
    // Change type from INTEGER to DECIMAL(5,2) for better precision
    await queryInterface.changeColumn('assignments', 'max_score', {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 100.0
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const tableDescription = await queryInterface.describeTable('assignments');
  
  if (tableDescription.max_score) {
    // Change back to INTEGER
    await queryInterface.changeColumn('assignments', 'max_score', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
    });
    
    // Rename back to max_points
    await queryInterface.renameColumn('assignments', 'max_score', 'max_points');
  }
}
