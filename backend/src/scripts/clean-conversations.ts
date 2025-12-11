/**
 * Script to clean conversation data and reset seeder
 */

import { Sequelize } from 'sequelize';
import env from '../config/env.config';

async function cleanAndReseed() {
  const sequelize = new Sequelize(env.databaseUrl, {
    dialect: 'postgres',
    logging: console.log,
  });
  
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Check if tables exist
    const [tables] = await sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('direct_messages', 'conversations')
    `);
    
    const tableNames = (tables || []).map((t: any) => t.table_name);
    console.log('📋 Found tables:', tableNames);
    
    // Clean old data if tables exist
    console.log('🧹 Cleaning old conversation data...');
    
    if (tableNames.includes('direct_messages')) {
      await sequelize.query('DELETE FROM direct_messages');
      console.log('  ✅ Cleaned direct_messages');
    } else {
      console.log('  ⚠️ direct_messages table does not exist');
    }
    
    if (tableNames.includes('conversations')) {
      await sequelize.query('DELETE FROM conversations');
      console.log('  ✅ Cleaned conversations');
    } else {
      console.log('  ⚠️ conversations table does not exist');
    }
    
    // Reset seeder tracking for version 006
    try {
      await sequelize.query("DELETE FROM seeder_meta WHERE version = '006'");
      console.log('✅ Seeder tracking reset');
    } catch (e) {
      console.log('⚠️ seeder_meta table does not exist or error:', (e as Error).message);
    }
    
    await sequelize.close();
    console.log('🎉 Done! Now run: npm run seed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanAndReseed();
