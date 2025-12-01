/**
 * InstructorChatPage - Instructor Chat Page
 * 
 * Trang chat cho giảng viên với học viên
 * Sử dụng ChatLayout với API thực
 */

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
    ChatLayout,
    Message,
    Conversation as ChatConversation,
} from '@/features/chat';
import {
    useConversations,
    useMessages,
    useSendMessage,
    useMarkAsRead,
} from '@/hooks/useConversations';
import { Conversation, DirectMessage } from '@/services/api/conversation.api';

/**
 * Transform API conversation to ChatLayout format
 */
function transformConversation(
    conv: Conversation,
    currentUserId: string
): ChatConversation {
    const isInstructor = conv.instructor_id === currentUserId;
    const participant = isInstructor ? conv.student : conv.instructor;

    return {
        id: conv.id,
        course_id: conv.course_id,
        course_title: conv.course?.title || 'Unknown Course',
        participant: {
            id: participant.id,
            name: `${participant.first_name} ${participant.last_name}`.trim(),
            avatar_url: participant.avatar,
            role: isInstructor ? 'student' : 'instructor',
            online_status: participant.status === 'active' ? 'online' : 'offline',
        },
        last_message: conv.last_message ? {
            content: conv.last_message.content,
            created_at: conv.last_message.created_at,
            sender_role: conv.last_message.sender_id === conv.instructor_id ? 'instructor' : 'student',
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
    instructorId: string
): Message {
    return {
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender_id: msg.sender_id,
        sender_role: msg.sender_id === instructorId ? 'instructor' : 'student',
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

export function InstructorChatPage() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    const courseIdFromUrl = searchParams.get('courseId');

    // State
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    // API Hooks
    const { data: conversationsData, isLoading: isLoadingConversations } = useConversations();
    const { data: messagesData, isLoading: isLoadingMessages } = useMessages(
        selectedConversationId || undefined
    );
    const sendMessageMutation = useSendMessage(selectedConversationId || '');
    const markAsReadMutation = useMarkAsRead();

    // Transform API data to ChatLayout format
    const conversations = useMemo<ChatConversation[]>(() => {
        if (!conversationsData?.data || !user?.id) return [];
        return conversationsData.data.map(conv => transformConversation(conv, user.id));
    }, [conversationsData, user?.id]);

    // Get current conversation's instructorId for message transformation
    const currentConversation = conversationsData?.data?.find(
        c => c.id === selectedConversationId
    );

    const messages = useMemo<Message[]>(() => {
        if (!messagesData?.data || !currentConversation) return [];
        return messagesData.data.map(msg => 
            transformMessage(msg, currentConversation.instructor_id)
        );
    }, [messagesData, currentConversation]);

    // Auto-select conversation based on courseId
    useEffect(() => {
        if (courseIdFromUrl && conversations.length > 0) {
            const matchingConversation = conversations.find(
                (c) => c.course_id === courseIdFromUrl
            );
            if (matchingConversation) {
                setSelectedConversationId(matchingConversation.id);
            }
        } else if (conversations.length > 0 && !selectedConversationId) {
            setSelectedConversationId(conversations[0].id);
        }
    }, [courseIdFromUrl, conversations, selectedConversationId]);

    // Mark conversation as read when selected
    useEffect(() => {
        if (selectedConversationId) {
            markAsReadMutation.mutate(selectedConversationId);
        }
    }, [selectedConversationId]);

    // Handle send message
    const handleSendMessage = (content: string) => {
        if (!selectedConversationId || !user) return;

        sendMessageMutation.mutate({ content });
    };

    return (
        <div className="h-[calc(100vh-64px)]">
            <ChatLayout
                conversations={conversations}
                messages={messages}
                currentUserId={user?.id || ''}
                currentUserRole="instructor"
                selectedConversationId={selectedConversationId}
                onSelectConversation={setSelectedConversationId}
                onSendMessage={handleSendMessage}
                isLoadingMessages={isLoadingMessages}
                isLoadingConversations={isLoadingConversations}
            />
        </div>
    );
}

export default InstructorChatPage;
