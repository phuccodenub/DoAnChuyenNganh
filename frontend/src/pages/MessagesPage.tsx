/**
 * MessagesPage - Unified Chat Page
 * 
 * Trang tin nhắn dùng chung cho tất cả roles: Student, Instructor, Admin
 * Thay thế cho StudentChatPage và InstructorChatPage riêng lẻ
 * 
 * Features:
 * - Tab navigation: DM / Course Discussions
 * - Real-time messaging via Socket.IO
 * - New conversation modal
 * - Responsive design
 * 
 * @author AI Agent
 * @version 2.0
 * @since 2024-12-03
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
    ChatLayout,
    ChatTabs,
    useChatTabs,
    NewChatModal,
    CourseChatPanel,
    Message,
    Conversation as ChatConversation,
    UserRole,
    useDMSocket,
    useChatNotifications,
} from '@/features/chat';
import type { ChatTabType } from '@/features/chat';
import {
    useConversations,
    useMessages,
    useSendMessage,
    useMarkAsRead,
    useCreateConversation,
    useUnreadCount,
} from '@/hooks/useConversations';
import { Conversation, DirectMessage } from '@/services/api/conversation.api';
import { StudentDashboardLayout } from '@/layouts/StudentDashboardLayout';
import { InstructorDashboardLayout } from '@/layouts/InstructorDashboardLayout';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';

/**
 * Transform API conversation to ChatLayout format
 * Xử lý logic cho tất cả các role
 */
function transformConversation(
    conv: Conversation,
    currentUserId: string,
    currentRole: string
): ChatConversation {
    // Xác định participant dựa vào role hiện tại
    let participant: Conversation['student'] | Conversation['instructor'];
    let participantRole: UserRole;

    if (currentRole === 'student') {
        // Student đang chat -> participant là instructor
        participant = conv.instructor;
        participantRole = 'instructor';
    } else if (currentRole === 'instructor') {
        // Instructor đang chat -> participant là student
        participant = conv.student;
        participantRole = 'student';
    } else {
        // Admin: có thể chat với cả 2, xác định dựa vào ID
        const isStudent = conv.student_id === currentUserId;
        participant = isStudent ? conv.instructor : conv.student;
        participantRole = isStudent ? 'instructor' : 'student';
    }

    // Xác định sender_role cho last_message
    let lastMessageSenderRole: UserRole = 'student';
    if (conv.last_message) {
        if (conv.last_message.sender_id === conv.student_id) {
            lastMessageSenderRole = 'student';
        } else {
            lastMessageSenderRole = 'instructor';
        }
    }

    return {
        id: conv.id,
        course_id: conv.course_id,
        course_title: conv.course?.title || 'Khóa học không xác định',
        participant: {
            id: participant.id,
            name: `${participant.first_name || ''} ${participant.last_name || ''}`.trim() || 'Người dùng',
            avatar_url: participant.avatar,
            role: participantRole,
            online_status: participant.status === 'active' ? 'online' : 'offline',
        },
        last_message: conv.last_message ? {
            content: conv.last_message.content,
            created_at: conv.last_message.created_at,
            sender_role: lastMessageSenderRole,
        } : undefined,
        unread_count: conv.unread_count || 0,
        updated_at: conv.last_message_at || conv.updated_at,
    };
}

/**
 * Transform API message to ChatLayout format
 */
function transformMessage(
    msg: DirectMessage,
    conv: Conversation,
    _currentRole: string
): Message {
    // Xác định sender_role dựa trên sender_id
    let senderRole: UserRole;
    if (msg.sender_id === conv.student_id) {
        senderRole = 'student';
    } else {
        senderRole = 'instructor';
    }

    return {
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        sender_role: senderRole,
        content: msg.content,
        created_at: msg.created_at,
        status: msg.status === 'read' ? 'read' : msg.status === 'delivered' ? 'delivered' : 'sent',
        attachment: msg.attachment_url ? {
            type: msg.attachment_type === 'image' ? 'image' : 'file',
            url: msg.attachment_url,
            name: msg.attachment_url.split('/').pop() || 'attachment',
        } : undefined,
    };
}

/**
 * Map user role to UserRole type (for ChatLayout)
 * Admin được xử lý như instructor trong context chat
 */
function mapToUserRole(role: string | undefined): UserRole {
    if (role === 'student') return 'student';
    // admin, super_admin, instructor -> đều được coi là instructor trong context chat
    return 'instructor';
}

/**
 * Get appropriate layout wrapper based on user role
 */
function getLayoutWrapper(role: string | undefined) {
    switch (role) {
        case 'student':
            return StudentDashboardLayout;
        case 'instructor':
            return InstructorDashboardLayout;
        case 'admin':
        case 'super_admin':
            return AdminDashboardLayout;
        default:
            return StudentDashboardLayout;
    }
}

/**
 * MessagesPage Component
 * Unified chat page for all roles
 */
