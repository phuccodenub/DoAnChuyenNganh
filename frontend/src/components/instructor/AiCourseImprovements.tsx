import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSuggestCourseImprovements } from '@/hooks/useAi';
import { Sparkles, Loader2, AlertCircle, TrendingUp, Lightbulb } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AiCourseImprovementsProps {
  courseId: string;
  courseData: {
    title: string;
    description?: string;
    content?: string;
    lessons?: any[];
    studentFeedback?: any[];
    enrollmentStats?: any;
  };
}

export function AiCourseImprovements({ courseId, courseData }: AiCourseImprovementsProps) {
  const [improvements, setImprovements] = useState<any>(null);
  const suggestImprovements = useSuggestCourseImprovements();

  const handleAnalyze = async () => {
    try {
      const result = await suggestImprovements.mutateAsync({
        courseId,
        courseData,
      });

      setImprovements(result);
      toast.success('Đã phân tích và đề xuất cải thiện thành công');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể phân tích khóa học');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content':
        return '📚';
      case 'structure':
        return '🏗️';
      case 'engagement':
        return '💡';
      case 'assessment':
        return '📝';
      case 'accessibility':
        return '♿';
      default:
        return '📌';
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg">AI Đề Xuất Cải Thiện</CardTitle>
          </div>
          {improvements?.overallScore !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Điểm tổng thể:</span>
              <Badge variant={improvements.overallScore >= 80 ? 'success' : improvements.overallScore >= 60 ? 'warning' : 'error'}>
                {improvements.overallScore}/100
              </Badge>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Phân tích khóa học và đưa ra các đề xuất cải thiện cụ thể
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!improvements ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Nhấn nút bên dưới để AI phân tích khóa học và đưa ra đề xuất cải thiện
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={suggestImprovements.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {suggestImprovements.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Phân tích & Đề xuất
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {improvements.summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-1">Tóm tắt đánh giá:</p>
                <p className="text-sm text-blue-800">{improvements.summary}</p>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Đề xuất cải thiện:</h4>
              {improvements.improvements?.map((improvement: any, idx: number) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(improvement.category)}</span>
                      <h5 className="font-semibold text-gray-900">{improvement.title}</h5>
                    </div>
                    <Badge className={getPriorityColor(improvement.priority)}>
                      {improvement.priority === 'high' ? 'Cao' : 
                       improvement.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{improvement.description}</p>
                  <div className="bg-indigo-50 border border-indigo-100 rounded p-2 mb-2">
                    <p className="text-xs font-medium text-indigo-900 mb-1">💡 Gợi ý:</p>
                    <p className="text-sm text-indigo-800">{improvement.suggestion}</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded p-2">
                    <p className="text-xs font-medium text-green-900 mb-1">📈 Tác động:</p>
                    <p className="text-sm text-green-800">{improvement.impact}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setImprovements(null)}
              variant="outline"
              className="w-full"
            >
              Phân tích lại
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

