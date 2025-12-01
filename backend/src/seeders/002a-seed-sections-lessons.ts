/**
 * Seeder 002a: Seed sections and lessons for courses
 */

import { Sequelize, QueryTypes } from 'sequelize';

export async function seedSectionsAndLessons(sequelize: Sequelize): Promise<void> {
  // Sections for Advanced React Course (10000000-0000-0000-0000-000000000002)
  const sections = [
    {
      id: '00000000-0000-0000-0001-000000000001',
      course_id: '10000000-0000-0000-0000-000000000002',
      title: 'Giới thiệu khóa học',
      description: 'Tổng quan về khóa học và cài đặt môi trường',
      order_index: 1,
      is_published: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: '00000000-0000-0000-0001-000000000002',
      course_id: '10000000-0000-0000-0000-000000000002',
      title: 'React Fundamentals',
      description: 'Các khái niệm cơ bản của React',
      order_index: 2,
      is_published: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: '00000000-0000-0000-0001-000000000003',
      course_id: '10000000-0000-0000-0000-000000000002',
      title: 'React Hooks',
      description: 'Sử dụng hooks trong React',
      order_index: 3,
      is_published: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: '00000000-0000-0000-0001-000000000004',
      course_id: '10000000-0000-0000-0000-000000000002',
      title: 'State Management',
      description: 'Quản lý state với Context và Redux',
      order_index: 4,
      is_published: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    // Sections for Node.js Course (10000000-0000-0000-0000-000000000004)
    {
      id: '00000000-0000-0000-0001-000000000011',
      course_id: '10000000-0000-0000-0000-000000000004',
      title: 'Node.js Basics',
      description: 'Giới thiệu về Node.js',
      order_index: 1,
      is_published: true,
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15')
    },
    {
      id: '00000000-0000-0000-0001-000000000012',
      course_id: '10000000-0000-0000-0000-000000000004',
      title: 'Express.js Framework',
      description: 'Xây dựng API với Express.js',
      order_index: 2,
      is_published: true,
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15')
    },
    {
      id: '00000000-0000-0000-0001-000000000013',
      course_id: '10000000-0000-0000-0000-000000000004',
      title: 'Database Integration',
      description: 'Kết nối và làm việc với database',
      order_index: 3,
      is_published: true,
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15')
    }
  ];

  // Lessons
  const lessons = [
    // Lessons for Section 1 (Giới thiệu khóa học)
    {
      id: '00000000-0000-0000-0002-000000000001',
      section_id: '00000000-0000-0000-0001-000000000001',
      title: 'Chào mừng đến với khóa học',
      description: 'Giới thiệu về khóa học và những gì bạn sẽ học được',
      content_type: 'video',
      video_url: 'https://example.com/videos/welcome.mp4',
      duration_minutes: 5,
      order_index: 1,
      is_published: true,
      is_free_preview: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: '00000000-0000-0000-0002-000000000002',
      section_id: '00000000-0000-0000-0001-000000000001',
      title: 'Cài đặt môi trường phát triển',
      description: 'Hướng dẫn cài đặt Node.js, VS Code và các công cụ cần thiết',
      content_type: 'video',
      video_url: 'https://example.com/videos/setup.mp4',
      duration_minutes: 15,
      order_index: 2,
      is_published: true,
      is_free_preview: true,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: '00000000-0000-0000-0002-000000000003',
      section_id: '00000000-0000-0000-0001-000000000001',
      title: 'Tài liệu hướng dẫn',
      description: 'Tài liệu tham khảo và hướng dẫn chi tiết',
      content_type: 'document',
      duration_minutes: 10,
      order_index: 3,
      is_published: true,
      is_free_preview: false,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    // Lessons for Section 2 (React Fundamentals)
    {
      id: '00000000-0000-0000-0002-000000000004',
      section_id: '00000000-0000-0000-0001-000000000002',
      title: 'JSX và Components',
      description: 'Tìm hiểu về JSX syntax và cách tạo components',
      content_type: 'video',
      video_url: 'https://example.com/videos/jsx.mp4',
      duration_minutes: 20,
      order_index: 1,
      is_published: true,
      is_free_preview: false,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: '00000000-0000-0000-0002-000000000005',
      section_id: '00000000-0000-0000-0001-000000000002',
      title: 'Props và State',
      description: 'Truyền dữ liệu với props và quản lý state',
      content_type: 'video',
      video_url: 'https://example.com/videos/props-state.mp4',
      duration_minutes: 25,
      order_index: 2,
      is_published: true,
      is_free_preview: false,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: '00000000-0000-0000-0002-000000000006',
      section_id: '00000000-0000-0000-0001-000000000002',
      title: 'Bài kiểm tra: React Basics',
      description: 'Kiểm tra kiến thức về React cơ bản',
      content_type: 'quiz',
      duration_minutes: 15,
      order_index: 3,
      is_published: true,
      is_free_preview: false,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    // Lessons for Section 3 (React Hooks)
    {
      id: '00000000-0000-0000-0002-000000000007',
      section_id: '00000000-0000-0000-0001-000000000003',
      title: 'useState và useEffect',
      description: 'Hai hooks cơ bản nhất trong React',
      content_type: 'video',
      video_url: 'https://example.com/videos/hooks-basic.mp4',
      duration_minutes: 30,
      order_index: 1,
      is_published: true,
      is_free_preview: false,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: '00000000-0000-0000-0002-000000000008',
      section_id: '00000000-0000-0000-0001-000000000003',
      title: 'useContext và useReducer',
      description: 'Quản lý state phức tạp với hooks',
      content_type: 'video',
      video_url: 'https://example.com/videos/hooks-advanced.mp4',
      duration_minutes: 25,
      order_index: 2,
      is_published: true,
      is_free_preview: false,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      id: '00000000-0000-0000-0002-000000000009',
      section_id: '00000000-0000-0000-0001-000000000003',
      title: 'Bài tập thực hành Hooks',
      description: 'Thực hành sử dụng hooks trong dự án thực tế',
      content_type: 'assignment',
      duration_minutes: 45,
      order_index: 3,
      is_published: true,
      is_free_preview: false,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    // Lessons for Node.js Section 1
    {
      id: '00000000-0000-0000-0002-000000000021',
      section_id: '00000000-0000-0000-0001-000000000011',
      title: 'Giới thiệu Node.js',
      description: 'Tổng quan về Node.js và cách hoạt động',
      content_type: 'video',
      video_url: 'https://example.com/videos/nodejs-intro.mp4',
      duration_minutes: 20,
      order_index: 1,
      is_published: true,
      is_free_preview: true,
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15')
    },
    {
      id: '00000000-0000-0000-0002-000000000022',
      section_id: '00000000-0000-0000-0001-000000000011',
      title: 'Modules và NPM',
      description: 'Làm việc với modules và package manager',
      content_type: 'video',
      video_url: 'https://example.com/videos/npm.mp4',
      duration_minutes: 25,
      order_index: 2,
      is_published: true,
      is_free_preview: false,
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15')
    }
  ];

  // Insert sections
  for (const section of sections) {
    const existing = await sequelize.query(
      'SELECT id FROM sections WHERE id = $1',
      { bind: [section.id], type: QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      console.log(`⚠️  Section "${section.title}" already exists, skipping...`);
      continue;
    }

    await sequelize.query(
      `INSERT INTO sections (id, course_id, title, description, order_index, is_published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      {
        bind: [
          section.id, section.course_id, section.title, section.description,
          section.order_index, section.is_published, section.created_at, section.updated_at
        ]
      }
    );
    console.log(`✅ Created section: ${section.title}`);
  }

  // Insert lessons
  for (const lesson of lessons) {
    const existing = await sequelize.query(
      'SELECT id FROM lessons WHERE id = $1',
      { bind: [lesson.id], type: QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      console.log(`⚠️  Lesson "${lesson.title}" already exists, skipping...`);
      continue;
    }

    await sequelize.query(
      `INSERT INTO lessons (id, section_id, title, description, content_type, video_url, duration_minutes, order_index, is_published, is_free_preview, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      {
        bind: [
          lesson.id, lesson.section_id, lesson.title, lesson.description || null,
          lesson.content_type, lesson.video_url || null, lesson.duration_minutes,
          lesson.order_index, lesson.is_published, lesson.is_free_preview,
          lesson.created_at, lesson.updated_at
        ]
      }
    );
    console.log(`✅ Created lesson: ${lesson.title}`);
  }
}
