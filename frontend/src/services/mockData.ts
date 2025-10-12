import type { User } from '@/stores/authStore'

// Mock Users
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'john.instructor@example.com',
    full_name: 'Dr. John Smith',
    role: 'instructor',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    is_active: true,
    email_verified: true,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 2,
    email: 'jane.student@example.com',
    full_name: 'Jane Doe',
    role: 'student',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b125b0d7?w=150&h=150&fit=crop&crop=face',
    is_active: true,
    email_verified: true,
    created_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 3,
    email: 'alice.student@example.com',
    full_name: 'Alice Johnson',
    role: 'student',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    is_active: true,
    email_verified: true,
    created_at: '2024-02-10T00:00:00Z'
  },
  {
    id: 4,
    email: 'sarah.instructor@example.com',
    full_name: 'Prof. Sarah Wilson',
    role: 'instructor',
    avatar_url: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    is_active: true,
    email_verified: true,
    created_at: '2024-01-20T00:00:00Z'
  }
]

// Mock Courses
export interface Course {
  id: string
  title: string
  description: string
  code: string
  credits: number
  schedule: string
  instructor_id: number
  instructor: {
    id: number
    full_name: string
    avatar_url?: string
  }
  status: 'draft' | 'active' | 'archived' | 'cancelled'
  thumbnail_url?: string
  max_students?: number
  enrollment_count: number
  enrolled_count?: number
  is_live_enabled: boolean
  is_chat_enabled: boolean
  is_quiz_enabled: boolean
  start_date?: string
  end_date?: string
  created_at: string
}

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to React Development',
    description: 'Learn the fundamentals of React.js including components, hooks, and state management. Perfect for beginners looking to start their journey in modern web development.',
    code: 'CS101',
    credits: 3,
    schedule: 'Mon, Wed, Fri 10:00 AM',
    instructor_id: 1,
    instructor: {
      id: 1,
      full_name: 'Dr. John Smith',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    status: 'active',
    thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
    max_students: 50,
    enrollment_count: 23,
    enrolled_count: 23,
    is_live_enabled: true,
    is_chat_enabled: true,
    is_quiz_enabled: true,
    start_date: '2024-03-01T00:00:00Z',
    end_date: '2024-05-30T00:00:00Z',
    created_at: '2024-02-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'Advanced JavaScript Concepts',
    description: 'Deep dive into advanced JavaScript topics including closures, prototypes, async programming, and modern ES6+ features.',
    code: 'CS201',
    credits: 4,
    schedule: 'Tue, Thu 2:00 PM',
    instructor_id: 4,
    instructor: {
      id: 4,
      full_name: 'Prof. Sarah Wilson',
      avatar_url: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face'
    },
    status: 'active',
    thumbnail_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=225&fit=crop',
    max_students: 30,
    enrollment_count: 18,
    enrolled_count: 18,
    is_live_enabled: true,
    is_chat_enabled: true,
    is_quiz_enabled: true,
    start_date: '2024-02-20T00:00:00Z',
    end_date: '2024-04-15T00:00:00Z',
    created_at: '2024-02-10T00:00:00Z'
  },
  {
    id: '3',
    title: 'Full-Stack Web Development',
    description: 'Complete course covering both frontend and backend development using Node.js, React, and databases.',
    code: 'CS301',
    credits: 5,
    schedule: 'Mon, Wed, Fri 1:00 PM',
    instructor_id: 1,
    instructor: {
      id: 1,
      full_name: 'Dr. John Smith',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    status: 'active',
    thumbnail_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop',
    max_students: 40,
    enrollment_count: 35,
    enrolled_count: 35,
    is_live_enabled: true,
    is_chat_enabled: true,
    is_quiz_enabled: true,
    start_date: '2024-03-15T00:00:00Z',
    end_date: '2024-08-30T00:00:00Z',
    created_at: '2024-03-01T00:00:00Z'
  },
  {
    id: '4',
    title: 'Database Design and Management',
    description: 'Learn SQL, database design principles, and work with both relational and NoSQL databases.',
    code: 'CS401',
    credits: 4,
    schedule: 'Tue, Thu 10:00 AM',
    instructor_id: 4,
    instructor: {
      id: 4,
      full_name: 'Prof. Sarah Wilson',
      avatar_url: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face'
    },
    status: 'draft',
    thumbnail_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop',
    max_students: 25,
    enrollment_count: 0,
    enrolled_count: 0,
    is_live_enabled: true,
    is_chat_enabled: true,
    is_quiz_enabled: true,
    start_date: '2024-04-01T00:00:00Z',
    end_date: '2024-06-30T00:00:00Z',
    created_at: '2024-03-20T00:00:00Z'
  }
]

