/**
 * CourseChatPanel Component
 * 
 * Panel hiển thị danh sách các khóa học đã enroll và chat discussions
 * Sử dụng cho tab "Thảo luận khóa học"
 */

import { useState, useCallback, useMemo } from 'react';
import { BookOpen, MessageSquare, Users, Loader2, ChevronRight, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { apiClient } from '@/services/http/client';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages, useSendMessage as useSendCourseMessage } from '@/hooks/useChat';
import { useCourseChatSocket } from '../hooks/useChatSocket';
import { MessageComposer } from './MessageComposer';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from './EmptyState';
import { Message, UserRole } from '../types';

interface CourseForChat {
  id: string;
  title: string;
  thumbnail?: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  enrollmentCount?: number;
}

interface CourseChatPanelProps {
  className?: string;
}

export function CourseChatPanel({ className }: CourseChatPanelProps) {
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isStudent = user?.role === 'student';

  // Fetch courses based on role
  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: isStudent ? ['my-enrolled-courses-panel'] : ['my-teaching-courses-panel'],
    queryFn: async () => {
      const endpoint = isStudent 
        ? '/courses/enrolled' 
        : '/courses/instructor/my-courses';
      const response = await apiClient.get(endpoint);
      // API returns { success, data: { data: Course[], pagination } }
      // or { success, data: { courses: Course[] } } for enrolled
      const respData = response.data?.data || response.data;
      const rawCourses = respData?.data || respData?.courses || respData || [];
      // Transform to CourseForChat format
      return (Array.isArray(rawCourses) ? rawCourses : []).map((c: any) => ({
        id: c.id,
        title: c.title,
        thumbnail: c.thumbnail_url || c.thumbnail,
        instructor: c.instructor ? {
          id: c.instructor.id,
          firstName: c.instructor.first_name || c.instructor.firstName || '',
          lastName: c.instructor.last_name || c.instructor.lastName || '',
          avatar: c.instructor.avatar_url || c.instructor.avatar,
        } : { id: user?.id || '', firstName: '', lastName: '' },
        enrollmentCount: c.enrollment_count || c.enrollmentCount || c.total_students,
      })) as CourseForChat[];
    },
    enabled: !!user,
  });

  // Fetch messages for selected course
  const { 
    data: messagesData, 
    isLoading: isLoadingMessages,
    refetch: refetchMessages 
  } = useChatMessages(selectedCourseId || '', 1, 50);

  const sendMessageMutation = useSendCourseMessage(selectedCourseId || '');

  // Real-time socket for course chat
  const { onlineUsers } = useCourseChatSocket({
    courseId: selectedCourseId || undefined,
    onNewMessage: () => {
      refetchMessages();
    },
  });

  // Filter courses by search
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (!searchQuery) return courses;
    return courses.filter(course => 
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  // Transform API messages to component format
  const messages = useMemo<Message[]>(() => {
    if (!messagesData?.data || !user) return [];
    return messagesData.data.map(msg => ({
      id: msg.id,
      conversation_id: msg.courseId,
      sender_id: msg.senderId,
      sender_role: (msg.senderId === user.id ? user.role : 'student') as UserRole,
      content: msg.content,
      created_at: msg.createdAt,
      status: 'sent' as const,
      attachment: msg.fileUrl ? {
        type: 'file' as const,
        url: msg.fileUrl,
        name: msg.fileName || 'file',
      } : undefined,
    }));
  }, [messagesData, user]);

  // Get selected course info
  const selectedCourse = useMemo(() => {
    return courses?.find(c => c.id === selectedCourseId);
  }, [courses, selectedCourseId]);

  // Handle select course
  const handleSelectCourse = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
  }, []);

  // Handle send message
  const handleSendMessage = useCallback((content: string) => {
    if (!selectedCourseId) return;
    sendMessageMutation.mutate({ content });
  }, [selectedCourseId, sendMessageMutation]);

  // Handle back to list
  const handleBackToList = useCallback(() => {
    setSelectedCourseId(null);
  }, []);

  const currentUserId = user?.id || '';

  return (
    <div className={cn('h-full flex bg-gray-100', className)}>
      {/* Sidebar - Course List */}
      <div
        className={cn(
          'w-80 xl:w-96 border-r border-gray-200 bg-white flex flex-col',
          selectedCourseId && 'hidden lg:flex'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {isStudent ? 'Khóa học đã đăng ký' : 'Khóa học đang dạy'}
          </h2>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Course List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingCourses ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => handleSelectCourse(course.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors',
                    selectedCourseId === course.id && 'bg-blue-50 border-l-4 border-blue-500'
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
                    {course.enrollmentCount !== undefined && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                        <Users className="w-3 h-3" />
                        <span>
                          {isStudent 
                            ? `${course.enrollmentCount} học viên • 1 giảng viên`
                            : `${course.enrollmentCount} học viên`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300" />
              <p className="mt-3 text-gray-500">
                {searchQuery 
                  ? 'Không tìm thấy khóa học nào'
                  : isStudent 
                    ? 'Bạn chưa đăng ký khóa học nào' 
                    : 'Bạn chưa có khóa học nào'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Panel - Chat */}
      <div className={cn(
        'flex-1 flex flex-col min-w-0',
        !selectedCourseId && 'hidden lg:flex'
      )}>
        {selectedCourse ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {selectedCourse.thumbnail ? (
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {selectedCourse.title}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span>Thảo luận chung</span>
                  {onlineUsers.length > 0 && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {onlineUsers.length} đang online
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.sender_id === currentUserId}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="mt-3 text-gray-500">
                      Chưa có tin nhắn nào
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      Hãy bắt đầu cuộc thảo luận!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="bg-white border-t border-gray-200 p-4">
              <MessageComposer
                onSend={handleSendMessage}
                placeholder="Nhập tin nhắn..."
                disabled={sendMessageMutation.isPending}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <EmptyState
              type="select-conversation"
              title="Chọn một khóa học"
              description="Chọn từ danh sách bên trái để xem thảo luận."
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseChatPanel;
