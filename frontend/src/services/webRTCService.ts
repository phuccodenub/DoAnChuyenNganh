/**
 * WebRTC Service for Live Streaming
 * Handles video calls and live streaming without database dependencies
 */

export interface StreamParticipant {
  id: string
  name: string
  role: 'instructor' | 'student'
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  stream?: MediaStream
}

export interface LiveStreamState {
  isStreaming: boolean
  isJoined: boolean
  participants: Map<string, StreamParticipant>
  localStream?: MediaStream
  remoteStreams: Map<string, MediaStream>
}

class WebRTCService {
  private localStream?: MediaStream
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private socketService: any = null
  private currentCourseId?: string
  private isInstructor: boolean = false
  private callbacks: Map<string, Function[]> = new Map()

  // WebRTC configuration
  private config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  }

  constructor() {
    // Initialize callback maps
    this.callbacks.set('stream-added', [])
    this.callbacks.set('stream-removed', [])
    this.callbacks.set('participant-joined', [])
    this.callbacks.set('participant-left', [])
    this.callbacks.set('stream-started', [])
    this.callbacks.set('stream-ended', [])
  }

  // Initialize with socket service
  initialize(socketService: any, courseId: string, userRole: string) {
    this.socketService = socketService
    this.currentCourseId = courseId
    this.isInstructor = userRole === 'instructor'
    this.setupSocketListeners()
  }

  // Start local media capture
  async startLocalStream(video: boolean = true, audio: boolean = true): Promise<MediaStream | null> {
    try {
      const constraints: MediaStreamConstraints = {
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } : false
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      this.emit('stream-added', {
        stream: this.localStream,
        participantId: 'local',
        isLocal: true
      })

      return this.localStream
    } catch (error) {
      console.error('Failed to start local stream:', error)
      throw new Error('Camera/microphone access denied or not available')
    }
  }

  // Stop local stream
  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop()
      })
      this.localStream = undefined
      this.emit('stream-removed', { participantId: 'local' })
    }
  }

  // Start live streaming (instructor only)
  async startLiveStream(): Promise<boolean> {
    if (!this.isInstructor) {
      throw new Error('Only instructors can start live streams')
    }

    try {
      // Start local media
      await this.startLocalStream(true, true)
      
      // Notify via socket that stream is starting
      if (this.socketService) {
        this.socketService.emit('start-livestream', {
          courseId: this.currentCourseId,
          streamId: `stream-${Date.now()}`
        })
      }

      this.emit('stream-started', { courseId: this.currentCourseId })
      return true
    } catch (error) {
      console.error('Failed to start live stream:', error)
      return false
    }
  }

  // Join live stream (students)
  async joinLiveStream(): Promise<boolean> {
    try {
      // Students typically join with audio muted
      await this.startLocalStream(false, true)
      
      if (this.socketService) {
        this.socketService.emit('join-livestream', {
          courseId: this.currentCourseId
        })
      }

      return true
    } catch (error) {
      console.error('Failed to join live stream:', error)
      return false
    }
  }

  // Create peer connection for a participant
  async createPeerConnection(participantId: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection(this.config)
    
    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // Handle incoming streams
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams
      this.emit('stream-added', {
        stream: remoteStream,
        participantId,
        isLocal: false
      })
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socketService) {
        this.socketService.emit('ice-candidate', {
          courseId: this.currentCourseId,
          candidate: event.candidate,
          to: participantId
        })
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Peer connection state: ${peerConnection.connectionState}`)
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed') {
        this.removePeerConnection(participantId)
      }
    }

    this.peerConnections.set(participantId, peerConnection)
    return peerConnection
  }

  // Create and send offer
  async createOffer(participantId: string): Promise<void> {
    const peerConnection = await this.createPeerConnection(participantId)
    
    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
      
      await peerConnection.setLocalDescription(offer)
      
      if (this.socketService) {
        this.socketService.emit('webrtc-offer', {
          courseId: this.currentCourseId,
          offer: offer,
          to: participantId
        })
      }
    } catch (error) {
      console.error('Failed to create offer:', error)
    }
  }

  // Handle incoming offer
  async handleOffer(participantId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = await this.createPeerConnection(participantId)
    
    try {
      await peerConnection.setRemoteDescription(offer)
      
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)
      
      if (this.socketService) {
        this.socketService.emit('webrtc-answer', {
          courseId: this.currentCourseId,
          answer: answer,
          to: participantId
        })
      }
    } catch (error) {
      console.error('Failed to handle offer:', error)
    }
  }

  // Handle incoming answer
  async handleAnswer(participantId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.peerConnections.get(participantId)
    
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(answer)
      } catch (error) {
        console.error('Failed to handle answer:', error)
      }
    }
  }

  // Handle ICE candidate
  async handleIceCandidate(participantId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.peerConnections.get(participantId)
    
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(candidate)
      } catch (error) {
        console.error('Failed to handle ICE candidate:', error)
      }
    }
  }

  // Toggle video
  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        return videoTrack.enabled
      }
    }
    return false
  }

  // Toggle audio
  toggleAudio(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return audioTrack.enabled
      }
    }
    return false
  }

  // End live stream
  endLiveStream(): void {
    // Close all peer connections
    this.peerConnections.forEach((pc) => {
      pc.close()
    })
    this.peerConnections.clear()

    // Stop local stream
    this.stopLocalStream()

    // Notify via socket
    if (this.socketService) {
      this.socketService.emit('end-livestream', {
        courseId: this.currentCourseId
      })
    }

    this.emit('stream-ended', { courseId: this.currentCourseId })
  }

  // Remove peer connection
  private removePeerConnection(participantId: string): void {
    const peerConnection = this.peerConnections.get(participantId)
    if (peerConnection) {
      peerConnection.close()
      this.peerConnections.delete(participantId)
    }
    this.emit('stream-removed', { participantId })
  }

  // Setup socket listeners for WebRTC signaling
  private setupSocketListeners(): void {
    if (!this.socketService) return

    // Handle WebRTC offers
    this.socketService.on('webrtc-offer', (data: any) => {
      this.handleOffer(data.from, data.offer)
    })

    // Handle WebRTC answers
    this.socketService.on('webrtc-answer', (data: any) => {
      this.handleAnswer(data.from, data.answer)
    })

    // Handle ICE candidates
    this.socketService.on('ice-candidate', (data: any) => {
      this.handleIceCandidate(data.from, data.candidate)
    })

    // Handle livestream events
    this.socketService.on('livestream-started', (data: any) => {
      this.emit('stream-started', data)
    })

    this.socketService.on('livestream-ended', (data: any) => {
      this.emit('stream-ended', data)
    })

    // Handle participant events
    this.socketService.on('participant-joined-stream', (data: any) => {
      this.emit('participant-joined', data)
      // Instructor creates offer for new participant
      if (this.isInstructor) {
        this.createOffer(data.participantId)
      }
    })

    this.socketService.on('participant-left-stream', (data: any) => {
      this.removePeerConnection(data.participantId)
      this.emit('participant-left', data)
    })
  }

  // Event handling
  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    if (this.callbacks.has(event)) {
      const callbacks = this.callbacks.get(event)!
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any): void {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event)!.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${event} callback:`, error)
        }
      })
    }
  }

  // Cleanup
  destroy(): void {
    this.endLiveStream()
    this.callbacks.clear()
    this.socketService = null
  }

  // Get connection statistics
  async getConnectionStats(participantId: string): Promise<any> {
    const peerConnection = this.peerConnections.get(participantId)
    if (peerConnection) {
      return await peerConnection.getStats()
    }
    return null
  }

  // Check if WebRTC is supported
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      window.RTCPeerConnection
    )
  }
}

// Export both class and singleton instance
export { WebRTCService }
export const webRTCService = new WebRTCService()
export default webRTCService
