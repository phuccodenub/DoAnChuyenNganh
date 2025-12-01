// Quick test script to run inside container
const { Sequelize } = require('sequelize');

async function main() {
  const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false });
  
  const userId = '00000000-0000-0000-0000-000000000006';
  
  // Test 1: Raw count
  const [results] = await sequelize.query(
    `SELECT COUNT(*) as total FROM notification_recipients WHERE recipient_id = '${userId}' AND is_archived = false`
  );
  console.log('Raw SQL count:', results);
  
  // Test 2: With include notification
  const [withNotif] = await sequelize.query(`
    SELECT nr.*, n.title, n.notification_type
    FROM notification_recipients nr
    JOIN notifications n ON nr.notification_id = n.id
    WHERE nr.recipient_id = '${userId}'
    AND nr.is_archived = false
    LIMIT 20
  `);
  console.log('Total with notification join:', withNotif.length);
  console.log('First 3:');
  withNotif.slice(0, 3).forEach(r => {
    console.log({
      id: r.id,
      notification_id: r.notification_id,
      title: r.title,
      is_read: r.is_read
    });
  });
  
  process.exit(0);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
