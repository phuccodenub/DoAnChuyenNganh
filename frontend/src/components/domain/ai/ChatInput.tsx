/**
 * ChatInput Component
 * 
 * Input box để nhập tin nhắn chat
 */

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({ 
  onSend, 
  disabled = false, 
  isLoading = false,
  placeholder = 'Nhập câu hỏi của bạn...',
  className 
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled || isLoading) return;

    onSend(trimmed);
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn('border-t bg-white p-4', className)}>
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className={cn(
              'w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg resize-none',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
              'max-h-32 overflow-y-auto'
            )}
            style={{ minHeight: '48px' }}
          />
          
          {/* Character count (optional) */}
          {input.length > 0 && (
            <div className="absolute bottom-1 right-1 text-xs text-gray-400 pointer-events-none">
              {input.length}
            </div>
          )}
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || isLoading || !input.trim()}
          variant="primary"
          size="lg"
          className="flex-shrink-0 h-12 px-6"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Gửi
            </>
          )}
        </Button>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-500 mt-2">
        Nhấn <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> để gửi, 
        <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs ml-1">Shift + Enter</kbd> để xuống dòng
      </p>
    </div>
  );
}
