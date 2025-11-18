import { socketService } from './socketService';
import { useAuthStore } from '@/stores/authStore.enhanced';

/**
 * WebRTC Service
 * 
 * Quản lý WebRTC connections cho video/audio call
 * - Peer-to-peer video/audio streaming
 * - Screen sharing
 * - Media controls (mute, video on/off)
 * 
 * Sử dụng Socket.IO cho signaling (offer/answer/ICE candidates)
 */

export interface WebRTCPeer {
  userId: string;
  peerConnection: RTCPeerConnection;
  stream?: MediaStream;
  videoElement?: HTMLVideoElement;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

// Default STUN servers (free, Google provides)
const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

class WebRTCService {
  private peers: Map<string, WebRTCPeer> = new Map(); // userId -> Peer
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private currentSessionId: string | null = null;
  private config: WebRTCConfig;

  constructor() {
    this.config = {
      iceServers: DEFAULT_ICE_SERVERS,
    };
    this.setupSocketListeners();
  }

  /**
   * Setup Socket.IO listeners for WebRTC signaling
   */
  private setupSocketListeners(): void {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Listen for WebRTC events (matching backend event names)
    socket.on('webrtc:offer_received', this.handleOfferReceived.bind(this));
    socket.on('webrtc:answer_received', this.handleAnswerReceived.bind(this));
    socket.on('webrtc:ice_candidate_received', this.handleIceCandidateReceived.bind(this));
    socket.on('webrtc:user_joined', this.handleUserJoined.bind(this));
    socket.on('webrtc:user_left', this.handleUserLeft.bind(this));
    socket.on('webrtc:participants_list', this.handleParticipantsList.bind(this));
  }

  /**
   * Get user media (camera + microphone)
   */
  async getUserMedia(constraints: MediaStreamConstraints = {}): Promise<MediaStream> {
    try {
      const defaultConstraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
        ...constraints,
      };

      const stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
      this.localStream = stream;
      return stream;
    } catch (error) {
      console.error('[WebRTCService] Error getting user media:', error);
      throw error;
    }
  }

