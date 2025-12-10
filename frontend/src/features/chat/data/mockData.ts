/**
 * Chat Mock Data
 * 
 * Dữ liệu giả lập cho tính năng Chat 1-1
 * TODO: [API] Thay thế bằng API calls thực tế
 */

import { Conversation, Message, ChatUser } from '../types';

// ==================== MOCK USERS ====================

export const mockInstructors: ChatUser[] = [
  {
    id: 'ins-001',
    name: 'TS. Nguyễn Văn Minh',
    avatar_url: '/avatars/instructor-1.jpg',
    role: 'instructor',
    online_status: 'online',
  },
  {
    id: 'ins-002',
    name: 'ThS. Trần Thị Hương',
    avatar_url: '/avatars/instructor-2.jpg',
    role: 'instructor',
    online_status: 'offline',
    last_seen: '2025-12-01T08:30:00Z',
  },
  {
    id: 'ins-003',
    name: 'PGS. Lê Hoàng Nam',
    role: 'instructor',
    online_status: 'away',
    last_seen: '2025-12-01T10:15:00Z',
  },
];

export const mockStudents: ChatUser[] = [
  {
    id: 'stu-001',
    name: 'Phạm Minh Tuấn',
    avatar_url: '/avatars/student-1.jpg',
    role: 'student',
    online_status: 'online',
  },
  {
    id: 'stu-002',
    name: 'Nguyễn Thị Lan',
    role: 'student',
    online_status: 'offline',
    last_seen: '2025-12-01T09:45:00Z',
  },
  {
    id: 'stu-003',
    name: 'Trần Văn Hùng',
    avatar_url: '/avatars/student-3.jpg',
    role: 'student',
    online_status: 'online',
  },
];

// ==================== MOCK CONVERSATIONS (Student View) ====================
// TODO: [API] GET /api/v1/chat/conversations
// Query params: { role: 'student' | 'instructor', filter?: 'all' | 'unread' }

export const mockStudentConversations: Conversation[] = [
  {
    id: 'conv-001',
    course_id: 'course-react-101',
    course_title: 'React Fundamentals',
    participant: mockInstructors[0],
    last_message: {
      content: 'Chào em, em có thể giải thích rõ hơn về useEffect không?',
      created_at: '2025-12-01T10:30:00Z',
      sender_id: 'ins-001',
      sender_role: 'instructor',
    },
    unread_count: 2,
    updated_at: '2025-12-01T10:30:00Z',
  },
  {
    id: 'conv-002',
    course_id: 'course-ts-advanced',
    course_title: 'TypeScript Nâng cao',
    participant: mockInstructors[1],
    last_message: {
      content: 'Dạ em cảm ơn cô ạ!',
      created_at: '2025-11-30T16:45:00Z',
      sender_id: 'current-student',
      sender_role: 'student',
    },
    unread_count: 0,
    updated_at: '2025-11-30T16:45:00Z',
  },
  {
    id: 'conv-003',
    course_id: 'course-nodejs',
    course_title: 'Node.js Backend Development',
    participant: mockInstructors[2],
    last_message: {
      content: 'Bài tập tuần này em nộp muộn được không ạ?',
      created_at: '2025-11-29T14:20:00Z',
      sender_id: 'current-student',
      sender_role: 'student',
    },
    unread_count: 0,
    updated_at: '2025-11-29T14:20:00Z',
  },
];

// ==================== MOCK CONVERSATIONS (Instructor View) ====================

export const mockInstructorConversations: Conversation[] = [
  {
    id: 'conv-101',
    course_id: 'course-react-101',
    course_title: 'React Fundamentals',
    participant: mockStudents[0],
    last_message: {
      content: 'Dạ thầy ơi, em không hiểu phần này...',
      created_at: '2025-12-01T11:00:00Z',
      sender_id: 'stu-001',
      sender_role: 'student',
    },
    unread_count: 1,
    updated_at: '2025-12-01T11:00:00Z',
  },
  {
    id: 'conv-102',
    course_id: 'course-react-101',
    course_title: 'React Fundamentals',
    participant: mockStudents[1],
    last_message: {
      content: 'Em đã hoàn thành bài tập rồi ạ',
      created_at: '2025-12-01T09:30:00Z',
      sender_id: 'stu-002',
      sender_role: 'student',
    },
    unread_count: 0,
    updated_at: '2025-12-01T09:30:00Z',
  },
  {
    id: 'conv-103',
    course_id: 'course-ts-advanced',
    course_title: 'TypeScript Nâng cao',
    participant: mockStudents[2],
    last_message: {
      content: 'Generic types khó quá thầy ơi',
      created_at: '2025-11-30T20:15:00Z',
      sender_id: 'stu-003',
      sender_role: 'student',
    },
    unread_count: 3,
    updated_at: '2025-11-30T20:15:00Z',
  },
];

// ==================== MOCK MESSAGES ====================
// TODO: [API] GET /api/v1/chat/conversations/:conversationId/messages
// Query params: { cursor?: string, limit?: number }

