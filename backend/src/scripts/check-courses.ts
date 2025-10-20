/**
 * Check courses in database
 */

import { getSequelize } from '../config/db';
import logger from '../utils/logger.util';

async function checkCourses() {
  try {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    logger.info('Database connected');

    // Query all courses directly
    const [results] = await sequelize.query('SELECT id, title, instructor_id, status FROM courses ORDER BY created_at DESC LIMIT 10');
    
    console.log('\n📚 Courses in database:');
    console.log('====================================');
    console.table(results);
    
    // Check specific course
    const [course101] = await sequelize.query(
      "SELECT * FROM courses WHERE id = '00000000-0000-0000-0000-000000000101'"
    );
    
    console.log('\n🔍 Course 101 details:');
    console.log('====================================');
    console.log(JSON.stringify(course101, null, 2));

    // Check instructor
    const [instructor] = await sequelize.query(
      "SELECT id, username, email, role FROM users WHERE id = '00000000-0000-0000-0000-000000000003'"
    );
    
    console.log('\n👨‍🏫 Instructor details:');
    console.log('====================================');
    console.log(JSON.stringify(instructor, null, 2));

    process.exit(0);
  } catch (error) {
    logger.error('Error checking courses:', error);
    process.exit(1);
  }
}

checkCourses();

