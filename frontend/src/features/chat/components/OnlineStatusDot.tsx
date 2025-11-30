/**
 * OnlineStatusDot Component
 * 
 * Dot indicator cho trạng thái online/offline/away
 */

import { cn } from '@/lib/utils';
import { OnlineStatus } from '../types';
import { CHAT_COPY } from '../constants/copy';

interface OnlineStatusDotProps {
    status: OnlineStatus;
    className?: string;
    showTooltip?: boolean;
}

const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
};

const statusTooltips = {
    online: CHAT_COPY.tooltips.onlineStatus,
    offline: CHAT_COPY.tooltips.offlineStatus,
    away: CHAT_COPY.tooltips.awayStatus,
};

export function OnlineStatusDot({
    status,
    className,
    showTooltip = true,
}: OnlineStatusDotProps) {
    return (
        <span
            className={cn(
                'w-3 h-3 rounded-full border-2 border-white',
                statusColors[status],
                className
            )}
            title={showTooltip ? statusTooltips[status] : undefined}
        />
    );
}

export default OnlineStatusDot;
