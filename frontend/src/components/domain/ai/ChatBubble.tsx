/**
 * ChatBubble Component
 * 
 * Hiển thị một tin nhắn trong chat
 * Support markdown rendering và code highlighting
 */

import { memo } from 'react';
import { marked } from 'marked';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  model?: string;
  provider?: string;
  latency?: number;
}

export const ChatBubble = memo(({ 
  message, 
  isUser, 
  timestamp,
  model,
  provider,
  latency 
}: ChatBubbleProps) => {
  // Convert markdown to HTML for AI messages
  const htmlContent = !isUser && message ? marked.parse(message) as string : message;

  return (
    <div className={cn(
      'flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
      )}>
        {isUser ? (
          <User className="w-5 h-5" />
        ) : (
          <Bot className="w-5 h-5" />
        )}
      </div>

      {/* Message content */}
      <div className={cn(
        'flex-1 max-w-[75%]',
        isUser && 'flex flex-col items-end'
      )}>
        <div className={cn(
          'rounded-2xl px-4 py-2.5 shadow-sm',
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-white border border-gray-200'
        )}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
          ) : (
            <div 
              className="prose prose-sm max-w-none prose-p:my-1 prose-pre:my-2 prose-code:text-sm"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </div>

        {/* Metadata */}
        <div className={cn(
          'flex items-center gap-2 mt-1 px-2',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          <span className="text-xs text-gray-500">
            {new Date(timestamp).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          
          {!isUser && model && (
            <>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500" title={`Provider: ${provider || 'unknown'}`}>
                {model}
              </span>
            </>
          )}
          
          {!isUser && latency && (
            <>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {(latency / 1000).toFixed(1)}s
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

ChatBubble.displayName = 'ChatBubble';
