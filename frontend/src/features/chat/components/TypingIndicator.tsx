/**
 * TypingIndicator Component
 * 
 * Hiển thị animation khi người khác đang gõ tin nhắn
 */

import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  /** Tên người đang gõ */
  userName?: string;
  /** Số người đang gõ (nếu nhiều người) */
  typingCount?: number;
  /** Custom class */
  className?: string;
  /** Variant: inline (trong list) hoặc bubble (trong chat panel) */
  variant?: 'inline' | 'bubble';
}

export function TypingIndicator({
  userName,
  typingCount = 1,
  className,
  variant = 'bubble',
}: TypingIndicatorProps) {
  // Text hiển thị
  const getTypingText = () => {
    if (typingCount > 1) {
      return `${typingCount} người đang nhập...`;
    }
    if (userName) {
      return `${userName} đang nhập...`;
    }
    return 'Đang nhập...';
  };

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-1 text-xs text-gray-500', className)}>
        <TypingDots size="sm" />
        <span>{getTypingText()}</span>
      </div>
    );
  }

  // Bubble variant - looks like a message bubble
  return (
    <div className={cn('flex items-start gap-2', className)}>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[120px]">
        <div className="flex items-center gap-2">
          <TypingDots size="md" />
        </div>
        <p className="text-xs text-gray-500 mt-1">{getTypingText()}</p>
      </div>
    </div>
  );
}

/**
 * Animated typing dots
 */
function TypingDots({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            dotSize,
            'bg-gray-400 rounded-full animate-bounce',
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Inline typing status for conversation list item
 */
export function TypingStatus({ userName }: { userName?: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-blue-500 font-medium">
      <TypingDots size="sm" />
      <span className="truncate">
        {userName ? `${userName} đang nhập...` : 'Đang nhập...'}
      </span>
    </div>
  );
}

export default TypingIndicator;
