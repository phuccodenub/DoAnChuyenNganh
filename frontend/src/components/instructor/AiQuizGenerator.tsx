import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/services/api/ai.api';
import { Sparkles, Loader2, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AiQuizGeneratorProps {
  courseContent: string;
  onQuestionsGenerated?: (questions: any[]) => void;
}

export function AiQuizGenerator({ courseContent, onQuestionsGenerated }: AiQuizGeneratorProps) {
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionType, setQuestionType] = useState<'single_choice' | 'multiple_choice' | 'true_false'>('single_choice');
  const [bloomLevel, setBloomLevel] = useState<'remember' | 'understand' | 'apply' | 'analyze'>('understand');
  const [isPremium, setIsPremium] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  const generateQuiz = useMutation({
    mutationFn: (payload: {
      courseId: string;
      courseContent: string;
      numberOfQuestions?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
      questionType?: 'single_choice' | 'multiple_choice' | 'true_false';
      bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze';
      isPremium?: boolean;
    }) => aiApi.generateQuiz(payload),
  });

  const handleGenerate = async () => {
    if (!courseContent.trim()) {
      toast.error('Vui lòng cung cấp nội dung khóa học');
      return;
    }

    try {
      const result = await generateQuiz.mutateAsync({
        courseId: 'temp', // Will be replaced with actual courseId
        courseContent: courseContent.trim(),
        numberOfQuestions,
        difficulty,
        questionType,
        bloomLevel,
        isPremium,
      });

      setGeneratedQuestions(result.questions || []);
      
      const successMsg = result.fromCache 
        ? `Đã tải ${result.totalQuestions || 0} câu hỏi từ cache`
        : `Đã tạo ${result.totalQuestions || 0} câu hỏi thành công`;
      
      toast.success(successMsg);

      if (result.metadata) {
        const meta = result.metadata;
        console.log(`[QuizGenerator] Model: ${meta.model}, Time: ${meta.processingTime}ms, Stages: ${meta.stages.join(' → ')}`);
      }

      if (onQuestionsGenerated) {
        onQuestionsGenerated(result.questions || []);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo câu hỏi');
    }
  };

  const handleAddQuestion = (question: any) => {
    if (onQuestionsGenerated) {
      onQuestionsGenerated([question]);
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg">AI Tạo Câu Hỏi Quiz</CardTitle>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Tạo câu hỏi quiz tự động từ nội dung khóa học
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số câu hỏi
            </label>
            <Input
              type="number"
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
              min={1}
              max={50}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Độ khó
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại câu hỏi
            </label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="single_choice">Trắc nghiệm (1 đáp án)</option>
              <option value="multiple_choice">Nhiều đáp án đúng</option>
              <option value="true_false">Đúng/Sai</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mức độ tư duy
            </label>
            <select
              value={bloomLevel}
              onChange={(e) => setBloomLevel(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="remember">Ghi nhớ</option>
              <option value="understand">Hiểu biết</option>
              <option value="apply">Áp dụng</option>
              <option value="analyze">Phân tích</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPremium"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isPremium" className="text-sm text-gray-700">
            <span className="font-medium">Chất lượng Premium</span>
            <span className="text-gray-500 ml-2">(Cho đề thi quan trọng)</span>
          </label>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generateQuiz.isPending || !courseContent.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {generateQuiz.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tạo câu hỏi...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Tạo Câu Hỏi với AI
            </>
          )}
        </Button>

        {generatedQuestions.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="font-semibold text-gray-900">
              Đã tạo {generatedQuestions.length} câu hỏi:
            </h4>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {generatedQuestions.map((question, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">
                        Câu {idx + 1}: {question.question}
                      </p>
                      {question.options && (
                        <div className="ml-4 space-y-1">
                          {question.options.map((option: string, optIdx: number) => (
                            <div
                              key={optIdx}
                              className={`text-sm ${
                                optIdx === question.correctAnswer
                                  ? 'text-green-700 font-medium'
                                  : 'text-gray-700'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}. {option}
                              {optIdx === question.correctAnswer && ' ✓'}
                            </div>
                          ))}
                        </div>
                      )}
                      {question.explanation && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-900">
                          <strong>Giải thích:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddQuestion(question)}
                      className="ml-2"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

