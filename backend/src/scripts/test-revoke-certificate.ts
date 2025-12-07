/**
 * Script to test certificate revocation
 * 
 * Usage:
 *   npm run ts-node src/scripts/test-revoke-certificate.ts <certificate_id> [reason]
 * 
 * Example:
 *   npm run ts-node src/scripts/test-revoke-certificate.ts abc123 "Test revocation"
 */

import 'dotenv-flow/config';
import { getSequelize } from '../config/database.config';
import Certificate from '../models/certificate.model';
import { CertificateService } from '../modules/certificate/certificate.service';

async function testRevokeCertificate() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: npm run ts-node src/scripts/test-revoke-certificate.ts <certificate_id> [reason]');
    process.exit(1);
  }

  const certificateId = args[0];
  const reason = args[1] || 'Test revocation';

  try {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get certificate before revoke
    const certificateBefore = await Certificate.findByPk(certificateId);
    if (!certificateBefore) {
      console.error(`❌ Certificate with ID ${certificateId} not found`);
      process.exit(1);
    }

    console.log('\n📋 Certificate before revoke:');
    console.log(`   ID: ${certificateBefore.id}`);
    console.log(`   Status: ${certificateBefore.status}`);
    console.log(`   Certificate Number: ${certificateBefore.certificate_number}`);
    console.log(`   Certificate Hash: ${certificateBefore.certificate_hash}`);

    // Revoke certificate
    const certificateService = new CertificateService();
    const success = await certificateService.revokeCertificate(certificateId, reason, 'test-admin-id');

    if (!success) {
      console.error('❌ Failed to revoke certificate');
      process.exit(1);
    }

    console.log('\n✅ Certificate revoked successfully');

    // Get certificate after revoke
    const certificateAfter = await Certificate.findByPk(certificateId);
    console.log('\n📋 Certificate after revoke:');
    console.log(`   ID: ${certificateAfter!.id}`);
    console.log(`   Status: ${certificateAfter!.status}`);
    console.log(`   Revoked At: ${certificateAfter!.revoked_at}`);
    console.log(`   Revoked Reason: ${certificateAfter!.revoked_reason}`);

    // Test verification
    console.log('\n🔍 Testing verification...');
    const verifyResult = await certificateService.verifyCertificate(certificateBefore.certificate_hash);
    
    if (verifyResult.valid) {
      console.log('❌ Verification should fail for revoked certificate!');
    } else {
      console.log('✅ Verification correctly returns invalid for revoked certificate');
      console.log(`   Error: ${verifyResult.error}`);
    }

    console.log('\n✅ Test completed successfully');
    await sequelize.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testRevokeCertificate();