export const mockMessages: Record<string, Message[]> = {
  'conv-001': [
    {
      id: 'msg-001',
      conversation_id: 'conv-001',
      sender_id: 'stu-current',
      sender_role: 'student',
      content: 'Chào thầy ạ, em có câu hỏi về bài học hôm nay.',
      created_at: '2025-12-01T09:00:00Z',
      status: 'read',
    },
    {
      id: 'msg-002',
      conversation_id: 'conv-001',
      sender_id: 'ins-001',
      sender_role: 'instructor',
      content: 'Chào em, em cứ hỏi nhé!',
      created_at: '2025-12-01T09:05:00Z',
      status: 'read',
    },
    {
      id: 'msg-003',
      conversation_id: 'conv-001',
      sender_id: 'stu-current',
      sender_role: 'student',
      content: 'Dạ thầy ơi, em không hiểu phần useEffect trong React. Tại sao phải dùng dependency array ạ?',
      created_at: '2025-12-01T09:10:00Z',
      status: 'read',
    },
    {
      id: 'msg-004',
      conversation_id: 'conv-001',
      sender_id: 'ins-001',
      sender_role: 'instructor',
      content: 'Câu hỏi hay đó em! Dependency array giúp React biết khi nào cần chạy lại effect. Nếu không có, effect sẽ chạy sau mỗi lần render, gây ra vấn đề performance.',
      created_at: '2025-12-01T09:20:00Z',
      status: 'read',
    },
    {
      id: 'msg-005',
      conversation_id: 'conv-001',
      sender_id: 'ins-001',
      sender_role: 'instructor',
      content: 'Ví dụ: useEffect(() => { fetchData() }, [userId]) - effect chỉ chạy khi userId thay đổi.',
      created_at: '2025-12-01T09:21:00Z',
      status: 'read',
    },
    {
      id: 'msg-006',
      conversation_id: 'conv-001',
      sender_id: 'stu-current',
      sender_role: 'student',
      content: 'Dạ em hiểu rồi ạ. Vậy nếu em muốn effect chỉ chạy 1 lần thì sao ạ?',
      created_at: '2025-12-01T10:00:00Z',
      status: 'read',
    },
    {
      id: 'msg-007',
      conversation_id: 'conv-001',
      sender_id: 'ins-001',
      sender_role: 'instructor',
      content: 'Em truyền array rỗng [] nhé! useEffect(() => { ... }, [])',
      created_at: '2025-12-01T10:25:00Z',
      status: 'delivered',
    },
    {
      id: 'msg-008',
      conversation_id: 'conv-001',
      sender_id: 'ins-001',
      sender_role: 'instructor',
      content: 'Chào em, em có thể giải thích rõ hơn về useEffect không?',
      created_at: '2025-12-01T10:30:00Z',
      status: 'delivered',
    },
  ],
  'conv-002': [
    {
      id: 'msg-101',
      conversation_id: 'conv-002',
      sender_id: 'stu-current',
      sender_role: 'student',
      content: 'Cô ơi, em muốn hỏi về Generic Types ạ.',
      created_at: '2025-11-30T15:00:00Z',
      status: 'read',
    },
    {
      id: 'msg-102',
      conversation_id: 'conv-002',
      sender_id: 'ins-002',
      sender_role: 'instructor',
      content: 'Em hỏi đi nhé!',
      created_at: '2025-11-30T15:30:00Z',
      status: 'read',
    },
    {
      id: 'msg-103',
      conversation_id: 'conv-002',
      sender_id: 'stu-current',
      sender_role: 'student',
      content: 'Khi nào thì em nên dùng Generic thay vì any ạ?',
      created_at: '2025-11-30T16:00:00Z',
      status: 'read',
    },
    {
      id: 'msg-104',
      conversation_id: 'conv-002',
      sender_id: 'ins-002',
      sender_role: 'instructor',
      content: 'Generic giữ được type safety, còn any thì không. Ví dụ function identity<T>(arg: T): T sẽ giữ nguyên type của input.',
      created_at: '2025-11-30T16:30:00Z',
      status: 'read',
    },
    {
      id: 'msg-105',
      conversation_id: 'conv-002',
      sender_id: 'stu-current',
      sender_role: 'student',
      content: 'Dạ em cảm ơn cô ạ!',
      created_at: '2025-11-30T16:45:00Z',
      status: 'read',
    },
  ],
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Lấy danh sách conversations theo role
 * TODO: [API] Thay bằng API call: GET /api/v1/chat/conversations
 */
export function getConversationsByRole(role: 'student' | 'instructor'): Conversation[] {
  return role === 'student' ? mockStudentConversations : mockInstructorConversations;
}

/**
 * Lấy messages của một conversation
 * TODO: [API] Thay bằng API call: GET /api/v1/chat/conversations/:id/messages
 */
export function getMessagesByConversationId(conversationId: string): Message[] {
  return mockMessages[conversationId] || [];
}

/**
 * Tìm conversation theo courseId
 * TODO: [API] Thay bằng API call: GET /api/v1/chat/conversations?course_id=xxx
 */
export function findConversationByCourseId(
  courseId: string,
  conversations: Conversation[]
): Conversation | undefined {
  return conversations.find((c) => c.course_id === courseId);
}
