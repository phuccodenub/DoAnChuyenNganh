/**
 * Complete Course Seeder
 * Creates a comprehensive course with all related data for UI testing
 * 
 * Course structure:
 * - Course: "Introduction to React Development"
 * - Instructor: instructor1@example.com
 * - Student: student1@example.com  
 * - Category: 10000000-0000-0000-0000-000000000001
 * - 3 Sections with multiple lessons
 * - 2 Quizzes with questions
 * - 2 Assignments
 * - Enrollment with progress
 * - Chat messages
 */

import 'dotenv-flow/config';
import { getSequelize } from '../config/db';
import logger from '../utils/logger.util';

const sequelize = getSequelize();

// IDs for our complete course data
const COURSE_ID = '20000000-0000-0000-0000-000000000001';
const INSTRUCTOR_ID = '00000000-0000-0000-0000-000000000003'; // instructor1@example.com
const STUDENT_ID = '00000000-0000-0000-0000-000000000006'; // student1@example.com
const CATEGORY_ID = '10000000-0000-0000-0000-000000000001';

// Section IDs
const SECTION_1_ID = '30000000-0000-0000-0000-000000000001';
const SECTION_2_ID = '30000000-0000-0000-0000-000000000002';
const SECTION_3_ID = '30000000-0000-0000-0000-000000000003';

// Lesson IDs
const LESSON_1_1_ID = '40000000-0000-0000-0000-000000000001';
const LESSON_1_2_ID = '40000000-0000-0000-0000-000000000002';
const LESSON_1_3_ID = '40000000-0000-0000-0000-000000000003';
const LESSON_2_1_ID = '40000000-0000-0000-0000-000000000004';
const LESSON_2_2_ID = '40000000-0000-0000-0000-000000000005';
const LESSON_2_3_ID = '40000000-0000-0000-0000-000000000006';
const LESSON_3_1_ID = '40000000-0000-0000-0000-000000000007';
const LESSON_3_2_ID = '40000000-0000-0000-0000-000000000008';

// Quiz IDs
const QUIZ_1_ID = '50000000-0000-0000-0000-000000000001';
const QUIZ_2_ID = '50000000-0000-0000-0000-000000000002';

// Assignment IDs
const ASSIGNMENT_1_ID = '60000000-0000-0000-0000-000000000001';
const ASSIGNMENT_2_ID = '60000000-0000-0000-0000-000000000002';

async function seedCourse() {
  logger.info('📚 Creating course...');
  
  const course = {
    id: COURSE_ID,
    title: 'Introduction to React Development',
    description: `Learn React fundamentals: components, hooks, state.

This comprehensive course will take you from React basics to building real-world applications. You'll learn:

• Core React concepts and component architecture
• Modern hooks (useState, useEffect, useContext, etc.)
• State management and data flow
• Building reusable components
• Working with forms and events
• API integration and async operations
• Routing with React Router
• Best practices and common patterns

Perfect for beginners with basic JavaScript knowledge who want to master React development.`,
    short_description: 'Learn React fundamentals: components, hooks, state.',
    instructor_id: INSTRUCTOR_ID,
    // Note: category field removed as it doesn't exist in DB schema
    level: 'beginner',
    language: 'vi',
    price: 0,
    currency: 'USD',
    is_free: true,
    is_featured: true,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    video_intro: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
    total_students: 23,
    total_lessons: 8,
    duration_hours: 30,
    rating: 4.5,
    total_ratings: 18,
    status: 'published',
    published_at: new Date('2024-01-01'),
    prerequisites: JSON.stringify([
      'Basic HTML/CSS knowledge',
      'JavaScript fundamentals',
      'ES6+ features understanding'
    ]),
    learning_objectives: JSON.stringify([
      'Build modern React applications from scratch',
      'Master React Hooks and component lifecycle',
      'Implement state management effectively',
      'Create reusable and maintainable components',
      'Handle forms, events, and user interactions',
      'Integrate APIs and handle async operations',
      'Implement routing in React applications'
    ]),
    tags: JSON.stringify(['React', 'JavaScript', 'Frontend', 'Web Development', 'Hooks']),
    metadata: JSON.stringify({
      difficulty_rating: 'easy',
      completion_time: '4-6 weeks',
      certificate_available: true,
      has_subtitles: true
    })
  };

  try {
    const [result]: any = await sequelize.query(
      `INSERT INTO courses (
        id, title, description, short_description, instructor_id,
        level, language, price, currency, is_free, is_featured, thumbnail, video_intro,
        total_students, total_lessons, duration_hours, rating, total_ratings,
        status, published_at, prerequisites, learning_objectives, tags, metadata,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        updated_at = EXCLUDED.updated_at`,
      {
        replacements: [
          course.id, course.title, course.description, course.short_description,
          course.instructor_id, course.level, course.language,
          course.price, course.currency, course.is_free, course.is_featured,
          course.thumbnail, course.video_intro, course.total_students, course.total_lessons,
          course.duration_hours, course.rating, course.total_ratings,
          course.status, course.published_at, course.prerequisites,
          course.learning_objectives, course.tags, course.metadata,
          new Date(), new Date()
        ]
      }
    );
    logger.info(`✅ Course created: ${course.title}`);
  } catch (error: any) {
    logger.error('❌ Error creating course:', error.message);
    throw error;
  }
}

