/**
 * Seeder 005: Seed notifications
 * Creates sample notifications for all categories:
 * - system: System announcements
 * - announcement: General announcements
 * - course: Course updates
 * - assignment: Assignment notifications
 * - quiz: Quiz notifications
 * - grade: Grade notifications
 * - message: Message notifications
 */

import { Sequelize, QueryTypes } from 'sequelize';
import { randomUUID } from 'crypto';

// User IDs from 001-seed-users.ts
const USER_IDS = {
  SUPER_ADMIN: '00000000-0000-0000-0000-000000000001',
  ADMIN: '00000000-0000-0000-0000-000000000002',
  INSTRUCTOR_1: '00000000-0000-0000-0000-000000000003',
  INSTRUCTOR_2: '00000000-0000-0000-0000-000000000004',
  INSTRUCTOR_3: '00000000-0000-0000-0000-000000000005',
  STUDENT_1: '00000000-0000-0000-0000-000000000006',
  STUDENT_2: '00000000-0000-0000-0000-000000000007',
  STUDENT_3: '00000000-0000-0000-0000-000000000008',
  STUDENT_4: '00000000-0000-0000-0000-000000000009',
  STUDENT_5: '00000000-0000-0000-0000-000000000010',
};

// Course IDs from 002-seed-courses.ts
const COURSE_IDS = {
  REACT_COURSE: '00000000-0000-0000-0000-000000000101',
  NODEJS_COURSE: '00000000-0000-0000-0000-000000000102',
  ML_COURSE: '00000000-0000-0000-0000-000000000103',
  JS_BASICS: '00000000-0000-0000-0000-000000000104',
  ADVANCED_REACT: '00000000-0000-0000-0000-000000000105',
};

// Notification IDs
const NOTIFICATION_IDS = {
  // System notifications
  SYSTEM_1: '00000000-0000-0000-0005-000000000001',
  SYSTEM_2: '00000000-0000-0000-0005-000000000002',
  SYSTEM_3: '00000000-0000-0000-0005-000000000003',
  
  // Announcement notifications
  ANNOUNCE_1: '00000000-0000-0000-0005-000000000011',
  ANNOUNCE_2: '00000000-0000-0000-0005-000000000012',
  
  // Course notifications
  COURSE_1: '00000000-0000-0000-0005-000000000021',
  COURSE_2: '00000000-0000-0000-0005-000000000022',
  COURSE_3: '00000000-0000-0000-0005-000000000023',
  
  // Assignment notifications
  ASSIGN_1: '00000000-0000-0000-0005-000000000031',
  ASSIGN_2: '00000000-0000-0000-0005-000000000032',
  
  // Quiz notifications
  QUIZ_1: '00000000-0000-0000-0005-000000000041',
  QUIZ_2: '00000000-0000-0000-0005-000000000042',
  
  // Grade notifications
  GRADE_1: '00000000-0000-0000-0005-000000000051',
  GRADE_2: '00000000-0000-0000-0005-000000000052',
  GRADE_3: '00000000-0000-0000-0005-000000000053',
  
  // Message notifications
  MESSAGE_1: '00000000-0000-0000-0005-000000000061',
  MESSAGE_2: '00000000-0000-0000-0005-000000000062',
};

