import React from 'react';
import clsx from 'clsx';

interface TypingIndicatorProps {
  userNames: string[];
  className?: string;
}

/**
 * Typing Indicator Component
 * Shows animated dots when other users are typing
 */
export function TypingIndicator({ userNames, className }: TypingIndicatorProps) {
  if (!userNames || userNames.length === 0) {
    return null;
  }

  const displayText =
    userNames.length === 1
      ? `${userNames[0]} is typing`
      : userNames.length === 2
        ? `${userNames[0]} and ${userNames[1]} are typing`
        : `${userNames[0]} and ${userNames.length - 1} others are typing`;

  return (
    <div
      className={clsx(
        'flex items-center gap-2 text-sm text-gray-500 px-4 py-2',
        className
      )}
    >
      <span>{displayText}</span>
      <div className="flex items-center gap-1">
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}

export default TypingIndicator;
