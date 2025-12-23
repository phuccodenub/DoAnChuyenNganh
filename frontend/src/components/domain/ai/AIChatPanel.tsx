/**
 * AIChatPanel Component
 * 
 * Main AI Chat Panel Component
 * - Floating chat panel với toggle button
 * - Real-time messaging với AI Tutor
 * - Streaming responses
 * - Conversation history
 */

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, X, RefreshCw, Trash2, Sparkles, WifiOff } from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AIChatPanelProps {
  courseId?: string;
  lessonId?: string;
  className?: string;
}

export function AIChatPanel({ courseId, lessonId, className }: AIChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isConnected,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearHistory,
    reconnect,
  } = useAIChat({
    courseId,
    lessonId,
    enabled: true,
  });

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleClearHistory = () => {
    clearHistory();
    setShowClearConfirm(false);
  };

  return (
    <>
      {/* Floating toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-14 h-14 rounded-full shadow-lg',
            'bg-gradient-to-br from-purple-500 to-blue-600 text-white',
            'flex items-center justify-center',
            'hover:shadow-xl hover:scale-110',
            'transition-all duration-200',
            'group',
            className
          )}
          aria-label="Mở trợ giảng AI"
        >
          <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-20" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-[400px] h-[600px] max-h-[calc(100vh-3rem)]',
            'bg-white rounded-xl shadow-2xl',
            'flex flex-col overflow-hidden',
            'border border-gray-200',
            'animate-in slide-in-from-bottom-4 fade-in duration-300',
            // Responsive
            'max-sm:w-[calc(100vw-2rem)] max-sm:h-[calc(100vh-2rem)]',
            'max-sm:inset-4 max-sm:bottom-4 max-sm:right-4',
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500 to-blue-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Trợ Giảng AI</h3>
                <div className="flex items-center gap-2 text-xs">
                  {isConnected ? (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="opacity-90">Đang kết nối</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
                      <span className="opacity-90">Không kết nối</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Reconnect button */}
              {!isConnected && (
                <button
                  onClick={reconnect}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Kết nối lại"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}

              {/* Clear history button */}
              {messages.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Xóa lịch sử"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {messages.length === 0 && !error && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Xin chào! Tôi là Trợ Giảng AI
                </h4>
                <p className="text-sm text-gray-600 max-w-sm">
                  Tôi có thể giúp bạn giải đáp thắc mắc về bài học, giải thích khái niệm, 
                  và hỗ trợ bạn trong quá trình học tập. Hãy đặt câu hỏi bất kỳ!
                </p>
                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  <p>💡 Ví dụ: "Giải thích về React Hooks"</p>
                  <p>💻 Ví dụ: "Viết code để sort một array"</p>
                  <p>❓ Ví dụ: "Sự khác biệt giữa var và let"</p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg.content}
                isUser={msg.role === 'user'}
                timestamp={msg.timestamp}
                model={msg.model}
                provider={msg.provider}
                latency={msg.latency}
              />
            ))}

            {(isLoading || isStreaming) && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <ChatInput
            onSend={sendMessage}
            disabled={!isConnected}
            isLoading={isLoading || isStreaming}
            placeholder={
              !isConnected 
                ? 'Đang kết nối...' 
                : 'Nhập câu hỏi của bạn...'
            }
          />

          {/* Clear confirmation modal */}
          {showClearConfirm && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-10">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
                <h4 className="font-semibold text-lg mb-2">Xóa lịch sử hội thoại?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Hành động này sẽ xóa toàn bộ lịch sử hội thoại. Bạn có chắc chắn muốn tiếp tục?
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleClearHistory}
                  >
                    Xóa lịch sử
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
