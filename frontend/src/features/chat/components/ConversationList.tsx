/**
 * ConversationList Component
 * 
 * Sidebar chứa danh sách các cuộc trò chuyện
 * Bao gồm: search, filter tabs, danh sách items
 */

import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConversationListProps } from '../types';
import { ConversationListItem } from './ConversationListItem';
import { EmptyState } from './EmptyState';
import { CHAT_COPY } from '../constants/copy';

export function ConversationList({
    conversations,
    selectedId,
    onSelect,
    isLoading = false,
    filter = 'all',
    onFilterChange,
    searchQuery = '',
    onSearchChange,
    onlineStatusMap,
}: ConversationListProps) {
    const [localSearch, setLocalSearch] = useState(searchQuery);

    // Filter conversations
    const filteredConversations = conversations.filter((conv) => {
        // Search filter
        const matchesSearch =
            !localSearch ||
            conv.participant.name.toLowerCase().includes(localSearch.toLowerCase()) ||
            conv.course_title.toLowerCase().includes(localSearch.toLowerCase());

        // Unread filter
        const matchesFilter = filter === 'all' || conv.unread_count > 0;

        return matchesSearch && matchesFilter;
    });

    const handleSearchChange = (value: string) => {
        setLocalSearch(value);
        onSearchChange?.(value);
    };

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                </div>
                <div className="flex-1 p-2 space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-3 p-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                                <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    {CHAT_COPY.headers.conversations}
                </h2>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={localSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder={CHAT_COPY.placeholders.search}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filter tabs */}
                {onFilterChange && (
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => onFilterChange('all')}
                            className={cn(
                                'px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
                                filter === 'all'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            )}
                        >
                            {CHAT_COPY.filters.all}
                        </button>
                        <button
                            onClick={() => onFilterChange('unread')}
                            className={cn(
                                'px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
                                filter === 'unread'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                            )}
                        >
                            {CHAT_COPY.filters.unread}
                        </button>
                    </div>
                )}
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-2">
                {filteredConversations.length === 0 ? (
                    <EmptyState type="no-conversations" />
                ) : (
                    <div className="space-y-1">
                        {filteredConversations.map((conversation) => (
                            <ConversationListItem
                                key={conversation.id}
                                conversation={conversation}
                                isSelected={conversation.id === selectedId}
                                onClick={() => onSelect(conversation.id)}
                                isOnline={onlineStatusMap?.[conversation.id]}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ConversationList;
