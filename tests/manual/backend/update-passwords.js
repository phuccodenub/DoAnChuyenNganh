const bcrypt = require('bcrypt');
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'lms_db',
  user: 'lms_user',
  password: '123456'
});

async function updatePasswords() {
  try {
    await client.connect();
    
    // Hash passwords
    const adminHash = await bcrypt.hash('Admin123!', 10);
    const studentHash = await bcrypt.hash('Student123!', 10);
    const instructorHash = await bcrypt.hash('Instructor123!', 10);
    
    // Update passwords
    await client.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [adminHash, 'admin@example.com']
    );
    
    await client.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [studentHash, 'student11@example.com']
    );
    
    await client.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [instructorHash, 'instructor@example.com']
    );
    
    console.log('✅ Passwords updated successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

updatePasswords();