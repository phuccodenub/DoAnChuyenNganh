import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { MeetStyleControls } from '@/pages/livestream/components/host/MeetStyleControls';
import { useSession, useUpdateSession } from '@/hooks/useLivestream';
import { useIceServers } from '@/hooks/useIceServers';
import { useLivestreamSocket } from '@/hooks/useLivestreamSocket';
import { ROUTES } from '@/constants/routes';
import {
  StudioPanel,
  HostChatPanel,
} from './components';
import { LiveStreamChatState } from '@/pages/livestream/components/shared/LiveStreamChat';
import type { LiveSession } from '@/services/api/livestream.api';

export function LiveStreamHostPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [currentAudioDeviceId, setCurrentAudioDeviceId] = useState<string | undefined>();
  const [currentVideoDeviceId, setCurrentVideoDeviceId] = useState<string | undefined>();
  const screenShareRef = useRef<React.RefObject<{ startScreenShare: () => Promise<void> }> | null>(null);

  const { data: session, isLoading } = useSession(sessionId);
  const updateSession = useUpdateSession();
  const sessionIceServers = session?.webrtc_config?.iceServers as RTCIceServer[] | undefined;
  const iceServers = useIceServers(sessionIceServers, session?.ingest_type === 'webrtc');

  // Socket for chat and real-time updates
  const {
    isJoined,
    messages,
    typingUsers,
    sendMessage,
    sendReaction,
    setTyping,
  } = useLivestreamSocket({
    sessionId,
    enabled: !!sessionId && !!session && session.status === 'live',
    sessionStatus: session?.status,
  });

  const chatState = useMemo<LiveStreamChatState>(
    () => ({
      isJoined,
      messages,
      typingUsers: Array.from(typingUsers),
      sendMessage,
      sendReaction,
      setTyping,
    }),
    [isJoined, messages, typingUsers, sendMessage, sendReaction, setTyping]
  );

  useEffect(() => {
    if (
      session &&
      session.status === 'scheduled' &&
      !hasAutoStarted &&
      !updateSession.isPending &&
      sessionId
    ) {
      const createdAt = session.created_at ? new Date(session.created_at) : null;
      if (createdAt) {
        const secondsSinceCreation = (new Date().getTime() - createdAt.getTime()) / 1000;
        if (secondsSinceCreation < 30) {
          setHasAutoStarted(true);
          updateSession.mutate(
            {
              id: sessionId,
              data: {
                status: 'live',
                actual_start: new Date().toISOString(),
              } as any,
            },
            {
              onSuccess: () => console.log('[LiveStreamHostPage] Session auto-started successfully'),
              onError: (error) => {
                console.error('[LiveStreamHostPage] Auto-start failed:', error);
                setHasAutoStarted(false);
              },
            },
          );
        }
      }
    }
  }, [session, sessionId, hasAutoStarted, updateSession]);


  const handleEnd = async () => {
    if (!sessionId || !confirm('Bạn có chắc muốn kết thúc livestream?')) return;
    try {
      await updateSession.mutateAsync({
        id: sessionId,
        data: {
          status: 'ended',
          actual_end: new Date().toISOString(),
        } as any,
      });
      alert('Đã kết thúc livestream!');
      navigate(ROUTES.INSTRUCTOR.LIVESTREAM);
    } catch (error) {
      console.error('End session error:', error);
      alert('Có lỗi khi kết thúc livestream');
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy phiên livestream</h3>
          <Button onClick={() => navigate(ROUTES.INSTRUCTOR.LIVESTREAM)}>Quay lại danh sách</Button>
        </div>
      </div>
    );
  }

  const currentSession = session as LiveSession;

  return (
    <div className="w-full h-[calc(100vh-64px)] overflow-hidden bg-white">
      {/* Layout theo wireframe: Video + Chat ở trên, Controls ở dưới */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Phần trên: Video + Chat */}
        <div className="flex gap-4 flex-1 min-h-0 px-4 pt-4 pb-2 overflow-hidden">
          {/* Video Preview - Container với nền tối */}
          <div 
            className={cn(
              'flex flex-col min-h-0 transition-all duration-300 ease-in-out',
              currentSession.status === 'live' && isChatOpen ? 'flex-[4]' : 'flex-1'
            )}
          >
            <div className="relative bg-zinc-900 rounded-lg overflow-hidden shadow-lg h-full">
              <StudioPanel
                ingestType={currentSession.ingest_type}
                sessionId={currentSession.id}
                sessionTitle={currentSession.title}
                iceServers={iceServers}
                onEndCall={handleEnd}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
                isChatOpen={isChatOpen}
                onAudioToggle={(isOn) => setIsAudioOn(isOn)}
                onVideoToggle={(isOn) => setIsVideoOn(isOn)}
                externalAudioState={isAudioOn}
                externalVideoState={isVideoOn}
                onScreenShareRef={(ref) => {
                  screenShareRef.current = ref;
                }}
              />
            </div>
          </div>

          {/* Chat Panel - Animation mượt khi đóng/mở */}
          {currentSession.status === 'live' && (
            <div 
              className={cn(
                'flex flex-col min-h-0 transition-all duration-500 ease-in-out overflow-hidden',
                isChatOpen 
                  ? 'flex-[1] opacity-100 min-w-0' 
                  : 'flex-[0] w-0 opacity-0 min-w-0'
              )}
              style={{
                transition: 'flex 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out, width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {isChatOpen && (
                <div className="bg-white border border-gray-200 rounded-lg flex flex-col h-full w-full">
                  <HostChatPanel
                    sessionId={currentSession.id}
                    chatState={chatState}
                    className="h-full bg-gray-200 border-0 rounded-lg"
                    onClose={() => setIsChatOpen(false)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Phần dưới: Button Control Bar - Full Width */}
        <div className="w-full bg-white px-4 py-2 flex items-center justify-center flex-shrink-0">
          <MeetStyleControls
            isAudioOn={isAudioOn}
            isVideoOn={isVideoOn}
            onToggleAudio={() => setIsAudioOn(!isAudioOn)}
            onToggleVideo={() => setIsVideoOn(!isVideoOn)}
            onScreenShare={async () => {
              if (screenShareRef.current?.current) {
                await screenShareRef.current.current.startScreenShare();
              } else {
                console.warn('[HostPage] Screen share ref not available');
              }
            }}
            onEndCall={handleEnd}
            onReactions={() => console.log('Reactions clicked')}
            onRaiseHand={() => console.log('Raise hand clicked')}
            onMoreOptions={() => console.log('More options clicked')}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
            isChatOpen={isChatOpen}
            onAudioDeviceChange={(deviceId) => {
              setCurrentAudioDeviceId(deviceId);
              // TODO: Implement device change in WebRTCLiveStudio
            }}
            onVideoDeviceChange={(deviceId) => {
              setCurrentVideoDeviceId(deviceId);
              // TODO: Implement device change in WebRTCLiveStudio
            }}
            currentAudioDeviceId={currentAudioDeviceId}
            currentVideoDeviceId={currentVideoDeviceId}
          />
        </div>
      </div>
    </div>
  );
}

export default LiveStreamHostPage;

