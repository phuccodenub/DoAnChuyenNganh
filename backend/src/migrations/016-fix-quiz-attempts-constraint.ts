import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🔧 Fixing quiz_attempts unique constraint...');
  
  try {
    // Drop the old unique constraint if it exists
    await queryInterface.removeConstraint('quiz_attempts', 'quiz_attempts_quiz_id_user_id_key');
    console.log('✅ Dropped old constraint');
  } catch (error) {
    console.log('Old constraint not found, continuing...');
  }
  
  try {
    // Drop any existing constraint with attempt_number
    await queryInterface.removeConstraint('quiz_attempts', 'quiz_attempts_quiz_id_user_id_attempt_number_key');
    console.log('✅ Dropped existing attempt_number constraint');
  } catch (error) {
    console.log('Attempt number constraint not found, continuing...');
  }
  
  // Add the correct unique constraint with attempt_number
  await queryInterface.addConstraint('quiz_attempts', {
    fields: ['quiz_id', 'user_id', 'attempt_number'],
    type: 'unique',
    name: 'quiz_attempts_quiz_id_user_id_attempt_number_key'
  });
  console.log('✅ Added new constraint with attempt_number');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Drop the correct constraint
  await queryInterface.removeConstraint('quiz_attempts', 'quiz_attempts_quiz_id_user_id_attempt_number_key');
  
  // Restore the old constraint
  await queryInterface.addConstraint('quiz_attempts', {
    fields: ['quiz_id', 'user_id'],
    type: 'unique',
    name: 'quiz_attempts_quiz_id_user_id_key'
  });
}
