import { User } from '../models';
import { globalServices } from '../services/global';
import { comparePassword, hashPassword } from '../utils';

async function debugStudentLogin() {
  try {
    console.log('🔍 Debugging student login...\n');
    
    // 1. Check if student exists
    const student = await User.findOne({
      where: { email: 'student@example.com' }
    }) as any;
    
    if (!student) {
      console.log('❌ Student not found in database');
      return;
    }
    
    console.log('✅ Student found:', {
      id: student.id,
      email: student.email,
      role: student.role,
      status: student.status,
      is_active: student.is_active,
      is_verified: student.is_verified,
      hashPrefix: student.password_hash?.substring(0, 20) || 'NO HASH',
      hashLength: student.password_hash?.length || 0
    });
    
    // 2. Test with different password variations
    const testPasswords = [
      'student123',
      'Student123',
      'STUDENT123',
      'student',
      '123456',
      'password'
    ];
    
    console.log('\n🧪 Testing passwords:');
    for (const password of testPasswords) {
      try {
        // Test với direct utils
        const utilResult = await comparePassword(password, student.password_hash);
        console.log(`  "${password}" -> directUtils: ${utilResult ? '✅ VALID' : '❌ INVALID'}`);
        
        // Test với global service
        const globalResult = await globalServices.auth.comparePassword(password, student.password_hash);
        console.log(`  "${password}" -> globalService: ${globalResult ? '✅ VALID' : '❌ INVALID'}`);
        
        console.log('');
      } catch (error) {
        console.log(`  "${password}" -> ERROR:`, error);
      }
    }
    
    // 3. Test hash creation với student123
    console.log('🔐 Testing hash creation:');
    const testPassword = 'student123';
    const newHash = await hashPassword(testPassword);
    console.log('New hash created:', newHash);
    
    const verifyNewHash = await comparePassword(testPassword, newHash);
    console.log('New hash verification:', verifyNewHash ? '✅ VALID' : '❌ INVALID');
    
    // 4. Check hash format
    console.log('\n📝 Hash analysis:');
    console.log('Current hash format:', {
      isBcrypt: student.password_hash?.startsWith('$2'),
      isCrypto: student.password_hash?.startsWith('crypto:'),
      length: student.password_hash?.length,
      parts: student.password_hash?.split('$').length
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugStudentLogin();