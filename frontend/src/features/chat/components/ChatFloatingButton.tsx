/**
 * ChatFloatingButton Component
 * 
 * Nút nổi để mở chat từ các trang như LearningPage
 * Hiển thị badge số tin nhắn chưa đọc
 */

import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatFloatingButtonProps } from '../types';
import { CHAT_COPY } from '../constants/copy';

export function ChatFloatingButton({
    unreadCount = 0,
    onClick,
    instructorName,
}: ChatFloatingButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'fixed bottom-6 right-6 z-50',
                'flex items-center gap-2 px-4 py-3 rounded-full',
                'bg-blue-600 text-white shadow-lg',
                'hover:bg-blue-700 hover:shadow-xl',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            )}
            title={CHAT_COPY.tooltips.chatButton}
            aria-label={CHAT_COPY.a11y.openChat}
        >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
                {instructorName ? `Hỏi ${instructorName}` : CHAT_COPY.buttons.askInstructor}
            </span>

            {/* Unread badge */}
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </button>
    );
}

export default ChatFloatingButton;
