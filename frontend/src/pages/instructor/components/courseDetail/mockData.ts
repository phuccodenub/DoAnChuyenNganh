/**
 * Mock Data for InstructorCourseDetail
 * 
 * TODO: Thay thế bằng API calls thực tế
 */

import { CourseDetail, CourseStats, Section, Student, Review } from './types';

// TODO: Replace with API call - GET /api/instructor/courses/:courseId
export const MOCK_COURSE: CourseDetail = {
  id: '1',
  title: 'React & TypeScript: Xây dựng ứng dụng thực tế',
  description: 'Học cách xây dựng ứng dụng web hiện đại với React và TypeScript từ cơ bản đến nâng cao.',
  thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  status: 'published',
  difficulty: 'intermediate',
  is_free: false,
  price: 1990000,
  created_at: '2024-01-15',
  updated_at: '2024-11-20',
};

// TODO: Replace with API call - GET /api/instructor/courses/:courseId/stats
export const MOCK_STATS: CourseStats = {
  total_students: 98,
  total_revenue: 466260000,
  average_rating: 4.7,
  total_reviews: 89,
  completion_rate: 67,
  // New fields for enhanced overview
  avg_progress: 72, // Average progress percentage
  avg_score: 8.2, // Average score (0-10 scale)
  pending_grading: 12, // Number of submissions waiting for grading
  max_students: 100, // Maximum capacity
  new_students_this_week: 3, // New enrollments this week
};

// TODO: Replace with API call - GET /api/instructor/courses/:courseId/sections
export const MOCK_SECTIONS: Section[] = [
  {
    id: '1',
    title: 'Giới thiệu khóa học',
    order_index: 1,
    isExpanded: true,
    lessons: [
      { id: '1', title: 'Chào mừng đến với khóa học', content_type: 'video', duration_minutes: 5, is_preview: true, order_index: 1, video_url: 'https://example.com/video1.mp4' },
      { id: '2', title: 'Cài đặt môi trường phát triển', content_type: 'video', duration_minutes: 15, is_preview: true, order_index: 2, video_url: 'https://example.com/video2.mp4' },
      { id: '3', title: 'Tài liệu hướng dẫn', content_type: 'document', duration_minutes: 10, is_preview: false, order_index: 3, video_url: '' },
    ],
  },
  {
    id: '2',
    title: 'React Fundamentals',
    order_index: 2,
    isExpanded: false,
    lessons: [
      { id: '4', title: 'JSX và Components', content_type: 'video', duration_minutes: 20, is_preview: false, order_index: 1, video_url: 'https://example.com/video4.mp4' },
      { id: '5', title: 'Props và State', content_type: 'video', duration_minutes: 25, is_preview: false, order_index: 2, video_url: 'https://example.com/video5.mp4' },
      { id: '6', title: 'Bài kiểm tra: React Basics', content_type: 'quiz', duration_minutes: 15, is_preview: false, order_index: 3, video_url: '' },
    ],
  },
  {
    id: '3',
    title: 'TypeScript với React',
    order_index: 3,
    isExpanded: false,
    lessons: [
      { id: '7', title: 'TypeScript cơ bản', content_type: 'video', duration_minutes: 30, is_preview: false, order_index: 1, video_url: 'https://example.com/video7.mp4' },
      { id: '8', title: 'Typing React Components', content_type: 'video', duration_minutes: 25, is_preview: false, order_index: 2, video_url: 'https://example.com/video8.mp4' },
      { id: '9', title: 'Bài tập thực hành', content_type: 'assignment', duration_minutes: 45, is_preview: false, order_index: 3, video_url: '' },
    ],
  },
];

// TODO: Replace with API call - GET /api/instructor/courses/:courseId/students
export const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Nguyễn Văn A', email: 'vana@email.com', progress_percent: 85, enrolled_at: '2024-10-01', last_activity_at: '2024-11-25' },
  { id: '2', name: 'Trần Thị B', email: 'thib@email.com', progress_percent: 60, enrolled_at: '2024-10-15', last_activity_at: '2024-11-24' },
  { id: '3', name: 'Lê Văn C', email: 'vanc@email.com', progress_percent: 100, enrolled_at: '2024-09-20', last_activity_at: '2024-11-20' },
  { id: '4', name: 'Phạm Thị D', email: 'thid@email.com', progress_percent: 25, enrolled_at: '2024-11-01', last_activity_at: '2024-11-23' },
  { id: '5', name: 'Hoàng Văn E', email: 'vane@email.com', progress_percent: 45, enrolled_at: '2024-11-10', last_activity_at: '2024-11-25' },
];

// TODO: Replace with API call - GET /api/instructor/courses/:courseId/reviews
export const MOCK_REVIEWS: Review[] = [
  { id: '1', user_name: 'Nguyễn Văn A', rating: 5, comment: 'Khóa học rất hay và chi tiết. Giảng viên giảng dễ hiểu.', created_at: '2024-11-20', reply: 'Cảm ơn bạn đã đánh giá!', replied_at: '2024-11-21' },
  { id: '2', user_name: 'Trần Thị B', rating: 4, comment: 'Nội dung tốt, nhưng mong có thêm bài tập thực hành.', created_at: '2024-11-18' },
  { id: '3', user_name: 'Lê Văn C', rating: 5, comment: 'Đây là khóa học React tốt nhất mình từng học!', created_at: '2024-11-15', reply: 'Rất vui vì bạn thấy hữu ích!', replied_at: '2024-11-16' },
];