async function seedSections() {
  logger.info('📑 Creating sections...');
  
  const sections = [
    {
      id: SECTION_1_ID,
      course_id: COURSE_ID,
      title: 'Chương 1: Giới thiệu về Flutter',
      description: 'Tìm hiểu cơ bản về Flutter framework và môi trường phát triển',
      order_index: 1,
      is_published: true,
      duration_minutes: 180,
      objectives: JSON.stringify([
        'Hiểu Flutter là gì và tại sao nên học',
        'Cài đặt môi trường phát triển',
        'Xây dựng ứng dụng Hello World đầu tiên'
      ])
    },
    {
      id: SECTION_2_ID,
      course_id: COURSE_ID,
      title: 'Chương 2: Widgets cơ bản',
      description: 'Học về các widgets cơ bản trong Flutter',
      order_index: 2,
      is_published: true,
      duration_minutes: 240,
      objectives: JSON.stringify([
        'Hiểu khái niệm Widget trong Flutter',
        'Sử dụng StatelessWidget và StatefulWidget',
        'Xây dựng giao diện với các widgets phổ biến'
      ])
    },
    {
      id: SECTION_3_ID,
      course_id: COURSE_ID,
      title: 'Chương 3: Navigation và Routing',
      description: 'Tìm hiểu về điều hướng giữa các màn hình',
      order_index: 3,
      is_published: true,
      duration_minutes: 200,
      objectives: JSON.stringify([
        'Điều hướng cơ bản với Navigator',
        'Named routes và route parameters',
        'Advanced navigation patterns'
      ])
    }
  ];

  for (const section of sections) {
    try {
      await sequelize.query(
        `INSERT INTO sections (
          id, course_id, title, description, order_index, is_published, duration_minutes, objectives,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          updated_at = EXCLUDED.updated_at`,
        {
          replacements: [
            section.id, section.course_id, section.title, section.description,
            section.order_index, section.is_published, section.duration_minutes,
            section.objectives, new Date(), new Date()
          ]
        }
      );
      logger.info(`✅ Section created: ${section.title}`);
    } catch (error: any) {
      logger.error(`❌ Error creating section ${section.title}:`, error.message);
      throw error;
    }
  }
}

