const bcrypt = require('bcryptjs');

// Test password comparison
async function testPassword() {
  const plainPassword = 'Admin123!';
  
  // Hash password như trong seed
  const hashedPassword = await bcrypt.hash(plainPassword, 12);
  console.log('New hash:', hashedPassword);
  
  // Compare
  const isValid1 = await bcrypt.compare(plainPassword, hashedPassword);
  console.log('Compare new hash:', isValid1);
  
  // Test with existing hash from database
  const existingHash = '$2b$12$6X2jZmDyr6tP3bItThea3Owh1xggUbLo532fO5OPTGD0akO4tNGKt'; // from screenshot
  const isValid2 = await bcrypt.compare(plainPassword, existingHash);
  console.log('Compare existing hash:', isValid2);
  
  // Try different variations
  const variations = [
    'Admin123!',
    'admin123!',
    'ADMIN123!',
    'Admin123',
  ];
  
  console.log('\nTesting variations with existing hash:');
  for (const variation of variations) {
    const result = await bcrypt.compare(variation, existingHash);
    console.log(`${variation}: ${result}`);
  }
}

testPassword().catch(console.error);