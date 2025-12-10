/**
 * MessageBubble Component
 * 
 * Hiển thị một tin nhắn trong cuộc trò chuyện
 * - Phân biệt tin nhắn gửi đi (own) và nhận vào
 * - Hiển thị avatar, timestamp, status
 */

import { cn } from '@/lib/utils';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { MessageBubbleProps } from '../types';
import { formatMessageTime } from '../utils/formatTime';

export function MessageBubble({
    message,
    isOwn,
    showAvatar = true,
    senderName,
    senderAvatar,
}: MessageBubbleProps) {
    const statusIcon = {
        sending: <Clock className="w-3 h-3 text-gray-400" />,
        sent: <Check className="w-3 h-3 text-gray-400" />,
        delivered: <CheckCheck className="w-3 h-3 text-gray-400" />,
        read: <CheckCheck className="w-3 h-3 text-blue-500" />,
        failed: <AlertCircle className="w-3 h-3 text-red-500" />,
    };

    return (
        <div
            className={cn(
                'flex gap-2 max-w-[80%]',
                isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto',
                // Add left margin for non-own messages when avatar is hidden (Messenger style)
                !isOwn && !showAvatar && 'ml-10'
            )}
        >
            {/* Avatar */}
            {showAvatar && !isOwn && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    {senderAvatar ? (
                        <img
                            src={senderAvatar}
                            alt={senderName || 'Avatar'}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-600">
                            {senderName?.charAt(0).toUpperCase() || '?'}
                        </div>
                    )}
                </div>
            )}

            {/* Message Content */}
            <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
                {/* Sender name - Chỉ hiển thị cho tin nhắn đầu tiên (showAvatar=true) */}
                {!isOwn && senderName && showAvatar && (
                    <span className="text-xs text-gray-500 mb-1 px-1">{senderName}</span>
                )}

                {/* Bubble */}
                <div
                    className={cn(
                        'px-4 py-2 rounded-2xl max-w-full break-words',
                        isOwn
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    )}
                >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {/* Attachment preview (nếu có) */}
                    {message.attachment && (
                        <div className="mt-2">
                            {message.attachment.type === 'image' ? (
                                <img
                                    src={message.attachment.url}
                                    alt={message.attachment.name}
                                    className="max-w-[200px] rounded-lg"
                                />
                            ) : (
                                <a
                                    href={message.attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        'flex items-center gap-2 text-sm underline',
                                        isOwn ? 'text-blue-100' : 'text-blue-600'
                                    )}
                                >
                                    📎 {message.attachment.name}
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Timestamp & Status */}
                <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-xs text-gray-400">
                        {formatMessageTime(message.created_at) || 'Đang gửi...'}
                    </span>
                    {isOwn && statusIcon[message.status]}
                </div>
            </div>
        </div>
    );
}

export default MessageBubble;