async function seedLessons() {
  logger.info('📝 Creating lessons...');
  
  const lessons = [
    // Section 1 lessons
    {
      id: LESSON_1_1_ID,
      section_id: SECTION_1_ID,
      title: 'Bài 1: Flutter là gì và tại sao nên học?',
      description: 'Giới thiệu tổng quan về Flutter framework và lợi ích của việc sử dụng Flutter',
      content_type: 'video',
      content: `<h2>Flutter là gì?</h2>
<p>Flutter là một framework mã nguồn mở được phát triển bởi Google để xây dựng ứng dụng đa nền tảng.</p>

<h3>Ưu điểm của Flutter:</h3>
<ul>
  <li>Hot Reload - Cập nhật code ngay lập tức</li>
  <li>UI đẹp và mượt mà</li>
  <li>Hiệu suất cao gần native</li>
  <li>Một codebase cho nhiều platform</li>
</ul>`,
      video_url: 'https://www.youtube.com/watch?v=1xipg02Wu8s',
      video_duration: 900, // 15 minutes
      order_index: 1,
      duration_minutes: 30,
      is_published: true,
      is_free_preview: true
    },
    {
      id: LESSON_1_2_ID,
      section_id: SECTION_1_ID,
      title: 'Bài 2: Hướng dẫn cài đặt môi trường',
      description: 'Cài đặt Flutter SDK, Android Studio, và các công cụ cần thiết',
      content_type: 'document',
      content: `<h2>Cài đặt Flutter</h2>
<ol>
  <li>Tải Flutter SDK từ trang chính thức</li>
  <li>Giải nén và thêm vào PATH</li>
  <li>Chạy flutter doctor để kiểm tra</li>
  <li>Cài đặt Android Studio hoặc VS Code</li>
  <li>Cài đặt Flutter plugin</li>
</ol>

<h3>Yêu cầu hệ thống:</h3>
<ul>
  <li>Windows 10 trở lên / macOS / Linux</li>
  <li>Ít nhất 8GB RAM</li>
  <li>10GB dung lượng trống</li>
</ul>`,
      order_index: 2,
      duration_minutes: 45,
      is_published: true,
      is_free_preview: true
    },
    {
      id: LESSON_1_3_ID,
      section_id: SECTION_1_ID,
      title: 'Bài 3: Xây dựng ứng dụng "Hello World"',
      description: 'Tạo ứng dụng Flutter đầu tiên và hiểu cấu trúc project',
      content_type: 'video',
      content: `<h2>Hello World App</h2>
<p>Trong bài này, chúng ta sẽ xây dựng ứng dụng Flutter đầu tiên.</p>

<h3>Các bước thực hiện:</h3>
<ol>
  <li>Tạo project mới với flutter create</li>
  <li>Hiểu cấu trúc thư mục</li>
  <li>Chỉnh sửa file main.dart</li>
  <li>Chạy ứng dụng trên emulator</li>
</ol>`,
      video_url: 'https://www.youtube.com/watch?v=xWV71C2kp38',
      video_duration: 1200,
      order_index: 3,
      duration_minutes: 60,
      is_published: true,
      is_free_preview: false
    },
    
    // Section 2 lessons
    {
      id: LESSON_2_1_ID,
      section_id: SECTION_2_ID,
      title: 'Bài 1: StatelessWidget và StatefulWidget',
      description: 'Tìm hiểu sự khác biệt giữa StatelessWidget và StatefulWidget',
      content_type: 'video',
      content: `<h2>Widgets trong Flutter</h2>
<p>Widget là thành phần cơ bản nhất trong Flutter. Mọi thứ đều là widget!</p>

<h3>StatelessWidget:</h3>
<ul>
  <li>Không thay đổi trạng thái</li>
  <li>Render một lần</li>
  <li>Dùng cho UI tĩnh</li>
</ul>

<h3>StatefulWidget:</h3>
<ul>
  <li>Có thể thay đổi trạng thái</li>
  <li>Re-render khi state thay đổi</li>
  <li>Dùng cho UI động</li>
</ul>`,
      video_url: 'https://www.youtube.com/watch?v=p5dkB3Mrxdo',
      video_duration: 1500,
      order_index: 1,
      duration_minutes: 50,
      is_published: true,
      is_free_preview: false
    },
    {
      id: LESSON_2_2_ID,
      section_id: SECTION_2_ID,
      title: 'Bài 2: Layout Widgets (Container, Row, Column)',
      description: 'Học cách sắp xếp layout với Container, Row, Column',
      content_type: 'video',
      content: `<h2>Layout Widgets</h2>
<p>Flutter cung cấp nhiều widget để xây dựng layout phức tạp.</p>

<h3>Container:</h3>
<ul>
  <li>Widget đa năng nhất</li>
  <li>Padding, margin, decoration</li>
  <li>Có thể chứa widget con</li>
</ul>

<h3>Row & Column:</h3>
<ul>
  <li>Row: Sắp xếp ngang</li>
  <li>Column: Sắp xếp dọc</li>
  <li>MainAxis và CrossAxis</li>
</ul>`,
      video_url: 'https://www.youtube.com/watch?v=RJEnTRBxaSg',
      video_duration: 1800,
      order_index: 2,
      duration_minutes: 70,
      is_published: true,
      is_free_preview: false
    },
    {
      id: LESSON_2_3_ID,
      section_id: SECTION_2_ID,
      title: 'Bài 3: Text, Image, và Button Widgets',
      description: 'Làm việc với các widget hiển thị nội dung và tương tác',
      content_type: 'text',
      content: `<h2>Basic Widgets</h2>

<h3>Text Widget:</h3>
<pre><code>Text(
  'Hello Flutter',
  style: TextStyle(fontSize: 24, color: Colors.blue),
)</code></pre>

<h3>Image Widget:</h3>
<pre><code>Image.network('https://example.com/image.png')
Image.asset('assets/logo.png')</code></pre>

<h3>Button Widgets:</h3>
<pre><code>ElevatedButton(
  onPressed: () {},
  child: Text('Click me'),
)

TextButton(...)
IconButton(...)</code></pre>`,
      order_index: 3,
      duration_minutes: 40,
      is_published: true,
      is_free_preview: false
    },
    
    // Section 3 lessons
    {
      id: LESSON_3_1_ID,
      section_id: SECTION_3_ID,
      title: 'Bài 1: Navigator.push và Navigator.pop',
      description: 'Điều hướng cơ bản giữa các màn hình',
      content_type: 'video',
      content: `<h2>Basic Navigation</h2>
<p>Học cách chuyển đổi giữa các màn hình trong Flutter.</p>

<h3>Navigator.push:</h3>
<pre><code>Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => SecondScreen()),
);</code></pre>

<h3>Navigator.pop:</h3>
<pre><code>Navigator.pop(context);</code></pre>`,
      video_url: 'https://www.youtube.com/watch?v=nyvwx7o277U',
      video_duration: 1200,
      order_index: 1,
      duration_minutes: 50,
      is_published: true,
      is_free_preview: false
    },
    {
      id: LESSON_3_2_ID,
      section_id: SECTION_3_ID,
      title: 'Bài 2: Named Routes và Route Parameters',
      description: 'Sử dụng named routes và truyền dữ liệu giữa màn hình',
      content_type: 'text',
      content: `<h2>Named Routes</h2>

<h3>Định nghĩa routes:</h3>
<pre><code>MaterialApp(
  routes: {
    '/': (context) => HomeScreen(),
    '/second': (context) => SecondScreen(),
  },
)</code></pre>

<h3>Điều hướng:</h3>
<pre><code>Navigator.pushNamed(context, '/second');</code></pre>

<h3>Truyền arguments:</h3>
<pre><code>Navigator.pushNamed(
  context, 
  '/second',
  arguments: {'id': 123},
);</code></pre>`,
      order_index: 2,
      duration_minutes: 60,
      is_published: true,
      is_free_preview: false
    }
  ];

  for (const lesson of lessons) {
    try {
      await sequelize.query(
        `INSERT INTO lessons (
          id, section_id, title, description, content_type, content,
          video_url, video_duration, order_index, duration_minutes,
          is_published, is_free_preview, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          updated_at = EXCLUDED.updated_at`,
        {
          replacements: [
            lesson.id, lesson.section_id, lesson.title, lesson.description,
            lesson.content_type, lesson.content, lesson.video_url || null,
            lesson.video_duration || null, lesson.order_index, lesson.duration_minutes,
            lesson.is_published, lesson.is_free_preview, new Date(), new Date()
          ]
        }
      );
      logger.info(`✅ Lesson created: ${lesson.title}`);
    } catch (error: any) {
      logger.error(`❌ Error creating lesson ${lesson.title}:`, error.message);
      throw error;
    }
  }
}

