/**
 * Test notifications API to verify data returned
 */
import 'dotenv-flow/config';
import { getSequelize } from '../config/db';
import setupAssociations from '../models/associations';
import { NotificationsService } from '../modules/notifications/notifications.service';
import NotificationRecipient from '../models/notification-recipient.model';
import Notification from '../models/notification.model';
import User from '../models/user.model';

async function main() {
  try {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Setup associations manually
    setupAssociations();
    console.log('✅ Associations setup');

    const STUDENT1_ID = '00000000-0000-0000-0000-000000000006';

    // Test raw repository query to see what we get
    console.log('\n=== RAW QUERY TEST ===');
    const recipients = await NotificationRecipient.findAll({
      where: { recipient_id: STUDENT1_ID },
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

    recipients.forEach((r: any, i: number) => {
      console.log(`\n${i + 1}. Recipient row:`);
      console.log(`   recipient.created_at: ${r.created_at}`);
      console.log(`   recipient.createdAt: ${r.createdAt}`);
      
      const notif = r.notification;
      if (notif) {
        console.log(`   notification.title: ${notif.title?.substring(0, 40)}...`);
        console.log(`   notification.created_at: ${notif.created_at}`);
        console.log(`   notification.createdAt: ${notif.createdAt}`);
        console.log(`   notification keys: ${Object.keys(notif.dataValues || notif).join(', ')}`);
      }
    });

    // Now test service
    console.log('\n=== SERVICE TEST ===');
    const service = new NotificationsService();
    const result = await service.getMyNotifications(STUDENT1_ID, { limit: 3 });
    
    result.notifications.forEach((n: any, i: number) => {
      console.log(`\n${i + 1}. ${n.title?.substring(0, 40)}...`);
      console.log(`   created_at value: ${n.created_at}`);
    });

    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
