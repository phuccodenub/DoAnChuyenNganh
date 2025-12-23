import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Pin, Trash2, UserX, X, Settings, Edit2, Check, X as XIcon } from 'lucide-react';
import { LiveStreamChatState } from '@/pages/livestream/components/shared/LiveStreamChat';
import { ChatMessage } from '@/hooks/useLivestreamSocket';
import { cn } from '@/lib/utils';

interface HostChatPanelProps {
  sessionId: string | number;
  chatState: LiveStreamChatState;
  className?: string;
  onClose?: () => void;
  sessionTitle?: string;
  sessionDescription?: string;
  isHost?: boolean;
  onUpdateSession?: (data: { title?: string; description?: string }) => Promise<void>;
}

export function HostChatPanel({ 
  sessionId, 
  chatState, 
  className, 
  onClose,
  sessionTitle = '',
  sessionDescription = '',
  isHost = false,
  onUpdateSession,
}: HostChatPanelProps) {
  const { messages, sendMessage, isJoined } = chatState;
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pinnedMessageId, setPinnedMessageId] = useState<string | null>(null);
  const [allowParticipantsChat, setAllowParticipantsChat] = useState(true);
  
  // Title and description states
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState(sessionTitle);
  const [editedDescription, setEditedDescription] = useState(sessionDescription);
  
  useEffect(() => {
    setEditedTitle(sessionTitle);
    setEditedDescription(sessionDescription);
  }, [sessionTitle, sessionDescription]);
  
  const handleSaveTitle = async () => {
    if (onUpdateSession && editedTitle.trim() !== sessionTitle) {
      await onUpdateSession({ title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };
  
  const handleSaveDescription = async () => {
    if (onUpdateSession && editedDescription.trim() !== sessionDescription) {
      await onUpdateSession({ description: editedDescription.trim() });
    }
    setIsEditingDescription(false);
  };
  
  const handleCancelEdit = () => {
    setEditedTitle(sessionTitle);
    setEditedDescription(sessionDescription);
    setIsEditingTitle(false);
    setIsEditingDescription(false);
  };
  
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isJoined) return;
    sendMessage(message.trim());
    setMessage('');
  };

  const handlePinMessage = (messageId: string) => {
    setPinnedMessageId(pinnedMessageId === messageId ? null : messageId);
  };

  const pinnedMessage = pinnedMessageId ? messages.find((m) => m.id === pinnedMessageId) : null;

  const isDark = className?.includes('bg-gray-900') || className?.includes('bg-[#2d2e30]');
  
  return (
    <div className={cn(
      'flex flex-col h-full',
      isDark 
        ? 'bg-[#2d2e30]' 
        : 'bg-white rounded-lg shadow-sm border border-gray-200',
      className
    )}>
      {/* Header - Title and Description */}
      <div className={cn('px-4 py-3 border-b', isDark ? 'border-[#3c3d3e]' : 'border-gray-200')}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className={cn(
                    'flex-1 px-2 py-1 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500',
                    isDark ? 'bg-[#1f2020] border border-[#3c3d3e] text-white' : 'bg-white border border-gray-300 text-gray-900'
                  )}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <button
                  onClick={handleSaveTitle}
                  className={cn('p-1 rounded transition-colors', isDark ? 'hover:bg-[#3c3d3e] text-green-400' : 'hover:bg-gray-200 text-green-600')}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className={cn('p-1 rounded transition-colors', isDark ? 'hover:bg-[#3c3d3e] text-gray-400' : 'hover:bg-gray-200 text-gray-600')}
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-2 group">
                <div className="flex-1 min-w-0">
                  <h2 
                    className={cn(
                      'text-base font-medium break-words',
                      isDark ? 'text-white' : 'text-gray-900',
                      !isTitleExpanded && needsTruncation(sessionTitle) ? 'line-clamp-3' : ''
                    )}
                  >
                    {isTitleExpanded || !needsTruncation(sessionTitle) 
                      ? sessionTitle 
                      : truncateText(sessionTitle)}
                  </h2>
                  {needsTruncation(sessionTitle) && (
                    <button
                      onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                      className={cn('text-xs mt-1 hover:underline', isDark ? 'text-blue-400' : 'text-blue-600')}
                    >
                      {isTitleExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                  )}
                </div>
                {isHost && (
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className={cn('p-1 rounded transition-colors opacity-0 group-hover:opacity-100', isDark ? 'hover:bg-[#3c3d3e] text-gray-400' : 'hover:bg-gray-200 text-gray-600')}
                    title="Chỉnh sửa tiêu đề"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={cn('p-1.5 rounded-full transition-colors flex-shrink-0', isDark ? 'hover:bg-[#3c3d3e] text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600')}
              aria-label="Đóng chat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Description */}
        {sessionDescription && (
          <div className="mt-2">
            {isEditingDescription ? (
              <div className="flex items-start gap-2">
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                  className={cn(
                    'flex-1 px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none',
                    isDark ? 'bg-[#1f2020] border border-[#3c3d3e] text-white' : 'bg-white border border-gray-300 text-gray-900'
                  )}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <div className="flex flex-col gap-1">
                  <button
                    onClick={handleSaveDescription}
                    className={cn('p-1 rounded transition-colors', isDark ? 'hover:bg-[#3c3d3e] text-green-400' : 'hover:bg-gray-200 text-green-600')}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className={cn('p-1 rounded transition-colors', isDark ? 'hover:bg-[#3c3d3e] text-gray-400' : 'hover:bg-gray-200 text-gray-600')}
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 group">
                <div className="flex-1 min-w-0">
                  <p 
                    className={cn(
                      'text-sm break-words whitespace-pre-wrap',
                      isDark ? 'text-gray-300' : 'text-gray-600',
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
                      className={cn('text-xs mt-1 hover:underline', isDark ? 'text-blue-400' : 'text-blue-600')}
                    >
                      {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                  )}
                </div>
                {isHost && (
                  <button
                    onClick={() => setIsEditingDescription(true)}
                    className={cn('p-1 rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0', isDark ? 'hover:bg-[#3c3d3e] text-gray-400' : 'hover:bg-gray-200 text-gray-600')}
                    title="Chỉnh sửa mô tả"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pinned Message */}
      {pinnedMessage && (
        <div className={cn('px-4 pt-3 pb-2 border-b', isDark ? 'border-yellow-700 bg-yellow-900/30' : 'border-yellow-200 bg-yellow-50')}>
          <div className="flex items-start gap-2">
            <Pin className={cn('w-4 h-4 mt-0.5 flex-shrink-0', isDark ? 'text-yellow-400' : 'text-yellow-600')} />
            <div className="flex-1 min-w-0">
              <p className={cn('text-xs font-medium mb-1', isDark ? 'text-yellow-300' : 'text-yellow-900')}>
                {pinnedMessage.sender_name}
              </p>
              <p className={cn('text-sm', isDark ? 'text-yellow-200' : 'text-yellow-800')}>{pinnedMessage.message}</p>
            </div>
            <button
              onClick={() => setPinnedMessageId(null)}
              className={cn('hover:opacity-80', isDark ? 'text-yellow-400' : 'text-yellow-600')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Messages - Google Meet Style */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            {/* Illustration - Google Meet Style (Person pointing to speech bubble) */}
            <div className="mb-6">
              <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Person body (light blue shirt) */}
                <ellipse cx="60" cy="100" rx="28" ry="35" fill="#87CEEB" />
                {/* Person head */}
                <circle cx="60" cy="50" r="22" fill="#F4A460" />
                {/* Hair (reddish-brown) */}
                <path
                  d="M45 35 Q60 25 75 35 Q75 30 70 28 Q60 20 50 28 Q45 30 45 35 Z"
                  fill="#8B4513"
                />
                {/* Face features */}
                <circle cx="55" cy="48" r="2" fill="#333" />
                <circle cx="65" cy="48" r="2" fill="#333" />
                <path
                  d="M55 58 Q60 62 65 58"
                  stroke="#333"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Arm pointing up */}
                <ellipse cx="85" cy="75" rx="8" ry="25" fill="#F4A460" transform="rotate(-20 85 75)" />
                {/* Hand pointing */}
                <circle cx="88" cy="50" r="6" fill="#F4A460" />
                <path
                  d="M88 44 L88 38"
                  stroke="#333"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Speech bubble (empty) */}
                <path
                  d="M105 30 L125 30 L125 50 L105 50 L100 55 L100 40 Z"
                  fill={isDark ? '#3c3d3e' : '#f7fafc'}
                  stroke={isDark ? '#4a5568' : '#e2e8f0'}
                  strokeWidth="2"
                />
              </svg>
            </div>
            <p className={cn('text-sm font-medium', isDark ? 'text-gray-300' : 'text-gray-700')}>
              Chưa có tin nhắn trò chuyện nào
            </p>
          </div>
        ) : (
          <div className="space-y-1 py-2">
            {messages.map((msg: ChatMessage) => (
              <div
                key={msg.id}
                className={cn(
                  'group flex items-start gap-3 px-4 py-2.5',
                  pinnedMessageId === msg.id 
                    ? (isDark ? 'bg-yellow-900/20' : 'bg-yellow-50')
                    : (isDark ? 'hover:bg-[#3c3d3e]' : 'hover:bg-gray-50')
                )}
              >
                {/* Avatar hiển thị đúng avatar của user nếu có, fallback sang chữ cái đầu */}
                <div className="flex-shrink-0">
                  {msg.sender_avatar ? (
                    <img
                      src={msg.sender_avatar}
                      alt={msg.sender_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm',
                        isDark ? 'bg-[#4285f4]' : 'bg-blue-500'
                      )}
                    >
                      <span className="text-white">
                        {msg.sender_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-gray-900')}>{msg.sender_name}</p>
                    <span className={cn('text-xs', isDark ? 'text-gray-500' : 'text-gray-500')}>
                      {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className={cn('text-sm break-words leading-relaxed', isDark ? 'text-gray-200' : 'text-gray-800')}>{msg.message}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handlePinMessage(msg.id)}
                    className={cn(
                      'p-1.5 rounded-full transition-colors',
                      isDark 
                        ? (pinnedMessageId === msg.id ? 'text-yellow-400 hover:bg-[#3c3d3e]' : 'text-gray-500 hover:bg-[#3c3d3e]')
                        : (pinnedMessageId === msg.id ? 'text-yellow-600 hover:bg-gray-200' : 'text-gray-400 hover:bg-gray-200')
                    )}
                    title="Ghim tin nhắn"
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input - Google Meet Style */}
      {isJoined && (
        <form onSubmit={handleSend} className={cn('p-3 border-t', isDark ? 'border-[#3c3d3e] bg-[#2d2e30]' : 'border-gray-200 bg-white')}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Gửi thư"
              disabled={!allowParticipantsChat}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm',
                isDark
                  ? 'bg-[#1f2020] border border-[#3c3d3e] text-white placeholder-gray-500 disabled:opacity-50'
                  : 'border border-gray-300 bg-gray-50 disabled:opacity-50'
              )}
            />
            <button
              type="submit"
              disabled={!message.trim() || !allowParticipantsChat}
              className={cn(
                'p-2.5 rounded-full transition-colors',
                message.trim() && allowParticipantsChat
                  ? 'bg-[#4285f4] text-white hover:bg-[#357ae8]'
                  : isDark
                    ? 'bg-[#3c3d3e] text-gray-600 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
              aria-label="Gửi tin nhắn"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

