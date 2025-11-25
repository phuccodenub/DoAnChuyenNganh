/**
 * Fix course_id NOT NULL constraint in live_sessions table
 * Run: ts-node -r tsconfig-paths/register src/scripts/fix-course-id-nullable.ts
 */

import 'dotenv-flow/config';
import { DataTypes } from 'sequelize';
import logger from '../utils/logger.util';
import { getSequelize } from '../config/db';

async function fixCourseIdNullable() {
  try {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    const queryInterface = sequelize.getQueryInterface();

    logger.info('Checking current course_id constraint...');
    
    // Check current constraint
    const [results] = await sequelize.query(`
      SELECT 
        column_name, 
        is_nullable, 
        data_type 
      FROM information_schema.columns 
      WHERE table_name = 'live_sessions' 
      AND column_name = 'course_id';
    `) as any[];

    if (results.length > 0) {
      const column = results[0];
      logger.info('Current course_id column:', column);
      
      if (column.is_nullable === 'NO') {
        logger.info('course_id is currently NOT NULL, changing to nullable...');
        
        // Drop NOT NULL constraint using raw SQL (more reliable)
        await sequelize.query(`
          ALTER TABLE live_sessions 
          ALTER COLUMN course_id DROP NOT NULL;
        `);
        
        logger.info('✅ Successfully changed course_id to nullable');
      } else {
        logger.info('✅ course_id is already nullable, no changes needed');
      }
    } else {
      logger.warn('course_id column not found in live_sessions table');
    }

    // Verify the change
    const [verifyResults] = await sequelize.query(`
      SELECT 
        column_name, 
        is_nullable, 
        data_type 
      FROM information_schema.columns 
      WHERE table_name = 'live_sessions' 
      AND column_name = 'course_id';
    `) as any[];

    if (verifyResults.length > 0) {
      logger.info('Verification - course_id column:', verifyResults[0]);
    }

    await sequelize.close();
    logger.info('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error fixing course_id constraint:', error);
    process.exit(1);
  }
}

fixCourseIdNullable();

