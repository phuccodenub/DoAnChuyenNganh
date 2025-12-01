/**
 * Moderation API Service
 * 
 * API calls for livestream moderation and policy management
 */

import { httpClient } from '../http/client';

export interface LivestreamPolicy {
  id: string;
  session_id: string;
  comment_moderation_enabled: boolean;
  comment_ai_moderation: boolean;
  comment_manual_moderation: boolean;
  comment_blocked_keywords: string[];
  comment_max_length: number | null;
  comment_min_interval_seconds: number | null;
  content_moderation_enabled: boolean;
  content_ai_moderation: boolean;
  content_blocked_keywords: string[];
  auto_block_violations: boolean;
  auto_warn_violations: boolean;
  violation_threshold: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface CommentModeration {
  id: string;
  message_id: string | null; // Can be null if comment was blocked before saving
  session_id: string;
  user_id: string;
  sender_name: string; // User name who sent the comment
  sender_avatar?: string | null; // User avatar
  message_content: string; // The actual message content
  status: 'pending' | 'approved' | 'rejected' | 'blocked' | 'flagged';
  ai_checked: boolean;
  ai_risk_score: number | null;
  ai_risk_categories: string[];
  ai_reason: string | null;
  moderated_by: string | null;
  moderation_reason: string | null;
  moderated_at: string | null;
  violation_count: number;
  created_at: string;
  updated_at: string;
}

export interface UpdatePolicyPayload {
  comment_moderation_enabled?: boolean;
  comment_ai_moderation?: boolean;
  comment_manual_moderation?: boolean;
  comment_blocked_keywords?: string[];
  comment_max_length?: number;
  comment_min_interval_seconds?: number;
  content_moderation_enabled?: boolean;
  content_ai_moderation?: boolean;
  content_blocked_keywords?: string[];
  auto_block_violations?: boolean;
  auto_warn_violations?: boolean;
  violation_threshold?: number;
}

export interface ModerateCommentPayload {
  action: 'approve' | 'reject' | 'block';
  reason?: string;
}

const BASE_PATH = '/moderation';

export const moderationApi = {
  /**
   * Get policy for a session
   */
  getPolicy: async (sessionId: string): Promise<LivestreamPolicy> => {
    const response = await httpClient.get(`${BASE_PATH}/sessions/${sessionId}/policy`);
    return response.data.data;
  },

  /**
   * Update policy for a session
   */
  updatePolicy: async (
    sessionId: string,
    data: UpdatePolicyPayload
  ): Promise<LivestreamPolicy> => {
    const response = await httpClient.put(
      `${BASE_PATH}/sessions/${sessionId}/policy`,
      data
    );
    return response.data.data;
  },

  /**
   * Get moderation history for a session
   */
  getModerationHistory: async (
    sessionId: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<{ data: CommentModeration[]; total?: number }> => {
    const response = await httpClient.get(
      `${BASE_PATH}/sessions/${sessionId}/moderation-history`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Manually moderate a comment
   */
  moderateComment: async (
    messageId: string,
    data: ModerateCommentPayload
  ): Promise<CommentModeration> => {
    const response = await httpClient.post(
      `${BASE_PATH}/messages/${messageId}/moderate`,
      data
    );
    return response.data.data;
  },

  /**
   * Unban a user (reset violation count)
   */
  unbanUser: async (
    sessionId: string,
    userId: string
  ): Promise<{ sessionId: string; userId: string; unbannedBy: string; unbannedAt: string }> => {
    const response = await httpClient.post(
      `${BASE_PATH}/sessions/${sessionId}/users/${userId}/unban`
    );
    return response.data.data;
  },
};

