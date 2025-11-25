/**
 * LiveStreamChat Component
 * 
 * Real-time chat component cho livestream với:
 * - Message list với auto-scroll
 * - Message input với typing indicator
 * - Reactions (emoji)
 * - User avatars
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Smile } from 'lucide-react';
import { useLivestreamSocket, ChatMessage } from '@/hooks/useLivestreamSocket';
import { useAuthStore } from '@/stores/authStore.enhanced';

interface LiveStreamChatProps {
  sessionId: string;
  enabled?: boolean;
  sessionStatus?: 'scheduled' | 'live' | 'ended' | 'cancelled';
}

const EMOJI_REACTIONS = ['👍', '❤️', '🔥', '👏', '🎉', '😄', '😮', '💯'];

export function LiveStreamChat({ sessionId, enabled = true, sessionStatus }: LiveStreamChatProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const [recentReactions, setRecentReactions] = useState<Array<{ emoji: string; userName: string; timestamp: number }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const user = useAuthStore((state) => state.user);

  const { messages, typingUsers, sendMessage, sendReaction, setTyping, isJoined } = useLivestreamSocket({
    sessionId,
    enabled,
    sessionStatus,
    onNewMessage: (newMessage) => {
      // Remove optimistic messages that match this real message
      // Match by sender_id, message content, and approximate timestamp
      setOptimisticMessages((prev) => {
        const messageTime = new Date(newMessage.timestamp).getTime();
        return prev.filter((msg) => {
          // If it's from the same sender and similar content, remove it
          if (msg.sender_id === newMessage.sender_id && msg.message === newMessage.message) {
            const optimisticTime = new Date(msg.timestamp).getTime();
            // Remove if timestamp is within 5 seconds (optimistic message was just sent)
            if (Math.abs(messageTime - optimisticTime) < 5000) {
              return false; // Remove this optimistic message
            }
          }
          return true; // Keep this optimistic message
        });
      });
      // Auto scroll to bottom on new message
      scrollToBottom();
    },
    onReaction: (data) => {
      // Show reaction notification
      const reactionId = Date.now();
      setRecentReactions((prev) => [
        ...prev.slice(-4), // Keep only last 5
        { emoji: data.emoji, userName: data.userName, timestamp: reactionId }
      ]);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        setRecentReactions((prev) => prev.filter((r) => r.timestamp !== reactionId));
      }, 3000);
    },
  });

  // Combine real messages with optimistic messages, remove duplicates
  const allMessages = [...messages, ...optimisticMessages]
    .filter((msg, index, self) => {
      // Remove duplicates by ID first
      const idIndex = self.findIndex((m) => m.id === msg.id);
      if (idIndex !== index) return false;
      
      // Also check for duplicate by sender + message + timestamp (within 1 second)
      const duplicate = self.find((m, i) => 
        i !== index &&
        m.sender_id === msg.sender_id &&
        m.message === msg.message &&
        Math.abs(new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 1000
      );
      return !duplicate;
    })
    .sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto scroll on mount and when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !enabled || !isJoined) return;

    const messageText = message.trim();
    const tempId = `temp-${user?.id}-${Date.now()}`;
    
    // Create optimistic message
    const optimisticMessage: ChatMessage = {
      id: tempId,
      session_id: sessionId,
      sender_id: user?.id || '',
      sender_name: user?.full_name || 'Bạn',
      sender_avatar: user?.avatar_url || undefined,
      message: messageText,
      message_type: 'text',
      reply_to: null,
      timestamp: new Date().toISOString(),
    };

    // Add optimistic message immediately
    setOptimisticMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    // Send message via socket
    sendMessage(messageText);
    setMessage('');
    setTyping(false);

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Remove optimistic message after a delay (in case real message doesn't arrive)
    setTimeout(() => {
      setOptimisticMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }, 5000);
  };

  // Debounced typing indicator
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Only send typing indicator if there's text
    if (value.trim() && enabled && isJoined) {
      setTyping(true);
      
      // Auto stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
        typingTimeoutRef.current = null;
      }, 2000);
    } else {
      setTyping(false);
    }
  }, [enabled, isJoined, setTyping]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleBlur = useCallback(() => {
    // Clear typing indicator on blur
    setTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [setTyping]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Chat trực tiếp</h3>
        {typingUsers.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'đang gõ' : 'đang gõ'}...
          </p>
        )}
        {/* Recent reactions */}
        {recentReactions.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {recentReactions.map((reaction, idx) => (
              <div
                key={idx}
                className="text-lg animate-bounce"
                title={`${reaction.userName} đã gửi ${reaction.emoji}`}
              >
                {reaction.emoji}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        style={{ maxHeight: '400px' }}
      >
        {allMessages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            {!enabled || !isJoined ? (
              'Đang kết nối...'
            ) : (
              'Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!'
            )}
          </div>
        ) : (
          allMessages.map((msg: ChatMessage) => {
            const isOptimistic = msg.id.startsWith('temp-');
            const isOwnMessage = msg.sender_id === user?.id;
            
            return (
              <div 
                key={msg.id} 
                className={`flex gap-2 ${isOptimistic ? 'opacity-70' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {msg.sender_avatar ? (
                    <img
                      src={msg.sender_avatar}
                      alt={msg.sender_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                      {getInitials(msg.sender_name)}
                    </div>
                  )}
                </div>

                {/* Message content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {isOwnMessage ? 'Bạn' : msg.sender_name}
                    </span>
                    <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                    {isOptimistic && (
                      <span className="text-xs text-gray-400 italic">Đang gửi...</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 break-words">{msg.message}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji reactions bar */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          {EMOJI_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                if (enabled && isJoined) {
                  sendReaction(emoji);
                }
              }}
              disabled={!enabled || !isJoined}
              className={`
                text-xl p-1 rounded transition-all
                ${enabled && isJoined 
                  ? 'hover:scale-125 hover:bg-gray-200 active:scale-110 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
              title={enabled && isJoined ? `Gửi ${emoji}` : 'Đang kết nối...'}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onBlur={handleBlur}
            placeholder={!enabled || !isJoined ? "Đang kết nối..." : "Nhập tin nhắn..."}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!enabled || !isJoined}
          />
          <button
            type="submit"
            disabled={!message.trim() || !enabled || !isJoined}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title={!enabled || !isJoined ? "Đang kết nối..." : "Gửi tin nhắn"}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default LiveStreamChat;

