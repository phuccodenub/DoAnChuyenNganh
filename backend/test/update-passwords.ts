import 'dotenv-flow/config';
import { hashPassword } from '../src/utils';
import { getSequelize } from '../src/config/db';

async function updatePasswords() {
  const sequelize = getSequelize();
  
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    
    const adminHash = await hashPassword('Admin123!');
    console.log('Admin hash generated');
    
    const studentHash = await hashPassword('Student123!');
    console.log('Student hash generated');
    
    const instructorHash = await hashPassword('Instructor123!');
    console.log('Instructor hash generated');
    
    await sequelize.query('UPDATE users SET password = ? WHERE email = ?', {
      replacements: [adminHash, 'admin@example.com']
    });
    console.log('Admin password updated');
    
    await sequelize.query('UPDATE users SET password = ? WHERE email = ?', {
      replacements: [studentHash, 'student11@example.com']
    });
    console.log('Student password updated');
    
    await sequelize.query('UPDATE users SET password = ? WHERE email = ?', {
      replacements: [instructorHash, 'instructor@example.com']
    });
    console.log('Instructor password updated');
    
    console.log('✅ Passwords updated successfully');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error?.message || error);
    process.exit(1);
  }
}

updatePasswords();