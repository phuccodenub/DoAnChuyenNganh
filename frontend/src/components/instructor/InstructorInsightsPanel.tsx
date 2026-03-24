/**
 * Instructor Insights Panel Component
 * Displays aggregated class insights for instructors (weak areas, recommendations)
 * 
 * Based on: docs/AI/16_INSTRUCTOR_STUDENT_LEARNING_SUPPORT_PLAN_MVP.md
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { aiApi, InstructorInsights } from '@/services/api/ai.api';
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  Loader2,
  RefreshCw,
  Users,
  TrendingUp,
} from 'lucide-react';

interface InstructorInsightsPanelProps {
  courseId: string;
}

export function InstructorInsightsPanel({ courseId }: InstructorInsightsPanelProps) {
  const [expandedQuizzes, setExpandedQuizzes] = useState<Set<string>>(new Set());

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['instructor-insights', courseId],
    queryFn: () => aiApi.getInstructorInsights(courseId),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const toggleQuiz = (quizId: string) => {
    setExpandedQuizzes((prev) => {
      const next = new Set(prev);
      if (next.has(quizId)) {
        next.delete(quizId);
      } else {
        next.add(quizId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">Đang phân tích dữ liệu lớp học...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-3 text-red-600">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">Không thể tải dữ liệu phân tích</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Phân tích lớp học</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Cập nhật</span>
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Khóa học: <span className="font-medium">{data.courseTitle}</span>
          </p>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700">{data.totalStudents}</p>
              <p className="text-xs text-blue-600">Tổng học sinh</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">{data.activeStudents}</p>
              <p className="text-xs text-green-600">Học sinh hoạt động</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">
                {Math.round(data.overallAverageScore * 100)}%
              </p>
              <p className="text-xs text-amber-600">Điểm TB lớp</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <p className="text-2xl font-bold text-purple-700">
                {data.weakAreasAggregate.length}
              </p>
              <p className="text-xs text-purple-600">Quiz cần chú ý</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">Đề xuất cải thiện</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weak Areas */}
      {data.weakAreasAggregate.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-base">Quiz cần cải thiện</CardTitle>
            </div>
            <p className="text-xs text-gray-500">
              Các quiz có điểm trung bình thấp, sắp xếp theo độ yếu
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.weakAreasAggregate.map((quiz) => (
              <QuizInsightItem
                key={quiz.quizId}
                quiz={quiz}
                isExpanded={expandedQuizzes.has(quiz.quizId)}
                onToggle={() => toggleQuiz(quiz.quizId)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {data.weakAreasAggregate.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-3 text-green-600">
              <TrendingUp className="h-8 w-8" />
              <p className="text-sm font-medium">Lớp học đang hoạt động tốt!</p>
              <p className="text-xs text-gray-500">
                Chưa phát hiện vấn đề cần chú ý.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface QuizInsightItemProps {
  quiz: InstructorInsights['weakAreasAggregate'][0];
  isExpanded: boolean;
  onToggle: () => void;
}

function QuizInsightItem({ quiz, isExpanded, onToggle }: QuizInsightItemProps) {
  const scorePercent = Math.round(quiz.averageScore * 100);
  const scoreColor = scorePercent < 50 ? 'red' : scorePercent < 70 ? 'amber' : 'green';

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-gray-900 truncate">{quiz.quizTitle}</p>
            {quiz.sectionTitle && (
              <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                {quiz.sectionTitle}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className={`text-${scoreColor}-600 font-medium`}>
              {scorePercent}% điểm TB
            </span>
            <span>|</span>
            <span>{quiz.studentCount} học sinh</span>
            <span>|</span>
            <span>{quiz.attemptCount} lần làm</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Score Bar */}
          <div className="hidden sm:block w-24">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-${scoreColor}-500`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && quiz.mostMissedQuestions.length > 0 && (
        <div className="border-t bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-700 mb-2">
            Câu hỏi sai nhiều nhất:
          </p>
          <div className="space-y-2">
            {quiz.mostMissedQuestions.map((q, index) => (
              <div
                key={q.questionId}
                className="flex items-start gap-2 p-2 rounded bg-white border"
              >
                <Badge
                  variant="secondary"
                  className={`flex-shrink-0 ${
                    q.incorrectRate > 0.7
                      ? 'bg-red-100 text-red-700'
                      : q.incorrectRate > 0.5
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {Math.round(q.incorrectRate * 100)}% sai
                </Badge>
                <p className="text-xs text-gray-700 line-clamp-2">{q.questionText}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorInsightsPanel;
