/**
 * ConversationListItem Component
 * 
 * Một item trong danh sách cuộc trò chuyện
 * Hiển thị: avatar, tên, khóa học, tin nhắn cuối, badge chưa đọc
 */

import { cn } from '@/lib/utils';
import { ConversationListItemProps } from '../types';
import { formatRelativeTime } from '../utils/formatTime';
import { OnlineStatusDot } from './OnlineStatusDot';
import { TypingStatus } from './TypingIndicator';

interface ExtendedConversationListItemProps extends ConversationListItemProps {
    /** Is the other user typing */
    isTyping?: boolean;
}

export function ConversationListItem({
    conversation,
    isSelected,
    onClick,
    isTyping = false,
}: ExtendedConversationListItemProps) {
    const { participant, course_title, last_message, unread_count } = conversation;

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left',
                isSelected
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
            )}
        >
            {/* Avatar with online status */}
            <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
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
                    status={participant.online_status}
                    className="absolute bottom-0 right-0"
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Header: Name + Time */}
                <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span
                        className={cn(
                            'font-medium truncate',
                            unread_count > 0 ? 'text-gray-900' : 'text-gray-700'
                        )}
                    >
                        {participant.name}
                    </span>
                    {last_message && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatRelativeTime(last_message.created_at)}
                        </span>
                    )}
                </div>

                {/* Course title */}
                <p className="text-xs text-blue-600 truncate mb-1">{course_title}</p>

                {/* Last message preview or typing indicator */}
                <div className="flex items-center gap-2">
                    {isTyping ? (
                        <TypingStatus />
                    ) : (
                        <p
                            className={cn(
                                'text-sm truncate flex-1',
                                unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                            )}
                        >
                            {last_message ? (
                                <>
                                    {last_message.sender_role === 'student' && (
                                        <span className="text-gray-400">Bạn: </span>
                                    )}
                                    {last_message.content}
                                </>
                            ) : (
                                <span className="text-gray-400 italic">Chưa có tin nhắn</span>
                            )}
                        </p>
                    )}

                    {/* Unread badge */}
                    {unread_count > 0 && !isTyping && (
                        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                            {unread_count > 99 ? '99+' : unread_count}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}

export default ConversationListItem;
