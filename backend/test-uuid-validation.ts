import { z } from 'zod';

const uuidSchema = z.string().uuid();

const testUUIDs = [
  '00000000-0000-0000-0000-000000000501',
  '00000000-0000-0000-0000-000000000503',
  'a1b2c3d4-0000-0000-0000-000000000001',
  '550e8400-e29b-41d4-a716-446655440000', // Standard UUID v4
];

testUUIDs.forEach(uuid => {
  try {
    uuidSchema.parse(uuid);
    console.log(`✅ ${uuid} - VALID`);
  } catch (error: any) {
    console.log(`❌ ${uuid} - INVALID`);
    console.log(`   Error: ${error.errors?.[0]?.message || error.message}`);
  }
});
