import { QueryInterface, DataTypes } from 'sequelize';
import { getSequelize } from '@config/db';

async function fixQuizAttemptsConstraint() {
  const sequelize = getSequelize();
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('🔧 Fixing quiz_attempts unique constraint...');
    
    // Drop the old constraint
    await queryInterface.removeConstraint('quiz_attempts', 'quiz_attempts_quiz_id_user_id_key');
    console.log('✅ Dropped old constraint');
    
    // Add the correct constraint
    await queryInterface.addConstraint('quiz_attempts', {
      fields: ['quiz_id', 'user_id', 'attempt_number'],
      type: 'unique',
      name: 'quiz_attempts_quiz_id_user_id_attempt_number_key'
    });
    console.log('✅ Added new constraint with attempt_number');
    
    console.log('🎉 Constraint fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing constraint:', error);
  } finally {
    await sequelize.close();
  }
}

fixQuizAttemptsConstraint();
