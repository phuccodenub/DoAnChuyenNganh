// eslint-disable-next-line @typescript-eslint/no-require-imports
const { connectDatabase, sequelize } = require('../config/db');

const userId = '00000000-0000-0000-0000-000000000006';

async function main() {
  await connectDatabase();
  console.log('Testing database count for student1...');
  
  // Test raw SQL
  const [results] = await sequelize.query(`
    SELECT COUNT(*) as total 
    FROM notification_recipients 
    WHERE recipient_id = '${userId}' 
    AND is_archived = false
  `);
  console.log('Raw SQL count:', results);
  
  // Test with Sequelize model
  const NotificationRecipient = require('../models/notification-recipient.model').default;
  
  const count = await NotificationRecipient.count({
    where: {
      recipient_id: userId,
      is_archived: false
    }
  });
  console.log('Sequelize count:', count);
  
  // Get some records
  const records = await NotificationRecipient.findAll({
    where: {
      recipient_id: userId,
      is_archived: false
    },
    limit: 20
  });
  console.log('Records found:', records.length);
  console.log('First 3 records:');
  records.slice(0, 3).forEach((r: any) => {
    console.log({
      id: r.id,
      notification_id: r.notification_id,
      is_read: r.is_read,
      is_archived: r.is_archived
    });
  });
  
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