async function seedQuizzes() {
  logger.info('❓ Creating quizzes...');
  
  const quizzes = [
    {
      id: QUIZ_1_ID,
      course_id: COURSE_ID,
      title: 'Quiz: State Management',
      description: 'Kiểm tra kiến thức về quản lý state trong React',
      duration_minutes: 30,
      passing_score: 70.0,
      max_attempts: 3,
      shuffle_questions: true,
      show_correct_answers: true,
      available_from: new Date('2024-01-01'),
      available_until: null,
      is_published: true
    },
    {
      id: QUIZ_2_ID,
      course_id: COURSE_ID,
      title: 'Quiz: React Hooks',
      description: 'Bài kiểm tra về React Hooks',
      duration_minutes: 25,
      passing_score: 75.0,
      max_attempts: 2,
      shuffle_questions: false,
      show_correct_answers: true,
      available_from: new Date('2024-01-01'),
      available_until: null,
      is_published: true
    }
  ];

  for (const quiz of quizzes) {
    try {
      await sequelize.query(
        `INSERT INTO quizzes (
          id, course_id, title, description, duration_minutes, passing_score,
          max_attempts, shuffle_questions, show_correct_answers,
          available_from, available_until, is_published,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          updated_at = EXCLUDED.updated_at`,
        {
          replacements: [
            quiz.id, quiz.course_id, quiz.title, quiz.description,
            quiz.duration_minutes, quiz.passing_score, quiz.max_attempts,
            quiz.shuffle_questions, quiz.show_correct_answers,
            quiz.available_from, quiz.available_until, quiz.is_published,
            new Date(), new Date()
          ]
        }
      );
      logger.info(`✅ Quiz created: ${quiz.title}`);
    } catch (error: any) {
      logger.error(`❌ Error creating quiz ${quiz.title}:`, error.message);
      throw error;
    }
  }
}

