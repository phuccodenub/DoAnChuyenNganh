import { useMutation } from '@tanstack/react-query';
import { aiApi, type AiChatRequest, type AiChatResponse } from '@/services/api/ai.api';

export function useAiChat() {
  return useMutation<AiChatResponse, any, AiChatRequest>({
    mutationFn: (payload) => aiApi.chat(payload),
  });
}

export function useLessonAiChat(lessonId: string | undefined) {
  return useMutation<AiChatResponse, any, Omit<AiChatRequest, 'context'>>({
    mutationFn: (payload) => aiApi.lessonChat(lessonId!, payload),
    meta: { requiresLessonId: true },
  });
}

export function useLessonSummary(lessonId: string | undefined) {
  return useMutation<AiChatResponse, any, void>({
    mutationFn: () => aiApi.lessonSummary(lessonId!),
    meta: { requiresLessonId: true },
  });
}


