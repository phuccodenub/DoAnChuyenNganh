/**
 * LiveStreamChat Component
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Gift, MoreHorizontal, Send, Smile } from 'lucide-react';
import { ChatMessage } from '@/hooks/useLivestreamSocket';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore.enhanced';

export interface LiveStreamChatState {
  isJoined: boolean;
  messages: ChatMessage[];
  typingUsers: string[];
  sendMessage: (message: string, messageType?: 'text' | 'emoji' | 'system', replyTo?: string) => void;
  sendReaction: (emoji: string) => void;
  setTyping: (isTyping: boolean) => void;
}

interface LiveStreamChatProps {
  sessionId: string | number;
  enabled?: boolean;
  chatState: LiveStreamChatState;
  variant?: 'panel' | 'fullscreenDesktop' | 'fullscreenMobile';
  recentReactions?: Array<{ emoji: string; userName: string; timestamp: number }>;
  className?: string;
  sessionTitle?: string;
  sessionDescription?: string;
}

const EMOJI_REACTIONS = ['👍', '❤️', '🔥', '👏', '🎉', '😄', '😮', '💯'];

export function LiveStreamChat({
  sessionId,
  enabled = true,
  chatState,
  variant = 'panel',
  recentReactions,
  className = '',
  sessionTitle = '',
  sessionDescription = '',
}: LiveStreamChatProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const user = useAuthStore((state) => state.user);
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Check if text needs truncation (more than 3 lines)
  const needsTruncation = (text: string, maxLines: number = 3) => {
    const lines = text.split('\n');
    return lines.length > maxLines || text.length > 150; // Rough estimate
  };
  
  const truncateText = (text: string, maxLines: number = 3) => {
    const lines = text.split('\n');
    if (lines.length <= maxLines && text.length <= 150) return text;
    return lines.slice(0, maxLines).join('\n') + '...';
  };

  const { messages, typingUsers, sendMessage, sendReaction, setTyping, isJoined } = chatState;
  const isPanel = variant === 'panel';
  const isFullscreenDesktop = variant === 'fullscreenDesktop';
  const isFullscreenMobile = variant === 'fullscreenMobile';
  const showHeader = isPanel;

  // Use messages directly from chatState (hook already handles optimistic updates)
  const allMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto scroll on mount and when messages change
  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !enabled || !isJoined) return;

    const messageText = message.trim();

    // Send message via socket (hook will handle optimistic update)
    sendMessage(messageText);
    setMessage('');
    setTyping(false);
    
    // Scroll to bottom after a short delay to ensure optimistic message is rendered
    setTimeout(() => {
      scrollToBottom();
    }, 50);

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
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

  const containerClasses = cn(
    'flex flex-col',
    isPanel
      ? 'h-full bg-white rounded-lg border border-gray-200 shadow-sm'
      : isFullscreenDesktop
        ? 'h-full bg-black/20 text-white border border-white/10 backdrop-blur-md shadow-2xl'
        : 'h-full text-white'
  );

  const nameClasses = variant === 'panel' ? 'text-sm font-medium text-gray-900' : 'text-sm font-semibold text-white drop-shadow';
  const timeClasses = variant === 'panel' ? 'text-xs text-gray-500' : 'text-xs text-white/70';
  const messageTextClasses = variant === 'panel' ? 'text-sm text-gray-700' : 'text-sm text-white drop-shadow';

  const messageWrapperClasses = cn(
    'flex-1 overflow-y-auto space-y-3',
    isPanel
      ? 'px-4 py-3 text-gray-900'
      : isFullscreenDesktop
        ? 'px-2 sm:px-4 py-4 text-white [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]'
        : 'px-3 py-2 text-white text-sm space-y-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]'
  );

  const messageMask =
    isFullscreenDesktop || isFullscreenMobile
      ? {
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 35%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 35%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
        }
      : undefined;

  const emojiBarClasses =
    isPanel
      ? 'px-4 py-2 border-t border-gray-200 bg-gray-50 overflow-x-hidden'
      : isFullscreenDesktop
        ? 'px-2 sm:px-4 py-2 border-t border-white/10 bg-transparent overflow-x-hidden'
        : 'px-3 py-2 border-t border-white/5 bg-transparent';

  const inputWrapperClasses =
    isPanel
      ? 'px-4 py-3 border-t border-gray-200 bg-white'
      : isFullscreenDesktop
        ? 'px-2 sm:px-4 py-3 border-t border-white/10 bg-transparent'
        : 'px-3 pb-3 pt-1 bg-transparent';

  const inputClasses =
    isPanel
      ? 'flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
      : isFullscreenDesktop
        ? 'flex-1 px-3 py-2 rounded-full bg-black/40 border border-white/20 text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-black/10 disabled:text-white/50'
        : 'flex-1 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:bg-white/5 disabled:text-white/40';

  const sendButtonClasses =
    isPanel
      ? 'p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
      : isFullscreenDesktop
        ? 'p-2 bg-white/20 text-white rounded-full hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed transition-colors'
        : 'p-2.5 bg-pink-500 text-white rounded-full shadow-lg shadow-pink-500/30 hover:bg-pink-400 transition-colors disabled:bg-white/20';

  return (
    <div className={cn(containerClasses, className)}>
      {showHeader && (
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        {/* Title */}
        {sessionTitle && (
          <div className="mb-2">
            <h3 
              className={cn(
                'text-sm font-semibold text-gray-900 break-words',
                !isTitleExpanded && needsTruncation(sessionTitle) ? 'line-clamp-3' : ''
              )}
            >
              {isTitleExpanded || !needsTruncation(sessionTitle) 
                ? sessionTitle 
                : truncateText(sessionTitle)}
            </h3>
            {needsTruncation(sessionTitle) && (
              <button
                onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                className="text-xs mt-1 text-blue-600 hover:underline"
              >
                {isTitleExpanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
        )}
        
        {/* Description */}
        {sessionDescription && (
          <div className="mb-2">
            <p 
              className={cn(
                'text-xs text-gray-600 break-words whitespace-pre-wrap',
                !isDescriptionExpanded && needsTruncation(sessionDescription) ? 'line-clamp-3' : ''
              )}
            >
              {isDescriptionExpanded || !needsTruncation(sessionDescription)
                ? sessionDescription
                : truncateText(sessionDescription)}
            </p>
            {needsTruncation(sessionDescription) && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-xs mt-1 text-blue-600 hover:underline"
              >
                {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
        )}
        
        {typingUsers.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'đang gõ' : 'đang gõ'}...
          </p>
        )}
          {recentReactions && recentReactions.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
              {recentReactions.map((reaction) => (
              <div
                  key={reaction.timestamp}
                className="text-lg animate-bounce"
                title={`${reaction.userName} đã gửi ${reaction.emoji}`}
              >
                {reaction.emoji}
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      <div
        ref={messagesContainerRef}
        className={messageWrapperClasses}
        style={messageMask}
      >
        {allMessages.length === 0 ? (
          <div className={variant === 'panel' ? 'text-center text-gray-500 text-sm py-8' : 'text-center text-white/70 text-sm py-8'}>
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
                    <span className={nameClasses}>
                      {isOwnMessage ? 'Bạn' : msg.sender_name}
                    </span>
                    <span className={timeClasses}>{formatTime(msg.timestamp)}</span>
                    {isOptimistic && (
                      <span className={variant === 'panel' ? 'text-xs text-gray-400 italic' : 'text-xs text-white/60 italic'}>
                        Đang gửi...
                      </span>
                    )}
                  </div>
                  <div className={`${messageTextClasses} break-words`}>{msg.message}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={emojiBarClasses}>
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
              className={cn(
                'text-xl p-1 rounded transition-all',
                enabled && isJoined
                  ? variant === 'panel'
                  ? 'hover:scale-125 hover:bg-gray-200 active:scale-110 cursor-pointer' 
                    : 'hover:scale-125 hover:bg-white/20 active:scale-110 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              )}
              title={enabled && isJoined ? `Gửi ${emoji}` : 'Đang kết nối...'}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSend} className={inputWrapperClasses}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onBlur={handleBlur}
            placeholder={!enabled || !isJoined ? 'Đang kết nối...' : 'Nhập tin nhắn...'}
            className={inputClasses}
            disabled={!enabled || !isJoined}
          />
          {isFullscreenMobile && (
            <div className="flex items-center gap-2 text-white/80">
              <button
                type="button"
                onClick={() => sendReaction('❤️')}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Gửi cảm xúc"
              >
                <Smile className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Tặng quà"
              >
                <Gift className="w-4 h-4" />
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={!message.trim() || !enabled || !isJoined}
            className={sendButtonClasses}
            title={!enabled || !isJoined ? 'Đang kết nối...' : 'Gửi tin nhắn'}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {/* {isFullscreenMobile && (
          <div className="flex items-center justify-between text-xs text-white/60 mt-2 px-1">
            <span>Vuốt lên để xem thêm bình luận</span>
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-white"
            >
              <MoreHorizontal className="w-3 h-3" />
              Tuỳ chọn
            </button>
          </div>
        )} */}
      </form>
    </div>
  );
}

export default LiveStreamChat;

