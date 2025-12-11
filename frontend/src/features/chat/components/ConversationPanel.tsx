/**
 * ConversationPanel Component
 * 
 * Panel chính hiển thị cuộc trò chuyện
 * Bao gồm: header, message list, composer
 * Supports infinite scroll for loading older messages
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConversationPanelProps, Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { EmptyState } from './EmptyState';
import { OnlineStatusDot } from './OnlineStatusDot';
import { TypingIndicator } from './TypingIndicator';
import { CHAT_COPY } from '../constants/copy';
import { getDateGroupLabel } from '../utils/formatTime';

export function ConversationPanel({
    conversation,
    messages,
    currentUserId,
    currentUserRole,
    isLoading = false,
    isTyping = false,
    onSendMessage,
    onRetry,
    error,
    isParticipantOnline,
    onLoadMore,
    isLoadingMore = false,
    onMarkAsRead,
}: ConversationPanelProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const prevMessagesLengthRef = useRef(messages.length);
    const prevConversationIdRef = useRef<string | null>(null);
    const [isNearBottom, setIsNearBottom] = useState(true);
    const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastMarkAsReadTimeRef = useRef<number>(0);
    const isMarkAsReadPendingRef = useRef<boolean>(false);
    const [isDocumentVisible, setIsDocumentVisible] = useState(!document.hidden);
    const MARK_AS_READ_DEBOUNCE_MS = 1000; // Minimum 1 second between mark as read calls (reduced for faster response)

    // Track document visibility to only mark as read when user is viewing
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsDocumentVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Helper function to check if we should mark as read
    const shouldMarkAsRead = useCallback(() => {
        // Only mark as read if:
        // 1. Document is visible (user is viewing the tab)
        // 2. Not pending
        // 3. Enough time has passed since last call
        if (!isDocumentVisible || isMarkAsReadPendingRef.current) {
            return false;
        }
        
        const now = Date.now();
        const timeSinceLastCall = now - lastMarkAsReadTimeRef.current;
        return timeSinceLastCall >= MARK_AS_READ_DEBOUNCE_MS;
    }, [isDocumentVisible]);

    // Scroll to bottom on initial load (when conversation changes)
    useEffect(() => {
        if (conversation?.id && conversation.id !== prevConversationIdRef.current) {
            // New conversation opened - scroll to bottom immediately
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
                // Mark as read when opening conversation and messages are loaded
                if (onMarkAsRead && messages.length > 0 && shouldMarkAsRead()) {
                    // Small delay to ensure scroll completed
                    setTimeout(() => {
                        if (shouldMarkAsRead()) {
                            isMarkAsReadPendingRef.current = true;
                            lastMarkAsReadTimeRef.current = Date.now();
                            onMarkAsRead();
                            // Reset pending flag after a delay
                            setTimeout(() => {
                                isMarkAsReadPendingRef.current = false;
                            }, 300); // Reduced from 500ms to 300ms for faster response // Reduced from 1000ms to 500ms for faster response
                        }
                    }, 300);
                }
            }, 100);
            prevConversationIdRef.current = conversation.id;
            prevMessagesLengthRef.current = messages.length;
            setIsNearBottom(true); // Reset to true when conversation changes
        }
    }, [conversation?.id, messages.length, onMarkAsRead]);

    // Mark as read when messages are loaded and user is at bottom
    useEffect(() => {
        if (!isLoading && messages.length > 0 && isNearBottom && conversation?.id && onMarkAsRead && shouldMarkAsRead()) {
            // Debounce to avoid too many calls
            if (markAsReadTimeoutRef.current) {
                clearTimeout(markAsReadTimeoutRef.current);
            }
            markAsReadTimeoutRef.current = setTimeout(() => {
                if (shouldMarkAsRead()) {
                    isMarkAsReadPendingRef.current = true;
                    lastMarkAsReadTimeRef.current = Date.now();
                    onMarkAsRead();
                    // Reset pending flag after a delay
                    setTimeout(() => {
                        isMarkAsReadPendingRef.current = false;
                    }, 1000);
                }
            }, 500);
        }
    }, [isLoading, messages.length, isNearBottom, conversation?.id, onMarkAsRead, shouldMarkAsRead]);

    // Auto scroll to bottom when new messages arrive (only if near bottom)
    useEffect(() => {
        const messagesChanged = messages.length !== prevMessagesLengthRef.current;
        
        if (messagesChanged && isNearBottom && conversation?.id === prevConversationIdRef.current) {
            // Only auto-scroll if user is near bottom and same conversation
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            
            // Mark as read when new messages arrive and user is viewing
            if (onMarkAsRead && messages.length > 0 && shouldMarkAsRead()) {
                // Debounce mark as read to avoid too many calls
                if (markAsReadTimeoutRef.current) {
                    clearTimeout(markAsReadTimeoutRef.current);
                }
                markAsReadTimeoutRef.current = setTimeout(() => {
                    if (shouldMarkAsRead()) {
                        isMarkAsReadPendingRef.current = true;
                        lastMarkAsReadTimeRef.current = Date.now();
                        onMarkAsRead();
                        // Reset pending flag after a delay
                        setTimeout(() => {
                            isMarkAsReadPendingRef.current = false;
                        }, 1000);
                    }
                }, 500);
            }
            
            prevMessagesLengthRef.current = messages.length;
        }
    }, [messages, isNearBottom, conversation?.id, onMarkAsRead]);

    // Handle infinite scroll - load older messages when scrolled to top
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container || !onLoadMore) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            
            // Check if near bottom (for auto-scroll behavior)
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            const wasNearBottom = isNearBottom;
            const nowNearBottom = distanceFromBottom < 100;
            setIsNearBottom(nowNearBottom);
            
            // Mark as read when user scrolls to bottom
            if (onMarkAsRead && nowNearBottom && !wasNearBottom && messages.length > 0 && shouldMarkAsRead()) {
                // Debounce mark as read to avoid too many calls
                if (markAsReadTimeoutRef.current) {
                    clearTimeout(markAsReadTimeoutRef.current);
                }
                markAsReadTimeoutRef.current = setTimeout(() => {
                    if (shouldMarkAsRead()) {
                        isMarkAsReadPendingRef.current = true;
                        lastMarkAsReadTimeRef.current = Date.now();
                        onMarkAsRead();
                        // Reset pending flag after a delay
                        setTimeout(() => {
                            isMarkAsReadPendingRef.current = false;
                        }, 1000);
                    }
                }, 500);
            }
            
            // Load more when scrolled to top
            if (scrollTop < 100 && !isLoadingMore && messages.length > 0) {
                const oldestMessage = messages[0];
                if (oldestMessage && oldestMessage.created_at) {
                    onLoadMore(oldestMessage.created_at);
                }
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (markAsReadTimeoutRef.current) {
                clearTimeout(markAsReadTimeoutRef.current);
            }
        };
    }, [messages, isLoadingMore, onLoadMore, onMarkAsRead, isNearBottom]);

    // No conversation selected
    if (!conversation) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <EmptyState type="select-conversation" />
            </div>
        );
    }

    const { participant, course_title } = conversation;

    // Group messages by date
    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                            {participant.avatar_url ? (
                                <img
                                    src={participant.avatar_url}
                                    alt={participant.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-gray-600 bg-gradient-to-br from-blue-100 to-purple-100">
                                    {participant.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <OnlineStatusDot
                            status={isParticipantOnline ? 'online' : 'offline'}
                            className="absolute bottom-0 right-0"
                        />
                    </div>

                    {/* Info */}
                    <div>
                        <h3 className="font-semibold text-gray-900">{participant.name}</h3>
                        <p className="text-xs text-gray-500">
                            {isParticipantOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Messages area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {/* Loading more indicator */}
                {isLoadingMore && (
                    <div className="text-center py-2">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Loading state */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'flex gap-2',
                                    i % 2 === 0 ? 'justify-start' : 'justify-end'
                                )}
                            >
                                {i % 2 === 0 && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                                )}
                                <div
                                    className={cn(
                                        'h-10 rounded-2xl animate-pulse',
                                        i % 2 === 0 ? 'bg-gray-200 w-48' : 'bg-blue-200 w-40'
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <EmptyState
                        type="error"
                        title={CHAT_COPY.errors.loadMessages.title}
                        description={error}
                        actionLabel={CHAT_COPY.errors.loadMessages.actionLabel}
                        onAction={onRetry}
                    />
                ) : messages.length === 0 ? (
                    <EmptyState type="no-messages" />
                ) : (
                    <div className="space-y-4">
                        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                            <div key={date}>
                                {/* Date separator */}
                                <div className="flex items-center justify-center my-4">
                                    <span className="px-3 py-1 text-xs text-gray-500 bg-white rounded-full shadow-sm border border-gray-100">
                                        {date}
                                    </span>
                                </div>

                                {/* Messages */}
                                <div className="space-y-3">
                                    {dayMessages.map((message, index) => {
                                        const isOwn = message.sender_id === currentUserId;
                                        const showAvatar =
                                            index === 0 ||
                                            dayMessages[index - 1].sender_id !== message.sender_id;

                                        return (
                                            <MessageBubble
                                                key={message.id}
                                                message={message}
                                                isOwn={isOwn}
                                                showAvatar={showAvatar}
                                                senderName={!isOwn ? participant.name : undefined}
                                                senderAvatar={!isOwn ? participant.avatar_url : undefined}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <TypingIndicator 
                              userName={participant.name}
                              variant="bubble"
                            />
                        )}

                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Composer */}
            <MessageComposer
                onSend={onSendMessage}
                placeholder={CHAT_COPY.placeholders.composerWithContext}
                disabled={isLoading || !!error}
            />
        </div>
    );
}

/**
 * Helper: Group messages by date
 */
function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
    const groups: Record<string, Message[]> = {};

    messages.forEach((message) => {
        const date = new Date(message.created_at);
        const label = getDateGroupLabel(message.created_at);

        if (!groups[label]) {
            groups[label] = [];
        }
        groups[label].push(message);
    });

    return groups;
}

export default ConversationPanel;