async function seedQuizQuestions() {
  logger.info('❓ Creating quiz questions...');
  
  const questions = [
    // Quiz 1 questions
    {
      quiz_id: QUIZ_1_ID,
      question_text: 'useState hook được sử dụng để làm gì?',
      question_type: 'single_choice',
      points: 10,
      order_index: 1,
      explanation: 'useState là hook để quản lý state trong functional component'
    },
    {
      quiz_id: QUIZ_1_ID,
      question_text: 'useEffect có thể được sử dụng để thực hiện side effects?',
      question_type: 'true_false',
      points: 5,
      order_index: 2,
      explanation: 'useEffect được thiết kế đặc biệt để xử lý side effects'
    },
    {
      quiz_id: QUIZ_1_ID,
      question_text: 'Các hooks nào sau đây là built-in hooks của React?',
      question_type: 'multiple_choice',
      points: 15,
      order_index: 3,
      explanation: 'useState, useEffect, useContext đều là built-in hooks'
    },
    
    // Quiz 2 questions
    {
      quiz_id: QUIZ_2_ID,
      question_text: 'Khi nào nên sử dụng useCallback?',
      question_type: 'single_choice',
      points: 10,
      order_index: 1,
      explanation: 'useCallback được dùng để memoize functions'
    },
    {
      quiz_id: QUIZ_2_ID,
      question_text: 'useMemo và useCallback có chức năng giống nhau?',
      question_type: 'true_false',
      points: 5,
      order_index: 2,
      explanation: 'useMemo memoize values, useCallback memoize functions'
    }
  ];

  for (const [index, question] of questions.entries()) {
    try {
      const questionId = `70000000-0000-0000-0000-0000000000${(index + 1).toString().padStart(2, '0')}`;
      await sequelize.query(
        `INSERT INTO quiz_questions (
          id, quiz_id, question_text, question_type, points, order_index, explanation,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (id) DO UPDATE SET
          question_text = EXCLUDED.question_text,
          updated_at = EXCLUDED.updated_at`,
        {
          replacements: [
            questionId, question.quiz_id, question.question_text, question.question_type,
            question.points, question.order_index, question.explanation,
            new Date(), new Date()
          ]
        }
      );
      logger.info(`✅ Question created: ${question.question_text.substring(0, 50)}...`);
      
      // Add options for each question
      await seedQuizOptions(questionId, question.question_type);
    } catch (error: any) {
      logger.error(`❌ Error creating question:`, error.message);
      throw error;
    }
  }
}

async function seedQuizOptions(questionId: string, questionType: string) {
  const optionsMap: Record<string, any[]> = {
    '70000000-0000-0000-0000-000000000001': [
      { text: 'Quản lý state trong component', is_correct: true, order: 1 },
      { text: 'Fetch data từ API', is_correct: false, order: 2 },
      { text: 'Tạo side effects', is_correct: false, order: 3 },
      { text: 'Điều hướng routing', is_correct: false, order: 4 }
    ],
    '70000000-0000-0000-0000-000000000002': [
      { text: 'Đúng', is_correct: true, order: 1 },
      { text: 'Sai', is_correct: false, order: 2 }
    ],
    '70000000-0000-0000-0000-000000000003': [
      { text: 'useState', is_correct: true, order: 1 },
      { text: 'useEffect', is_correct: true, order: 2 },
      { text: 'useContext', is_correct: true, order: 3 },
      { text: 'useCustomHook', is_correct: false, order: 4 }
    ],
    '70000000-0000-0000-0000-000000000004': [
      { text: 'Khi cần memoize functions', is_correct: true, order: 1 },
      { text: 'Khi cần quản lý state', is_correct: false, order: 2 },
      { text: 'Khi cần fetch data', is_correct: false, order: 3 },
      { text: 'Khi cần tạo component', is_correct: false, order: 4 }
    ],
    '70000000-0000-0000-0000-000000000005': [
      { text: 'Đúng', is_correct: false, order: 1 },
      { text: 'Sai', is_correct: true, order: 2 }
    ]
  };

  const options = optionsMap[questionId] || [];
  
  for (const [index, option] of options.entries()) {
    try {
      await sequelize.query(
        `INSERT INTO quiz_options (
          id, question_id, option_text, is_correct, order_index,
          created_at, updated_at
        ) VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?)
        ON CONFLICT DO NOTHING`,
        {
          replacements: [
            questionId, option.text, option.is_correct, option.order,
            new Date(), new Date()
          ]
        }
      );
    } catch (error: any) {
      logger.error(`❌ Error creating option:`, error.message);
    }
  }
}