export async function seedNotifications(sequelize: Sequelize): Promise<void> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Define notifications
  const notifications = [
    // =================== SYSTEM NOTIFICATIONS ===================
    {
      id: NOTIFICATION_IDS.SYSTEM_1,
      sender_id: USER_IDS.ADMIN,
      notification_type: 'system',
      title: '🔧 Bảo trì hệ thống định kỳ',
      message: 'Hệ thống sẽ được bảo trì vào ngày 15/01/2025 từ 2:00 - 4:00 sáng. Trong thời gian này, một số tính năng có thể tạm thời không khả dụng. Chúng tôi xin lỗi vì sự bất tiện này và cảm ơn sự thông cảm của bạn.',
      link_url: '/announcements/maintenance',
      priority: 'high',
      category: 'system',
      related_resource_type: null,
      related_resource_id: null,
      scheduled_at: null,
      sent_at: oneDayAgo,
      expires_at: null,
      metadata: JSON.stringify({ type: 'maintenance', estimated_duration: '2 hours' }),
      is_broadcast: true,
      total_recipients: 500,
      read_count: 350,
      created_at: oneDayAgo,
      updated_at: oneDayAgo,
    },
    {
      id: NOTIFICATION_IDS.SYSTEM_2,
      sender_id: USER_IDS.ADMIN,
      notification_type: 'system',
      title: '✨ Cập nhật phiên bản mới v2.5.0',
      message: 'Chúng tôi vừa phát hành phiên bản mới với nhiều tính năng hấp dẫn:\n- Giao diện người dùng được cải thiện\n- Tính năng thông báo thời gian thực\n- Hỗ trợ livestream học trực tuyến\n- Tối ưu hiệu suất tải trang\n\nCập nhật ngay để trải nghiệm!',
      link_url: '/changelog/v2.5.0',
      priority: 'normal',
      category: 'system',
      related_resource_type: null,
      related_resource_id: null,
      scheduled_at: null,
      sent_at: twoDaysAgo,
      expires_at: null,
      metadata: JSON.stringify({ version: '2.5.0', features: ['ui', 'notifications', 'livestream', 'performance'] }),
      is_broadcast: true,
      total_recipients: 500,
      read_count: 420,
      created_at: twoDaysAgo,
      updated_at: twoDaysAgo,
    },
    {
      id: NOTIFICATION_IDS.SYSTEM_3,
      sender_id: USER_IDS.SUPER_ADMIN,
      notification_type: 'system',
      title: '🔒 Nhắc nhở bảo mật tài khoản',
      message: 'Để bảo vệ tài khoản của bạn, chúng tôi khuyến nghị:\n1. Đổi mật khẩu định kỳ mỗi 3 tháng\n2. Bật xác thực 2 yếu tố (2FA)\n3. Không chia sẻ thông tin đăng nhập\n4. Kiểm tra hoạt động đăng nhập gần đây\n\nBảo mật là ưu tiên hàng đầu!',
      link_url: '/settings/security',
      priority: 'high',
      category: 'system',
      related_resource_type: null,
      related_resource_id: null,
      scheduled_at: null,
      sent_at: oneWeekAgo,
      expires_at: null,
      metadata: JSON.stringify({ type: 'security_reminder' }),
      is_broadcast: true,
      total_recipients: 500,
      read_count: 280,
      created_at: oneWeekAgo,
      updated_at: oneWeekAgo,
    },

    // =================== ANNOUNCEMENT NOTIFICATIONS ===================
    {
      id: NOTIFICATION_IDS.ANNOUNCE_1,
      sender_id: USER_IDS.ADMIN,
      notification_type: 'announcement',
      title: '🎉 Chương trình khuyến mãi Tết 2025',
      message: 'Mừng xuân Ất Tỵ 2025, LMS triển khai chương trình ưu đãi đặc biệt:\n- Giảm 50% tất cả khóa học Premium\n- Tặng 1 tháng VIP cho người dùng mới\n- Cơ hội nhận học bổng toàn phần\n\nThời gian: 20/01 - 15/02/2025. Nhanh tay đăng ký!',
      link_url: '/promotions/tet-2025',
      priority: 'high',
      category: 'announcement',
      related_resource_type: null,
      related_resource_id: null,
      scheduled_at: null,
      sent_at: oneHourAgo,
      expires_at: new Date('2025-02-15'),
      metadata: JSON.stringify({ promotion_code: 'TET2025', discount: 50 }),
      is_broadcast: true,
      total_recipients: 500,
      read_count: 150,
      created_at: oneHourAgo,
      updated_at: oneHourAgo,
    },
    {
      id: NOTIFICATION_IDS.ANNOUNCE_2,
      sender_id: USER_IDS.ADMIN,
      notification_type: 'announcement',
      title: '📢 Thông báo lịch nghỉ Tết Nguyên Đán',
      message: 'Thông báo về lịch nghỉ Tết Nguyên Đán 2025:\n- Nghỉ Tết: từ 28/01/2025 đến 02/02/2025\n- Hoạt động bình thường từ: 03/02/2025\n\nTrong thời gian nghỉ, hệ thống vẫn hoạt động bình thường. Chúc bạn và gia đình một năm mới An Khang - Thịnh Vượng!',
      link_url: null,
      priority: 'normal',
      category: 'announcement',
      related_resource_type: null,
      related_resource_id: null,
      scheduled_at: null,
      sent_at: oneDayAgo,
      expires_at: null,
      metadata: JSON.stringify({ holiday: 'tet_2025' }),
      is_broadcast: true,
      total_recipients: 500,
      read_count: 380,
      created_at: oneDayAgo,
      updated_at: oneDayAgo,
    },

    // =================== COURSE NOTIFICATIONS ===================
    {
      id: NOTIFICATION_IDS.COURSE_1,
      sender_id: USER_IDS.INSTRUCTOR_1,
      notification_type: 'course',
      title: '📚 Bài học mới: React Hooks nâng cao',
      message: 'Chào các bạn học viên khóa React!\n\nMình vừa cập nhật bài học mới về React Hooks nâng cao bao gồm:\n- useCallback và useMemo\n- Custom Hooks\n- Best practices khi sử dụng Hooks\n\nHãy vào học và để lại câu hỏi nếu cần nhé!',
      link_url: '/courses/00000000-0000-0000-0000-000000000101/lessons/hooks-advanced',
      priority: 'normal',
      category: 'course',
      related_resource_type: 'course',
      related_resource_id: COURSE_IDS.REACT_COURSE,
      scheduled_at: null,
      sent_at: oneHourAgo,
      expires_at: null,
      metadata: JSON.stringify({ course_name: 'Complete React Development Course', lesson_name: 'React Hooks nâng cao' }),
      is_broadcast: false,
      total_recipients: 150,
      read_count: 45,
      created_at: oneHourAgo,
      updated_at: oneHourAgo,
    },
    {
      id: NOTIFICATION_IDS.COURSE_2,
      sender_id: USER_IDS.INSTRUCTOR_2,
      notification_type: 'course',
      title: '📖 Cập nhật nội dung khóa Node.js',
      message: 'Khóa học Node.js Backend Development vừa được cập nhật với các nội dung mới:\n\n1. Authentication với JWT\n2. OAuth2 integration\n3. Rate limiting và security best practices\n\nCác bài học cũ cũng được cải thiện với nhiều ví dụ thực tế hơn. Chúc các bạn học tốt!',
      link_url: '/courses/00000000-0000-0000-0000-000000000102',
      priority: 'normal',
      category: 'course',
      related_resource_type: 'course',
      related_resource_id: COURSE_IDS.NODEJS_COURSE,
      scheduled_at: null,
      sent_at: oneDayAgo,
      expires_at: null,
      metadata: JSON.stringify({ course_name: 'Node.js Backend Development', update_type: 'content_update' }),
      is_broadcast: false,
      total_recipients: 200,
      read_count: 120,
      created_at: oneDayAgo,
      updated_at: oneDayAgo,
    },
    {
      id: NOTIFICATION_IDS.COURSE_3,
      sender_id: USER_IDS.INSTRUCTOR_3,
      notification_type: 'course',
      title: '🎓 Nhắc nhở: Hoàn thành bài học ML cơ bản',
      message: 'Mình thấy một số bạn chưa hoàn thành các bài học về ML cơ bản trong tuần này.\n\nĐể theo kịp tiến độ, các bạn cần hoàn thành:\n- Bài 5: Regression Models\n- Bài 6: Classification\n- Quiz cuối chương\n\nHạn chót: Chủ nhật tuần này. Cố lên các bạn!',
      link_url: '/courses/00000000-0000-0000-0000-000000000103/progress',
      priority: 'high',
      category: 'course',
      related_resource_type: 'course',
      related_resource_id: COURSE_IDS.ML_COURSE,
      scheduled_at: null,
      sent_at: twoDaysAgo,
      expires_at: null,
      metadata: JSON.stringify({ course_name: 'Machine Learning Fundamentals', type: 'progress_reminder' }),
      is_broadcast: false,
      total_recipients: 300,
      read_count: 180,
      created_at: twoDaysAgo,
      updated_at: twoDaysAgo,
    },

    // =================== ASSIGNMENT NOTIFICATIONS ===================
    {
      id: NOTIFICATION_IDS.ASSIGN_1,
      sender_id: USER_IDS.INSTRUCTOR_1,
      notification_type: 'assignment',
      title: '📝 Bài tập mới: Xây dựng Todo App với React',
      message: 'Bài tập tuần này: Xây dựng ứng dụng Todo App\n\nYêu cầu:\n- Sử dụng React Hooks (useState, useEffect)\n- CRUD operations\n- Local storage persistence\n- UI/UX đẹp mắt\n\n📅 Deadline: 20/01/2025\n⭐ Điểm tối đa: 100 điểm\n\nNộp bài qua hệ thống submission. Good luck!',
      link_url: '/courses/00000000-0000-0000-0000-000000000101/assignments/todo-app',
      priority: 'high',
      category: 'assignment',
      related_resource_type: 'assignment',
      related_resource_id: '00000000-0000-0000-0003-000000000001',
      scheduled_at: null,
      sent_at: oneDayAgo,
      expires_at: new Date('2025-01-20'),
      metadata: JSON.stringify({ 
        assignment_name: 'Todo App với React', 
        deadline: '2025-01-20', 
        max_score: 100,
        course_name: 'Complete React Development Course'
      }),
      is_broadcast: false,
      total_recipients: 150,
      read_count: 100,
      created_at: oneDayAgo,
      updated_at: oneDayAgo,
    },
    {
      id: NOTIFICATION_IDS.ASSIGN_2,
      sender_id: USER_IDS.INSTRUCTOR_2,
      notification_type: 'assignment',
      title: '⏰ Nhắc nhở: Deadline bài tập REST API sắp hết',
      message: 'Deadline bài tập "Xây dựng REST API với Express" sẽ kết thúc sau 24 giờ nữa!\n\nTình trạng nộp bài hiện tại:\n- Đã nộp: 120/200 học viên\n- Chưa nộp: 80 học viên\n\nNếu bạn chưa nộp, hãy hoàn thành sớm để tránh bị trừ điểm. Có thắc mắc gì hãy liên hệ mình nhé!',
      link_url: '/courses/00000000-0000-0000-0000-000000000102/assignments/rest-api',
      priority: 'urgent',
      category: 'assignment',
      related_resource_type: 'assignment',
      related_resource_id: '00000000-0000-0000-0003-000000000002',
      scheduled_at: null,
      sent_at: oneHourAgo,
      expires_at: null,
      metadata: JSON.stringify({ 
        assignment_name: 'REST API với Express', 
        deadline: '2025-01-15',
        submitted: 120,
        total: 200,
        course_name: 'Node.js Backend Development'
      }),
      is_broadcast: false,
      total_recipients: 80,
      read_count: 60,
      created_at: oneHourAgo,
      updated_at: oneHourAgo,
    },

    // =================== QUIZ NOTIFICATIONS ===================
    {
      id: NOTIFICATION_IDS.QUIZ_1,
      sender_id: USER_IDS.INSTRUCTOR_3,
      notification_type: 'quiz',
      title: '📋 Quiz mới: Machine Learning Algorithms',
      message: 'Quiz mới đã sẵn sàng!\n\n📌 Chủ đề: Machine Learning Algorithms\n⏱️ Thời gian làm bài: 30 phút\n❓ Số câu hỏi: 20 câu\n🎯 Điểm đạt: 70%\n\nQuiz này sẽ kiểm tra kiến thức về:\n- Supervised Learning\n- Unsupervised Learning\n- Model Evaluation\n\nBắt đầu làm bài ngay!',
      link_url: '/courses/00000000-0000-0000-0000-000000000103/quizzes/ml-algorithms',
      priority: 'normal',
      category: 'quiz',
      related_resource_type: 'quiz',
      related_resource_id: '00000000-0000-0000-0006-000000000001',
      scheduled_at: null,
      sent_at: twoDaysAgo,
      expires_at: null,
      metadata: JSON.stringify({ 
        quiz_name: 'Machine Learning Algorithms', 
        duration: 30,
        questions: 20,
        passing_score: 70,
        course_name: 'Machine Learning Fundamentals'
      }),
      is_broadcast: false,
      total_recipients: 300,
      read_count: 250,
      created_at: twoDaysAgo,
      updated_at: twoDaysAgo,
    },
    {
      id: NOTIFICATION_IDS.QUIZ_2,
      sender_id: USER_IDS.INSTRUCTOR_1,
      notification_type: 'quiz',
      title: '🔔 Nhắc nhở: Quiz React Hooks đang mở',
      message: 'Quiz "React Hooks Mastery" vẫn đang mở!\n\nBạn chưa làm quiz này. Đây là cơ hội để kiểm tra hiểu biết của mình về:\n- useState, useEffect\n- useContext, useReducer\n- Custom Hooks\n\n⏰ Quiz sẽ đóng vào: 18/01/2025\n\nĐừng bỏ lỡ cơ hội luyện tập!',
      link_url: '/courses/00000000-0000-0000-0000-000000000101/quizzes/react-hooks',
      priority: 'normal',
      category: 'quiz',
      related_resource_type: 'quiz',
      related_resource_id: '00000000-0000-0000-0006-000000000002',
      scheduled_at: null,
      sent_at: oneDayAgo,
      expires_at: new Date('2025-01-18'),
      metadata: JSON.stringify({ 
        quiz_name: 'React Hooks Mastery', 
        deadline: '2025-01-18',
        course_name: 'Complete React Development Course'
      }),
      is_broadcast: false,
      total_recipients: 50,
      read_count: 30,
      created_at: oneDayAgo,
      updated_at: oneDayAgo,
    },

    // =================== GRADE NOTIFICATIONS ===================
    {
      id: NOTIFICATION_IDS.GRADE_1,
      sender_id: USER_IDS.INSTRUCTOR_1,
      notification_type: 'grade',
      title: '🎉 Chúc mừng! Bạn đạt điểm A bài tập React Components',
      message: 'Chúc mừng bạn đã hoàn thành xuất sắc bài tập "React Components"!\n\n📊 Kết quả:\n- Điểm số: 95/100\n- Xếp loại: A\n- Nhận xét: Bài làm rất tốt, code clean và đầy đủ chức năng\n\nHãy tiếp tục phát huy nhé! 💪',
      link_url: '/courses/00000000-0000-0000-0000-000000000101/grades',
      priority: 'normal',
      category: 'grade',
      related_resource_type: 'assignment',
      related_resource_id: '00000000-0000-0000-0003-000000000001',
      scheduled_at: null,
      sent_at: oneHourAgo,
      expires_at: null,
      metadata: JSON.stringify({ 
        assignment_name: 'React Components', 
        score: 95,
        max_score: 100,
        grade: 'A',
        course_name: 'Complete React Development Course'
      }),
      is_broadcast: false,
      total_recipients: 1,
      read_count: 0,
      created_at: oneHourAgo,
      updated_at: oneHourAgo,
    },
    {
      id: NOTIFICATION_IDS.GRADE_2,
      sender_id: USER_IDS.INSTRUCTOR_2,
      notification_type: 'grade',
      title: '📈 Điểm Quiz API Design đã được cập nhật',
      message: 'Kết quả Quiz "API Design Principles" của bạn:\n\n📊 Điểm: 18/20 (90%)\n✅ Trả lời đúng: 18 câu\n❌ Trả lời sai: 2 câu\n\nXem chi tiết đáp án và giải thích tại trang kết quả quiz.',
      link_url: '/courses/00000000-0000-0000-0000-000000000102/quizzes/api-design/results',
      priority: 'normal',
      category: 'grade',
      related_resource_type: 'quiz',
      related_resource_id: '00000000-0000-0000-0006-000000000003',
      scheduled_at: null,
      sent_at: oneDayAgo,
      expires_at: null,
      metadata: JSON.stringify({ 
        quiz_name: 'API Design Principles', 
        score: 18,
        max_score: 20,
        percentage: 90,
        course_name: 'Node.js Backend Development'
      }),
      is_broadcast: false,
      total_recipients: 1,
      read_count: 1,
      created_at: oneDayAgo,
      updated_at: oneDayAgo,
    },
    {
      id: NOTIFICATION_IDS.GRADE_3,
      sender_id: USER_IDS.INSTRUCTOR_3,
      notification_type: 'grade',
      title: '🏆 Bạn đã hoàn thành khóa học Machine Learning!',
      message: 'Chúc mừng bạn đã hoàn thành 100% khóa học "Machine Learning Fundamentals"! 🎉\n\n📜 Thành tích:\n- Hoàn thành: 30/30 bài học\n- Quiz trung bình: 88%\n- Bài tập: 92%\n- Điểm tổng kết: 90%\n\n🎓 Chứng chỉ của bạn đã sẵn sàng để tải về!\n\nHãy tiếp tục học các khóa nâng cao để phát triển kỹ năng nhé!',
      link_url: '/certificates/ml-fundamentals',
      priority: 'high',
      category: 'grade',
      related_resource_type: 'course',
      related_resource_id: COURSE_IDS.ML_COURSE,
      scheduled_at: null,
      sent_at: twoDaysAgo,
      expires_at: null,
      metadata: JSON.stringify({ 
        course_name: 'Machine Learning Fundamentals', 
        completion: 100,
        final_score: 90,
        certificate_available: true
      }),
      is_broadcast: false,
      total_recipients: 1,
      read_count: 1,
      created_at: twoDaysAgo,
      updated_at: twoDaysAgo,
    },

    // =================== MESSAGE NOTIFICATIONS ===================
    {
      id: NOTIFICATION_IDS.MESSAGE_1,
      sender_id: USER_IDS.INSTRUCTOR_1,
      notification_type: 'message',
      title: '💬 Tin nhắn mới từ giảng viên John Doe',
      message: 'Chào em,\n\nGiảng viên John Doe vừa gửi tin nhắn cho em về bài tập React Components. Hãy vào hộp thư để xem chi tiết và trả lời nhé.\n\nNội dung tóm tắt: "Mình đã review bài của em và có một số góp ý..."',
      link_url: '/messages/conversation/instructor-1',
      priority: 'normal',
      category: 'message',
      related_resource_type: 'message',
      related_resource_id: null,
      scheduled_at: null,
      sent_at: oneHourAgo,
      expires_at: null,
      metadata: JSON.stringify({ 
        sender_name: 'John Doe', 
        sender_role: 'instructor',
        preview: 'Mình đã review bài của em và có một số góp ý...'
      }),
      is_broadcast: false,
      total_recipients: 1,
      read_count: 0,
      created_at: oneHourAgo,
      updated_at: oneHourAgo,
    },
    {
      id: NOTIFICATION_IDS.MESSAGE_2,
      sender_id: USER_IDS.STUDENT_2,
      notification_type: 'message',
      title: '💬 Bạn có tin nhắn mới trong nhóm học tập',
      message: 'Nhóm "React Study Group" có 5 tin nhắn mới.\n\nTin nhắn gần nhất từ Bob Wilson: "Các bạn ơi, ai có thể giải thích useCallback vs useMemo không?"',
      link_url: '/messages/groups/react-study',
      priority: 'low',
      category: 'message',
      related_resource_type: 'chat',
      related_resource_id: null,
      scheduled_at: null,
      sent_at: oneDayAgo,
      expires_at: null,
      metadata: JSON.stringify({ 
        group_name: 'React Study Group', 
        unread_count: 5,
        last_sender: 'Bob Wilson'
      }),
      is_broadcast: false,
      total_recipients: 25,
      read_count: 20,
      created_at: oneDayAgo,
      updated_at: oneDayAgo,
    },
  ];

  // Insert notifications
  for (const notification of notifications) {
    // Check if notification already exists
    const existingNotification = await sequelize.query(
      'SELECT id FROM notifications WHERE id = ?',
      {
        replacements: [notification.id],
        type: QueryTypes.SELECT
      }
    );

    if (existingNotification.length > 0) {
      console.log(`⚠️  Notification ${notification.id} already exists, skipping...`);
      continue;
    }

    await sequelize.query(
      `INSERT INTO notifications (
        id, sender_id, notification_type, title, message, link_url, priority, category,
        related_resource_type, related_resource_id, scheduled_at, sent_at, expires_at,
        metadata, is_broadcast, total_recipients, read_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          notification.id, notification.sender_id, notification.notification_type,
          notification.title, notification.message, notification.link_url, notification.priority,
          notification.category, notification.related_resource_type, notification.related_resource_id,
          notification.scheduled_at, notification.sent_at, notification.expires_at,
          notification.metadata, notification.is_broadcast, notification.total_recipients,
          notification.read_count, notification.created_at, notification.updated_at
        ]
      }
    );

    console.log(`✅ Created notification: ${notification.title}`);
  }

  // Create notification recipients for students
  console.log('\n📬 Creating notification recipients...');
  
  const students = [
    USER_IDS.STUDENT_1,
    USER_IDS.STUDENT_2,
    USER_IDS.STUDENT_3,
    USER_IDS.STUDENT_4,
    USER_IDS.STUDENT_5,
  ];

  // System and announcement notifications - sent to all users
  const broadcastNotifications = [
    NOTIFICATION_IDS.SYSTEM_1,
    NOTIFICATION_IDS.SYSTEM_2,
    NOTIFICATION_IDS.SYSTEM_3,
    NOTIFICATION_IDS.ANNOUNCE_1,
    NOTIFICATION_IDS.ANNOUNCE_2,
  ];

  for (const notifId of broadcastNotifications) {
    for (const studentId of students) {
      const existingRecipient = await sequelize.query(
        'SELECT id FROM notification_recipients WHERE notification_id = ? AND recipient_id = ?',
        {
          replacements: [notifId, studentId],
          type: QueryTypes.SELECT
        }
      );

      if (existingRecipient.length > 0) continue;

      const isRead = Math.random() > 0.3; // 70% chance of being read

      await sequelize.query(
        `INSERT INTO notification_recipients (
          id, notification_id, recipient_id, is_read, is_archived, read_at, archived_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, false, ?, null, ?, ?)`,
        {
          replacements: [
            randomUUID(),
            notifId,
            studentId,
            isRead,
            isRead ? oneHourAgo : null,
            now,
            now
          ]
        }
      );
    }
  }

  // Course-specific notifications
  const courseNotifications = [
    { notifId: NOTIFICATION_IDS.COURSE_1, courseId: COURSE_IDS.REACT_COURSE },
    { notifId: NOTIFICATION_IDS.COURSE_2, courseId: COURSE_IDS.NODEJS_COURSE },
    { notifId: NOTIFICATION_IDS.COURSE_3, courseId: COURSE_IDS.ML_COURSE },
    { notifId: NOTIFICATION_IDS.ASSIGN_1, courseId: COURSE_IDS.REACT_COURSE },
    { notifId: NOTIFICATION_IDS.ASSIGN_2, courseId: COURSE_IDS.NODEJS_COURSE },
    { notifId: NOTIFICATION_IDS.QUIZ_1, courseId: COURSE_IDS.ML_COURSE },
    { notifId: NOTIFICATION_IDS.QUIZ_2, courseId: COURSE_IDS.REACT_COURSE },
  ];

  // Send course notifications to first 3 students (enrolled)
  const enrolledStudents = students.slice(0, 3);
  
  for (const { notifId } of courseNotifications) {
    for (let i = 0; i < enrolledStudents.length; i++) {
      const studentId = enrolledStudents[i];
      
      const existingRecipient = await sequelize.query(
        'SELECT id FROM notification_recipients WHERE notification_id = ? AND recipient_id = ?',
        {
          replacements: [notifId, studentId],
          type: QueryTypes.SELECT
        }
      );

      if (existingRecipient.length > 0) continue;

      const isRead = Math.random() > 0.4; // 60% chance of being read

      await sequelize.query(
        `INSERT INTO notification_recipients (
          id, notification_id, recipient_id, is_read, is_archived, read_at, archived_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, false, ?, null, ?, ?)`,
        {
          replacements: [
            randomUUID(),
            notifId,
            studentId,
            isRead,
            isRead ? oneHourAgo : null,
            now,
            now
          ]
        }
      );
    }
  }

  // Individual grade and message notifications for student 1
  const individualNotifications = [
    NOTIFICATION_IDS.GRADE_1,
    NOTIFICATION_IDS.GRADE_2,
    NOTIFICATION_IDS.GRADE_3,
    NOTIFICATION_IDS.MESSAGE_1,
    NOTIFICATION_IDS.MESSAGE_2,
  ];

  for (const notifId of individualNotifications) {
    const existingRecipient = await sequelize.query(
      'SELECT id FROM notification_recipients WHERE notification_id = ? AND recipient_id = ?',
      {
        replacements: [notifId, USER_IDS.STUDENT_1],
        type: QueryTypes.SELECT
      }
    );

    if (existingRecipient.length > 0) continue;

    const isRead = notifId !== NOTIFICATION_IDS.GRADE_1 && notifId !== NOTIFICATION_IDS.MESSAGE_1;

    await sequelize.query(
      `INSERT INTO notification_recipients (
        id, notification_id, recipient_id, is_read, is_archived, read_at, archived_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, false, ?, null, ?, ?)`,
      {
        replacements: [
          randomUUID(),
          notifId,
          USER_IDS.STUDENT_1,
          isRead,
          isRead ? oneDayAgo : null,
          now,
          now
        ]
      }
    );
  }

  console.log('\n✅ Notification seeding completed!');
  console.log(`📊 Summary:`);
  console.log(`   - System notifications: 3`);
  console.log(`   - Announcement notifications: 2`);
  console.log(`   - Course notifications: 3`);
  console.log(`   - Assignment notifications: 2`);
  console.log(`   - Quiz notifications: 2`);
  console.log(`   - Grade notifications: 3`);
  console.log(`   - Message notifications: 2`);
  console.log(`   - Total: 17 notifications`);
}
