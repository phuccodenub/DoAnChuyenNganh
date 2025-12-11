import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAiChat, useLessonAiChat, useLessonSummary } from '@/hooks/useAi';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

interface AiAssistantCardProps {
  courseTitle?: string;
  courseDescription?: string;
  lessonTitle?: string;
  lessonId?: string;
}

export function AiAssistantCard({ courseTitle, courseDescription, lessonTitle, lessonId }: AiAssistantCardProps) {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [summary, setSummary] = useState<string>('');
  const aiChat = useAiChat();
  const lessonChat = useLessonAiChat(lessonId);
  const lessonSummary = useLessonSummary(lessonId);

  const handleAsk = async () => {
    if (!message.trim()) return;
    const userMsg = message.trim();
    setMessage('');
    setHistory((prev) => [...prev, { role: 'user', content: userMsg }]);
    try {
      const res = lessonId
        ? await lessonChat.mutateAsync({
            message: userMsg,
            conversationHistory: history,
            options: { maxTokens: 512 },
          })
        : await aiChat.mutateAsync({
            message: userMsg,
            conversationHistory: history,
            context: {
              courseTitle,
              courseDescription,
              lessonTitle,
            },
          });
      setHistory((prev) => [...prev, { role: 'assistant', content: res.response }]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể gọi trợ lý AI');
    }
  };

  const handleSummary = async () => {
    if (!lessonId) {
      toast.error('Thiếu lessonId để tóm tắt');
      return;
    }
    try {
      const res = await lessonSummary.mutateAsync();
      setSummary(res.response);
      toast.success('Đã tạo tóm tắt bài học');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tóm tắt bài học');
    }
  };

  // Gỡ auto-fetch tóm tắt để giảm số lần gọi AI (người dùng bấm tay)
  useEffect(() => {
    // intentionally left blank
  }, [lessonId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Trợ lý AI</CardTitle>
          <p className="text-sm text-gray-600 mt-1">Hỏi nhanh về khóa học/bài học này.</p>
        </div>
        <Sparkles className="w-5 h-5 text-indigo-500" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-gray-800">Tóm tắt bài học</div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSummary}
              disabled={lessonSummary.isPending || !lessonId}
            >
              {lessonSummary.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lấy tóm tắt
            </Button>
          </div>
          <div className="rounded-lg border bg-gray-50 p-3 min-h-[80px]">
            {summary ? (
              <p className="text-sm whitespace-pre-wrap text-gray-800">{summary}</p>
            ) : (
              <p className="text-sm text-gray-500">Chưa có tóm tắt. Bấm “Lấy tóm tắt”.</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-800">Hỏi trợ lý AI</div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hỏi trợ lý AI..."
            rows={3}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex justify-end">
            <Button onClick={handleAsk} disabled={aiChat.isPending || lessonChat.isPending}>
              {(aiChat.isPending || lessonChat.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Hỏi trợ lý
            </Button>
          </div>
        </div>

        {history.length > 0 && (
          <div className="space-y-3">
            {history.map((msg, idx) => (
              <div key={idx} className="p-3 rounded-lg border bg-gray-50">
                <div className="text-xs font-semibold text-gray-500 mb-1">
                  {msg.role === 'user' ? 'Bạn' : 'AI'}
                </div>
                <p className="text-sm whitespace-pre-wrap text-gray-800">{msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


