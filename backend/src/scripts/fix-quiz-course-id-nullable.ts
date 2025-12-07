import 'dotenv-flow/config';
import { Sequelize } from 'sequelize';
import logger from '../utils/logger.util';

/**
 * Script để fix course_id nullable cho quizzes và assignments
 * Chạy trực tiếp SQL để đảm bảo hoạt động đúng
 */
async function fixCourseIdNullable() {
  const sequelize = new Sequelize(
    process.env.DATABASE_URL || 'postgresql://lms_user:123456@localhost:5432/lms_db',
    {
      dialect: 'postgres',
      logging: false,
    }
  );

  try {
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Fix quizzes table
    logger.info('Fixing quizzes.course_id to allow NULL...');
    await sequelize.query(`
      ALTER TABLE quizzes 
      ALTER COLUMN course_id DROP NOT NULL;
    `);
    logger.info('✅ quizzes.course_id is now nullable');

    // Fix assignments table
    logger.info('Fixing assignments.course_id to allow NULL...');
    await sequelize.query(`
      ALTER TABLE assignments 
      ALTER COLUMN course_id DROP NOT NULL;
    `);
    logger.info('✅ assignments.course_id is now nullable');

    logger.info('✅ All fixes completed successfully');
  } catch (error) {
    logger.error('Error fixing course_id nullable:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the script
fixCourseIdNullable()
  .then(() => {
    logger.info('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Script failed:', error);
    process.exit(1);
  });

