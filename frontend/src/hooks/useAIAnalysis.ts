/**
 * AI Analysis Hooks
 * React hooks for AI lesson analysis
 */

import { useState, useEffect, useCallback } from 'react';
import { aiAnalysisApi, AILessonAnalysisResponse, QueueTaskResponse } from '../api/ai-analysis.api';
import toast from 'react-hot-toast';

interface UseAIAnalysisResult {
  analysis: AILessonAnalysisResponse | null;
  queueStatus: QueueTaskResponse[];
  loading: boolean;
  error: string | null;
  refreshAnalysis: () => Promise<void>;
}

/**
 * Hook to fetch and manage lesson analysis
 */
export function useAIAnalysis(lessonId: string | null): UseAIAnalysisResult {
  const [analysis, setAnalysis] = useState<AILessonAnalysisResponse | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueTaskResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!lessonId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await aiAnalysisApi.getLessonAnalysis(lessonId);
      
      if (response.success) {
        setAnalysis(response.data?.analysis || null);
        setQueueStatus(response.data?.queue_status || []);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch analysis';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const shouldPoll = Boolean(
    analysis && (analysis.status === 'pending' || analysis.status === 'processing')
  ) || queueStatus.some((task) => task.status === 'pending' || task.status === 'processing');

  useEffect(() => {
    if (!lessonId || !shouldPoll) return;

    const intervalId = window.setInterval(() => {
      fetchAnalysis();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [lessonId, shouldPoll, fetchAnalysis]);

  return {
    analysis,
    queueStatus,
    loading,
    error,
    refreshAnalysis: fetchAnalysis,
  };
}

interface UseRequestAnalysisResult {
  requestAnalysis: (force?: boolean) => Promise<boolean>;
  loading: boolean;
}

/**
 * Hook to request analysis (instructor only)
 */
export function useRequestAnalysis(lessonId: string): UseRequestAnalysisResult {
  const [loading, setLoading] = useState(false);

  const requestAnalysis = async (force: boolean = false): Promise<boolean> => {
    setLoading(true);

    try {
      const response = await aiAnalysisApi.requestAnalysis(lessonId, force);

      if (response.success) {
        if (response.data?.analysis) {
          toast.success('Analysis retrieved from cache');
        } else if (response.data?.queued) {
          toast.success('Analysis queued. Processing will start soon.');
        }
        return true;
      } else {
        toast.error(response.message);
        return false;
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to request analysis';
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    requestAnalysis,
    loading,
  };
}

interface UseDeleteAnalysisResult {
  deleteAnalysis: () => Promise<boolean>;
  loading: boolean;
}

/**
 * Hook to delete analysis and trigger re-analysis
 */
export function useDeleteAnalysis(lessonId: string): UseDeleteAnalysisResult {
  const [loading, setLoading] = useState(false);

  const deleteAnalysis = async (): Promise<boolean> => {
    setLoading(true);

    try {
      const response = await aiAnalysisApi.deleteAnalysis(lessonId);

      if (response.success) {
        toast.success('Analysis deleted. Re-analysis queued.');
        return true;
      } else {
        toast.error(response.message);
        return false;
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete analysis';
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteAnalysis,
    loading,
  };
}

interface ProxyPalStatus {
  available: boolean;
  url: string;
  models?: {
    gemini_3_pro?: boolean;
  };
}

interface UseProxyPalStatusResult {
  status: ProxyPalStatus | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to check ProxyPal status
 */
export function useProxyPalStatus(): UseProxyPalStatusResult {
  const [status, setStatus] = useState<ProxyPalStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);

    try {
      const response = await aiAnalysisApi.getProxyPalStatus();
      setStatus(response);
    } catch (err) {
      console.error('Failed to fetch ProxyPal status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    status,
    loading,
    refresh: fetchStatus,
  };
}

interface UseAnalysisQueueResult {
  tasks: QueueTaskResponse[];
  total: number;
  loading: boolean;
  refresh: () => Promise<void>;
  forceProcess: () => Promise<void>;
}

/**
 * Hook to manage analysis queue (admin only)
 */
export function useAnalysisQueue(params?: {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  limit?: number;
  offset?: number;
}): UseAnalysisQueueResult {
  const [tasks, setTasks] = useState<QueueTaskResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);

    try {
      const response = await aiAnalysisApi.getAnalysisQueue(params);
      
      if (response.success) {
        setTasks(response.data.tasks);
        setTotal(response.data.total);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch queue';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const forceProcess = async () => {
    try {
      const response = await aiAnalysisApi.forceProcessQueue();
      
      if (response.success) {
        toast.success(`Processed ${response.data?.processed || 0} tasks`);
        await fetchQueue();
      } else {
        toast.error(response.message);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to process queue';
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [params?.status, params?.limit, params?.offset]);

  return {
    tasks,
    total,
    loading,
    refresh: fetchQueue,
    forceProcess,
  };
}
