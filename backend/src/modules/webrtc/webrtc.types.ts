/**
 * WebRTC Module Types
 * Types for WebRTC signaling server
 */

// ===== WEBRTC BASIC TYPES =====

export interface RTCSessionDescriptionInit {
  type: 'offer' | 'answer';
  sdp: string;
}

export interface RTCIceCandidateInit {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
}

export interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

// ===== SOCKET EVENT TYPES =====

export enum WebRTCSocketEvents {
  // Client to Server
  JOIN_SESSION = 'webrtc:join_session',
  LEAVE_SESSION = 'webrtc:leave_session',
  OFFER = 'webrtc:offer',
  ANSWER = 'webrtc:answer',
  ICE_CANDIDATE = 'webrtc:ice_candidate',
  SCREEN_SHARE_START = 'webrtc:screen_share_start',
  SCREEN_SHARE_STOP = 'webrtc:screen_share_stop',
  TOGGLE_AUDIO = 'webrtc:toggle_audio',
  TOGGLE_VIDEO = 'webrtc:toggle_video',
  RAISE_HAND = 'webrtc:raise_hand',
  LOWER_HAND = 'webrtc:lower_hand',

  // Server to Client
  USER_JOINED = 'webrtc:user_joined',
  USER_LEFT = 'webrtc:user_left',
  OFFER_RECEIVED = 'webrtc:offer_received',
  ANSWER_RECEIVED = 'webrtc:answer_received',
  ICE_CANDIDATE_RECEIVED = 'webrtc:ice_candidate_received',
  PARTICIPANTS_LIST = 'webrtc:participants_list',
  USER_AUDIO_TOGGLED = 'webrtc:user_audio_toggled',
  USER_VIDEO_TOGGLED = 'webrtc:user_video_toggled',
  SCREEN_SHARE_STARTED = 'webrtc:screen_share_started',
  SCREEN_SHARE_STOPPED = 'webrtc:screen_share_stopped',
  HAND_RAISED = 'webrtc:hand_raised',
  HAND_LOWERED = 'webrtc:hand_lowered',
  ERROR = 'webrtc:error',
  SESSION_ENDED = 'webrtc:session_ended',
}

// ===== SESSION TYPES =====

export interface JoinSessionData {
  sessionId: string;
  userId: string;
  displayName?: string;
  role?: 'instructor' | 'student';
}

export interface LeaveSessionData {
  sessionId: string;
  userId: string;
}

// ===== WEBRTC SIGNALING TYPES =====

export interface OfferData {
  sessionId: string;
  targetUserId: string;
  offer: RTCSessionDescriptionInit;
}

export interface AnswerData {
  sessionId: string;
  targetUserId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidateData {
  sessionId: string;
  targetUserId: string;
  candidate: RTCIceCandidateInit;
}

// ===== PARTICIPANT TYPES =====

export interface Participant {
  userId: string;
  socketId: string;
  displayName: string;
  role: 'instructor' | 'student';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  joinedAt: Date;
}

export interface Session {
  sessionId: string;
  participants: Map<string, Participant>; // userId -> Participant
  createdAt: Date;
  lastActivity: Date;
}

// ===== CONTROL TYPES =====

export interface ToggleMediaData {
  sessionId: string;
  mediaType: 'audio' | 'video';
  enabled: boolean;
}

export interface ScreenShareData {
  sessionId: string;
  userId: string;
}

export interface RaiseHandData {
  sessionId: string;
  userId: string;
}

// ===== RESPONSE TYPES =====

export interface ParticipantsListData {
  sessionId: string;
  participants: Participant[];
}

export interface UserJoinedData {
  sessionId: string;
  participant: Participant;
}

export interface UserLeftData {
  sessionId: string;
  userId: string;
}

// ===== ERROR TYPES =====

export interface WebRTCError {
  code: string;
  message: string;
  details?: unknown;
}

export enum WebRTCErrorCodes {
  UNAUTHORIZED = 'WEBRTC_UNAUTHORIZED',
  SESSION_NOT_FOUND = 'WEBRTC_SESSION_NOT_FOUND',
  USER_NOT_IN_SESSION = 'WEBRTC_USER_NOT_IN_SESSION',
  TARGET_USER_NOT_FOUND = 'WEBRTC_TARGET_USER_NOT_FOUND',
  INVALID_OFFER = 'WEBRTC_INVALID_OFFER',
  INVALID_ANSWER = 'WEBRTC_INVALID_ANSWER',
  INVALID_CANDIDATE = 'WEBRTC_INVALID_CANDIDATE',
  SESSION_FULL = 'WEBRTC_SESSION_FULL',
  PERMISSION_DENIED = 'WEBRTC_PERMISSION_DENIED',
  SERVER_ERROR = 'WEBRTC_SERVER_ERROR',
}

// ===== CONFIGURATION TYPES =====

export interface WebRTCConfig {
  maxParticipants: number;
  iceServers: RTCIceServer[];
  sessionTimeout: number; // in milliseconds
}

// ===== STATISTICS TYPES =====

export interface SessionStatistics {
  sessionId: string;
  totalParticipants: number;
  activeParticipants: number;
  duration: number; // in seconds
  audioEnabled: number;
  videoEnabled: number;
  screenSharing: number;
  handsRaised: number;
}
