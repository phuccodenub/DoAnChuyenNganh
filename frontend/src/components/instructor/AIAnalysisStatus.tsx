/**
 * AI Analysis Status Component
 * Shows analysis status for instructors in lesson editor
 */

import React, { useMemo } from 'react';
import { marked } from 'marked';
import { 
  useAIAnalysis, 
  useRequestAnalysis, 
  useDeleteAnalysis 
} from '../../hooks/useAIAnalysis';
import { 
  Sparkles, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Loader2 
} from 'lucide-react';

interface AIAnalysisStatusProps {
  lessonId: string;
  isInstructor: boolean;
}

const renderMarkdownToHtml = (raw?: string | null): string => {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  let html = marked.parse(trimmed, { breaks: true, gfm: true });
  // Loại bỏ các tag lạ mà AI có thể sinh ra (ví dụ </tên_gói>)
  html = (html as string).replace(/<\/?tên_gói>/gi, '');
  return html as string;
};

export const AIAnalysisStatus: React.FC<AIAnalysisStatusProps> = ({ 
  lessonId, 
  isInstructor 
}) => {
  const { analysis, queueStatus, loading, refreshAnalysis } = useAIAnalysis(lessonId);
  const { requestAnalysis, loading: requestLoading } = useRequestAnalysis(lessonId);
  const { deleteAnalysis, loading: deleteLoading } = useDeleteAnalysis(lessonId);

  // Get current queue task (if any)
  const currentQueueTask = queueStatus.find(task => 
    task.status === 'pending' || task.status === 'processing'
  );

  // Determine overall status
  const getStatus = () => {
    if (currentQueueTask) {
      return {
        type: currentQueueTask.status,
        label: currentQueueTask.status === 'processing' ? 'Đang phân tích' : 'Đang xếp hàng',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: Clock,
      };
    }

    if (analysis) {
      if (analysis.status === 'completed') {
        return {
          type: 'completed',
          label: 'Đã hoàn tất',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: CheckCircle,
        };
      }
      if (analysis.status === 'failed') {
        return {
          type: 'failed',
          label: 'Thất bại',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: XCircle,
        };
      }
      if (analysis.status === 'pending' || analysis.status === 'processing') {
        return {
          type: analysis.status,
          label: analysis.status === 'processing' ? 'Đang phân tích' : 'Đang xếp hàng',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          icon: Clock,
        };
      }
    }

    return {
      type: 'not_started',
      label: 'Chưa phân tích',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: Sparkles,
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;
  const showSpinner = status.type === 'pending' || status.type === 'processing';

  const summaryHtml = useMemo(
    () => (analysis && analysis.summary ? renderMarkdownToHtml(analysis.summary) : ''),
    [analysis]
  );

  const handleRequestAnalysis = async () => {
    const success = await requestAnalysis(false);
    if (success) {
      await refreshAnalysis();
    }
  };

  const handleReAnalyze = async () => {
    if (confirm('Re-analyze this lesson? This will delete the current analysis and queue a new one.')) {
      const success = await deleteAnalysis();
      if (success) {
        await refreshAnalysis();
      }
    }
  };

  if (!isInstructor) {
    return null; // Only show to instructors
  }

  return (
    <div className={`rounded-lg border-2 ${status.bgColor} border-gray-200 p-4 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <StatusIcon className={`h-6 w-6 ${status.color} mt-0.5`} />
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              AI Analysis
            </h3>
            <div className={`flex items-center text-sm font-medium ${status.color}`}>
              <span>{status.label}</span>
              {showSpinner && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
            </div>

            {/* Show queue info */}
            {currentQueueTask && (
              <div className="mt-2 text-xs text-gray-600">
                <p>Task: {currentQueueTask.task_type.replace('_', ' ')}</p>
                <p>Priority: {currentQueueTask.priority}</p>
                {currentQueueTask.retry_count > 0 && (
                  <p className="text-yellow-600">
                    Retry: {currentQueueTask.retry_count}/5
                  </p>
                )}
              </div>
            )}

            {/* Show analysis info */}
            {analysis && analysis.status === 'completed' && (
              <div className="mt-2 space-y-1 text-xs text-gray-600">
                {analysis.summary && (
                  <p>✓ Tóm tắt đã tạo</p>
                )}
                {analysis.video_transcript && (
                  <p>✓ Video đã phân tích</p>
                )}
                {analysis.content_key_concepts && analysis.content_key_concepts.length > 0 && (
                  <p>✓ {analysis.content_key_concepts.length} khái niệm chính đã trích xuất</p>
                )}
                {analysis.difficulty_level && (
                  <p>
                    Độ khó: <span className="font-medium capitalize">{analysis.difficulty_level}</span>
                  </p>
                )}
                <p className="text-gray-500">
                  Xử lý lúc {new Date(analysis.processed_at!).toLocaleString('vi-VN')}
                </p>
              </div>
            )}

            {/* Show error */}
            {analysis && analysis.status === 'failed' && analysis.error_message && (
              <p className="mt-2 text-xs text-red-600">
                Lỗi: {analysis.error_message}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col space-y-2">
          {status.type === 'not_started' && (
            <button
              onClick={handleRequestAnalysis}
              disabled={requestLoading || loading}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Phân tích
            </button>
          )}

          {(status.type === 'completed' || status.type === 'failed') && (
            <button
              onClick={handleReAnalyze}
              disabled={deleteLoading || loading}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Phân tích lại
            </button>
          )}

          <button
            onClick={refreshAnalysis}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {loading ? 'Đang cập nhật...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* Analysis Detail Content - Show when completed */}
      {analysis && analysis.status === 'completed' && (
        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
          {/* Summary */}
          {summaryHtml && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">📝 Tóm tắt</h4>
              <div
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed [&>p]:mb-2"
                dangerouslySetInnerHTML={{ __html: summaryHtml }}
              />
            </div>
          )}

          {/* Key Concepts */}
          {analysis.content_key_concepts && analysis.content_key_concepts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 Khái niệm chính</h4>
              <ul className="space-y-1">
                {analysis.content_key_concepts.map((concept, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span>{concept}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Video Key Points */}
          {analysis.video_key_points && analysis.video_key_points.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">🎥 Điểm nổi bật từ video</h4>
              <ul className="space-y-1">
                {analysis.video_key_points.map((point, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="text-purple-600 mr-2">▶</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Learning Objectives */}
          {analysis.learning_objectives && analysis.learning_objectives.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">🎯 Mục tiêu học tập</h4>
              <ul className="space-y-1">
                {analysis.learning_objectives.map((objective, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prerequisites */}
          {analysis.prerequisites && analysis.prerequisites.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">📚 Kiến thức cần có</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.prerequisites.map((prereq, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100">
            {analysis.estimated_study_time_minutes && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                <span>Thời gian học: ~{analysis.estimated_study_time_minutes} phút</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
