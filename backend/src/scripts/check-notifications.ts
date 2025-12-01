/**
 * Script to check notifications in database
 */

import 'dotenv-flow/config';
import { getSequelize } from '../config/db';

const sequelize = getSequelize();

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check user schema for is_active column
    const [cols] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active'");
    console.log('is_active column exists:', (cols as any[]).length > 0);
    
    // Check status column
    const [statusCol] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status'");
    console.log('status column exists:', (statusCol as any[]).length > 0);
    
    // Check users with status
    const [usersWithStatus] = await sequelize.query("SELECT id, email, role, status FROM users WHERE role IN ('admin', 'instructor', 'student') LIMIT 10");
    console.log('USERS WITH STATUS:', JSON.stringify(usersWithStatus, null, 2));

    // Check enrollments  
    const [enrollments] = await sequelize.query('SELECT id, user_id, course_id, status FROM enrollments LIMIT 5');
    console.log('ENROLLMENTS:', JSON.stringify(enrollments, null, 2));

    // Check instructor1 specifically
    const [instructor1] = await sequelize.query("SELECT id, email, role, status FROM users WHERE email = 'instructor1@example.com'");
    console.log('INSTRUCTOR1:', JSON.stringify(instructor1, null, 2));
    
    // Check courses for instructor1
    const [instructor1Courses] = await sequelize.query("SELECT id, title, instructor_id FROM courses WHERE instructor_id = '00000000-0000-0000-0000-000000000003'");
    console.log('INSTRUCTOR1 COURSES:', JSON.stringify(instructor1Courses, null, 2));

    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