  /**
   * Get screen share stream
   */
  async getDisplayMedia(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        } as MediaTrackConstraints,
        audio: true,
      });

      this.screenStream = stream;

      // Stop screen share when user clicks stop in browser UI
      stream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };

      return stream;
    } catch (error) {
      console.error('[WebRTCService] Error getting display media:', error);
      throw error;
    }
  }

  /**
   * Stop local stream
   */
  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  /**
   * Stop screen share
   */
  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;

      // Notify other participants
      if (this.currentSessionId) {
        socketService.emit('webrtc:screen_share_stop', {
          sessionId: this.currentSessionId,
        });
      }
    }
  }

  /**
   * Join WebRTC session
   */
  async joinSession(sessionId: string, displayName?: string, role: 'instructor' | 'student' = 'student'): Promise<void> {
    this.currentSessionId = sessionId;

    const state = useAuthStore.getState();
    const user = state.user;

    // Get local media stream
    if (!this.localStream) {
      await this.getUserMedia();
    }

    // Emit join event (matching backend event name)
    socketService.emit('webrtc:join_session', {
      sessionId,
      displayName: displayName || user?.full_name || user?.email || 'User',
      role,
    });

    console.log(`[WebRTCService] Joined session: ${sessionId}`);
  }

  /**
   * Leave WebRTC session
   */
  async leaveSession(sessionId: string): Promise<void> {
    // Stop all peer connections
    this.peers.forEach((peer) => {
      peer.peerConnection.close();
      if (peer.stream) {
        peer.stream.getTracks().forEach((track) => track.stop());
      }
    });
    this.peers.clear();

    // Stop local streams
    this.stopLocalStream();
    this.stopScreenShare();

    // Emit leave event (matching backend event name)
    socketService.emit('webrtc:leave_session', { sessionId });

    this.currentSessionId = null;
    console.log(`[WebRTCService] Left session: ${sessionId}`);
  }

  /**
   * Create peer connection for a user
   */
  private createPeerConnection(userId: string): RTCPeerConnection {
    const peerConnection = new RTCPeerConnection(this.config);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.currentSessionId) {
        socketService.emit('webrtc:ice_candidate', {
          sessionId: this.currentSessionId,
          targetUserId: userId,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      const peer = this.peers.get(userId);
      if (peer) {
        peer.stream = remoteStream;
        // Trigger callback to update UI
        this.onRemoteStream?.(userId, remoteStream);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`[WebRTCService] Peer ${userId} connection state:`, peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed') {
        // Try to reconnect
        peerConnection.restartIce();
      }
    };

    return peerConnection;
  }

  /**
   * Create offer for a peer
   */
  private async createOffer(userId: string): Promise<void> {
    const peer = this.peers.get(userId);
    if (!peer) return;

    try {
      const offer = await peer.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peer.peerConnection.setLocalDescription(offer);

      // Send offer via Socket.IO (matching backend event name)
      if (this.currentSessionId) {
        socketService.emit('webrtc:offer', {
          sessionId: this.currentSessionId,
          targetUserId: userId,
          offer: offer,
        });
      }
    } catch (error) {
      console.error(`[WebRTCService] Error creating offer for ${userId}:`, error);
    }
  }

  /**
   * Handle offer received
   */
  private async handleOfferReceived(data: {
    sessionId: string;
    fromUserId: string;
    offer: RTCSessionDescriptionInit;
  }): Promise<void> {
    const { fromUserId, offer } = data;

    // Create or get peer connection
    if (!this.peers.has(fromUserId)) {
      const peerConnection = this.createPeerConnection(fromUserId);
      this.peers.set(fromUserId, {
        userId: fromUserId,
        peerConnection,
      });
    }

    const peer = this.peers.get(fromUserId)!;

    try {
      await peer.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      // Create answer
      const answer = await peer.peerConnection.createAnswer();
      await peer.peerConnection.setLocalDescription(answer);

      // Send answer via Socket.IO (matching backend event name)
      if (this.currentSessionId) {
        socketService.emit('webrtc:answer', {
          sessionId: this.currentSessionId,
          targetUserId: fromUserId,
          answer: answer,
        });
      }
    } catch (error) {
      console.error(`[WebRTCService] Error handling offer from ${fromUserId}:`, error);
    }
  }

  /**
   * Handle answer received
   */
  private async handleAnswerReceived(data: {
    sessionId: string;
    fromUserId: string;
    answer: RTCSessionDescriptionInit;
  }): Promise<void> {
    const { fromUserId, answer } = data;
    const peer = this.peers.get(fromUserId);

    if (!peer) {
      console.warn(`[WebRTCService] No peer connection for ${fromUserId}`);
      return;
    }

    try {
      await peer.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error(`[WebRTCService] Error handling answer from ${fromUserId}:`, error);
    }
  }

  /**
   * Handle ICE candidate received
   */
  private async handleIceCandidateReceived(data: {
    sessionId: string;
    fromUserId: string;
    candidate: RTCIceCandidateInit;
  }): Promise<void> {
    const { fromUserId, candidate } = data;
    const peer = this.peers.get(fromUserId);

    if (!peer) {
      console.warn(`[WebRTCService] No peer connection for ${fromUserId}`);
      return;
    }

    try {
      await peer.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error(`[WebRTCService] Error adding ICE candidate from ${fromUserId}:`, error);
    }
  }

  /**
   * Handle user joined
   */
  private handleUserJoined(data: { sessionId: string; participant: any }): void {
    const { participant } = data;
    console.log(`[WebRTCService] User joined: ${participant.userId}`);

    // Create peer connection for new user
    if (!this.peers.has(participant.userId)) {
      const peerConnection = this.createPeerConnection(participant.userId);
      this.peers.set(participant.userId, {
        userId: participant.userId,
        peerConnection,
      });

      // Create offer
      this.createOffer(participant.userId);
    }

    // Trigger callback
    this.onUserJoined?.(participant);
  }

  /**
   * Handle user left
   */
  private handleUserLeft(data: { sessionId: string; userId: string }): void {
    const { userId } = data;
    console.log(`[WebRTCService] User left: ${userId}`);

    // Close peer connection
    const peer = this.peers.get(userId);
    if (peer) {
      peer.peerConnection.close();
      if (peer.stream) {
        peer.stream.getTracks().forEach((track) => track.stop());
      }
      this.peers.delete(userId);
    }

    // Trigger callback
    this.onUserLeft?.(userId);
  }

  /**
   * Handle participants list
   */
  private handleParticipantsList(data: { sessionId: string; participants: any[] }): void {
    const { participants } = data;
    console.log(`[WebRTCService] Participants list:`, participants);

    // Create peer connections for existing participants
    participants.forEach((participant) => {
      if (!this.peers.has(participant.userId)) {
        const peerConnection = this.createPeerConnection(participant.userId);
        this.peers.set(participant.userId, {
          userId: participant.userId,
          peerConnection,
        });

        // Create offer
        this.createOffer(participant.userId);
      }
    });

    // Trigger callback
    this.onParticipantsList?.(participants);
  }

  /**
   * Toggle audio (mute/unmute)
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });

      if (this.currentSessionId) {
        socketService.emit('webrtc:toggle_audio', {
          sessionId: this.currentSessionId,
          mediaType: 'audio',
          enabled,
        });
      }
    }
  }

  /**
   * Toggle video (on/off)
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });

      if (this.currentSessionId) {
        socketService.emit('webrtc:toggle_video', {
          sessionId: this.currentSessionId,
          mediaType: 'video',
          enabled,
        });
      }
    }
  }

  /**
   * Start screen share
   */
  async startScreenShare(): Promise<void> {
    try {
      const screenStream = await this.getDisplayMedia();

      // Replace video track in all peer connections
      this.peers.forEach((peer) => {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peer.peerConnection.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      if (this.currentSessionId) {
        socketService.emit('webrtc:screen_share_start', {
          sessionId: this.currentSessionId,
        });
      }
    } catch (error) {
      console.error('[WebRTCService] Error starting screen share:', error);
      throw error;
    }
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get peer stream
   */
  getPeerStream(userId: string): MediaStream | undefined {
    return this.peers.get(userId)?.stream;
  }

  /**
   * Get all peers
   */
  getPeers(): Map<string, WebRTCPeer> {
    return this.peers;
  }

  /**
   * Callbacks (set by components)
   */
  onRemoteStream?: (userId: string, stream: MediaStream) => void;
  onUserJoined?: (participant: any) => void;
  onUserLeft?: (userId: string) => void;
  onParticipantsList?: (participants: any[]) => void;
}

// Export singleton instance
export const webrtcService = new WebRTCService();
export default webrtcService;

