/**
 * MessageComposer Component
 * 
 * Input area để soạn và gửi tin nhắn
 * - Textarea tự động resize
 * - Nút gửi và đính kèm
 * - Hỗ trợ Enter để gửi, Shift+Enter để xuống dòng
 * - Emit typing events
 */

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { MessageComposerProps } from '../types';
import { CHAT_COPY } from '../constants/copy';

// Debounce time for typing indicator (ms)
const TYPING_DEBOUNCE = 1000;

export function MessageComposer({
    onSend,
    onTypingChange,
    placeholder = CHAT_COPY.placeholders.composer,
    disabled = false,
    isLoading = false,
}: MessageComposerProps) {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle typing indicator
    const handleTypingStart = useCallback(() => {
        if (!isTyping) {
            setIsTyping(true);
            onTypingChange?.(true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            onTypingChange?.(false);
        }, TYPING_DEBOUNCE);
    }, [isTyping, onTypingChange]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleSubmit = () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || disabled || isLoading) return;

        // Stop typing indicator
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        setIsTyping(false);
        onTypingChange?.(false);

        onSend(trimmedMessage);
        setMessage('');

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Enter để gửi, Shift+Enter để xuống dòng
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        
        // Trigger typing indicator only if there's content
        if (e.target.value.trim().length > 0) {
            handleTypingStart();
        }
    };

    const handleInput = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Auto-resize
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    };

    const canSend = message.trim().length > 0 && !disabled && !isLoading;

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-end gap-2">
                {/* Attachment buttons */}
                <div className="flex gap-1">
                    <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        title={CHAT_COPY.tooltips.attachFile}
                        disabled={disabled}
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        title="Gửi hình ảnh"
                        disabled={disabled}
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Message input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onInput={handleInput}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className={cn(
                            'w-full resize-none rounded-2xl border border-gray-200 px-4 py-2.5',
                            'text-sm text-gray-900 placeholder:text-gray-400',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            'disabled:bg-gray-50 disabled:text-gray-500',
                            'max-h-[120px] overflow-y-auto'
                        )}
                        aria-label={CHAT_COPY.a11y.messageInput}
                    />
                </div>

                {/* Send button */}
                <Button
                    onClick={handleSubmit}
                    disabled={!canSend}
                    size="sm"
                    className={cn(
                        'rounded-full w-10 h-10 p-0 flex items-center justify-center',
                        canSend ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200'
                    )}
                    aria-label={CHAT_COPY.a11y.sendMessage}
                >
                    <Send className={cn('w-4 h-4', canSend ? 'text-white' : 'text-gray-400')} />
                </Button>
            </div>

            {/* Hint text */}
            <p className="text-xs text-gray-400 mt-2 text-center">
                Nhấn Enter để gửi, Shift+Enter để xuống dòng
            </p>
        </div>
    );
}

export default MessageComposer;
