import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGenerateCourseOutline } from '@/hooks/useAi';
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AiCourseOutlineGeneratorProps {
  onOutlineGenerated?: (outline: any) => void;
}

export function AiCourseOutlineGenerator({ onOutlineGenerated }: AiCourseOutlineGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number>(10);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [numberOfSections, setNumberOfSections] = useState<number>(5);
  const [generatedOutline, setGeneratedOutline] = useState<any>(null);

  const generateOutline = useGenerateCourseOutline();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Vui lòng nhập chủ đề khóa học');
      return;
    }

    try {
      const result = await generateOutline.mutateAsync({
        topic: topic.trim(),
        description: description.trim() || undefined,
        duration,
        level,
        numberOfSections,
      });

      setGeneratedOutline(result);
      toast.success('Đã tạo outline khóa học thành công');
      
      if (onOutlineGenerated) {
        onOutlineGenerated(result);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo outline khóa học');
    }
  };

  const handleUseOutline = () => {
    if (onOutlineGenerated && generatedOutline) {
      onOutlineGenerated(generatedOutline);
    }
  };

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <CardTitle className="text-lg">AI Tạo Outline Khóa Học</CardTitle>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Nhập thông tin cơ bản, AI sẽ tạo outline chi tiết cho khóa học của bạn
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedOutline ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chủ đề khóa học <span className="text-red-500">*</span>
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: React từ cơ bản đến nâng cao"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả (tùy chọn)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về khóa học..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời lượng (giờ)
                </label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trình độ
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="beginner">Cơ bản</option>
                  <option value="intermediate">Trung cấp</option>
                  <option value="advanced">Nâng cao</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số chương
              </label>
              <Input
                type="number"
                value={numberOfSections}
                onChange={(e) => setNumberOfSections(Number(e.target.value))}
                min={3}
                max={15}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateOutline.isPending || !topic.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {generateOutline.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo outline...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tạo Outline với AI
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Đã tạo outline thành công!</h3>
              </div>
              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">Tiêu đề:</p>
                  <p className="text-sm text-gray-900">{generatedOutline.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Mô tả:</p>
                  <p className="text-sm text-gray-900">{generatedOutline.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Mục tiêu học tập:</p>
                  <ul className="list-disc list-inside text-sm text-gray-900 ml-2">
                    {generatedOutline.learningOutcomes?.map((outcome: string, idx: number) => (
                      <li key={idx}>{outcome}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Số chương: {generatedOutline.sections?.length || 0}
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    Thời lượng ước tính: {generatedOutline.totalEstimatedDuration} giờ
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Cấu trúc khóa học:</h4>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {generatedOutline.sections?.map((section: any, sectionIdx: number) => (
                  <div key={sectionIdx} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="font-medium text-gray-900 mb-1">
                      Chương {section.order}: {section.title}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                    <div className="ml-4 space-y-1">
                      {section.lessons?.map((lesson: any, lessonIdx: number) => (
                        <div key={lessonIdx} className="text-sm text-gray-700">
                          • Bài {lesson.order}: {lesson.title}
                          {lesson.estimatedDuration && (
                            <span className="text-gray-500 ml-2">
                              ({lesson.estimatedDuration} phút)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUseOutline}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Sử dụng Outline này
              </Button>
              <Button
                onClick={() => {
                  setGeneratedOutline(null);
                  setTopic('');
                  setDescription('');
                }}
                variant="outline"
              >
                Tạo lại
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

