/**
 * CourseChatPanel Component
 * 
 * Panel hiển thị danh sách các khóa học đã enroll và chat discussions
 * Sử dụng cho tab "Thảo luận khóa học"
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { BookOpen, MessageSquare, Users, Loader2, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages, useSendMessage as useSendCourseMessage, useMarkCourseAsRead, useUnreadCountPerCourse, useInfiniteChatMessages, useLoadOlderChatMessages } from '@/hooks/useChat';
import { useCourseChatSocket } from '../hooks/useChatSocket';
import { MessageComposer } from './MessageComposer';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from './EmptyState';
import { Message, UserRole } from '../types';
import { useCourseChatCourses } from '../hooks/useCourseChatCourses';

interface CourseChatPanelProps {
  className?: string;
}

export function CourseChatPanel({ className }: CourseChatPanelProps) {
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);
  const prevCourseIdRef = useRef<string | null>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const { data: courses, isLoading: isLoadingCourses } = useCourseChatCourses();

  // Fetch unread count per course
  const { data: unreadCountsData } = useUnreadCountPerCourse();
  
  // Create a map for quick lookup of unread counts by course_id
  const unreadCountMap = useMemo(() => {
    if (!unreadCountsData) return new Map<string, number>();
    const map = new Map<string, number>();
    unreadCountsData.forEach(item => {
      map.set(item.course_id, item.unread_count);
    });
    return map;
  }, [unreadCountsData]);

  // Fetch messages for selected course (using infinite scroll)
  const { 
    data: messagesData, 
    isLoading: isLoadingMessages,
    refetch: refetchMessages 
  } = useInfiniteChatMessages(selectedCourseId || '');

  const loadOlderMessagesMutation = useLoadOlderChatMessages(selectedCourseId || '');
  const sendMessageMutation = useSendCourseMessage(selectedCourseId || '');
  const markAsReadMutation = useMarkCourseAsRead();

  // Mark course as read immediately when opening (no debounce for instant update)
  useEffect(() => {
    if (selectedCourseId) {
      markAsReadMutation.mutate(selectedCourseId, {
        onError: (error) => {
          console.error('Failed to mark course as read:', error);
        }
      });
    }
  }, [selectedCourseId]);

  // Real-time socket for course chat
  const { onlineUsers } = useCourseChatSocket({
    courseId: selectedCourseId || undefined,
    onNewMessage: () => {
      // Messages will be updated automatically via cache update in useChatSocket
      // Just trigger a small delay for scroll
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      // Mark as read immediately when viewing and receiving new message
      if (selectedCourseId) {
        markAsReadMutation.mutate(selectedCourseId, {
          onError: (error) => {
            console.error('Failed to mark course as read:', error);
          }
        });
      }
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
    // Safety check: only process if we have valid data array
    if (!selectedCourseId || !messagesData?.data || !Array.isArray(messagesData.data) || !user) {
      return [];
    }
    const mapped = messagesData.data.map(msg => ({
      id: msg.id,
      conversation_id: msg.course_id,
      sender_id: msg.user_id,
      sender_role: (msg.user_id === user.id ? user.role : (msg.sender?.role || 'student')) as UserRole,
      content: msg.content,
      created_at: msg.createdAt,
      status: 'sent' as const,
      attachment: msg.attachment_url ? {
        type: 'file' as const,
        url: msg.attachment_url,
        name: msg.attachment_name || 'file',
      } : undefined,
    }));
    // Sort messages by date ascending (oldest first, newest last)
    return mapped.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messagesData, user, selectedCourseId]);

  // Scroll to bottom on initial load (when course changes)
  useEffect(() => {
    if (selectedCourseId && selectedCourseId !== prevCourseIdRef.current && messages.length > 0) {
      // New course selected - scroll to bottom immediately
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
      }, 150);
      prevCourseIdRef.current = selectedCourseId;
      prevMessagesLengthRef.current = messages.length;
    }
  }, [selectedCourseId, messages.length]);

  // Auto scroll when new messages arrive (only if near bottom)
  useEffect(() => {
    const messagesChanged = messages.length !== prevMessagesLengthRef.current;
    
    if (messagesChanged && messages.length > 0 && isNearBottom && selectedCourseId === prevCourseIdRef.current) {
      // Only auto-scroll if user is near bottom and same course
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages, isNearBottom, selectedCourseId]);

  // Handle infinite scroll - load older messages when scrolled to top
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !selectedCourseId) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Check if near bottom (for auto-scroll behavior)
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsNearBottom(distanceFromBottom < 100);
      
      // Load more when scrolled to top
      if (scrollTop < 100 && !loadOlderMessagesMutation.isPending && messages.length > 0) {
        const oldestMessage = messages[0];
        if (oldestMessage && oldestMessage.id) {
          loadOlderMessagesMutation.mutate(oldestMessage.id);
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages, selectedCourseId, loadOlderMessagesMutation]);

  // Create sender info map for display
  const senderInfoMap = useMemo(() => {
    if (!selectedCourseId || !messagesData?.data || !Array.isArray(messagesData.data)) {
      return new Map<string, { name: string; avatar?: string }>();
    }
    const map = new Map<string, { name: string; avatar?: string }>();
    messagesData.data.forEach(msg => {
      if (msg.sender && !map.has(msg.user_id)) {
        map.set(msg.user_id, {
          name: `${msg.sender.first_name} ${msg.sender.last_name}`.trim(),
          avatar: msg.sender.avatar,
        });
      }
    });
    return map;
  }, [messagesData]);

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
            {isStudent ? 'Khóa học đã đăng ký' : isAdmin ? 'Tất cả khóa học' : 'Khóa học đang dạy'}
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
              {filteredCourses.map((course) => {
                const unreadCount = unreadCountMap.get(course.id) || 0;
                const hasUnread = unreadCount > 0;
                
                return (
                  <button
                    key={course.id}
                    onClick={() => handleSelectCourse(course.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors',
                      selectedCourseId === course.id && 'bg-blue-50 border-l-4 border-blue-500',
                      hasUnread && selectedCourseId !== course.id && 'bg-blue-50/30 font-semibold'
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
                      <p className={cn(
                        "font-medium text-gray-900 truncate",
                        hasUnread && "font-bold"
                      )}>
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
                    {hasUnread ? (
                      <div className="flex flex-col items-end gap-1">
                        <div className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                        <MessageSquare className="w-4 h-4 text-red-500" />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                );
              })}
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
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Loading more indicator */}
              {loadOlderMessagesMutation.isPending && (
                <div className="text-center py-2">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}

              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : messages.length > 0 ? (
                <>
                  {messages.map((msg, index) => {
                    const senderInfo = senderInfoMap.get(msg.sender_id);
                    // Show avatar chỉ cho tin nhắn đầu tiên hoặc khi sender thay đổi
                    const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;
                    return (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.sender_id === currentUserId}
                        showAvatar={showAvatar}
                        senderName={senderInfo?.name}
                        senderAvatar={senderInfo?.avatar}
                      />
                    );
                  })}
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </>
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
