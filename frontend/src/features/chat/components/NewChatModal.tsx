/**
 * NewChatModal Component
 * 
 * Modal để bắt đầu cuộc trò chuyện mới
 * - Student: Chọn khóa học và gửi tin nhắn cho giảng viên
 * - Instructor: Chọn học viên từ danh sách đã enroll
 * - Admin: Có thể chat với bất kỳ ai
 */

import { useState, useEffect } from 'react';
import { X, Search, User, BookOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/http/client';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartConversation: (data: {
    courseId: string;
    instructorId?: string;
    studentId?: string;
  }) => void;
  isCreating?: boolean;
}

interface CourseOption {
  id: string;
  title: string;
  thumbnail?: string;
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export function NewChatModal({
  isOpen,
  onClose,
  onStartConversation,
  isCreating = false,
}: NewChatModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'course' | 'user'>('course');
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('course');
      setSelectedCourse(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  const isStudent = user?.role === 'student';
  const isInstructor = user?.role === 'instructor';
  const isAdmin = user?.role === 'admin';

  // Fetch enrolled courses (for student)
  const { data: enrolledCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['my-enrolled-courses-for-chat'],
    queryFn: async () => {
      const response = await apiClient.get('/courses/enrolled');
      // Transform to CourseOption format
      const courses = response.data.data?.courses || response.data.data || [];
      return courses.map((c: any) => ({
        id: c.id,
        title: c.title,
        thumbnail: c.thumbnail_url,
        instructor: c.instructor ? {
          id: c.instructor.id,
          firstName: c.instructor.first_name || c.instructor.firstName || '',
          lastName: c.instructor.last_name || c.instructor.lastName || '',
          avatar: c.instructor.avatar_url || c.instructor.avatar,
        } : undefined,
      })) as CourseOption[];
    },
    enabled: isOpen && isStudent,
  });

  // Fetch teaching courses (for instructor)
  const { data: teachingCourses, isLoading: isLoadingTeaching } = useQuery({
    queryKey: ['my-teaching-courses-for-chat'],
    queryFn: async () => {
      const response = await apiClient.get('/courses/instructor/my-courses');
      const courses = response.data.data?.courses || response.data.data || [];
      return courses.map((c: any) => ({
        id: c.id,
        title: c.title,
        thumbnail: c.thumbnail_url || c.thumbnail,
        instructor: undefined, // Instructor is self
      })) as CourseOption[];
    },
    enabled: isOpen && isInstructor,
  });

  // Fetch students in selected course (for instructor)
  const { data: courseStudents, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['course-students-for-chat', selectedCourse?.id],
    queryFn: async () => {
      const response = await apiClient.get(`/enrollments/course/${selectedCourse?.id}`);
      const enrollments = response.data.data || [];
      // Transform enrollments to StudentOption
      return enrollments.map((e: any) => ({
        id: e.user?.id || e.user_id,
        firstName: e.user?.first_name || e.user?.firstName || '',
        lastName: e.user?.last_name || e.user?.lastName || '',
        email: e.user?.email || '',
        avatar: e.user?.avatar_url || e.user?.avatar,
      })).filter((s: StudentOption) => s.id) as StudentOption[];
    },
    enabled: isOpen && isInstructor && !!selectedCourse?.id,
  });

  // Fetch all users (for admin)
  const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['all-users-for-chat', searchQuery],
    queryFn: async () => {
      const response = await apiClient.get('/users', {
        params: { search: searchQuery, limit: 20 },
      });
      return response.data.data as StudentOption[];
    },
    enabled: isOpen && isAdmin && searchQuery.length >= 2,
  });

  const courses = isStudent ? enrolledCourses : teachingCourses;
  const isLoadingCoursesData = isStudent ? isLoadingCourses : isLoadingTeaching;

  const handleSelectCourse = (course: CourseOption) => {
    setSelectedCourse(course);
    if (isStudent && course.instructor) {
      // Student selects course → auto start with instructor
      onStartConversation({
        courseId: course.id,
        instructorId: course.instructor.id,
      });
    } else if (isInstructor) {
      // Instructor selects course → need to choose student
      setStep('user');
    }
  };

  const handleSelectStudent = (student: StudentOption) => {
    if (selectedCourse) {
      onStartConversation({
        courseId: selectedCourse.id,
        studentId: student.id,
      });
    }
  };

  const handleSelectUser = (userToChat: StudentOption) => {
    // Admin can chat with anyone - use a placeholder course or direct chat
    onStartConversation({
      courseId: 'admin-direct', // Special handling in API
      studentId: userToChat.id,
    });
  };

  // Filter courses by search
  const filteredCourses = courses?.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter students by search
  const filteredStudents = courseStudents?.filter(
    (student) =>
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {step === 'user' && (
              <button
                onClick={() => setStep('course')}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {step === 'course' ? 'Chọn khóa học' : 'Chọn học viên'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            disabled={isCreating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={
                step === 'course'
                  ? 'Tìm kiếm khóa học...'
                  : isAdmin
                  ? 'Tìm kiếm người dùng...'
                  : 'Tìm kiếm học viên...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {/* Course Selection */}
          {step === 'course' && !isAdmin && (
            <>
              {isLoadingCoursesData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : filteredCourses && filteredCourses.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      disabled={isCreating}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors',
                        isCreating && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {course.title}
                        </p>
                        {course.instructor && (
                          <p className="text-sm text-gray-500 truncate">
                            Giảng viên: {course.instructor.firstName}{' '}
                            {course.instructor.lastName}
                          </p>
                        )}
                      </div>
                      {isCreating && (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="mt-3 text-gray-500">
                    {isStudent
                      ? 'Bạn chưa đăng ký khóa học nào'
                      : 'Bạn chưa có khóa học nào'}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Student Selection (for Instructor) */}
          {step === 'user' && isInstructor && (
            <>
              {isLoadingStudents ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : filteredStudents && filteredStudents.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      disabled={isCreating}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors',
                        isCreating && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={`${student.firstName} ${student.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {student.email}
                        </p>
                      </div>
                      {isCreating && (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <User className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="mt-3 text-gray-500">
                    Không có học viên nào trong khóa học này
                  </p>
                </div>
              )}
            </>
          )}

          {/* User Selection (for Admin) */}
          {isAdmin && (
            <>
              {searchQuery.length < 2 ? (
                <div className="py-12 text-center">
                  <Search className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="mt-3 text-gray-500">
                    Nhập ít nhất 2 ký tự để tìm kiếm người dùng
                  </p>
                </div>
              ) : isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : allUsers && allUsers.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {allUsers.map((userItem) => (
                    <button
                      key={userItem.id}
                      onClick={() => handleSelectUser(userItem)}
                      disabled={isCreating}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors',
                        isCreating && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {userItem.avatar ? (
                        <img
                          src={userItem.avatar}
                          alt={`${userItem.firstName} ${userItem.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {userItem.firstName} {userItem.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {userItem.email}
                        </p>
                      </div>
                      {isCreating && (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <User className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="mt-3 text-gray-500">
                    Không tìm thấy người dùng nào
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with selected course info */}
        {selectedCourse && step === 'user' && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="w-4 h-4" />
              <span>Khóa học: {selectedCourse.title}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewChatModal;
