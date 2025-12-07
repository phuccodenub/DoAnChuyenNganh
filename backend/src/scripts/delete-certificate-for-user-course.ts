/**
 * Script to delete certificate for a specific user and course
 * Usage: ts-node -r tsconfig-paths/register src/scripts/delete-certificate-for-user-course.ts <userId> <courseId>
 */

import 'dotenv-flow/config';
import { getSequelize } from '../config/db';
import Certificate from '../models/certificate.model';

async function deleteCertificate() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: ts-node delete-certificate-for-user-course.ts <userId> <courseId>');
    console.error('Example: ts-node delete-certificate-for-user-course.ts e2aa3089-6205-426f-96cb-ded1eb2c18a7 ea154833-5ba5-447d-96b5-682b084953b4');
    process.exit(1);
  }

  const [userId, courseId] = args;

  try {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find and delete certificate
    const deleted = await Certificate.destroy({
      where: {
        user_id: userId,
        course_id: courseId,
      },
    });

    if (deleted > 0) {
      console.log(`✅ Deleted ${deleted} certificate(s) for user ${userId} and course ${courseId}`);
      console.log('💡 Now refresh the course progress page to auto-generate a new certificate');
    } else {
      console.log(`ℹ️  No certificate found for user ${userId} and course ${courseId}`);
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteCertificate();

