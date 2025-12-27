import { useMemo, useState } from 'react';
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
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('medium');
  const [questionType, setQuestionType] = useState<'single_choice' | 'multiple_choice' | 'true_false' | 'mixed'>('single_choice');
  const [bloomLevel, setBloomLevel] = useState<'remember' | 'understand' | 'apply' | 'analyze' | 'mixed'>('understand');
  const [isPremium, setIsPremium] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [sourceMode, setSourceMode] = useState<'lesson' | 'file'>('lesson');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [difficultyMix, setDifficultyMix] = useState({ easy: 30, medium: 50, hard: 20 });
  const [questionTypeMix, setQuestionTypeMix] = useState({ single_choice: 50, multiple_choice: 30, true_false: 20 });
  const [bloomMix, setBloomMix] = useState({ remember: 25, understand: 35, apply: 25, analyze: 15 });

  const generateQuiz = useMutation({
    mutationFn: (payload: {
      courseId: string;
      courseContent: string;
      numberOfQuestions?: number;
      difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
      questionTypes?: Array<'single_choice' | 'multiple_choice' | 'true_false'>;
      bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'mixed';
      difficultyDistribution?: { easy: number; medium: number; hard: number };
      questionTypeDistribution?: { single_choice: number; multiple_choice: number; true_false: number };
      bloomDistribution?: { remember: number; understand: number; apply: number; analyze: number };
      isPremium?: boolean;
    }) => aiApi.generateQuiz(payload),
  });

  const generateQuizFromFile = useMutation({
    mutationFn: (payload: {
      courseId: string;
      file: File;
      numberOfQuestions?: number;
      difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
      questionTypes?: Array<'single_choice' | 'multiple_choice' | 'true_false'>;
      bloomLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'mixed';
      difficultyDistribution?: { easy: number; medium: number; hard: number };
      questionTypeDistribution?: { single_choice: number; multiple_choice: number; true_false: number };
      bloomDistribution?: { remember: number; understand: number; apply: number; analyze: number };
      isPremium?: boolean;
    }) => aiApi.generateQuizFromFile(payload),
  });

  const isGenerating = generateQuiz.isPending || generateQuizFromFile.isPending;

  const handleGenerate = async () => {
    if (sourceMode === 'lesson' && !courseContent.trim()) {
      toast.error('Vui lòng cung cấp nội dung khóa học');
      return;
    }

    if (sourceMode === 'file') {
      if (!sourceFile) {
        toast.error('Vui lòng chọn file để tạo quiz');
        return;
      }
      if (fileError) {
        toast.error(fileError);
        return;
      }
    }

    try {
      const questionTypes: Array<'single_choice' | 'multiple_choice' | 'true_false'> =
        questionType === 'mixed'
          ? ['single_choice', 'multiple_choice', 'true_false']
          : [questionType as 'single_choice' | 'multiple_choice' | 'true_false'];

      const buildDistribution = <T extends Record<string, number>>(mix: T): T => {
        const values = Object.values(mix);
        const total = values.reduce((sum, val) => sum + val, 0);
        if (total !== 100) {
          throw new Error('Tổng tỷ lệ phải bằng 100%');
        }
        return mix;
      };

      const difficultyDistribution = difficulty === 'mixed'
        ? buildDistribution(difficultyMix)
        : undefined;
      const questionTypeDistribution = questionType === 'mixed'
        ? buildDistribution(questionTypeMix)
        : undefined;
      const bloomDistribution = bloomLevel === 'mixed'
        ? buildDistribution(bloomMix)
        : undefined;

      const result = sourceMode === 'file'
        ? await generateQuizFromFile.mutateAsync({
            courseId: 'temp',
            file: sourceFile as File,
            numberOfQuestions,
            difficulty,
            questionTypes,
            bloomLevel,
            difficultyDistribution,
            questionTypeDistribution,
            bloomDistribution,
            isPremium,
          })
        : await generateQuiz.mutateAsync({
            courseId: 'temp',
            courseContent: courseContent.trim(),
            numberOfQuestions,
            difficulty,
            questionTypes,
            bloomLevel,
            difficultyDistribution,
            questionTypeDistribution,
            bloomDistribution,
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
      const message = error?.message || error?.response?.data?.message;
      toast.error(message || 'Không thể tạo câu hỏi');
    }
  };

  const handleAddQuestion = (question: any) => {
    if (onQuestionsGenerated) {
      onQuestionsGenerated([question]);
    }
  };

  const handleSourceModeChange = (mode: 'lesson' | 'file') => {
    setSourceMode(mode);
    setFileError('');
    if (mode === 'lesson') {
      setSourceFile(null);
    }
  };

  const validateFile = (file: File | null) => {
    if (!file) {
      setFileError('');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('File vượt quá 10MB, vui lòng chọn file nhỏ hơn.');
      setSourceFile(null);
      return;
    }

    setFileError('');
  };

  const fileDescription = useMemo(() => {
    if (!sourceFile) return '';
    const sizeMb = (sourceFile.size / (1024 * 1024)).toFixed(2);
    return `${sourceFile.name} (${sizeMb} MB)`;
  }, [sourceFile]);

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
              <option value="mixed">Đa dạng</option>
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
              <option value="mixed">Đa dạng</option>
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
              <option value="mixed">Đa dạng</option>
            </select>
          </div>
        </div>

        {difficulty === 'mixed' && (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Dễ (%)</label>
              <Input
                type="number"
                value={difficultyMix.easy}
                min={0}
                max={100}
                onChange={(e) =>
                  setDifficultyMix({ ...difficultyMix, easy: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Trung bình (%)</label>
              <Input
                type="number"
                value={difficultyMix.medium}
                min={0}
                max={100}
                onChange={(e) =>
                  setDifficultyMix({ ...difficultyMix, medium: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Khó (%)</label>
              <Input
                type="number"
                value={difficultyMix.hard}
                min={0}
                max={100}
                onChange={(e) =>
                  setDifficultyMix({ ...difficultyMix, hard: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>
        )}

        {questionType === 'mixed' && (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Single (%)</label>
              <Input
                type="number"
                value={questionTypeMix.single_choice}
                min={0}
                max={100}
                onChange={(e) =>
                  setQuestionTypeMix({
                    ...questionTypeMix,
                    single_choice: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Multiple (%)</label>
              <Input
                type="number"
                value={questionTypeMix.multiple_choice}
                min={0}
                max={100}
                onChange={(e) =>
                  setQuestionTypeMix({
                    ...questionTypeMix,
                    multiple_choice: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">True/False (%)</label>
              <Input
                type="number"
                value={questionTypeMix.true_false}
                min={0}
                max={100}
                onChange={(e) =>
                  setQuestionTypeMix({
                    ...questionTypeMix,
                    true_false: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
        )}

        {bloomLevel === 'mixed' && (
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-600">Remember (%)</label>
              <Input
                type="number"
                value={bloomMix.remember}
                min={0}
                max={100}
                onChange={(e) =>
                  setBloomMix({ ...bloomMix, remember: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Understand (%)</label>
              <Input
                type="number"
                value={bloomMix.understand}
                min={0}
                max={100}
                onChange={(e) =>
                  setBloomMix({ ...bloomMix, understand: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Apply (%)</label>
              <Input
                type="number"
                value={bloomMix.apply}
                min={0}
                max={100}
                onChange={(e) =>
                  setBloomMix({ ...bloomMix, apply: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Analyze (%)</label>
              <Input
                type="number"
                value={bloomMix.analyze}
                min={0}
                max={100}
                onChange={(e) =>
                  setBloomMix({ ...bloomMix, analyze: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>
        )}

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

        <div className="grid gap-3 rounded-lg border border-blue-100 bg-white p-3">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="quizSource"
                value="lesson"
                checked={sourceMode === 'lesson'}
                onChange={() => handleSourceModeChange('lesson')}
                className="text-blue-600 focus:ring-blue-500"
              />
              Dùng nội dung khóa học
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="quizSource"
                value="file"
                checked={sourceMode === 'file'}
                onChange={() => handleSourceModeChange('file')}
                className="text-blue-600 focus:ring-blue-500"
              />
              Dùng file tải lên
            </label>
          </div>

          {sourceMode === 'file' && (
            <div className="space-y-2">
              <Input
                type="file"
                accept=".txt,.md,.csv,.json,.pdf,.doc,.docx"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setSourceFile(file);
                  validateFile(file);
                }}
              />
              <p className="text-xs text-gray-500">
                Hỗ trợ TXT, Markdown, CSV, JSON, PDF, DOC, DOCX (tối đa 10MB).
              </p>
              {fileDescription && (
                <p className="text-xs text-gray-700">Đã chọn: {fileDescription}</p>
              )}
              {fileError && (
                <p className="text-xs text-red-600">{fileError}</p>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || (sourceMode === 'lesson' && !courseContent.trim())}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
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
        
        {/* Hiển thị preview nội dung sẽ được dùng để generate */}
        {sourceMode === 'lesson' && courseContent && courseContent.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Nội dung sẽ được dùng để tạo quiz:
            </p>
            <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
              {courseContent.length > 500 
                ? `${courseContent.substring(0, 500)}... (${courseContent.length} ký tự)` 
                : courseContent}
            </div>
          </div>
        )}


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

