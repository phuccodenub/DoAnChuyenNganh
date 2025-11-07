import 'dotenv-flow/config';
import { getSequelize } from '../config/db';
import { hashUtils } from '../utils/hash.util';
import logger from '../utils/logger.util';

const sequelize = getSequelize();

async function testPassword() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connected');

    // Get student user
    const [rows] = await sequelize.query(`
      SELECT email, password FROM users 
      WHERE email = 'student11@example.com'
    `);

    if (rows.length === 0) {
      logger.error('❌ Student user not found');
      return;
    }

    const user = rows[0] as any;
    const testPassword = 'Student123!';
    
    logger.info(`Testing password "${testPassword}" against stored hash`);
    
    const isValid = await hashUtils.password.comparePassword(testPassword, user.password);
    
    logger.info(`Password verification result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (!isValid) {
      logger.info('Generating new hash for comparison...');
      const newHash = await hashUtils.password.hashPassword(testPassword);
      logger.info(`New hash: ${newHash}`);
      logger.info(`Stored hash: ${user.password}`);
    }
    
    process.exit(0);
  } catch (e) {
    logger.error('❌ Error:', e);
    process.exit(1);
  }
}

testPassword();