// Mock Chat Messages
export interface ChatMessage {
  id: number
  sender_id: number
  sender: {
    id: number
    full_name: string
    avatar_url?: string
    role: string
  }
  course_id: number
  message: string
  message_type: 'text' | 'file' | 'system' | 'announcement'
  created_at: string
  is_edited?: boolean
  edited_at?: string
}

export const mockChatMessages: ChatMessage[] = [
  {
    id: 1,
    sender_id: 1,
    sender: {
      id: 1,
      full_name: 'Dr. John Smith',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      role: 'instructor'
    },
    course_id: 1,
    message: 'Welcome to Introduction to React Development! Let\'s start with the basics.',
    message_type: 'announcement',
    created_at: '2024-03-01T10:00:00Z'
  },
  {
    id: 2,
    sender_id: 2,
    sender: {
      id: 2,
      full_name: 'Jane Doe',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b125b0d7?w=150&h=150&fit=crop&crop=face',
      role: 'student'
    },
    course_id: 1,
    message: 'Excited to learn React! When do we start with components?',
    message_type: 'text',
    created_at: '2024-03-01T10:05:00Z'
  },
  {
    id: 3,
    sender_id: 3,
    sender: {
      id: 3,
      full_name: 'Alice Johnson',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      role: 'student'
    },
    course_id: 1,
    message: 'I have some experience with vanilla JS. Will that help?',
    message_type: 'text',
    created_at: '2024-03-01T10:07:00Z'
  },
  {
    id: 4,
    sender_id: 1,
    sender: {
      id: 1,
      full_name: 'Dr. John Smith',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      role: 'instructor'
    },
    course_id: 1,
    message: '@Jane We\'ll cover components in today\'s session! @Alice Yes, JavaScript knowledge is definitely helpful.',
    message_type: 'text',
    created_at: '2024-03-01T10:10:00Z'
  }
]

// Mock Enrollments
export interface Enrollment {
  id: number
  user_id: number
  course_id: number
  enrolled_at: string
  status: 'active' | 'completed' | 'dropped' | 'suspended'
  progress: number
  last_accessed: string
}

export const mockEnrollments: Enrollment[] = [
  {
    id: 1,
    user_id: 2,
    course_id: 1,
    enrolled_at: '2024-02-20T00:00:00Z',
    status: 'active',
    progress: 35,
    last_accessed: '2024-03-01T10:05:00Z'
  },
  {
    id: 2,
    user_id: 3,
    course_id: 1,
    enrolled_at: '2024-02-25T00:00:00Z',
    status: 'active',
    progress: 28,
    last_accessed: '2024-03-01T10:07:00Z'
  },
  {
    id: 3,
    user_id: 2,
    course_id: 2,
    enrolled_at: '2024-02-22T00:00:00Z',
    status: 'active',
    progress: 15,
    last_accessed: '2024-02-28T14:30:00Z'
  }
]

// Helper functions to get mock data
export const getMockUser = (email: string, password: string): User | null => {
  // Simple mock authentication
  const user = mockUsers.find(u => u.email === email)
  if (user && password === 'demo123') {
    return user
  }
  return null
}

export const getMockUserById = (id: number): User | null => {
  return mockUsers.find(u => u.id === id) || null
}

export const getMockCourses = (): Course[] => {
  return mockCourses.filter(c => c.status === 'active')
}

export const getMockCourse = (id: string | number): Course | null => {
  return mockCourses.find(c => c.id === String(id)) || null
}

export const getMockUserCourses = (userId: number, role: string): Course[] => {
  if (role === 'instructor') {
    return mockCourses.filter(c => c.instructor_id === userId)
  } else {
    const userEnrollments = mockEnrollments.filter(e => e.user_id === userId)
    return mockCourses.filter(c => 
      userEnrollments.some(e => e.course_id === parseInt(c.id))
    )
  }
}

export const getMockChatMessages = (courseId: number): ChatMessage[] => {
  return mockChatMessages.filter(m => m.course_id === courseId)
}

export const isUserEnrolled = (userId: number, courseId: number): boolean => {
  return mockEnrollments.some(e => 
    e.user_id === userId && 
    e.course_id === courseId && 
    e.status === 'active'
  )
}