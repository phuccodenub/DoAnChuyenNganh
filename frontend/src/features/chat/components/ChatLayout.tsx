/**
 * ChatLayout Component
 * 
 * Layout chính cho trang Chat
 * Split-view 2 cột: ConversationList (sidebar) + ConversationPanel (main)
 * Responsive: Trên mobile, sidebar có thể ẩn/hiện như drawer
 */

import { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConversationList } from './ConversationList';
import { ConversationPanel } from './ConversationPanel';
import { Conversation, Message, UserRole } from '../types';
import { CHAT_COPY } from '../constants/copy';

interface ChatLayoutProps {
    conversations: Conversation[];
    messages: Message[];
    currentUserId: string;
    currentUserRole: UserRole;
    selectedConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onSendMessage: (content: string) => void;
    isLoadingConversations?: boolean;
    isLoadingMessages?: boolean;
    isTyping?: boolean;
    error?: string | null;
    onRetry?: () => void;
    isParticipantOnline?: boolean;
    onLoadMore?: (oldestMessageDate: string) => void;
    isLoadingMore?: boolean;
    // For mobile: pre-select a conversation (e.g., from course page)
    initialConversationId?: string;
}

export function ChatLayout({
    conversations,
    messages,
    currentUserId,
    currentUserRole,
    selectedConversationId,
    onSelectConversation,
    onSendMessage,
    isLoadingConversations = false,
    isLoadingMessages = false,
    isTyping = false,
    error,
    onRetry,
    isParticipantOnline,
    onLoadMore,
    isLoadingMore = false,
}: ChatLayoutProps) {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);

    const selectedConversation = conversations.find(
        (c) => c.id === selectedConversationId
    );

    // On mobile, close sidebar when a conversation is selected
    useEffect(() => {
        if (selectedConversationId) {
            setIsMobileSidebarOpen(false);
        }
    }, [selectedConversationId]);

    const handleSelectConversation = (id: string) => {
        onSelectConversation(id);
        // Mobile: close sidebar
        setIsMobileSidebarOpen(false);
    };

    const handleBackToList = () => {
        setIsMobileSidebarOpen(true);
    };

    return (
        <div className="h-full flex bg-gray-100">
            {/* Sidebar - Desktop: always visible, Mobile: drawer */}
            <div
                className={cn(
                    // Desktop
                    'hidden lg:block lg:w-80 xl:w-96 border-r border-gray-200 bg-white',
                    // Mobile: full screen overlay
                    'lg:relative'
                )}
            >
                <ConversationList
                    conversations={conversations}
                    selectedId={selectedConversationId || undefined}
                    onSelect={handleSelectConversation}
                    isLoading={isLoadingConversations}
                    filter={filter}
                    onFilterChange={setFilter}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            </div>

            {/* Mobile sidebar overlay */}
            <div
                className={cn(
                    'lg:hidden fixed inset-0 z-50 transition-transform duration-300',
                    isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/30"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />

                {/* Sidebar content */}
                <div className="absolute left-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold">{CHAT_COPY.headers.messages}</h2>
                        <button
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="h-[calc(100%-60px)]">
                        <ConversationList
                            conversations={conversations}
                            selectedId={selectedConversationId || undefined}
                            onSelect={handleSelectConversation}
                            isLoading={isLoadingConversations}
                            filter={filter}
                            onFilterChange={setFilter}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                        />
                    </div>
                </div>
            </div>

            {/* Main panel */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile: Back button when conversation selected */}
                {selectedConversation && (
                    <button
                        onClick={handleBackToList}
                        className="lg:hidden flex items-center gap-2 p-3 text-gray-600 hover:text-gray-900 border-b border-gray-200 bg-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Quay lại</span>
                    </button>
                )}

                <div className="flex-1 min-h-0">
                    <ConversationPanel
                        conversation={selectedConversation || null}
                        messages={messages}
                        currentUserId={currentUserId}
                        currentUserRole={currentUserRole}
                        isLoading={isLoadingMessages}
                        isTyping={isTyping}
                        onSendMessage={onSendMessage}
                        onRetry={onRetry}
                        error={error}
                        isParticipantOnline={isParticipantOnline}
                        onLoadMore={onLoadMore}
                        isLoadingMore={isLoadingMore}
                    />
                </div>
            </div>
        </div>
    );
}

export default ChatLayout;
