import React, { useEffect, useRef } from 'react';
import { Loader } from 'lucide-react';
import { useChatMessages } from '@/hooks/useChat';
import { ChatMessageItem } from './ChatMessageItem';
import { useAuth } from '@/hooks/useAuth';
import { useMessageDelivery } from '@/hooks/useMessageDelivery';

interface ChatMessagesListProps {
  courseId: string;
  onEditMessage?: (messageId: string, content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onReplyMessage?: (message: any) => void;
}

/**
 * Chat Messages List Component
 * Displays chat messages with infinite scroll
 */
export function ChatMessagesList({
  courseId,
  onEditMessage,
  onDeleteMessage,
  onReplyMessage,
}: ChatMessagesListProps) {
  const { user } = useAuth();
  const { getStatus } = useMessageDelivery(courseId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isFetching } = useChatMessages(courseId, page);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.data]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (element.scrollTop === 0 && !isFetching) {
      setPage((p) => p + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  const messages = data?.data || [];

  return (
    <div
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-2"
    >
      {/* Loading older messages */}
      {isFetching && page > 1 && (
        <div className="flex justify-center py-2">
          <Loader className="w-4 h-4 animate-spin text-gray-500" />
        </div>
      )}

      {/* Empty state */}
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-center">
          <div className="text-gray-500">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start a conversation!</p>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => {
        const deliveryStatus = getStatus(message.id)?.status || 'sent';
        return (
          <ChatMessageItem
            key={message.id}
            message={message}
            isOwn={String(message.user_id) === String(user?.id)}
            deliveryStatus={deliveryStatus}
            onEdit={(msg) => {
              // Open edit modal or inline edit
            }}
            onDelete={onDeleteMessage}
            onReply={onReplyMessage}
          />
        );
      })}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
