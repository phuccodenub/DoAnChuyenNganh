/**
 * Types for Create LiveStream Page
 */

export type VideoSource = 'webcam' | 'software';
export type AudienceType = 'public' | 'followers' | 'private';
export type GoLiveTiming = 'now' | 'schedule';

export interface CreateSessionForm {
  course_id?: string;
  title: string;
  description?: string;
  scheduled_start: string;
  duration_minutes: number;
  meeting_url?: string;
  meeting_password?: string;
  platform?: string;
  category?: string;
  thumbnail_url?: string;
  videoSource: VideoSource;
  cameraDevice: string;
  microphoneDevice: string;
  shareScreen: boolean;
  shareToStory: boolean;
  notifyFollowers: boolean;
  crosspostGroup: boolean;
  audience: AudienceType;
  goLiveTiming: GoLiveTiming;
  presetCommentEnabled: boolean;
  presetComment?: string;
  stream_key: string;
  server_url: string;
  usePersistentKey: boolean;
  enableBackupStream: boolean;
  playback_url?: string;
  webrtcRoomId: string;
}

