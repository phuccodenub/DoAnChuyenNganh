/**
 * Script to check database schema and verify against model definitions
 * 
 * Usage: ts-node src/scripts/check-database-schema.ts
 */

import { getSequelize } from '../config/db';
import { QueryTypes } from 'sequelize';

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

const TABLES_TO_CHECK = [
  'assignment_submissions',
  'lesson_progress',
  'lessons',
  'quiz_attempts',
  'grade_components',
  'lesson_materials',
  'quiz_questions',
];

async function checkTableSchema(tableName: string): Promise<void> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`TABLE: ${tableName}`);
  console.log('='.repeat(80));

  const sequelize = getSequelize();

  try {
    const columns = await sequelize.query<ColumnInfo>(
      `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = :tableName
      ORDER BY ordinal_position;
      `,
      {
        replacements: { tableName },
        type: QueryTypes.SELECT,
      }
    );

    if (columns.length === 0) {
      console.log(`⚠️  Table "${tableName}" does not exist in database!`);
      return;
    }

    console.log('\nColumns:');
    console.log('-'.repeat(80));
    columns.forEach((col: ColumnInfo) => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? `DEFAULT ${col.column_default}` : '';
      console.log(`  ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${nullable.padEnd(10)} ${defaultVal}`);
    });

  } catch (error) {
    console.error(`❌ Error checking table ${tableName}:`, error);
  }
}

async function main() {
  console.log('🔍 DATABASE SCHEMA CHECKER');
  console.log('='.repeat(80));
  console.log(`Database: ${process.env.DATABASE_URL || 'Not configured'}`);
  console.log(`Checking ${TABLES_TO_CHECK.length} tables...`);

  const sequelize = getSequelize();

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    for (const tableName of TABLES_TO_CHECK) {
      await checkTableSchema(tableName);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Schema check complete!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Failed to check schemas:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { checkTableSchema };
