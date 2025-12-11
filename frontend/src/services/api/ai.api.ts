import { apiClient } from '../http/client';

export interface AiChatRequest {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: Record<string, unknown>;
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export interface AiChatResponse {
  response: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export const aiApi = {
  chat: async (payload: AiChatRequest): Promise<AiChatResponse> => {
    const res = await apiClient.post<{ data: AiChatResponse }>('/ai/chat', payload);
    return res.data.data;
  },

  lessonChat: async (lessonId: string, payload: Omit<AiChatRequest, 'context'>): Promise<AiChatResponse> => {
    const res = await apiClient.post<{ data: AiChatResponse }>('/ai/lesson-chat', {
      lessonId,
      ...payload,
    });
    return res.data.data;
  },

  lessonSummary: async (lessonId: string): Promise<AiChatResponse> => {
    const res = await apiClient.post<{ data: AiChatResponse }>('/ai/lesson-summary', { lessonId });
    return res.data.data;
  },
};


