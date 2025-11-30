/**
 * MessagePanel Component
 * 
 * Dropdown panel hiển thị danh sách tin nhắn giống Facebook Messenger
 * Khi click vào một tin nhắn sẽ điều hướng đến ChatPage hoặc InstructorChatPage
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, generateRoute } from '@/constants/routes';
import {
    Conversation,
    mockStudentConversations,
    mockInstructorConversations,
    formatRelativeTime,
    OnlineStatusDot,
} from '@/features/chat';

export const MessagePanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const panelRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Determine which conversations to show based on user role
    const isInstructor = user?.role === 'instructor';
    const conversations = isInstructor
        ? mockInstructorConversations
        : mockStudentConversations;

    // Filter conversations based on search
    const filteredConversations = conversations.filter((conv) => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        return (
            conv.participant.name.toLowerCase().includes(searchLower) ||
            conv.course_title.toLowerCase().includes(searchLower) ||
            conv.last_message?.content.toLowerCase().includes(searchLower)
        );
    });

    // Calculate unread count
    const unreadCount = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Handle click on conversation
    const handleConversationClick = (conversation: Conversation) => {
        setIsOpen(false);
        const chatRoute = isInstructor
            ? generateRoute.instructor.chat(conversation.course_id)
            : generateRoute.student.chat(conversation.course_id);
        navigate(chatRoute);
    };

    // Handle "See all messages"
    const handleSeeAllClick = () => {
        setIsOpen(false);
        const chatRoute = isInstructor ? ROUTES.INSTRUCTOR.CHAT : ROUTES.STUDENT.CHAT;
        navigate(chatRoute);
    };

    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .filter((char) => char)
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'relative p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    isOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                )}
                aria-label="Tin nhắn"
            >
                <MessageCircle className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* Popover Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-[380px] sm:w-[420px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900 text-lg">Tin nhắn</h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                        {unreadCount} mới
                                    </span>
                                )}
                            </div>
                            <button
                                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                                title="Cài đặt"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm tin nhắn..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="py-12 text-center">
                                <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 text-sm">
                                    {searchQuery ? 'Không tìm thấy tin nhắn' : 'Chưa có tin nhắn nào'}
                                </p>
                            </div>
                        ) : (
                            filteredConversations.map((conversation) => (
                                <button
                                    key={conversation.id}
                                    onClick={() => handleConversationClick(conversation)}
                                    className={cn(
                                        'w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-gray-50',
                                        conversation.unread_count > 0 && 'bg-blue-50/50 hover:bg-blue-50'
                                    )}
                                >
                                    {/* Avatar with online status */}
                                    <div className="relative flex-shrink-0">
                                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                                            {conversation.participant.avatar_url ? (
                                                <img
                                                    src={conversation.participant.avatar_url}
                                                    alt={conversation.participant.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-semibold text-indigo-600">
                                                    {getInitials(conversation.participant.name)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5">
                                            <OnlineStatusDot
                                                status={conversation.participant.online_status}
                                            />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <span className={cn(
                                                'font-medium text-sm truncate',
                                                conversation.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'
                                            )}>
                                                {conversation.participant.name}
                                            </span>
                                            <span className="text-xs text-gray-500 flex-shrink-0">
                                                {conversation.last_message?.created_at &&
                                                    formatRelativeTime(conversation.last_message.created_at)
                                                }
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mb-0.5">
                                            {conversation.course_title}
                                        </p>
                                        <p className={cn(
                                            'text-sm truncate',
                                            conversation.unread_count > 0
                                                ? 'font-medium text-gray-900'
                                                : 'text-gray-500'
                                        )}>
                                            {conversation.last_message?.sender_role === (isInstructor ? 'instructor' : 'student') && (
                                                <span className="text-gray-400">Bạn: </span>
                                            )}
                                            {conversation.last_message?.content}
                                        </p>
                                    </div>

                                    {/* Unread badge */}
                                    {conversation.unread_count > 0 && (
                                        <div className="flex-shrink-0 self-center">
                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                                {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                        <button
                            onClick={handleSeeAllClick}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            Xem tất cả tin nhắn
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagePanel;
