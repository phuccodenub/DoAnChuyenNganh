/**
 * Test notification API endpoints to debug data flow
 */
import 'dotenv-flow/config';
import { NotificationsService } from '../modules/notifications/notifications.service';
import { getSequelize } from '../config/db';
import { setupAssociations } from '../models/associations';

async function main() {
  try {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Setup associations manually
    setupAssociations();
    console.log('✅ Associations setup');

    const service = new NotificationsService();
    
    // Test as student1
    const student1Id = '00000000-0000-0000-0000-000000000006';
    console.log('\n=== Testing getMyNotifications for student1 ===');
    const result = await service.getMyNotifications(student1Id, { limit: 10, offset: 0 });
    console.log('Result:', JSON.stringify(result, null, 2));
    
    // Test unread count
    console.log('\n=== Testing getUnreadCount for student1 ===');
    const unreadCount = await service.getUnreadCount(student1Id);
    console.log('Unread count:', unreadCount);

    // Test as admin
    const adminId = '00000000-0000-0000-0000-000000000002';
    console.log('\n=== Testing getSentNotifications for admin ===');
    const sentResult = await service.getSentNotifications(adminId, { limit: 10, offset: 0 });
    console.log('Sent notifications:', JSON.stringify(sentResult, null, 2));

    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message, error.stack);
    process.exit(1);
  }
}

main();
