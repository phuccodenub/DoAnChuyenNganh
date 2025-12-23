/**
 * AI Analysis Status Component
 * Shows analysis status for instructors in lesson editor
 */

import React from 'react';
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
  RefreshCw 
} from 'lucide-react';

interface AIAnalysisStatusProps {
  lessonId: string;
  isInstructor: boolean;
}

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
        label: currentQueueTask.status === 'processing' ? 'Processing' : 'Queued',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: Clock,
      };
    }

    if (analysis) {
      if (analysis.status === 'completed') {
        return {
          type: 'completed',
          label: 'Completed',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: CheckCircle,
        };
      }
      if (analysis.status === 'failed') {
        return {
          type: 'failed',
          label: 'Failed',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: XCircle,
        };
      }
    }

    return {
      type: 'not_started',
      label: 'Not Analyzed',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: Sparkles,
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  const handleRequestAnalysis = async () => {
    const success = await requestAnalysis(false);
    if (success) {
      setTimeout(() => refreshAnalysis(), 2000);
    }
  };

  const handleReAnalyze = async () => {
    if (confirm('Re-analyze this lesson? This will delete the current analysis and queue a new one.')) {
      const success = await deleteAnalysis();
      if (success) {
        setTimeout(() => refreshAnalysis(), 2000);
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
            <p className={`text-sm font-medium ${status.color}`}>
              {status.label}
            </p>

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
                  <p>✓ Summary generated</p>
                )}
                {analysis.video_transcript && (
                  <p>✓ Video analyzed</p>
                )}
                {analysis.content_key_concepts && analysis.content_key_concepts.length > 0 && (
                  <p>✓ {analysis.content_key_concepts.length} key concepts extracted</p>
                )}
                {analysis.difficulty_level && (
                  <p>
                    Difficulty: <span className="font-medium capitalize">{analysis.difficulty_level}</span>
                  </p>
                )}
                <p className="text-gray-500">
                  Processed {new Date(analysis.processed_at!).toLocaleString()}
                </p>
              </div>
            )}

            {/* Show error */}
            {analysis && analysis.status === 'failed' && analysis.error_message && (
              <p className="mt-2 text-xs text-red-600">
                Error: {analysis.error_message}
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
              Analyze
            </button>
          )}

          {(status.type === 'completed' || status.type === 'failed') && (
            <button
              onClick={handleReAnalyze}
              disabled={deleteLoading || loading}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Re-analyze
            </button>
          )}

          <button
            onClick={refreshAnalysis}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};