export function MessagesPage() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const { conversationId: routeConversationId } = useParams<{ conversationId: string }>();

    // Get courseId from URL if coming from a course page
    const courseIdFromUrl = searchParams.get('courseId');

    // State
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
        routeConversationId || null
    );
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

    // Chat tabs state
    const { activeTab, setActiveTab } = useChatTabs('dm');

    // API Hooks
    const { data: conversationsData, isLoading: isLoadingConversations, refetch: refetchConversations } = useConversations();
    const { data: messagesData, isLoading: isLoadingMessages, refetch: refetchMessages } = useMessages(
        selectedConversationId || undefined
    );
    const sendMessageMutation = useSendMessage(selectedConversationId || '');
    const markAsReadMutation = useMarkAsRead();
    const createConversationMutation = useCreateConversation();
    const { data: unreadData } = useUnreadCount();

    // Current user info
    const currentUserId = user?.id || '';
    const currentRole = user?.role || 'student';
    const currentUserRole = mapToUserRole(currentRole);

    // Socket hooks for real-time updates
    useDMSocket({
        conversationId: selectedConversationId || undefined,
        onNewMessage: () => {
            refetchMessages();
            refetchConversations();
        },
    });

    // Global chat notifications
    useChatNotifications();

    // Transform API data to ChatLayout format
    const conversations = useMemo<ChatConversation[]>(() => {
        if (!conversationsData?.data || !currentUserId) return [];
        return conversationsData.data.map(conv => 
            transformConversation(conv, currentUserId, currentRole)
        );
    }, [conversationsData, currentUserId, currentRole]);

    // Get current conversation for message transformation
    const currentConversation = useMemo(() => {
        return conversationsData?.data?.find(c => c.id === selectedConversationId);
    }, [conversationsData, selectedConversationId]);

    const messages = useMemo<Message[]>(() => {
        if (!messagesData?.data || !currentConversation) return [];
        return messagesData.data.map(msg => 
            transformMessage(msg, currentConversation, currentRole)
        );
    }, [messagesData, currentConversation, currentRole]);

    // Unread count
    const dmUnreadCount = unreadData?.data?.unread_count || 0;

    // Auto-select conversation based on URL params
    useEffect(() => {
        // Priority 1: Route param (from /messages/:conversationId)
        if (routeConversationId && conversations.some(c => c.id === routeConversationId)) {
            setSelectedConversationId(routeConversationId);
            return;
        }

        // Priority 2: Query param (from ?courseId=xxx)
        if (courseIdFromUrl && conversations.length > 0) {
            const matchingConversation = conversations.find(
                (c) => c.course_id === courseIdFromUrl
            );
            if (matchingConversation) {
                setSelectedConversationId(matchingConversation.id);
                return;
            }
        }

        // Priority 3: Select first conversation if none selected
        if (conversations.length > 0 && !selectedConversationId) {
            setSelectedConversationId(conversations[0].id);
        }
    }, [routeConversationId, courseIdFromUrl, conversations, selectedConversationId]);

    // Mark conversation as read when selected
    useEffect(() => {
        if (selectedConversationId) {
            markAsReadMutation.mutate(selectedConversationId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedConversationId]);

    // Handle send message
    const handleSendMessage = useCallback((content: string) => {
        if (!selectedConversationId || !user) return;
        sendMessageMutation.mutate({ content });
    }, [selectedConversationId, user, sendMessageMutation]);

    // Handle select conversation
    const handleSelectConversation = useCallback((id: string) => {
        setSelectedConversationId(id);
    }, []);

    // Handle retry
    const handleRetry = useCallback(() => {
        refetchConversations();
        if (selectedConversationId) {
            refetchMessages();
        }
    }, [refetchConversations, refetchMessages, selectedConversationId]);

    // Handle start new conversation
    const handleStartConversation = useCallback(async (data: {
        courseId: string;
        instructorId?: string;
        studentId?: string;
    }) => {
        try {
            const result = await createConversationMutation.mutateAsync({
                course_id: data.courseId,
                instructor_id: data.instructorId,
                student_id: data.studentId,
            });
            
            if (result.data) {
                setSelectedConversationId(result.data.id);
                setIsNewChatModalOpen(false);
            }
        } catch {
            // Error handled by mutation
        }
    }, [createConversationMutation]);

    // Handle tab change
    const handleTabChange = useCallback((tab: ChatTabType) => {
        setActiveTab(tab);
        // Reset selected conversation when switching tabs
        setSelectedConversationId(null);
    }, [setActiveTab]);

    // Get the appropriate layout
    const LayoutWrapper = getLayoutWrapper(currentRole);

    return (
        <LayoutWrapper>
            <div className="h-[calc(100vh-64px)] -m-4 lg:-m-8 flex flex-col">
                {/* Header with tabs and new chat button */}
                <div className="bg-white border-b border-gray-200 flex items-center justify-between px-4">
                    <ChatTabs
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        dmUnreadCount={dmUnreadCount}
                        courseUnreadCount={0} // TODO: Implement course chat unread count
                        showGroupsTab={false} // Future feature
                        className="flex-1"
                    />
                    <button
                        onClick={() => setIsNewChatModalOpen(true)}
                        className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Tin nhắn mới</span>
                    </button>
                </div>

                {/* Chat content based on active tab */}
                <div className="flex-1 min-h-0">
                    {activeTab === 'dm' && (
                        <ChatLayout
                            conversations={conversations}
                            messages={messages}
                            currentUserId={currentUserId}
                            currentUserRole={currentUserRole}
                            selectedConversationId={selectedConversationId}
                            onSelectConversation={handleSelectConversation}
                            onSendMessage={handleSendMessage}
                            isLoadingMessages={isLoadingMessages}
                            isLoadingConversations={isLoadingConversations}
                            onRetry={handleRetry}
                        />
                    )}

                    {activeTab === 'courses' && (
                        <CourseChatPanel />
                    )}
                </div>

                {/* New Chat Modal */}
                <NewChatModal
                    isOpen={isNewChatModalOpen}
                    onClose={() => setIsNewChatModalOpen(false)}
                    onStartConversation={handleStartConversation}
                    isCreating={createConversationMutation.isPending}
                />
            </div>
        </LayoutWrapper>
    );
}

export default MessagesPage;
