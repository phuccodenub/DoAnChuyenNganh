/**
 * Test API response directly
 */
import 'dotenv-flow/config';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/v1.3.0';

async function main() {
  try {
    // Test /notifications (my notifications) as student
    console.log('🔐 Logging in as student1...');
    const studentLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'student1@example.com',
      password: 'Student123!'
    });
    
    const studentToken = studentLogin.data.data?.tokens?.accessToken;
    if (!studentToken) {
      console.error('Student login failed:', JSON.stringify(studentLogin.data, null, 2));
      process.exit(1);
    }
    console.log('✅ Student logged in successfully');
    console.log('User ID:', studentLogin.data.data?.user?.id);

    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    console.log('\n📋 Testing GET /notifications/me (student)...');
    const myRes = await axios.get(`${API_BASE}/notifications/me?limit=10`, { headers: studentHeaders });
    console.log('Response status:', myRes.status);
    console.log('Total:', myRes.data.data?.total);
    console.log('Notifications returned:', myRes.data.data?.notifications?.length);
    
    if (myRes.data.data?.notifications?.length > 0) {
      console.log('\nStudent notifications:');
      myRes.data.data.notifications.slice(0, 5).forEach((n: any, i: number) => {
        console.log(`${i + 1}. ${n.title?.substring(0, 50)}...`);
        console.log(`   created_at: ${n.created_at}`);
        console.log(`   is_read: ${n.is_read}`);
        console.log(`   id: ${n.id}`);
      });
    } else {
      console.log('\n⚠️ NO NOTIFICATIONS RETURNED!');
      console.log('Full response data:', JSON.stringify(myRes.data.data, null, 2));
    }

    // Test unread count
    console.log('\n📋 Testing GET /notifications/me/unread-count...');
    const unreadRes = await axios.get(`${API_BASE}/notifications/me/unread-count`, { headers: studentHeaders });
    console.log('Unread count:', unreadRes.data.data?.unread_count);

  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

main();
