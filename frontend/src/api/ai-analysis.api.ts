/**
 * AI Analysis API Client
 * Client for AI lesson analysis endpoints
 */

import { apiClient } from '../services/http/client';

export interface AILessonAnalysisResponse {
  id: string;
  lesson_id: string;
  summary: string | null;
  video_transcript: string | null;
  video_key_points: string[] | null;
  content_key_concepts: string[] | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null;
  estimated_study_time_minutes: number | null;
  prerequisites: string[] | null;
  learning_objectives: string[] | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  analysis_version: number;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QueueTaskResponse {
  id: string;
  lesson_id: string;
  task_type: 'summary' | 'video_analysis' | 'full_analysis';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  retry_count: number;
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ProxyPalStatusResponse {
  available: boolean;
  url: string;
  models?: {
    gemini_3_pro?: boolean;
  };
  last_checked?: string;
}

export interface RequestAnalysisResponse {
  success: boolean;
  message: string;
  data?: {
    analysis?: AILessonAnalysisResponse;
    queued?: boolean;
    queue_task?: QueueTaskResponse;
  };
}

export interface GetAnalysisResponse {
  success: boolean;
  message: string;
  data?: {
    analysis: AILessonAnalysisResponse | null;
    queue_status?: QueueTaskResponse[];
  };
}

export const aiAnalysisApi = {
  /**
   * Request lesson analysis (instructor only)
   */
  async requestAnalysis(lessonId: string, force: boolean = false): Promise<RequestAnalysisResponse> {
    const response = await apiClient.post(`/ai/analysis/${lessonId}`, { force });
    return response.data;
  },

  /**
   * Get lesson analysis (all authenticated users)
   */
  async getLessonAnalysis(lessonId: string): Promise<GetAnalysisResponse> {
    const response = await apiClient.get(`/ai/analysis/${lessonId}`);
    return response.data;
  },

  /**
   * Delete analysis and trigger re-analysis (instructor only)
   */
  async deleteAnalysis(lessonId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/ai/analysis/${lessonId}`);
    return response.data;
  },

  /**
   * Get ProxyPal status (all authenticated users)
   */
  async getProxyPalStatus(): Promise<ProxyPalStatusResponse> {
    const response = await apiClient.get('/ai/analysis/proxypal/status');
    return response.data;
  },

  /**
   * Get analysis queue (admin only)
   */
  async getAnalysisQueue(params?: {
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    limit?: number;
    offset?: number;
  }): Promise<{
    success: boolean;
    data: {
      tasks: QueueTaskResponse[];
      total: number;
    };
  }> {
    const response = await apiClient.get('/ai/analysis/queue', { params });
    return response.data;
  },

  /**
   * Force process queue (admin only)
   */
  async forceProcessQueue(): Promise<{
    success: boolean;
    message: string;
    data?: {
      processed: number;
    };
  }> {
    const response = await apiClient.post('/ai/analysis/queue/process');
    return response.data;
  },
};
