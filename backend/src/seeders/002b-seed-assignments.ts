/**
 * Seeder 002b: Seed assignments and submissions
 * 
 * This seeder creates sample assignments for existing courses
 * and sample submissions from enrolled students.
 * 
 * Prerequisites:
 * - Users must exist (001-seed-users)
 * - Courses must exist (002-seed-courses)
 * - Enrollments must exist (003-seed-enrollments)
 */

import { Sequelize, QueryTypes } from 'sequelize';

export async function seedAssignments(sequelize: Sequelize): Promise<void> {
  console.log('🔄 Seeding assignments and submissions...');

  // Assignments for Advanced React Course (10000000-0000-0000-0000-000000000002)
  const assignments = [
    {
      id: '00000000-0000-0000-0003-000000000001',
      course_id: '10000000-0000-0000-0000-000000000002',
      title: 'Bài tập 1: Tạo Component React đầu tiên',
      description: 'Tạo một component React hiển thị thông tin cá nhân của bạn bao gồm: tên, email, và một đoạn giới thiệu ngắn. Sử dụng props để truyền dữ liệu.',
      max_score: 100,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      allow_late_submission: true,
      submission_type: 'both',
      is_published: true,
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15')
    },
    {
      id: '00000000-0000-0000-0003-000000000002',
      course_id: '10000000-0000-0000-0000-000000000002',
      title: 'Bài tập 2: Quản lý State với useState',
      description: 'Xây dựng một ứng dụng Todo List đơn giản sử dụng useState hook. Ứng dụng cần có khả năng: thêm, xóa, và đánh dấu hoàn thành task.',
      max_score: 100,
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      allow_late_submission: true,
      submission_type: 'both',
      is_published: true,
      created_at: new Date('2024-01-20'),
      updated_at: new Date('2024-01-20')
    },
    {
      id: '00000000-0000-0000-0003-000000000003',
      course_id: '10000000-0000-0000-0000-000000000002',
      title: 'Bài tập 3: useEffect và API Integration',
      description: 'Tạo một component hiển thị danh sách users từ JSONPlaceholder API. Sử dụng useEffect để fetch data và hiển thị loading state.',
      max_score: 100,
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
      allow_late_submission: false,
      submission_type: 'file',
      is_published: true,
      created_at: new Date('2024-01-25'),
      updated_at: new Date('2024-01-25')
    },
    // Assignments for Node.js Course (10000000-0000-0000-0000-000000000004)
    {
      id: '00000000-0000-0000-0003-000000000011',
      course_id: '10000000-0000-0000-0000-000000000004',
      title: 'Bài tập 1: Tạo REST API cơ bản',
      description: 'Xây dựng một REST API đơn giản với Express.js có các endpoint CRUD cho resource "products".',
      max_score: 100,
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      allow_late_submission: true,
      submission_type: 'file',
      is_published: true,
      created_at: new Date('2024-02-01'),
      updated_at: new Date('2024-02-01')
    },
    {
      id: '00000000-0000-0000-0003-000000000012',
      course_id: '10000000-0000-0000-0000-000000000004',
      title: 'Bài tập 2: Authentication với JWT',
      description: 'Implement authentication system sử dụng JWT. Bao gồm: register, login, và protected routes.',
      max_score: 100,
      due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      allow_late_submission: false,
      submission_type: 'both',
      is_published: true,
      created_at: new Date('2024-02-10'),
      updated_at: new Date('2024-02-10')
    },
    // Unpublished assignment (draft)
    {
      id: '00000000-0000-0000-0003-000000000099',
      course_id: '10000000-0000-0000-0000-000000000002',
      title: 'Bài tập cuối khóa: Dự án thực tế',
      description: 'Xây dựng một ứng dụng React hoàn chỉnh với state management và routing.',
      max_score: 200,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      allow_late_submission: false,
      submission_type: 'both',
      is_published: false, // Draft
      created_at: new Date('2024-02-15'),
      updated_at: new Date('2024-02-15')
    }
  ];

  // Insert assignments
  for (const assignment of assignments) {
    const existing = await sequelize.query(
      'SELECT id FROM assignments WHERE id = $1',
      { bind: [assignment.id], type: QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      console.log(`⚠️  Assignment "${assignment.title}" already exists, skipping...`);
      continue;
    }

    await sequelize.query(
      `INSERT INTO assignments (id, course_id, title, description, max_score, due_date, allow_late_submission, submission_type, is_published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      {
        bind: [
          assignment.id, assignment.course_id, assignment.title, assignment.description,
          assignment.max_score, assignment.due_date, assignment.allow_late_submission,
          assignment.submission_type, assignment.is_published, assignment.created_at, assignment.updated_at
        ]
      }
    );
    console.log(`✅ Created assignment: ${assignment.title}`);
  }

  // Get enrolled students for submissions
  const enrolledStudents = await sequelize.query(
    `SELECT e.user_id, e.course_id, u.first_name, u.last_name 
     FROM enrollments e 
     JOIN users u ON e.user_id = u.id 
     WHERE e.course_id IN ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004')
     LIMIT 10`,
    { type: QueryTypes.SELECT }
  ) as Array<{ user_id: string; course_id: string; first_name: string; last_name: string }>;

  if (enrolledStudents.length === 0) {
    console.log('⚠️  No enrolled students found, skipping submissions...');
    return;
  }

  // Sample submissions
  const submissions = [
    // Submissions for Assignment 1 (React Component)
    {
      id: '00000000-0000-0000-0004-000000000001',
      assignment_id: '00000000-0000-0000-0003-000000000001',
      user_id: enrolledStudents[0]?.user_id,
      submission_text: 'Đây là bài nộp của tôi cho bài tập 1. Tôi đã tạo một component hiển thị thông tin cá nhân với props.',
      file_url: 'https://example.com/submissions/student1-assignment1.zip',
      file_name: 'my-first-component.zip',
      submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      score: 85,
      feedback: 'Bài làm tốt! Code clean và có comments. Có thể cải thiện thêm phần styling.',
      graded_by: '00000000-0000-0000-0000-000000000003', // Instructor
      graded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'graded'
    },
    {
      id: '00000000-0000-0000-0004-000000000002',
      assignment_id: '00000000-0000-0000-0003-000000000001',
      user_id: enrolledStudents[1]?.user_id,
      submission_text: 'Bài nộp component React của tôi.',
      file_url: 'https://example.com/submissions/student2-assignment1.zip',
      file_name: 'react-component.zip',
      submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      score: null,
      feedback: null,
      graded_by: null,
      graded_at: null,
      status: 'submitted' // Pending grading
    },
    {
      id: '00000000-0000-0000-0004-000000000003',
      assignment_id: '00000000-0000-0000-0003-000000000001',
      user_id: enrolledStudents[2]?.user_id,
      submission_text: 'Component với thông tin cá nhân.',
      file_url: null,
      file_name: null,
      submitted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      score: 92,
      feedback: 'Xuất sắc! Đã áp dụng đúng các best practices.',
      graded_by: '00000000-0000-0000-0000-000000000003',
      graded_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      status: 'graded'
    },
    // Submissions for Assignment 2 (Todo List)
    {
      id: '00000000-0000-0000-0004-000000000004',
      assignment_id: '00000000-0000-0000-0003-000000000002',
      user_id: enrolledStudents[0]?.user_id,
      submission_text: 'Todo List app với useState hook.',
      file_url: 'https://example.com/submissions/student1-todolist.zip',
      file_name: 'todo-list-app.zip',
      submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      score: null,
      feedback: null,
      graded_by: null,
      graded_at: null,
      status: 'submitted' // Pending grading
    },
    // Submissions for Node.js Assignment
    {
      id: '00000000-0000-0000-0004-000000000011',
      assignment_id: '00000000-0000-0000-0003-000000000011',
      user_id: enrolledStudents[0]?.user_id,
      submission_text: 'REST API với Express.js cho products.',
      file_url: 'https://example.com/submissions/student1-restapi.zip',
      file_name: 'express-api.zip',
      submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      score: 78,
      feedback: 'API hoạt động tốt. Cần thêm error handling và validation.',
      graded_by: '00000000-0000-0000-0000-000000000004',
      graded_at: new Date(),
      status: 'graded'
    }
  ];

  // Insert submissions (only for students that exist)
  for (const submission of submissions) {
    if (!submission.user_id) {
      console.log(`⚠️  Skipping submission - no user_id`);
      continue;
    }

    const existing = await sequelize.query(
      'SELECT id FROM assignment_submissions WHERE id = $1',
      { bind: [submission.id], type: QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      console.log(`⚠️  Submission ${submission.id} already exists, skipping...`);
      continue;
    }

    await sequelize.query(
      `INSERT INTO assignment_submissions (id, assignment_id, user_id, submission_text, file_url, file_name, submitted_at, score, feedback, graded_by, graded_at, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      {
        bind: [
          submission.id, submission.assignment_id, submission.user_id,
          submission.submission_text, submission.file_url, submission.file_name,
          submission.submitted_at, submission.score, submission.feedback,
          submission.graded_by, submission.graded_at, submission.status,
          submission.submitted_at, new Date()
        ]
      }
    );
    console.log(`✅ Created submission for assignment ${submission.assignment_id}`);
  }

  console.log('✅ Assignments and submissions seeding completed!');
}
