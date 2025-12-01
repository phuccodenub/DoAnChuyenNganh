import 'dotenv-flow/config';
import { getSequelize } from './src/config/db';
import { QueryTypes } from 'sequelize';

// Import and setup associations manually
import './src/models';
import { setupAssociations } from './src/models/associations';
import { setupExtendedAssociations } from './src/models/associations-extended';

async function check() {
  const sequelize = getSequelize();
  await sequelize.authenticate();
  console.log('Connected to DB');
  
  // Setup associations without sync
  setupAssociations();
  setupExtendedAssociations();
  console.log('Associations setup');
  
  // Import models after associations are setup
  const NotificationRecipient = (await import('./src/models/notification-recipient.model')).default;
  const Notification = (await import('./src/models/notification.model')).default;
  const User = (await import('./src/models/user.model')).default;
  
  const studentId = '00000000-0000-0000-0000-000000000006';
  
  // Test query directly
  console.log('\n1. Direct raw query test:');
  const rawResults = await sequelize.query(
    `SELECT nr.id, n.title FROM notification_recipients nr 
     JOIN notifications n ON nr.notification_id = n.id 
     WHERE nr.recipient_id = $1 LIMIT 3`,
    { bind: [studentId], type: QueryTypes.SELECT }
  ) as any[];
  console.log('Raw query results:', rawResults.length, 'items');
  rawResults.forEach((r: any) => console.log(`  - ${r.title}`));
  
  // Test Sequelize ORM query
  console.log('\n2. Sequelize ORM query test:');
  try {
    const ormResults = await NotificationRecipient.findAll({
      where: { recipient_id: studentId },
      limit: 3,
      include: [
        {
          model: Notification,
          as: 'notification',
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'first_name', 'last_name', 'avatar']
            }
          ]
        }
      ]
    });
    console.log('ORM query results:', ormResults.length, 'items');
    ormResults.forEach((r: any) => {
      console.log(`  - ${r.notification?.title || 'NO NOTIFICATION LOADED'}`);
    });
  } catch (err) {
    console.error('ORM query error:', err);
  }
  
  process.exit(0);
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});
