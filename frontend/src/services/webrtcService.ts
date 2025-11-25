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
  status?: 'idle' | 'awaiting-answer' | 'stable';
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
  private currentUserId: string | null = null;
  private config: WebRTCConfig;
  private listenersRegistered = false;
  private readonly preferredCameraKey = 'livestream:cameraDevice';
  private readonly preferredMicrophoneKey = 'livestream:microphoneDevice';
  private isPublishing = false;

  constructor() {
    this.config = {
      iceServers: DEFAULT_ICE_SERVERS,
    };
  }

  /**
   * Configure ICE servers (STUN/TURN) at runtime
   */
  configure(config?: Partial<WebRTCConfig>) {
    if (config?.iceServers && config.iceServers.length > 0) {
      this.config = {
        ...this.config,
        iceServers: config.iceServers.map((server) => ({ ...server })),
      };
      console.log('[WebRTCService] ICE servers configured:', this.config.iceServers);
    } else {
      this.config = {
        ...this.config,
        iceServers: DEFAULT_ICE_SERVERS,
      };
      console.log('[WebRTCService] Using default ICE servers:', this.config.iceServers);
    }
  }

  /**
   * Setup Socket.IO listeners for WebRTC signaling
   */
  private setupSocketListeners(): void {
    if (this.listenersRegistered) return;
    const socket = socketService.getSocket();
    if (!socket) return;

    // Remove old listeners nếu có để tránh duplicate
    socket.off('webrtc:offer_received');
    socket.off('webrtc:answer_received');
    socket.off('webrtc:ice_candidate_received');
    socket.off('webrtc:user_joined');
    socket.off('webrtc:user_left');
    socket.off('webrtc:participants_list');

    // Listen for WebRTC events (matching backend event names)
    socket.on('webrtc:offer_received', this.handleOfferReceived.bind(this));
    socket.on('webrtc:answer_received', this.handleAnswerReceived.bind(this));
    socket.on('webrtc:ice_candidate_received', this.handleIceCandidateReceived.bind(this));
    socket.on('webrtc:user_joined', this.handleUserJoined.bind(this));
    socket.on('webrtc:user_left', this.handleUserLeft.bind(this));
    socket.on('webrtc:participants_list', this.handleParticipantsList.bind(this));
    this.listenersRegistered = true;
    console.log('[WebRTCService] Socket listeners registered');
  }

  /**
   * Get user media (camera + microphone)
   */
  private getPreferredDevice(key: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async getUserMedia(constraints: MediaStreamConstraints = {}, skipPreferred = false): Promise<MediaStream> {
    try {
      const preferredCamera = skipPreferred ? null : this.getPreferredDevice(this.preferredCameraKey);
      const preferredMic = skipPreferred ? null : this.getPreferredDevice(this.preferredMicrophoneKey);

      const baseVideo: MediaTrackConstraints = {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: 'user',
      };
      const baseAudio: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 2,
      };

      let videoConstraints: MediaTrackConstraints | boolean =
        typeof constraints.video === 'undefined' ? baseVideo : constraints.video;
      let audioConstraints: MediaTrackConstraints | boolean =
        typeof constraints.audio === 'undefined' ? baseAudio : constraints.audio;

      if (typeof videoConstraints === 'object') {
        videoConstraints = {
          ...baseVideo,
          ...videoConstraints,
        };
      } else if (videoConstraints === true) {
        videoConstraints = baseVideo;
      }

      if (typeof audioConstraints === 'object') {
        audioConstraints = {
          ...baseAudio,
          ...audioConstraints,
        };
      } else if (audioConstraints === true) {
        audioConstraints = baseAudio;
      }

      if (preferredCamera && typeof videoConstraints === 'object') {
        videoConstraints = {
          ...(videoConstraints as MediaTrackConstraints),
          deviceId: { exact: preferredCamera },
        };
      }

      if (preferredMic && typeof audioConstraints === 'object') {
        audioConstraints = {
          ...(audioConstraints as MediaTrackConstraints),
          deviceId: { exact: preferredMic },
        };
      }

      const defaultConstraints: MediaStreamConstraints = {
        video: videoConstraints,
        audio: audioConstraints,
      };

      const stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
      
      // Tối ưu track settings cho low latency
      stream.getVideoTracks().forEach((track) => {
        const settings = track.getSettings();
        // Đảm bảo frame rate ổn định
        if (settings.frameRate && settings.frameRate > 30) {
          track.applyConstraints({ frameRate: 30 }).catch(console.error);
        }
      });
      
      this.localStream = stream;
      return stream;
    } catch (error: any) {
      if (
        !skipPreferred &&
        error?.name === 'OverconstrainedError' &&
        (this.getPreferredDevice(this.preferredCameraKey) || this.getPreferredDevice(this.preferredMicrophoneKey))
      ) {
        console.warn('[WebRTCService] Preferred device unavailable, retrying with default constraints');
        return this.getUserMedia(constraints, true);
      }
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
  async joinSession(
    sessionId: string,
    displayName?: string,
    role: 'instructor' | 'student' | 'admin' = 'student',
    options: { sendMedia?: boolean } = { sendMedia: true }
  ): Promise<void> {
    // Cleanup previous session if exists
    if (this.currentSessionId && this.currentSessionId !== sessionId) {
      await this.leaveSession(this.currentSessionId);
    }

    this.currentSessionId = sessionId;

    const socket = await socketService.connect();
    if (!socket) {
      throw new Error('Không thể kết nối Socket.IO để sử dụng WebRTC');
    }
    
    // Setup listeners trước khi join để đảm bảo không bỏ lỡ events
    this.listenersRegistered = false;
    this.setupSocketListeners();

    const state = useAuthStore.getState();
    const user = state.user;
    this.currentUserId = user?.id ? String(user.id) : null;

    const shouldSendMedia = options.sendMedia !== false;
    this.isPublishing = shouldSendMedia;

    // Get local media stream
    if (shouldSendMedia && !this.localStream) {
      await this.getUserMedia();
    }

    // Emit join event (matching backend event name)
    const fallbackName =
      (user && (user as any)?.full_name) ||
      (user && (user as any)?.fullName) ||
      user?.email ||
      'User';
    socketService.emit('webrtc:join_session', {
      sessionId,
      displayName: displayName || fallbackName,
      role,
      sendMedia: shouldSendMedia,
    });

    console.log(`[WebRTCService] Joined session: ${sessionId} (publishing: ${shouldSendMedia})`);
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
    this.currentUserId = null;
    this.isPublishing = false;
    console.log(`[WebRTCService] Left session: ${sessionId}`);
  }

  /**
   * Create peer connection for a user
   */
  private createPeerConnection(userId: string): RTCPeerConnection {
    // Tối ưu config cho độ trễ thấp nhất
    const optimizedConfig: RTCConfiguration = {
      ...this.config,
      // Tối ưu ICE gathering
      iceCandidatePoolSize: 10,
      // Bundle policy để giảm số lượng connection
      bundlePolicy: 'max-bundle',
      // RTCP mux để giảm overhead
      rtcpMuxPolicy: 'require',
      // Tối ưu cho low latency
      iceTransportPolicy: 'all',
    };

    console.log(`[WebRTCService] Creating peer connection for ${userId} with ICE servers:`, optimizedConfig.iceServers);
    const peerConnection = new RTCPeerConnection(optimizedConfig);

    // Tối ưu codec ưu tiên (VP8/VP9 cho video, Opus cho audio - tốt cho low latency)
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        const sender = peerConnection.addTrack(track, this.localStream!);
        
        // Tối ưu video codec cho low latency
        if (track.kind === 'video') {
          const params = sender.getParameters();
          if (params.codecs && params.codecs.length > 0) {
            // Ưu tiên VP8/VP9 (tốt hơn H.264 cho real-time)
            params.codecs.sort((a, b) => {
              const aPriority = a.mimeType.includes('VP8') || a.mimeType.includes('VP9') ? 1 : 0;
              const bPriority = b.mimeType.includes('VP8') || b.mimeType.includes('VP9') ? 1 : 0;
              return bPriority - aPriority;
            });
            sender.setParameters(params);
          }
        }
        
        // Tối ưu bitrate cho low latency (giảm buffer)
        if (track.kind === 'video') {
          const transceiver = peerConnection.getTransceivers().find(
            (t) => t.sender === sender
          );
          if (transceiver && transceiver.sender.track) {
            const constraints = {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 },
            };
            track.applyConstraints(constraints).catch(console.error);
          }
        }
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
      const state = peerConnection.connectionState;
      console.log(`[WebRTCService] Peer ${userId} connection state:`, state);
      
      if (state === 'failed') {
        console.warn(`[WebRTCService] Peer ${userId} connection failed, attempting ICE restart...`);
        // Try to reconnect
        peerConnection.restartIce();
      } else if (state === 'connected') {
        console.log(`[WebRTCService] Peer ${userId} connection established successfully`);
      } else if (state === 'disconnected') {
        console.warn(`[WebRTCService] Peer ${userId} connection disconnected`);
      }
    };

    // Handle ICE connection state changes (more detailed)
    peerConnection.oniceconnectionstatechange = () => {
      const iceState = peerConnection.iceConnectionState;
      console.log(`[WebRTCService] Peer ${userId} ICE connection state:`, iceState);
      
      if (iceState === 'failed') {
        console.warn(`[WebRTCService] Peer ${userId} ICE connection failed, restarting ICE...`);
        peerConnection.restartIce();
      } else if (iceState === 'connected' || iceState === 'completed') {
        console.log(`[WebRTCService] Peer ${userId} ICE connection ${iceState}`);
      }
    };

    // Handle ICE gathering state
    peerConnection.onicegatheringstatechange = () => {
      console.log(`[WebRTCService] Peer ${userId} ICE gathering state:`, peerConnection.iceGatheringState);
    };

    return peerConnection;
  }

  private registerPeer(userId: string, connection: RTCPeerConnection): WebRTCPeer {
    const entry: WebRTCPeer = {
      userId,
      peerConnection: connection,
      status: 'idle',
    };
    this.peers.set(userId, entry);
    return entry;
  }

  /**
   * Create offer for a peer
   */
  private async createOffer(userId: string): Promise<void> {
    const peer = this.peers.get(userId);
    if (!peer) {
      console.warn(`[WebRTCService] Cannot create offer: peer ${userId} not found`);
      return;
    }
    if (peer.status === 'awaiting-answer') {
      console.debug(`[WebRTCService] Skipping offer for ${userId}, awaiting answer`);
      return;
    }

    try {
      console.log(`[WebRTCService] Creating offer for ${userId}...`);
      // Tối ưu offer cho low latency
      const offer = await peer.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peer.peerConnection.setLocalDescription(offer);
      peer.status = 'awaiting-answer';

      // Send offer via Socket.IO (matching backend event name)
      if (this.currentSessionId) {
        socketService.emit('webrtc:offer', {
          sessionId: this.currentSessionId,
          targetUserId: userId,
          offer: offer,
        });
        console.log(`[WebRTCService] Offer sent to ${userId} via Socket.IO`);
      } else {
        console.warn(`[WebRTCService] Cannot send offer: no current session ID`);
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

    console.log(`[WebRTCService] Offer received from ${fromUserId}`);

    // Đảm bảo session ID khớp
    if (data.sessionId !== this.currentSessionId) {
      console.warn(`[WebRTCService] Offer from different session (${data.sessionId} vs ${this.currentSessionId}), ignoring`);
      return;
    }

    // Ignore offer from self
    if (fromUserId === this.currentUserId) {
      console.debug('[WebRTCService] Ignoring offer from self.');
      return;
    }

    let wrapper = this.peers.get(fromUserId);
    if (!wrapper) {
      console.log(`[WebRTCService] Creating peer connection for offer from ${fromUserId}`);
      const peerConnection = this.createPeerConnection(fromUserId);
      wrapper = this.registerPeer(fromUserId, peerConnection);
    }

    // Nếu connection đã stable và có remote description, bỏ qua duplicate offer
    const pc = wrapper.peerConnection;
    if (pc.signalingState === 'stable' && pc.currentRemoteDescription && pc.currentRemoteDescription.type === 'offer') {
      console.debug(`[WebRTCService] Ignoring duplicate offer from ${fromUserId}, connection already stable.`);
      return;
    }

    const applyOffer = async (peer: WebRTCPeer) => {
      const connection = peer.peerConnection;
      await connection.setRemoteDescription(new RTCSessionDescription(offer));
      await this.flushPendingIceCandidates(fromUserId);

      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);
      peer.status = 'stable';

      if (this.currentSessionId) {
        socketService.emit('webrtc:answer', {
          sessionId: this.currentSessionId,
          targetUserId: fromUserId,
          answer,
        });
        console.log(`[WebRTCService] Answer sent to ${fromUserId}`);
      }
    };

    try {
      await applyOffer(wrapper);
    } catch (err) {
      if (err instanceof Error && err.name === 'InvalidStateError') {
        const currentState = wrapper.peerConnection.signalingState;
        console.warn(
          `[WebRTCService] Offer could not be applied (state=${currentState}), recreating peer for ${fromUserId}`,
        );
        wrapper.peerConnection.close();
        this.peers.delete(fromUserId);
        const peerConnection = this.createPeerConnection(fromUserId);
        wrapper = this.registerPeer(fromUserId, peerConnection);

        try {
          await applyOffer(wrapper);
        } catch (retryError) {
          console.error('[WebRTCService] Offer retry failed:', retryError);
        }
      } else {
        console.error(`[WebRTCService] Error handling offer from ${fromUserId}:`, err);
      }
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
    
    console.log(`[WebRTCService] Answer received from ${fromUserId}`);

    // Đảm bảo session ID khớp
    if (data.sessionId !== this.currentSessionId) {
      console.warn(`[WebRTCService] Answer from different session (${data.sessionId} vs ${this.currentSessionId}), ignoring`);
      return;
    }

    const peer = this.peers.get(fromUserId);

    if (!peer) {
      console.warn(`[WebRTCService] No peer connection for ${fromUserId}`);
      return;
    }

    const pc = peer.peerConnection;
    if (
      pc.signalingState === 'stable' &&
      pc.currentRemoteDescription &&
      pc.currentRemoteDescription.type === 'answer'
    ) {
      console.debug('[WebRTCService] Duplicate answer received while connection already stable, ignoring.');
      return;
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      peer.status = 'stable';
      await this.flushPendingIceCandidates(fromUserId);
      console.log(`[WebRTCService] Answer applied successfully for ${fromUserId}`);
    } catch (error) {
      if (error instanceof Error && error.name === 'InvalidStateError') {
        if (pc.signalingState === 'stable') {
          console.debug('[WebRTCService] Received duplicate answer after connection stable, ignoring.');
          peer.status = 'stable';
          return;
        }

        console.warn(
          `[WebRTCService] Answer could not be applied (state=${peer.peerConnection.signalingState}), recreating peer for ${fromUserId}`,
        );
        peer.peerConnection.close();
        this.peers.delete(fromUserId);

        const peerConnection = this.createPeerConnection(fromUserId);
        const peerEntry = this.registerPeer(fromUserId, peerConnection);

        try {
          await peerEntry.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          peerEntry.status = 'stable';
          await this.flushPendingIceCandidates(fromUserId);
          console.log(`[WebRTCService] Answer retry successful for ${fromUserId}`);
        } catch (retryError) {
          if (retryError instanceof Error && retryError.name === 'InvalidStateError') {
            console.debug('[WebRTCService] Retry answer still invalid state; ignoring as connection likely already stable.');
            return;
          }
          console.error('[WebRTCService] Answer retry failed:', retryError);
        }
      } else {
        console.error(`[WebRTCService] Error handling answer from ${fromUserId}:`, error);
      }
    }
  }

  /**
   * Handle ICE candidate received
   */
  private pendingIceCandidates: Map<string, RTCIceCandidateInit[]> = new Map();

  private async flushPendingIceCandidates(userId: string): Promise<void> {
    const pending = this.pendingIceCandidates.get(userId);
    if (!pending || pending.length === 0) {
      return;
    }

    const peer = this.peers.get(userId);
    if (!peer) {
      this.pendingIceCandidates.delete(userId);
      return;
    }

    const pc = peer.peerConnection;
    if (!pc.remoteDescription) {
      return;
    }

    // Add all pending candidates sequentially
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        // Ignore errors for null candidates (end of gathering)
        if (candidate.candidate && candidate.candidate !== '') {
          console.error(`[WebRTCService] Error adding pending ICE candidate for ${userId}:`, error);
        }
      }
    }

    this.pendingIceCandidates.delete(userId);
    console.log(`[WebRTCService] Flushed ${pending.length} pending ICE candidates for ${userId}`);
  }

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

    const pc = peer.peerConnection;
    const remoteSet = pc.remoteDescription !== null;

    if (!remoteSet) {
      const pending = this.pendingIceCandidates.get(fromUserId) || [];
      pending.push(candidate);
      this.pendingIceCandidates.set(fromUserId, pending);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error(`[WebRTCService] Error adding ICE candidate from ${fromUserId}:`, error);
    }
  }

  /**
   * Handle user joined
   */
  private handleUserJoined(data: { sessionId: string; participant: any }): void {
    const { participant } = data;
    
    // Đảm bảo session ID khớp
    if (data.sessionId !== this.currentSessionId) {
      console.warn(`[WebRTCService] User joined different session (${data.sessionId} vs ${this.currentSessionId}), ignoring`);
      return;
    }

    console.log(`[WebRTCService] User joined: ${participant.userId} (sendMedia: ${participant.sendMedia})`);

    if (participant.userId === this.currentUserId) {
      return;
    }

    // Create peer connection for new user
    if (!this.peers.has(participant.userId)) {
      const peerConnection = this.createPeerConnection(participant.userId);
      const peer = this.registerPeer(participant.userId, peerConnection);

      // Nếu mình đang publish (host), tạo offer cho tất cả participants
      // Nếu mình không publish (viewer), chỉ chờ nhận offer từ host
      if (this.isPublishing) {
        console.log(`[WebRTCService] Creating offer for new participant ${participant.userId} (host publishing)`);
        this.createOffer(peer.userId);
      } else {
        console.log(`[WebRTCService] Waiting for offer from ${participant.userId} (viewer mode)`);
      }
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
    console.log(`[WebRTCService] Participants list received:`, participants.map(p => ({ userId: p.userId, sendMedia: p.sendMedia })));

    // Đảm bảo session ID khớp
    if (data.sessionId !== this.currentSessionId) {
      console.warn(`[WebRTCService] Participants list for different session (${data.sessionId} vs ${this.currentSessionId}), ignoring`);
      return;
    }

    // Create peer connections for existing participants
    participants.forEach((participant) => {
      if (participant.userId === this.currentUserId) {
        return;
      }

      // Chỉ tạo peer connection nếu chưa có
      if (!this.peers.has(participant.userId)) {
        const peerConnection = this.createPeerConnection(participant.userId);
        const peer = this.registerPeer(participant.userId, peerConnection);

        // Nếu mình đang publish (host), tạo offer cho tất cả participants
        // Nếu mình không publish (viewer), chỉ chờ nhận offer từ host
        if (this.isPublishing) {
          console.log(`[WebRTCService] Creating offer for existing participant ${participant.userId} (host publishing)`);
          this.createOffer(peer.userId);
        } else {
          console.log(`[WebRTCService] Waiting for offer from ${participant.userId} (viewer mode)`);
        }
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