async function seedAssignments() {
  logger.info('📋 Creating assignments...');
  
  const assignments = [
    {
      id: ASSIGNMENT_1_ID,
      course_id: COURSE_ID,
      title: 'Bài tập 1: Widgets cơ bản',
      description: `Hãy nộp bài các câu hỏi dưới đây PDF. Yêu cầu: tối thiểu 2 trang, mô tả tiền tố và văn đề gấp phải.

Nội dung bài tập:
1. Xây dựng màn hình login với TextField và Button
2. Tạo danh sách sản phẩm với ListView
3. Implement navigation giữa các màn hình
4. Sử dụng setState để quản lý form state

Yêu cầu:
- Code phải clean và có comments
- UI phải responsive
- Xử lý validation đầu vào
- Có ít nhất 3 màn hình`,
      max_score: 40,
      due_date: new Date('2025-11-06T21:23:00Z'),
      allow_late_submission: true,
      submission_type: 'both',
      is_published: true
    },
    {
      id: ASSIGNMENT_2_ID,
      course_id: COURSE_ID,
      title: 'Quiz: State Management',
      description: `Hoàn thành bài quiz về State Management.

Nội dung:
- Các khái niệm cơ bản về state
- Provider pattern
- setState vs setState callback
- Best practices

Thời gian: 30 phút
Số câu hỏi: 10
Điểm tối đa: 5/40`,
      max_score: 5,
      due_date: new Date('2025-11-10T21:23:00Z'),
      allow_late_submission: false,
      submission_type: 'text',
      is_published: true
    }
  ];

  for (const assignment of assignments) {
    try {
      await sequelize.query(
        `INSERT INTO assignments (
          id, course_id, title, description, max_score, due_date,
          allow_late_submission, submission_type, is_published,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          updated_at = EXCLUDED.updated_at`,
        {
          replacements: [
            assignment.id, assignment.course_id, assignment.title, assignment.description,
            assignment.max_score, assignment.due_date, assignment.allow_late_submission,
            assignment.submission_type, assignment.is_published,
            new Date(), new Date()
          ]
        }
      );
      logger.info(`✅ Assignment created: ${assignment.title}`);
    } catch (error: any) {
      logger.error(`❌ Error creating assignment ${assignment.title}:`, error.message);
      throw error;
    }
  }
}

async function seedAssignmentSubmission() {
  logger.info('📤 Creating assignment submission...');
  
  const submission = {
    id: '80000000-0000-0000-0000-000000000001',
    assignment_id: ASSIGNMENT_1_ID,
    user_id: STUDENT_ID,
    submission_text: 'Đây là bài nộp của tôi. Tôi đã hoàn thành tất cả các yêu cầu.',
    file_url: 'https://example.com/submissions/Huong_dan_nop_bai.pdf',
    file_name: 'Huong_dan_nop_bai.pdf',
    submitted_at: new Date('2025-11-04T10:00:00Z'),
    score: 12.0,
    feedback: 'Bài làm tốt! Tuy nhiên cần chú ý hơn về UI/UX.',
    graded_by: INSTRUCTOR_ID,
    graded_at: new Date('2025-11-05T14:30:00Z'),
    status: 'graded'
  };

  try {
    await sequelize.query(
      `INSERT INTO assignment_submissions (
        id, assignment_id, user_id, submission_text, file_url, file_name,
        submitted_at, score, feedback, graded_by, graded_at, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        submission_text = EXCLUDED.submission_text,
        updated_at = EXCLUDED.updated_at`,
      {
        replacements: [
          submission.id, submission.assignment_id, submission.user_id,
          submission.submission_text, submission.file_url, submission.file_name,
          submission.submitted_at, submission.score, submission.feedback,
          submission.graded_by, submission.graded_at, submission.status,
          new Date(), new Date()
        ]
      }
    );
    logger.info(`✅ Assignment submission created`);
  } catch (error: any) {
    logger.error(`❌ Error creating assignment submission:`, error.message);
    throw error;
  }
}

async function seedEnrollment() {
  logger.info('🎓 Creating enrollment...');
  
  const enrollment = {
    user_id: STUDENT_ID,
    course_id: COURSE_ID,
    status: 'active',
    enrollment_type: 'free',
    progress_percentage: 80.0,
    completed_lessons: 6,
    total_lessons: 8,
    last_accessed_at: new Date(),
    rating: 5,
    review: 'Khóa học rất hay và dễ hiểu. Giảng viên tận tâm!',
    review_date: new Date()
  };

  try {
    await sequelize.query(
      `INSERT INTO enrollments (
        id, user_id, course_id, status, enrollment_type,
        progress_percentage, completed_lessons, total_lessons,
        last_accessed_at, rating, review, review_date,
        created_at, updated_at
      ) VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (user_id, course_id) DO UPDATE SET
        progress_percentage = EXCLUDED.progress_percentage,
        completed_lessons = EXCLUDED.completed_lessons,
        last_accessed_at = EXCLUDED.last_accessed_at,
        updated_at = EXCLUDED.updated_at`,
      {
        replacements: [
          enrollment.user_id, enrollment.course_id, enrollment.status,
          enrollment.enrollment_type, enrollment.progress_percentage,
          enrollment.completed_lessons, enrollment.total_lessons,
          enrollment.last_accessed_at, enrollment.rating,
          enrollment.review, enrollment.review_date,
          new Date(), new Date()
        ]
      }
    );
    logger.info(`✅ Enrollment created for student1@example.com`);
  } catch (error: any) {
    logger.error(`❌ Error creating enrollment:`, error.message);
    throw error;
  }
}

