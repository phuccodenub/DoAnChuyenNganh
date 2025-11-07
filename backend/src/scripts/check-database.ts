import { getSequelize } from '../config/db';

async function checkDatabase() {
  const sequelize = getSequelize();
  
  try {
    await sequelize.authenticate();
    console.log('🔍 Checking database structure...\n');
    
    // Check table structure
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Users table columns:');
    console.log(columns);
    
    // Check student users
    const [users] = await sequelize.query(`
      SELECT id, email, username, 
             CASE 
               WHEN password IS NOT NULL THEN 'HAS_PASSWORD' 
               ELSE 'NO_PASSWORD' 
             END as password_status,
             CASE 
               WHEN password_hash IS NOT NULL THEN 'HAS_PASSWORD_HASH' 
               ELSE 'NO_PASSWORD_HASH' 
             END as password_hash_status,
             role, status, is_active
      FROM users 
      WHERE email LIKE '%student%' OR email LIKE '%admin%'
    `);
    
    console.log('\n👥 User accounts:');
    console.log(JSON.stringify(users, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabase();