/**
 * Study Plan Dashboard Component
 * Displays personalized study plan with weak areas, next actions, and checkpoints
 * 
 * Based on: docs/AI/16_INSTRUCTOR_STUDENT_LEARNING_SUPPORT_PLAN_MVP.md
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { aiApi, WeakArea, StudyAction, Checkpoint } from '@/services/api/ai.api';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,
  Minus,
  BarChart3,
  Zap,
} from 'lucide-react';

interface StudyPlanDashboardProps {
  courseId: string;
  onNavigateToQuiz?: (quizId: string) => void;
  onNavigateToLesson?: (lessonId: string) => void;
}

export function StudyPlanDashboard({
  courseId,
  onNavigateToQuiz,
  onNavigateToLesson,
}: StudyPlanDashboardProps) {
  const [showAllWeakAreas, setShowAllWeakAreas] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['study-plan', courseId],
    queryFn: () => aiApi.getStudyPlan(courseId),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const handleRefresh = async () => {
    await aiApi.clearStudyPlanCache(courseId);
    refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">Đang phân tích tiến độ học tập...</p>
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
            <p className="text-sm">Không thể tải kế hoạch học tập</p>
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

  const weakAreasToShow = showAllWeakAreas ? data.weakAreas : data.weakAreas.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Kế hoạch học tập</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
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
              <p className="text-2xl font-bold text-blue-700">{data.summary.totalQuizzesTaken}</p>
              <p className="text-xs text-blue-600">Quiz đã làm</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <p className="text-2xl font-bold text-green-700">
                {Math.round(data.summary.averageScore * 100)}%
              </p>
              <p className="text-xs text-green-600">Điểm TB</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-center">
              <p className="text-lg font-bold text-amber-700 truncate">
                {data.summary.weakestArea}
              </p>
              <p className="text-xs text-amber-600">Điểm yếu nhất</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <p className="text-2xl font-bold text-purple-700">
                {data.summary.estimatedStudyTimeMinutes}
              </p>
              <p className="text-xs text-purple-600">Phút cần học</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weak Areas */}
      {data.weakAreas.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-500" />
              <CardTitle className="text-base">Điểm yếu cần cải thiện</CardTitle>
            </div>
            <p className="text-xs text-gray-500">
              Các quiz có điểm thấp hoặc cần ôn tập lại
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {weakAreasToShow.map((area) => (
              <WeakAreaItem
                key={area.id}
                area={area}
                onNavigate={() => onNavigateToQuiz?.(area.id)}
              />
            ))}

            {data.weakAreas.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setShowAllWeakAreas(!showAllWeakAreas)}
              >
                {showAllWeakAreas
                  ? 'Thu gọn'
                  : `Xem thêm ${data.weakAreas.length - 3} quiz khác`}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next Actions */}
      {data.nextActions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">Việc cần làm</CardTitle>
            </div>
            <p className="text-xs text-gray-500">
              Hành động được đề xuất để cải thiện
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.nextActions.map((action) => (
              <ActionItem
                key={`${action.targetId}-${action.priority}`}
                action={action}
                onNavigate={() => {
                  if (action.targetType === 'quiz') {
                    onNavigateToQuiz?.(action.targetId);
                  } else {
                    onNavigateToLesson?.(action.targetId);
                  }
                }}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Checkpoints */}
      {data.checkpoints.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-base">Lịch ôn tập</CardTitle>
            </div>
            <p className="text-xs text-gray-500">
              Các mốc kiểm tra lại theo spaced repetition
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.checkpoints.map((checkpoint, index) => (
              <CheckpointItem
                key={`${checkpoint.targetId}-${index}`}
                checkpoint={checkpoint}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {data.weakAreas.length === 0 && data.nextActions.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center gap-3 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
              <p className="text-sm font-medium">Tuyệt vời! Bạn đang học rất tốt.</p>
              <p className="text-xs text-gray-500">
                Tiếp tục hoàn thành các quiz trong khóa học.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cache Info */}
      {data.metadata.cached && (
        <p className="text-xs text-gray-500 text-center">
          📊 Dữ liệu được cache. Nhấn "Cập nhật" để lấy dữ liệu mới nhất.
        </p>
      )}
    </div>
  );
}

interface WeakAreaItemProps {
  area: WeakArea;
  onNavigate?: () => void;
}

function WeakAreaItem({ area, onNavigate }: WeakAreaItemProps) {
  const getTrendIcon = () => {
    switch (area.trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendLabel = () => {
    switch (area.trend) {
      case 'improving':
        return 'Đang tiến bộ';
      case 'declining':
        return 'Đang giảm';
      default:
        return 'Ổn định';
    }
  };

  const performancePercent = Math.round(area.performance * 100);
  const weaknessPercent = Math.round(area.weaknessScore * 100);

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onNavigate}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">{area.title}</p>
          {area.sectionTitle && (
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              {area.sectionTitle}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className={performancePercent < 50 ? 'text-red-600' : 'text-green-600'}>
            {performancePercent}% điểm
          </span>
          <span>|</span>
          <span>{area.attemptCount} lần làm</span>
          <span>|</span>
          <span className="flex items-center gap-1">
            {getTrendIcon()}
            {getTrendLabel()}
          </span>
        </div>
      </div>

      {/* Weakness Indicator */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                weaknessPercent > 50 ? 'bg-red-500' : weaknessPercent > 25 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${weaknessPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">Cần ôn: {weaknessPercent}%</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
}

interface ActionItemProps {
  action: StudyAction;
  onNavigate?: () => void;
}

function ActionItem({ action, onNavigate }: ActionItemProps) {
  const getActionIcon = () => {
    switch (action.actionType) {
      case 'review_lesson':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'retake_quiz':
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      case 'practice':
        return <Target className="h-4 w-4 text-green-500" />;
    }
  };

  const getActionLabel = () => {
    switch (action.actionType) {
      case 'review_lesson':
        return 'Xem lại bài học';
      case 'retake_quiz':
        return 'Làm lại quiz';
      case 'practice':
        return 'Luyện tập';
    }
  };

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onNavigate}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
        <span className="text-sm font-bold text-gray-600">#{action.priority}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {getActionIcon()}
          <span className="text-xs font-medium text-gray-500">{getActionLabel()}</span>
        </div>
        <p className="text-sm font-medium text-gray-900 truncate">{action.targetTitle}</p>
        <p className="text-xs text-gray-500 mt-1">{action.reason}</p>
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          <span>~{action.suggestedTimeMinutes} phút</span>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
    </div>
  );
}

interface CheckpointItemProps {
  checkpoint: Checkpoint;
}

function CheckpointItem({ checkpoint }: CheckpointItemProps) {
  const date = new Date(checkpoint.scheduledDate);
  const isToday = date.toDateString() === new Date().toDateString();
  const isPast = date < new Date();

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${isPast ? 'bg-gray-50' : 'bg-white'}`}>
      <div
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg ${
          isToday ? 'bg-blue-100 text-blue-700' : isPast ? 'bg-gray-200 text-gray-500' : 'bg-purple-100 text-purple-700'
        }`}
      >
        <span className="text-xs font-medium">
          {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
        </span>
        <span className="text-lg font-bold">{date.getDate()}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant={checkpoint.type === 'mini_quiz' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {checkpoint.type === 'mini_quiz' ? 'Mini Quiz' : 'Ôn tập'}
          </Badge>
          {isToday && (
            <Badge className="bg-blue-500 text-white text-xs">Hôm nay</Badge>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900 truncate">{checkpoint.targetTitle}</p>
        <p className="text-xs text-gray-500">{checkpoint.description}</p>
      </div>
    </div>
  );
}

export default StudyPlanDashboard;
