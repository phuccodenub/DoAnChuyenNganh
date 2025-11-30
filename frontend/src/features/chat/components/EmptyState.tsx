/**
 * EmptyState Component
 * 
 * Hiển thị trạng thái rỗng với illustration và hướng dẫn
 * Các loại: no-conversations, no-messages, select-conversation, error
 */

import { MessageSquare, Inbox, AlertCircle, MousePointer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyStateProps } from '../types';
import { CHAT_COPY } from '../constants/copy';

const illustrations = {
    'no-conversations': Inbox,
    'no-messages': MessageSquare,
    'select-conversation': MousePointer,
    error: AlertCircle,
};

const defaultContent = {
    'no-conversations': CHAT_COPY.emptyStates.noConversations,
    'no-messages': CHAT_COPY.emptyStates.noMessages,
    'select-conversation': CHAT_COPY.emptyStates.selectConversation,
    error: CHAT_COPY.errors.networkError,
};

export function EmptyState({
    type,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    const Icon = illustrations[type];
    const content = defaultContent[type];

    const displayTitle = title || content.title;
    const displayDescription = description || content.description;
    const displayActionLabel = actionLabel || ('actionLabel' in content ? content.actionLabel : undefined);

    const iconColors = {
        'no-conversations': 'text-gray-300',
        'no-messages': 'text-blue-200',
        'select-conversation': 'text-gray-300',
        error: 'text-red-300',
    };

    return (
        <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
            {/* Illustration */}
            <div className="mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center">
                    <Icon className={`w-12 h-12 ${iconColors[type]}`} />
                </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {displayTitle}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 max-w-[280px] mb-6">
                {displayDescription}
            </p>

            {/* Action button */}
            {displayActionLabel && onAction && (
                <Button onClick={onAction} variant="outline" size="sm">
                    {displayActionLabel}
                </Button>
            )}
        </div>
    );
}

export default EmptyState;
