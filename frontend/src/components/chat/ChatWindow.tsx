import React, { useState } from 'react';
import { Users, Search, MoreVertical, X } from 'lucide-react';
import { useOnlineUsers, useChatStatistics } from '@/hooks/useChat';
import { ChatMessagesList } from './ChatMessagesList';
import { ChatInput } from './ChatInput';

interface ChatWindowProps {
  courseId: string;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Chat Window Component
 * Main chat interface for course discussions
 */
export function ChatWindow({
  courseId,
  isOpen = true,
  onClose,
}: ChatWindowProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: onlineUsers, isLoading: usersLoading } = useOnlineUsers(courseId);
  const { data: statistics } = useChatStatistics(courseId);

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Course Discussion</h3>
          <p className="text-sm opacity-90">
            {statistics ? `${statistics.totalMessages} messages` : 'Loading...'}
          </p>
        </div>

        {/* Online Users Count */}
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <span className="text-sm font-medium">
            {onlineUsers?.length || 0} online
          </span>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 p-1 hover:bg-blue-500 rounded transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="border-b border-gray-200 bg-gray-50 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Messages Container */}
      <ChatMessagesList courseId={courseId} />

      {/* Input Area */}
      <ChatInput courseId={courseId} />
    </div>
  );
}

export default ChatWindow;
