const { Sequelize } = require('sequelize');

const dbUrl = process.env.DATABASE_URL || 'postgresql://lms_user:123456@172.21.0.1:5432/lms_db';
const sequelize = new Sequelize(dbUrl);

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📍 URL:', dbUrl.replace(/:[^:@]+@/, ':***@'));
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connection established\n');
    
    // Get database info
    const [dbInfo] = await sequelize.query('SELECT current_database(), current_schema(), current_user');
    console.log('📊 Database Info:', JSON.stringify(dbInfo[0], null, 2));
    
    // List tables
    const [tables] = await sequelize.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname='public' 
      ORDER BY tablename
    `);
    console.log('\n📋 Tables:', tables.map(t => t.tablename).join(', '));
    
    // Count users
    const [userCount] = await sequelize.query('SELECT COUNT(*) as count FROM users');
    console.log('\n👥 Users count:', userCount[0].count);
    
    // Check admin user
    const [admin] = await sequelize.query(`
      SELECT email, role, LEFT(password, 20) as pwd_preview 
      FROM users 
      WHERE email='admin@example.com'
    `);
    
    if (admin.length > 0) {
      console.log('\n👤 Admin user found:');
      console.log(JSON.stringify(admin[0], null, 2));
    } else {
      console.log('\n❌ Admin user NOT found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
