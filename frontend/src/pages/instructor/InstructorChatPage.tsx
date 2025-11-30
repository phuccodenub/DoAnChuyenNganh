/**
 * InstructorChatPage - Instructor Chat Page
 * 
 * Trang chat cho giảng viên với học viên
 * Tương tự ChatPage nhưng hiển thị danh sách học viên
 * 
 * TODO: [API] Tích hợp với backend:
 * - GET /api/v1/chat/conversations?role=instructor - Lấy conversations
 * - GET /api/v1/chat/conversations/:id/messages - Lấy messages
 * - POST /api/v1/chat/messages - Gửi tin nhắn
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
    ChatLayout,
    mockInstructorConversations,
    getMessagesByConversationId,
    Message,
} from '@/features/chat';

export function InstructorChatPage() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    const courseIdFromUrl = searchParams.get('courseId');

    // State
    const [conversations] = useState(mockInstructorConversations);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // Auto-select conversation based on courseId
    useEffect(() => {
        if (courseIdFromUrl) {
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

    // Load messages when conversation changes
    useEffect(() => {
        if (selectedConversationId) {
            setIsLoadingMessages(true);

            // TODO: [API] Replace with API call
            setTimeout(() => {
                const conversationMessages = getMessagesByConversationId(selectedConversationId);
                setMessages(conversationMessages);
                setIsLoadingMessages(false);
            }, 500);
        }
    }, [selectedConversationId]);

    // Handle send message
    const handleSendMessage = (content: string) => {
        if (!selectedConversationId || !user) return;

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            conversation_id: selectedConversationId,
            sender_id: user.id,
            sender_role: 'instructor',
            content,
            created_at: new Date().toISOString(),
            status: 'sending',
        };

        setMessages((prev) => [...prev, newMessage]);

        // TODO: [API] POST /api/v1/chat/messages
        setTimeout(() => {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === newMessage.id ? { ...m, status: 'sent' } : m
                )
            );
        }, 1000);
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
            />
        </div>
    );
}

export default InstructorChatPage;
