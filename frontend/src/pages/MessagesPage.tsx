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
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/services/http/client';
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
import { useCourseChatCourses } from '@/features/chat/hooks/useCourseChatCourses';
import {
    useConversations,
    useMessages,
    useSendMessage,
    useMarkAsRead,
    useCreateConversation,
    useUnreadCount,
    useOnlineStatus,
} from '@/hooks/useConversations';
import { Conversation, DirectMessage } from '@/services/api/conversation.api';
import { StudentDashboardLayout } from '@/layouts/StudentDashboardLayout';
import { InstructorDashboardLayout } from '@/layouts/InstructorDashboardLayout';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';

/**
 * Transform API conversation to ChatLayout format
 * Note: useConversations already provides transformed data with .participant
 */
function transformConversation(
    conv: Conversation,
    _currentUserId: string,
    _currentRole: string
): ChatConversation {
    // useConversations hook đã transform, conv có .participant rồi
    const participant = (conv as any).participant || {
        id: '',
        name: 'Unknown',
        avatar_url: undefined,
        online_status: 'offline',
    };

    return {
        id: conv.id,
        course_id: conv.course_id,
        course_title: (conv as any).course_title || '',
        participant: {
            id: participant.id,
            name: participant.name || 'Người dùng',
            avatar_url: participant.avatar_url,
            role: 'student', // simplified, not critical for display
            online_status: participant.online_status,
        },
        last_message: conv.last_message ? {
            content: conv.last_message.content,
            created_at: conv.last_message.created_at,
            sender_id: conv.last_message.sender_id,
            sender_role: (conv.last_message.sender_role || 'student') as UserRole,
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
    _conv: Conversation,
    _currentRole: string
): Message {
    // CRITICAL: created_at MUST exist from backend
    // If missing, this is a backend serialization bug that needs to be fixed
    if (!msg.created_at) {
        console.error('❌ CRITICAL: Message missing created_at from backend!', {
            id: msg.id?.substring(0, 8),
            message: msg,
        });
        // Use empty string to make it obvious in UI
        // DO NOT use fallback timestamp as it corrupts all message times
    }
    
    // Simplified: không cần determine role từ conv.student_id nữa
    return {
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        sender_role: 'student', // simplified for DM
        content: msg.content,
        created_at: msg.created_at || '', // Empty string if missing
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
    const { data: conversationsData, isLoading: isLoadingConversations, refetch: refetchConversations } = useConversations(user?.id);
    const { data: messagesData, isLoading: isLoadingMessages, refetch: refetchMessages } = useMessages(
        selectedConversationId || undefined
    );
    const sendMessageMutation = useSendMessage(selectedConversationId || '');
    const markAsReadMutation = useMarkAsRead();
    const createConversationMutation = useCreateConversation();
    const { data: unreadData } = useUnreadCount();
    
    // Real-time online status for selected conversation participant
    const { data: onlineStatusData } = useOnlineStatus(selectedConversationId || undefined);

    // Course chat list (shared with CourseChatPanel) for counts and caching
    const { data: courseChatCourses } = useCourseChatCourses();
    const courseTotalCount = courseChatCourses?.length ?? 0;

    // Query for course chat unread count (separate from total courses)
    const { data: courseUnreadCountData } = useQuery({
        queryKey: ['course-chat-unread-count', user?.id],
        queryFn: async () => {
            try {
                const response = await apiClient.get('/chat/unread-count');
                return response.data?.data?.unread_count || 0;
            } catch (error) {
                console.error('Failed to fetch course chat unread count:', error);
                return 0;
            }
        },
        enabled: !!user,
        staleTime: 1000 * 60, // 1 minute
    });

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

    // Track online users for current conversation participant
    const currentConversation = useMemo(() => {
        return conversationsData?.data?.find(c => c.id === selectedConversationId);
    }, [conversationsData, selectedConversationId]);

    // Transform API data to ChatLayout format
    const conversations = useMemo<ChatConversation[]>(() => {
        if (!conversationsData?.data || !currentUserId) return [];
        return conversationsData.data.map(conv => 
            transformConversation(conv, currentUserId, currentRole)
        );
    }, [conversationsData, currentUserId, currentRole]);

    // Get current conversation for message transformation (already defined above)
    // const currentConversation = ...

    const messages = useMemo<Message[]>(() => {
        if (!messagesData?.data || !currentConversation) return [];
        return messagesData.data.map(msg => 
            transformMessage(msg, currentConversation, currentRole)
        );
    }, [messagesData, currentConversation, currentRole]);

    // Unread count
    const dmUnreadCount = unreadData?.data?.unread_count || conversationsData?.data?.reduce((sum, conv: any) => sum + (conv.unread_count || 0), 0) || 0;

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
        recipientId: string;
        recipientName: string;
    }) => {
        try {
            const result = await createConversationMutation.mutateAsync({
                recipient_id: data.recipientId,
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
                        dmTotalCount={conversations.length}
                        dmUnreadCount={dmUnreadCount}
                        courseTotalCount={courseTotalCount}
                        courseUnreadCount={courseUnreadCountData ?? 0}
                        showGroupsTab={false}
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
                            isParticipantOnline={onlineStatusData?.data?.isOnline}
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
