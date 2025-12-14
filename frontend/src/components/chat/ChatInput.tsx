import React, { useRef, useEffect, useState } from 'react';
import { Send, Loader, Paperclip, Smile } from 'lucide-react';
import { useSendMessage } from '@/hooks/useChat';

interface ChatInputProps {
  courseId: string;
  onMessageSent?: () => void;
  placeholder?: string;
}

/**
 * Chat Input Component
 * Allows users to type and send messages
 */
export function ChatInput({
  courseId,
  onMessageSent,
  placeholder = 'Nhập tin nhắn của bạn...',
}: ChatInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate: sendMessage, isPending } = useSendMessage(courseId);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [content]);

  const handleSend = () => {
    if (content.trim().length === 0 || isPending) return;

    sendMessage(
      { content: content.trim() },
      {
        onSuccess: () => {
          setContent('');
          onMessageSent?.();
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-2">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isPending}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-50"
          style={{ minHeight: '36px', maxHeight: '120px' }}
        />

        {/* Attachments Button */}
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          disabled={isPending}
          title="Đính kèm tệp"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Emoji Button */}
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          disabled={isPending}
          title="Thêm emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isPending || content.trim().length === 0}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white p-2 transition-colors disabled:bg-gray-300"
          title="Gửi tin nhắn"
        >
          {isPending ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Character count */}
      <div className="mt-2 text-xs text-gray-500">
        {content.length} / 5000 ký tự
      </div>
    </div>
  );
}
