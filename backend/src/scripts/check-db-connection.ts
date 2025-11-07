/**
 * Check Database Connection
 * Utility script to verify which database you're connected to
 */

import 'dotenv/config';
import { getSequelize } from '../config/db';
import logger from '../utils/logger.util';

const sequelize = getSequelize();

async function checkConnection() {
  try {
    console.log('');
    console.log('='.repeat(60));
    console.log('🔍 DATABASE CONNECTION CHECK');
    console.log('='.repeat(60));
    console.log('');

    // Get connection config
    const config = sequelize.config;
    console.log('📋 Connection Configuration:');
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   Username: ${config.username}`);
    console.log('');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connection established successfully');
    console.log('');

    // Get database info
    const [results] = await sequelize.query(`
      SELECT 
        version() as pg_version,
        current_database() as database_name,
        current_user as current_user,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `);

    console.log('📊 Database Information:');
    console.log(`   PostgreSQL Version: ${(results[0] as any).pg_version.split(',')[0]}`);
    console.log(`   Database Name: ${(results[0] as any).database_name}`);
    console.log(`   Current User: ${(results[0] as any).current_user}`);
    console.log('');

    // Count data
    const [[coursesCount]] = await sequelize.query(`SELECT COUNT(*) as count FROM courses`);
    const [[usersCount]] = await sequelize.query(`SELECT COUNT(*) as count FROM users`);
    const [[categoriesCount]] = await sequelize.query(`SELECT COUNT(*) as count FROM categories`);

    console.log('📈 Data Statistics:');
    console.log(`   Courses: ${(coursesCount as any).count}`);
    console.log(`   Users: ${(usersCount as any).count}`);
    console.log(`   Categories: ${(categoriesCount as any).count}`);
    console.log('');

    // List recent courses
    const [courses] = await sequelize.query(`
      SELECT id, title, created_at 
      FROM courses 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log('📚 Recent Courses:');
    (courses as any[]).forEach((course, idx) => {
      console.log(`   ${idx + 1}. ${course.title}`);
      console.log(`      ID: ${course.id}`);
      console.log(`      Created: ${new Date(course.created_at).toLocaleString()}`);
    });
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ CHECK COMPLETED');
    console.log('='.repeat(60));
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ DATABASE CONNECTION FAILED');
    console.error('='.repeat(60));
    console.error('');
    console.error('Error:', error);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Check if database container is running: docker ps');
    console.error('2. Check connection settings in .env file');
    console.error('3. Verify database credentials');
    console.error('');
    process.exit(1);
  }
}

checkConnection();
