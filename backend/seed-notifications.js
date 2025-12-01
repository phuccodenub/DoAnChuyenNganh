// Seed notifications to Supabase
const { Sequelize } = require('sequelize');

async function main() {
  const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false });
  
  console.log('Seeding notifications to Supabase...');
  
  // Get user IDs
  const [users] = await sequelize.query(`
    SELECT id, email FROM users WHERE email IN (
      'superadmin@example.com', 'admin@example.com', 
      'student1@example.com', 'instructor@example.com'
    )
  `);
  console.log('Found users:', users.map(u => u.email));
  
  const superadmin = users.find(u => u.email === 'superadmin@example.com');
  const student1 = users.find(u => u.email === 'student1@example.com');
  
  if (!superadmin || !student1) {
    console.error('Missing required users! Please ensure seed users exist.');
    process.exit(1);
  }
  
  // Create sample notifications - using valid enum values
  // Categories: assignment, quiz, grade, message, system, announcement
  const notificationData = [
    {
      notification_type: 'system_alert',
      title: 'Chào mừng đến với LMS',
      message: 'Chào mừng bạn đã tham gia hệ thống học tập trực tuyến!',
      category: 'system',
      priority: 'normal'
    },
    {
      notification_type: 'course_announcement',
      title: 'Khóa học mới đã mở',
      message: 'Khóa học "Lập trình Python cơ bản" đã sẵn sàng để đăng ký.',
      category: 'announcement',
      priority: 'normal'
    },
    {
      notification_type: 'deadline_reminder',
      title: 'Hạn nộp bài sắp đến',
      message: 'Bài tập "Thực hành vòng lặp" sẽ đến hạn trong 24 giờ.',
      category: 'assignment',
      priority: 'high'
    },
    {
      notification_type: 'grade_posted',
      title: 'Điểm bài kiểm tra',
      message: 'Điểm bài kiểm tra giữa kỳ của bạn đã được công bố: 8.5/10',
      category: 'grade',
      priority: 'normal'
    },
    {
      notification_type: 'comment',
      title: 'Có bình luận mới',
      message: 'Giảng viên đã phản hồi câu hỏi của bạn trong bài giảng "Cấu trúc dữ liệu"',
      category: 'message',
      priority: 'normal'
    },
    {
      notification_type: 'course_enrollment',
      title: 'Đăng ký khóa học thành công',
      message: 'Bạn đã đăng ký thành công khóa học "Machine Learning cơ bản"',
      category: 'announcement',
      priority: 'normal'
    },
    {
      notification_type: 'live_class_starting',
      title: 'Buổi học trực tuyến sắp bắt đầu',
      message: 'Buổi học "Q&A Python" sẽ bắt đầu trong 30 phút.',
      category: 'announcement',
      priority: 'high'
    },
    {
      notification_type: 'system_maintenance',
      title: 'Thông báo bảo trì',
      message: 'Hệ thống sẽ bảo trì vào 23:00 - 02:00 ngày mai.',
      category: 'system',
      priority: 'low'
    },
    {
      notification_type: 'achievement',
      title: 'Chúc mừng! Bạn đạt huy hiệu mới',
      message: 'Bạn đã nhận được huy hiệu "Học viên chăm chỉ" - hoàn thành 5 khóa học.',
      category: 'system',
      priority: 'normal'
    },
    {
      notification_type: 'certificate_ready',
      title: 'Chứng chỉ đã sẵn sàng',
      message: 'Chứng chỉ hoàn thành khóa học "Web Development" đã sẵn sàng để tải về.',
      category: 'announcement',
      priority: 'normal'
    },
    {
      notification_type: 'quiz_due',
      title: 'Quiz sắp hết hạn',
      message: 'Quiz "Kiểm tra chương 5" sẽ hết hạn trong 2 giờ nữa.',
      category: 'quiz',
      priority: 'high'
    },
    {
      notification_type: 'promotion',
      title: 'Ưu đãi đặc biệt',
      message: 'Giảm 50% cho tất cả khóa học Pro trong tuần này!',
      category: 'system',
      priority: 'low'
    }
  ];
  
  let createdCount = 0;
  
  for (const data of notificationData) {
    const id = require('crypto').randomUUID();
    const now = new Date();
    // Create notifications with different timestamps
    const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random within last 7 days
    
    await sequelize.query(`
      INSERT INTO notifications (
        id, sender_id, notification_type, title, message, 
        category, priority, is_broadcast, total_recipients, read_count,
        created_at, updated_at
      ) VALUES (
        '${id}', '${superadmin.id}', '${data.notification_type}', 
        '${data.title}', '${data.message}',
        '${data.category}', '${data.priority}', false, 1, 0,
        '${createdAt.toISOString()}', '${createdAt.toISOString()}'
      )
      ON CONFLICT DO NOTHING
    `);
    
    // Create recipient for student1
    const recipientId = require('crypto').randomUUID();
    await sequelize.query(`
      INSERT INTO notification_recipients (
        id, notification_id, recipient_id, is_read, is_archived, created_at, updated_at
      ) VALUES (
        '${recipientId}', '${id}', '${student1.id}', 
        ${Math.random() > 0.5}, false,
        '${createdAt.toISOString()}', '${createdAt.toISOString()}'
      )
      ON CONFLICT DO NOTHING
    `);
    
    createdCount++;
    console.log(`Created: ${data.title}`);
  }
  
  console.log(`\nDone! Created ${createdCount} notifications for student1.`);
  
  // Verify
  const [count] = await sequelize.query(`
    SELECT COUNT(*) as total FROM notification_recipients 
    WHERE recipient_id = '${student1.id}'
  `);
  console.log('Total notifications for student1:', count[0].total);
  
  process.exit(0);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