async function seedLessonProgress() {
  logger.info('📊 Creating lesson progress...');
  
  // Mark first 6 lessons as completed
  const completedLessons = [
    LESSON_1_1_ID, LESSON_1_2_ID, LESSON_1_3_ID,
    LESSON_2_1_ID, LESSON_2_2_ID, LESSON_2_3_ID
  ];

  for (const lessonId of completedLessons) {
    try {
      await sequelize.query(
        `INSERT INTO lesson_progress (
          id, user_id, lesson_id, completed, completion_percentage,
          time_spent_seconds, last_accessed_at, started_at, completed_at,
          created_at, updated_at
        ) VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET
          completed = EXCLUDED.completed,
          completion_percentage = EXCLUDED.completion_percentage,
          updated_at = EXCLUDED.updated_at`,
        {
          replacements: [
            STUDENT_ID, lessonId, true, 100,
            1800, new Date(), new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date(),
            new Date(), new Date()
          ]
        }
      );
    } catch (error: any) {
      logger.error(`❌ Error creating lesson progress:`, error.message);
    }
  }
  
  logger.info(`✅ Created progress for ${completedLessons.length} lessons`);
}

async function seedChatMessages() {
  logger.info('💬 Creating chat messages...');
  
  const messages = [
    {
      course_id: COURSE_ID,
      sender_id: STUDENT_ID,
      message: 'Xin chào thầy, em có thể hỏi về bài tập không ạ?',
      message_type: 'text',
      created_at: new Date('2025-11-03T10:00:00Z')
    },
    {
      course_id: COURSE_ID,
      sender_id: INSTRUCTOR_ID,
      message: 'Chào em! Thầy sẵn sàng giúp đỡ. Em cứ hỏi nhé!',
      message_type: 'text',
      created_at: new Date('2025-11-03T10:02:00Z')
    },
    {
      course_id: COURSE_ID,
      sender_id: STUDENT_ID,
      message: 'Em chưa hiểu rõ về useState hook thầy ạ. Thầy có thể giải thích thêm không?',
      message_type: 'text',
      created_at: new Date('2025-11-03T10:05:00Z')
    },
    {
      course_id: COURSE_ID,
      sender_id: INSTRUCTOR_ID,
      message: 'useState là hook cơ bản nhất để quản lý state trong functional component. Thầy sẽ giải thích chi tiết trong buổi học tiếp theo nhé!',
      message_type: 'text',
      created_at: new Date('2025-11-03T10:10:00Z')
    }
  ];

  let successCount = 0;
  for (const message of messages) {
    try {
      await sequelize.query(
        `INSERT INTO chat_messages (
          id, course_id, sender_id, message, message_type, created_at, updated_at
        ) VALUES (gen_random_uuid(), ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            message.course_id, message.sender_id, message.message, message.message_type
          ]
        }
      );
      successCount++;
    } catch (error: any) {
      logger.error(`❌ Error creating chat message:`, error.message || error);
      // Don't throw, continue with other messages
    }
  }
  
  if (successCount > 0) {
    logger.info(`✅ Created ${successCount} chat messages`);
  }
}

async function seedQuizAttempts() {
  logger.info('🎯 Creating quiz attempts...');
  
  // Quiz 1 - Attempt 1 (passed)
  const attempt1 = {
    id: '90000000-0000-0000-0000-000000000001',
    quiz_id: QUIZ_1_ID,
    user_id: STUDENT_ID,
    attempt_number: 1,
    score: 25.0,
    max_score: 30.0,
    started_at: new Date('2025-11-01T14:00:00Z'),
    submitted_at: new Date('2025-11-01T14:25:00Z'),
    time_spent_minutes: 25,
    is_passed: true
  };

  try {
    await sequelize.query(
      `INSERT INTO quiz_attempts (
        id, quiz_id, user_id, attempt_number, score, max_score,
        started_at, submitted_at, time_spent_minutes, is_passed,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        score = EXCLUDED.score,
        updated_at = EXCLUDED.updated_at`,
      {
        replacements: [
          attempt1.id, attempt1.quiz_id, attempt1.user_id, attempt1.attempt_number,
          attempt1.score, attempt1.max_score, attempt1.started_at, attempt1.submitted_at,
          attempt1.time_spent_minutes, attempt1.is_passed, new Date(), new Date()
        ]
      }
    );
    logger.info(`✅ Quiz attempt created: Quiz 1, Attempt 1 (Passed)`);
  } catch (error: any) {
    logger.error(`❌ Error creating quiz attempt:`, error.message);
  }
}

async function seedGrades() {
  logger.info('📊 Creating grades...');
  
  // Create grade components for the course
  const gradeComponents = [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      course_id: COURSE_ID,
      component_type: 'assignment',
      component_id: ASSIGNMENT_1_ID,
      name: 'Assignments',
      weight: 40.0
    },
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      course_id: COURSE_ID,
      component_type: 'quiz',
      component_id: QUIZ_1_ID,
      name: 'Quizzes',
      weight: 30.0
    },
    {
      id: 'a0000000-0000-0000-0000-000000000003',
      course_id: COURSE_ID,
      component_type: 'participation',
      component_id: null,
      name: 'Participation',
      weight: 30.0
    }
  ];

  for (const component of gradeComponents) {
    try {
      await sequelize.query(
        `INSERT INTO grade_components (
          id, course_id, component_type, component_id, name, weight,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          updated_at = EXCLUDED.updated_at`,
        {
          replacements: [
            component.id, component.course_id, component.component_type,
            component.component_id, component.name, component.weight,
            new Date(), new Date()
          ]
        }
      );
      logger.info(`✅ Grade component created: ${component.name}`);
    } catch (error: any) {
      logger.error(`❌ Error creating grade component:`, error.message || error);
      // Don't throw, continue
    }
  }

  // Create individual grades
  const grades = [
    {
      user_id: STUDENT_ID,
      course_id: COURSE_ID,
      component_id: 'a0000000-0000-0000-0000-000000000001',
      score: 30.0,
      max_score: 40.0,
      graded_by: INSTRUCTOR_ID,
      notes: 'Làm bài tốt, cần cải thiện thêm'
    },
    {
      user_id: STUDENT_ID,
      course_id: COURSE_ID,
      component_id: 'a0000000-0000-0000-0000-000000000002',
      score: 25.0,
      max_score: 30.0,
      graded_by: INSTRUCTOR_ID,
      notes: 'Hiểu bài khá tốt'
    },
    {
      user_id: STUDENT_ID,
      course_id: COURSE_ID,
      component_id: 'a0000000-0000-0000-0000-000000000003',
      score: 28.0,
      max_score: 30.0,
      graded_by: INSTRUCTOR_ID,
      notes: 'Tích cực tham gia'
    }
  ];

  for (const grade of grades) {
    try {
      await sequelize.query(
        `INSERT INTO grades (
          id, user_id, course_id, component_id, score, max_score,
          graded_by, notes, graded_at, created_at, updated_at
        ) VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT DO NOTHING`,
        {
          replacements: [
            grade.user_id, grade.course_id, grade.component_id,
            grade.score, grade.max_score, grade.graded_by, grade.notes,
            new Date(), new Date(), new Date()
          ]
        }
      );
      logger.info(`✅ Grade created`);
    } catch (error: any) {
      logger.error(`❌ Error creating grade:`, error.message || error);
      // Don't throw, continue
    }
  }

  // Create final grade
  try {
    await sequelize.query(
      `INSERT INTO final_grades (
        id, user_id, course_id, total_score, letter_grade,
        calculated_at, created_at, updated_at
      ) VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (user_id, course_id) DO UPDATE SET
        total_score = EXCLUDED.total_score,
        letter_grade = EXCLUDED.letter_grade,
        updated_at = EXCLUDED.updated_at`,
      {
        replacements: [
          STUDENT_ID, COURSE_ID, 83.0, 'B+',
          new Date(), new Date(), new Date()
        ]
      }
    );
    logger.info(`✅ Final grade created: 83.0 (B+)`);
  } catch (error: any) {
    logger.error(`❌ Error creating final grade:`, error.message || error);
    // Don't throw, continue
  }
}

async function main() {
  try {
    logger.info('🌱 Starting complete course seeding...');
    logger.info('='.repeat(60));

    // Test database connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established');
    
    // Seed all data in order
    await seedCourse();
    await seedSections();
    await seedLessons();
    await seedQuizzes();
    await seedQuizQuestions();
    await seedAssignments();
    await seedAssignmentSubmission();
    await seedEnrollment();
    await seedLessonProgress();
    await seedChatMessages();
    await seedQuizAttempts();
    await seedGrades();

    logger.info('='.repeat(60));
    logger.info('🎉 Complete course seeding finished!');
    logger.info('');
    logger.info('📝 Test Data Created:');
    logger.info(`  Course: Introduction to React Development`);
    logger.info(`  Course ID: ${COURSE_ID}`);
    logger.info(`  Instructor: instructor1@example.com`);
    logger.info(`  Student: student1@example.com`);
    logger.info(`  Category ID: ${CATEGORY_ID}`);
    logger.info(`  Sections: 3`);
    logger.info(`  Lessons: 8`);
    logger.info(`  Quizzes: 2 (1 attempt completed)`);
    logger.info(`  Assignments: 2 (1 submission graded)`);
    logger.info(`  Progress: 80% (6/8 lessons completed)`);
    logger.info(`  Chat Messages: 4`);
    logger.info(`  Final Grade: 83.0 (B+)`);
    logger.info('');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding complete course:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as seedCompleteCourse };
