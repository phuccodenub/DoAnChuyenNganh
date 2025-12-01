/**
 * Debug notifications data
 */
import 'dotenv-flow/config';
import { getSequelize } from '../config/db';

const sequelize = getSequelize();

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected');

    // Check notification_recipients for student1
    console.log('\n=== NOTIFICATION_RECIPIENTS FOR STUDENT1 ===');
    const [recipients] = await sequelize.query(`
      SELECT nr.id, nr.notification_id, nr.recipient_id, n.title
      FROM notification_recipients nr
      JOIN notifications n ON n.id = nr.notification_id
      WHERE nr.recipient_id = '00000000-0000-0000-0000-000000000006'
      ORDER BY n.created_at DESC
      LIMIT 10
    `);
    console.log(JSON.stringify(recipients, null, 2));

    // Check total recipients for student1
    console.log('\n=== TOTAL FOR STUDENT1 ===');
    const [count] = await sequelize.query(`
      SELECT COUNT(*) as total FROM notification_recipients
      WHERE recipient_id = '00000000-0000-0000-0000-000000000006'
    `);
    console.log(JSON.stringify(count, null, 2));

    // Check all notification_recipients
    console.log('\n=== ALL NOTIFICATION_RECIPIENTS (sample) ===');
    const [allRecipients] = await sequelize.query(`
      SELECT nr.recipient_id, u.email, COUNT(*) as notif_count
      FROM notification_recipients nr
      JOIN users u ON u.id = nr.recipient_id
      GROUP BY nr.recipient_id, u.email
      ORDER BY notif_count DESC
      LIMIT 10
    `);
    console.log(JSON.stringify(allRecipients, null, 2));

    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
