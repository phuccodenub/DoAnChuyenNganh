import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import socketService from '@/services/socketService'
import webRTCService, { WebRTCService, type StreamParticipant } from '@/services/webRTCService'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface LiveStreamInterfaceProps {
  courseId: string
  courseName: string
}

function LiveStreamInterface({ courseId, courseName }: LiveStreamInterfaceProps) {
  const { user } = useAuthStore()
  const [isStreaming, setIsStreaming] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [participants, setParticipants] = useState<StreamParticipant[]>([])
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')

  // Video element refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map())

  const isInstructor = user?.role === 'instructor'

  useEffect(() => {
    // Initialize WebRTC service
    if (user) {
      webRTCService.initialize(socketService, courseId, user.role)
      setupWebRTCListeners()
    }

    return () => {
      webRTCService.destroy()
    }
  }, [courseId, user])

  const setupWebRTCListeners = () => {
    // Handle stream events
    webRTCService.on('stream-added', handleStreamAdded)
    webRTCService.on('stream-removed', handleStreamRemoved)
    webRTCService.on('stream-started', handleStreamStarted)
    webRTCService.on('stream-ended', handleStreamEnded)
    webRTCService.on('participant-joined', handleParticipantJoined)
    webRTCService.on('participant-left', handleParticipantLeft)
  }

  const handleStreamAdded = (data: { stream: MediaStream, participantId: string, isLocal: boolean }) => {
    console.log('Stream added:', data)
    
    if (data.isLocal) {
      // Local stream - display in local video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = data.stream
      }
    } else {
      // Remote stream - create or update remote video element
      const videoElement = remoteVideosRef.current.get(data.participantId)
      if (videoElement) {
        videoElement.srcObject = data.stream
      }
    }
    
    setConnectionStatus('connected')
  }

  const handleStreamRemoved = (data: { participantId: string }) => {
    if (data.participantId === 'local') {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null
      }
    } else {
      // Remove remote stream
      setParticipants(prev => prev.filter(p => p.id !== data.participantId))
    }
  }

  const handleStreamStarted = (data: any) => {
    setIsStreaming(true)
    setError(null)
  }

  const handleStreamEnded = (data: any) => {
    setIsStreaming(false)
    setIsJoined(false)
    setParticipants([])
    setConnectionStatus('disconnected')
  }

  const handleParticipantJoined = (data: any) => {
    setParticipants(prev => [...prev, {
      id: data.participantId,
      name: data.participantName || 'Unknown',
      role: data.participantRole || 'student',
      isVideoEnabled: data.isVideoEnabled !== false,
      isAudioEnabled: data.isAudioEnabled !== false
    }])
  }

  const handleParticipantLeft = (data: any) => {
    setParticipants(prev => prev.filter(p => p.id !== data.participantId))
  }

  const startLiveStream = async () => {
    if (!isInstructor) return

    setIsLoading(true)
    setError(null)
    setConnectionStatus('connecting')

    try {
      const success = await webRTCService.startLiveStream()
      if (success) {
        setIsStreaming(true)
        setIsJoined(true)
      } else {
        throw new Error('Failed to start stream')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start live stream')
      setConnectionStatus('disconnected')
    } finally {
      setIsLoading(false)
    }
  }

  const joinLiveStream = async () => {
    if (isInstructor) return

    setIsLoading(true)
    setError(null)
    setConnectionStatus('connecting')

    try {
      const success = await webRTCService.joinLiveStream()
      if (success) {
        setIsJoined(true)
      } else {
        throw new Error('Failed to join stream')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join live stream')
      setConnectionStatus('disconnected')
    } finally {
      setIsLoading(false)
    }
  }

  const endLiveStream = () => {
    webRTCService.endLiveStream()
    setIsStreaming(false)
    setIsJoined(false)
    setParticipants([])
    setConnectionStatus('disconnected')
  }

  const toggleVideo = () => {
    const enabled = webRTCService.toggleVideo()
    setIsVideoEnabled(enabled)
  }

  const toggleAudio = () => {
    const enabled = webRTCService.toggleAudio()
    setIsAudioEnabled(enabled)
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600'
      case 'connecting': return 'text-yellow-600'
      case 'disconnected': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected'
      case 'connecting': return 'Connecting...'
      case 'disconnected': return 'Disconnected'
      default: return 'Unknown'
    }
  }

  if (!WebRTCService.isSupported()) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">WebRTC Not Supported</h3>
        <p className="text-gray-600">
          Your browser doesn't support WebRTC. Please use a modern browser like Chrome, Firefox, or Safari.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stream Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Live Stream: {courseName}</h2>
            <div className="flex items-center space-x-4 text-sm">
              <span className={getConnectionStatusColor()}>
                ● {getConnectionStatusText()}
              </span>
              <span>👥 {participants.length + (isJoined ? 1 : 0)} participants</span>
              {isStreaming && (
                <span className="bg-red-500 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                  🔴 LIVE
                </span>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-2">
            {!isJoined && !isStreaming && (
              <>
                {isInstructor ? (
                  <Button
                    onClick={startLiveStream}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isLoading ? '🔄 Starting...' : '📹 Start Live Stream'}
                  </Button>
                ) : (
                  <Button
                    onClick={joinLiveStream}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? '🔄 Joining...' : '🎯 Join Stream'}
                  </Button>
                )}
              </>
            )}

            {(isJoined || isStreaming) && (
              <>
                <Button
                  onClick={toggleVideo}
                  variant={isVideoEnabled ? 'secondary' : 'outline'}
                  className={isVideoEnabled ? 'bg-gray-100' : 'bg-red-100 text-red-600'}
                >
                  {isVideoEnabled ? '📹' : '📹'}
                  {isVideoEnabled ? ' Video On' : ' Video Off'}
                </Button>
                
                <Button
                  onClick={toggleAudio}
                  variant={isAudioEnabled ? 'secondary' : 'outline'}
                  className={isAudioEnabled ? 'bg-gray-100' : 'bg-red-100 text-red-600'}
                >
                  {isAudioEnabled ? '🎤' : '🔇'}
                  {isAudioEnabled ? ' Mic On' : ' Mic Off'}
                </Button>

                {isInstructor && (
                  <Button
                    onClick={endLiveStream}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    🛑 End Stream
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-300 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Video Grid */}
      {(isJoined || isStreaming) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Local Video */}
          <Card className="overflow-hidden">
            <div className="relative bg-gray-900 aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {user?.full_name || 'You'} {isInstructor && '(Instructor)'}
              </div>
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">👤</div>
                    <p className="text-white">Video Off</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Remote Videos */}
          {participants.map((participant, index) => (
            <Card key={participant.id} className="overflow-hidden">
              <div className="relative bg-gray-900 aspect-video">
                <video
                  ref={(el) => {
                    if (el) {
                      remoteVideosRef.current.set(participant.id, el)
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {participant.name} {participant.role === 'instructor' && '(Instructor)'}
                </div>
                {!participant.isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2">👤</div>
                      <p className="text-white">Video Off</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {/* Empty slots for demonstration */}
          {participants.length === 0 && (isJoined || isStreaming) && (
            <Card className="border-dashed border-2 border-gray-300">
              <div className="aspect-video flex items-center justify-center text-center p-6">
                <div>
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Waiting for participants
                  </h3>
                  <p className="text-gray-500">
                    {isInstructor 
                      ? 'Students will appear here when they join the stream'
                      : 'Other participants will appear here'
                    }
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Not Joined State */}
      {!isJoined && !isStreaming && (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🎥</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            {isInstructor ? 'Ready to Start Live Stream' : 'Join the Live Stream'}
          </h3>
          <p className="text-gray-600 mb-6">
            {isInstructor 
              ? 'Click the button above to start streaming to your students. Make sure your camera and microphone are working properly.'
              : 'Join the live stream to interact with your instructor and classmates in real-time.'
            }
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-medium text-blue-900 mb-2">📋 Before You Start:</h4>
            <ul className="text-sm text-blue-800 text-left space-y-1">
              <li>• Allow camera and microphone access</li>
              <li>• Ensure stable internet connection</li>
              <li>• Use headphones to prevent echo</li>
              {isInstructor && <li>• Test your audio/video quality</li>}
            </ul>
          </div>
        </Card>
      )}

      {/* Demo Mode Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <p className="text-sm text-amber-700">
          <span className="font-medium">🧪 Demo Mode:</span> This WebRTC implementation works with real camera/microphone access. 
          For full functionality, start the Socket.IO demo server to enable signaling between participants.
        </p>
      </div>
    </div>
  )
}

export default LiveStreamInterface