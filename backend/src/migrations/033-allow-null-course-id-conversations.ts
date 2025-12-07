/**
 * Migration 025: Allow null course_id in conversations table
 * 
 * This allows direct messages between users without requiring a course context
 */

import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

// Helper to check if column is already nullable
async function isColumnNullable(queryInterface: QueryInterface, table: string, column: string): Promise<boolean> {
  const [result] = await queryInterface.sequelize.query(
    `SELECT is_nullable FROM information_schema.columns 
     WHERE table_name = '${table}' AND column_name = '${column}'`,
    { type: QueryTypes.SELECT }
  ) as [{ is_nullable: string }[], unknown];
  return result && (result as any).is_nullable === 'YES';
}

// Helper to check if index exists
async function indexExists(queryInterface: QueryInterface, indexName: string): Promise<boolean> {
  const [results] = await queryInterface.sequelize.query(
    `SELECT indexname FROM pg_indexes WHERE indexname = '${indexName}'`,
    { type: QueryTypes.SELECT }
  ) as [{ indexname: string }[], unknown];
  return results !== undefined && (results as any).indexname === indexName;
}

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Use raw SQL to drop NOT NULL constraint (most reliable method)
  try {
    await queryInterface.sequelize.query(`
      ALTER TABLE conversations 
      ALTER COLUMN course_id DROP NOT NULL;
    `);
    console.log('✅ Dropped NOT NULL constraint on course_id');
  } catch (error: any) {
    // If constraint doesn't exist or already allows null, that's fine
    if (error.message?.includes('does not exist') || error.message?.includes('already')) {
      console.log('course_id already allows NULL or constraint does not exist');
    } else {
      console.log('Error dropping NOT NULL constraint (may already be nullable):', error.message);
    }
  }

  // Drop the old unique constraint that requires course_id
  try {
    await queryInterface.removeConstraint('conversations', 'conversations_course_id_student_id_instructor_id_key');
  } catch (error) {
    console.log('Old constraint may not exist, continuing...');
  }
  
  // Also try this variation
  try {
    await queryInterface.removeConstraint('conversations', 'unique_conversation_per_course_student_instructor');
  } catch (error) {
    console.log('Unique constraint may not exist, continuing...');
  }

  // Add a new unique constraint that handles null course_id (skip if exists)
  if (!(await indexExists(queryInterface, 'idx_conversations_direct_unique'))) {
    try {
      await queryInterface.addIndex('conversations', ['student_id', 'instructor_id'], {
        name: 'idx_conversations_direct_unique',
        unique: true,
        where: { course_id: null },
      });
    } catch (e) { /* ignore */ }
  }

  // Keep constraint for course-based conversations (skip if exists)
  if (!(await indexExists(queryInterface, 'idx_conversations_course_unique'))) {
    try {
      await queryInterface.addIndex('conversations', ['course_id', 'student_id', 'instructor_id'], {
        name: 'idx_conversations_course_unique',
        unique: true,
        where: { course_id: { ne: null } },
      });
    } catch (e) { /* ignore */ }
  }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  // Remove new indexes
  try {
    await queryInterface.removeIndex('conversations', 'idx_conversations_direct_unique');
    await queryInterface.removeIndex('conversations', 'idx_conversations_course_unique');
  } catch (error) {
    console.log('Indexes may not exist, continuing...');
  }

  // Change course_id back to NOT NULL (this will fail if there are NULL values)
  await queryInterface.changeColumn('conversations', 'course_id', {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });

  // Re-add the original unique constraint
  await queryInterface.addConstraint('conversations', {
    fields: ['course_id', 'student_id', 'instructor_id'],
    type: 'unique',
    name: 'conversations_course_id_student_id_instructor_id_key',
  });
};
