/**
 * Test repository directly
 */
import 'dotenv-flow/config';
import { getSequelize } from '../config/db';
import setupAssociations from '../models/associations';
import { NotificationsRepository } from '../modules/notifications/notifications.repository';

async function main() {
  try {
    const seq = getSequelize();
    await seq.authenticate();
    console.log('✅ Connected');
    
    setupAssociations();
    console.log('✅ Associations setup');
    
    const repo = new NotificationsRepository();
    const STUDENT1_ID = '00000000-0000-0000-0000-000000000006';
    
    console.log('\n=== Testing getUserNotifications ===');
    const results = await repo.getUserNotifications(STUDENT1_ID, { limit: 10 });
    
    console.log('Repository returned:', results.length, 'items');
    
    if (results.length > 0) {
      results.slice(0, 5).forEach((r: any, i: number) => {
        const notif = r.notification;
        console.log(`\n${i + 1}. recipient_id: ${r.recipient_id}`);
        console.log(`   notification_id: ${r.notification_id}`);
        console.log(`   has notification object: ${!!notif}`);
        if (notif) {
          console.log(`   title: ${notif.title?.substring(0, 40)}...`);
        }
      });
    } else {
      console.log('⚠️ NO RESULTS FROM REPOSITORY!');
    }
    
    // Test count
    console.log('\n=== Testing getUnreadCount ===');
    const unreadCount = await repo.getUnreadCount(STUDENT1_ID);
    console.log('Unread count:', unreadCount);
    
    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
