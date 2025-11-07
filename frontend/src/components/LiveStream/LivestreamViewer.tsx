/**
 * LivestreamViewer Component
 * Component for viewing livestream sessions with WebRTC integration
 */

import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  MessageCircle, 
  Users, 
  Send,
  Settings,
  Camera,
  Mic,
  MicOff,
  VideoOff
} from 'lucide-react'
import { 
  useSession, 
  useSessionViewers, 
  useSessionChat, 
  useJoinSession, 
  useLeaveSession,
  useSendChatMessage,
  useSendSignal,
  useLivestreamUtils 
} from '@/hooks/useLivestream'
import { socketService } from '@/services/socketService'

export const LivestreamViewer: React.FC = () => {
  const { t } = useTranslation()
  const { sessionId } = useParams<{ sessionId: string }>()
  
  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  
  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  
  // State
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [showChat, setShowChat] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Hooks
  const { data: sessionData, isLoading } = useSession(sessionId!)
  const { data: viewersData } = useSessionViewers(sessionId!)
  const { data: chatData } = useSessionChat(sessionId!)
  const joinSession = useJoinSession()
  const leaveSession = useLeaveSession()
  const sendChatMessage = useSendChatMessage()
  const sendSignal = useSendSignal()
  const { isSessionLive, formatViewerCount } = useLivestreamUtils()

  const session = sessionData?.data
  const viewers = Array.isArray(viewersData?.data)
    ? (viewersData?.data as any)
    : (viewersData?.data as any)?.viewers || []
  const chatMessages: any[] = Array.isArray(chatData?.data)
    ? (chatData?.data as any[])
    : ((chatData?.data as any)?.messages || [])

  // WebRTC configuration
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }

  // Initialize WebRTC
  useEffect(() => {
    if (!sessionId || !session || !isSessionLive(session)) return

    const initializeWebRTC = async () => {
      try {
        // Create peer connection
        const peerConnection = new RTCPeerConnection(rtcConfig)
        peerConnectionRef.current = peerConnection

        // Handle remote stream
        peerConnection.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0]
          }
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            sendSignal.mutate({
              sessionId: sessionId!,
              signalData: {
                type: 'ice-candidate',
                data: event.candidate
              }
            })
          }
        }

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
          setIsConnected(peerConnection.connectionState === 'connected')
        }

        // Get user media for instructor (if user is instructor)
        if (session.instructor_id === getCurrentUserId()) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          })
          
          localStreamRef.current = stream
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
          }

          // Add tracks to peer connection
          stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream)
          })
        }

        // Join session
        await joinSession.mutateAsync(sessionId)

      } catch (error) {
        console.error('Failed to initialize WebRTC:', error)
      }
    }

    initializeWebRTC()

    return () => {
      // Cleanup
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (sessionId) {
        leaveSession.mutate(sessionId)
      }
    }
  }, [sessionId, session])

  // Socket.IO event handlers for WebRTC signaling
  useEffect(() => {
    if (!sessionId) return

    const handleOffer = async (data: any) => {
      if (!peerConnectionRef.current) return
      
      await peerConnectionRef.current.setRemoteDescription(data.offer)
      const answer = await peerConnectionRef.current.createAnswer()
      await peerConnectionRef.current.setLocalDescription(answer)
      
      sendSignal.mutate({
        sessionId: sessionId!,
        signalData: {
          type: 'answer',
          data: answer
        }
      })
    }

    const handleAnswer = async (data: any) => {
      if (!peerConnectionRef.current) return
      await peerConnectionRef.current.setRemoteDescription(data.answer)
    }

    const handleIceCandidate = async (data: any) => {
      if (!peerConnectionRef.current) return
      await peerConnectionRef.current.addIceCandidate(data.candidate)
    }

    // Subscribe to socket events
    socketService.on('webrtc-offer', handleOffer)
    socketService.on('webrtc-answer', handleAnswer)
    socketService.on('webrtc-ice-candidate', handleIceCandidate)

    return () => {
      socketService.off('webrtc-offer', handleOffer)
      socketService.off('webrtc-answer', handleAnswer)
      socketService.off('webrtc-ice-candidate', handleIceCandidate)
    }
  }, [sessionId])

  const getCurrentUserId = () => {
    // Get current user ID from auth store
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed?.state?.user?.id
    }
    return null
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !sessionId) return
    
    sendChatMessage.mutate({
      sessionId,
      message: chatMessage
    })
    setChatMessage('')
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = isMuted
        setIsMuted(!isMuted)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = isVideoOff
        setIsVideoOff(!isVideoOff)
      }
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      remoteVideoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('livestream.sessionNotFound')}
        </h2>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex h-screen">
        {/* Main video area */}
        <div className="flex-1 relative">
          {/* Remote video (instructor stream) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Local video (student camera) - Picture in Picture */}
          {localStreamRef.current && (
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Video controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between">
              {/* Session info */}
              <div className="text-white">
                <h1 className="text-xl font-semibold">{session.title}</h1>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{formatViewerCount(viewers.length)}</span>
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    isSessionLive(session) 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {isSessionLive(session) ? t('livestream.live') : t('livestream.offline')}
                  </span>
                </div>
              </div>

              {/* Video controls */}
              <div className="flex items-center space-x-2">
                {localStreamRef.current && (
                  <>
                    <button
                      onClick={toggleMute}
                      className={`p-2 rounded-full ${
                        isMuted ? 'bg-red-600' : 'bg-gray-600'
                      } text-white hover:bg-opacity-80`}
                    >
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={toggleVideo}
                      className={`p-2 rounded-full ${
                        isVideoOff ? 'bg-red-600' : 'bg-gray-600'
                      } text-white hover:bg-opacity-80`}
                    >
                      {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                    </button>
                  </>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full bg-gray-600 text-white hover:bg-opacity-80"
                >
                  <Maximize className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="p-2 rounded-full bg-gray-600 text-white hover:bg-opacity-80"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Connection status */}
          <div className="absolute top-4 right-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-600 text-white' 
                : 'bg-yellow-600 text-white'
            }`}>
              {isConnected ? t('livestream.connected') : t('livestream.connecting')}
            </div>
          </div>
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {t('livestream.chat')}
              </h3>
              <p className="text-sm text-gray-500">
                {viewers.length} {t('livestream.viewers')}
              </p>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((message) => (
                <div key={message.id} className="flex space-x-2">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {message.user.full_name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm text-gray-900">
                        {message.user.full_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t('chat.placeholder')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim() || sendChatMessage.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LivestreamViewer
