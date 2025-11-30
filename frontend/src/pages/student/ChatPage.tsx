/**
 * ChatPage - Student Chat Page
 * 
 * Trang chat cho học viên với giảng viên
 * Sử dụng ChatLayout với mock data
 * 
 * TODO: [API] Tích hợp với backend:
 * - GET /api/v1/chat/conversations - Lấy danh sách conversations
 * - GET /api/v1/chat/conversations/:id/messages - Lấy messages
 * - POST /api/v1/chat/messages - Gửi tin nhắn
 * - WebSocket: Real-time messages & typing indicators
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
    ChatLayout,
    mockStudentConversations,
    mockMessages,
    getMessagesByConversationId,
    Message,
} from '@/features/chat';

export function ChatPage() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    // Get courseId from URL if coming from a course page
    const courseIdFromUrl = searchParams.get('courseId');

    // State
    const [conversations] = useState(mockStudentConversations);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // Auto-select conversation based on courseId from URL
    useEffect(() => {
        if (courseIdFromUrl) {
            const matchingConversation = conversations.find(
                (c) => c.course_id === courseIdFromUrl
            );
            if (matchingConversation) {
                setSelectedConversationId(matchingConversation.id);
            }
        } else if (conversations.length > 0 && !selectedConversationId) {
            // Default: select first conversation
            setSelectedConversationId(conversations[0].id);
        }
    }, [courseIdFromUrl, conversations, selectedConversationId]);

    // Load messages when conversation changes
    useEffect(() => {
        if (selectedConversationId) {
            setIsLoadingMessages(true);

            // TODO: [API] Replace with API call: GET /api/v1/chat/conversations/:id/messages
            // Simulate API delay
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

        // Optimistic UI: Add message immediately
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            conversation_id: selectedConversationId,
            sender_id: user.id,
            sender_role: 'student',
            content,
            created_at: new Date().toISOString(),
            status: 'sending',
        };

        setMessages((prev) => [...prev, newMessage]);

        // TODO: [API] POST /api/v1/chat/messages
        // On success: update message status to 'sent'
        // On error: update message status to 'failed'

        // Simulate API response
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
                currentUserRole="student"
                selectedConversationId={selectedConversationId}
                onSelectConversation={setSelectedConversationId}
                onSendMessage={handleSendMessage}
                isLoadingMessages={isLoadingMessages}
            />
        </div>
    );
}

export default ChatPage;
