import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Video, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession, useUpdateSession } from '@/hooks/useLivestream';
import { useLivestreamSocket } from '@/hooks/useLivestreamSocket';
import { useIceServers } from '@/hooks/useIceServers';
import { ROUTES } from '@/constants/routes';
import { MainLayout } from '@/layouts/MainLayout';
import { SessionHeader, ViewerSection, ChatPanel, ConnectionNotice, SessionHostInfo } from './components';
import { LiveStreamChatState } from '../components/shared/LiveStreamChat';
import { ReactionOverlay } from '../components/shared/ReactionOverlay';
import { useAuthStore } from '@/stores/authStore.enhanced';
import { MeetStyleControls } from '@/pages/livestream/components/host/MeetStyleControls';
import { StudioPanel, HostChatPanel, ModerationPanel } from '../host/components';
import type { LiveSession } from '@/services/api/livestream.api';
import toast from 'react-hot-toast';

type Reaction = { emoji: string; userName: string; userId?: string };

export function LiveStreamSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession(sessionId);
  const updateSession = useUpdateSession();

  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [recentChatReactions, setRecentChatReactions] = useState<Array<{ emoji: string; userName: string; timestamp: number }>>([]);
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  
  // Host page states
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'moderation'>('chat');
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [currentAudioDeviceId, setCurrentAudioDeviceId] = useState<string | undefined>();
  const [currentVideoDeviceId, setCurrentVideoDeviceId] = useState<string | undefined>();
  const screenShareRef = useRef<React.RefObject<{ startScreenShare: () => Promise<void> }> | null>(null);
  const [hostReactions, setHostReactions] = useState<Array<{ emoji: string; userName: string }>>([]);
  const [showEndedModal, setShowEndedModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  // Check if user is the host
  const isHost = useMemo(() => {
    return Boolean(userId && session?.host_user_id && userId === session.host_user_id);
  }, [userId, session?.host_user_id]);
  const userDisplayName = useMemo(() => {
    if (!user) return 'Bạn';
    if (user.full_name && user.full_name.trim().length > 0) return user.full_name;
    const fallbackName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
    return fallbackName || user.email || 'Bạn';
  }, [user]);

  // Get host info for display
  const hostInfo = useMemo(() => {
    if (!session) return null;
    const metadata = (session.metadata ?? {}) as Record<string, any>;
    const hostProfile = metadata?.hostProfile;
    
    const avatar = 
      hostProfile?.avatar ||
      session.host?.avatar ||
      session.instructor_avatar ||
      undefined;
    
    const name =
      hostProfile?.displayName ||
      hostProfile?.name ||
      [session.host?.first_name, session.host?.last_name].filter(Boolean).join(' ').trim() ||
      session.instructor_name ||
      'Giảng viên';
    
    return { avatar, name };
  }, [session]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const pushReactionToUI = useCallback((emoji: string, userName: string, timestamp = Date.now()) => {
    setReactions((prev) => [...prev, { emoji, userName }]);
    const reactionWithTimestamp = { emoji, userName, timestamp };
    setRecentChatReactions((prev) => {
      const next = [...prev, reactionWithTimestamp];
      return next.slice(-6);
    });
    setTimeout(() => {
      setRecentChatReactions((prev) => prev.filter((item) => item.timestamp !== reactionWithTimestamp.timestamp));
    }, 3000);
  }, []);

  const handleViewerCountUpdate = useCallback((data: any) => {
    console.log('[LiveStreamSessionPage] Viewer count updated:', data);
  }, []);

  const handleReaction = useCallback(
    (data: Reaction) => {
      if (data.userId && data.userId === userId) {
        return;
      }
      pushReactionToUI(data.emoji, data.userName);
    },
    [pushReactionToUI, userId]
  );

  // Handle session ended
  const handleSessionEnded = useCallback(() => {
    if (!showEndedModal) {
      setShowEndedModal(true);
      setCountdown(5);
    }
  }, [showEndedModal]);

  const {
    viewerCount,
    isJoined,
    isConnected,
    messages,
    typingUsers,
    sendMessage,
    sendReaction: socketSendReaction,
    setTyping,
  } = useLivestreamSocket({
    sessionId,
    enabled: !!sessionId && !!session,
    sessionStatus: session?.status,
    onViewerCountUpdate: handleViewerCountUpdate,
    onReaction: handleReaction,
    onSessionEnded: handleSessionEnded,
    onError: (error) => {
      // Show toast notification for moderation errors
      if (error.code === 'INVALID_DATA' || error.message?.includes('không phù hợp') || error.message?.includes('bị chặn')) {
        // You can integrate a toast library here
        console.warn('[SessionPage] Comment moderation error:', error.message);
        alert(error.message || 'Comment của bạn không phù hợp với quy tắc cộng đồng');
      }
    },
  });

  const sendReaction = useCallback(
    (emoji: string) => {
      pushReactionToUI(emoji, userDisplayName);
      socketSendReaction(emoji);
    },
    [pushReactionToUI, socketSendReaction, userDisplayName]
  );

  const mode: 'webrtc' | 'rtmp' | 'unknown' = session
    ? (session.ingest_type as 'webrtc' | 'rtmp') || (session.playback_url ? 'rtmp' : 'webrtc')
    : 'unknown';

  const isLive = session?.status === 'live';

  const chatState = useMemo<LiveStreamChatState>(
    () => ({
      isJoined,
      messages,
      typingUsers,
      sendMessage,
      sendReaction,
      setTyping,
    }),
    [isJoined, messages, typingUsers, sendMessage, sendReaction, setTyping]
  );
  const chatEnabled = Boolean(isConnected && isJoined);

  // Fetch ICE servers from Twilio NTS (for cross-network WebRTC)
  // Only fetch if WebRTC mode and session is loaded
  const sessionIceServers = session?.webrtc_config?.iceServers as RTCIceServer[] | undefined;
  const iceServers = useIceServers(
    sessionIceServers,
    (mode === 'webrtc' && !!session) || (isHost && session?.ingest_type === 'webrtc')
  );

  // Host reaction handler
  const handleHostReaction = useCallback(
    (data: { emoji: string; userId: string; userName: string }) => {
      // Chỉ hiển thị reactions từ viewers, không hiển thị reactions của chính host
      if (data.userId && data.userId === userId) {
        return;
      }
      setHostReactions((prev) => [...prev, { emoji: data.emoji, userName: data.userName }]);
    },
    [userId]
  );

  // Handle comment blocked notification for host
  const handleCommentBlocked = useCallback((data: {
    sessionId: string;
    userId: string;
    userName: string;
    message: string;
    reason?: string;
    riskScore?: number;
    riskCategories?: string[];
    timestamp: string;
  }) => {
    // Show toast notification
    toast.error(
      `Comment bị chặn từ ${data.userName}: "${data.message.substring(0, 50)}${data.message.length > 50 ? '...' : ''}"\nLý do: ${data.reason || 'Nội dung không phù hợp'}`,
      {
        duration: 5000,
        icon: '🚫',
      }
    );
    
    // Log for debugging
    console.log('[LiveStreamSessionPage] Comment blocked:', data);
  }, []);

  // Host page socket (different from viewer)
  const {
    isJoined: hostIsJoined,
    messages: hostMessages,
    typingUsers: hostTypingUsers,
    sendMessage: hostSendMessage,
    sendReaction: hostSendReaction,
    setTyping: hostSetTyping,
    viewerCount: hostViewerCount,
  } = useLivestreamSocket({
    sessionId,
    enabled: !!sessionId && !!session && session.status === 'live' && isHost,
    sessionStatus: session?.status,
    onReaction: handleHostReaction,
    onCommentBlocked: isHost ? handleCommentBlocked : undefined, // Only for host
  });

  // Calculate elapsed time for live session
  const [elapsedTime, setElapsedTime] = useState('00:00');
  useEffect(() => {
    if (!isHost || !session || session.status !== 'live' || !session.actual_start) {
      return;
    }
    const startTime = new Date(session.actual_start).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000); // seconds
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;
      if (hours > 0) {
        setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isHost, session?.status, session?.actual_start]);

  const hostChatState = useMemo<LiveStreamChatState>(
    () => ({
      isJoined: hostIsJoined,
      messages: hostMessages,
      typingUsers: Array.from(hostTypingUsers),
      sendMessage: hostSendMessage,
      sendReaction: hostSendReaction,
      setTyping: hostSetTyping,
    }),
    [hostIsJoined, hostMessages, hostTypingUsers, hostSendMessage, hostSendReaction, hostSetTyping]
  );

  // Auto-start session for host
  useEffect(() => {
    if (
      isHost &&
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
              onSuccess: () => console.log('[LiveStreamSessionPage] Session auto-started successfully'),
              onError: (error) => {
                console.error('[LiveStreamSessionPage] Auto-start failed:', error);
                setHasAutoStarted(false);
              },
            },
          );
        }
      }
    }
  }, [isHost, session, sessionId, hasAutoStarted, updateSession]);

  // Check if session is ended when loading
  useEffect(() => {
    if (session && session.status === 'ended' && !showEndedModal) {
      handleSessionEnded();
    }
  }, [session?.status, showEndedModal, handleSessionEnded]);

  // Countdown effect
  useEffect(() => {
    if (!showEndedModal) return;
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(ROUTES.LIVESTREAM.HUB);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [showEndedModal, navigate]);

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
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải phiên livestream...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <p className="text-gray-600">Không tìm thấy phiên livestream.</p>
        <Button onClick={() => navigate(isHost ? ROUTES.INSTRUCTOR.LIVESTREAM : ROUTES.LIVESTREAM.HUB)}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // If session is ended, only show modal (no content)
  if (session && session.status === 'ended') {
    return (
      <>
        <MainLayout showSidebar>
          <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center bg-white">
            <div className="text-center">
              <p className="text-gray-600">Livestream đã kết thúc</p>
            </div>
          </div>
        </MainLayout>
        {showEndedModal && (
          <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Livestream đã kết thúc</h2>
                <p className="text-gray-600">Bạn sẽ được chuyển về trang danh sách livestream sau</p>
              </div>
              <div className="mb-6">
                <div className="text-6xl font-bold text-blue-600 mb-2">{countdown}</div>
                <p className="text-sm text-gray-500">giây</p>
              </div>
              <Button 
                onClick={() => navigate(ROUTES.LIVESTREAM.HUB)}
                className="w-full"
              >
                Quay lại ngay
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Render Host UI if user is the host
  if (isHost) {
    const currentSession = session as LiveSession;
    return (
      <>
      <MainLayout showSidebar>
        <div className="w-full h-[calc(100vh-64px)] overflow-hidden bg-white">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex gap-4 flex-1 min-h-0 px-4 pt-4 pb-2 overflow-hidden">
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
                
                {/* Reaction Overlay - Floating emoji animations */}
                {currentSession.status === 'live' && (
                  <ReactionOverlay reactions={hostReactions} />
                )}
                
                {/* Overlay: LIVE badge + Viewer count (left) and Time (right) */}
                {currentSession.status === 'live' && (
                  <>
                    {/* Left: LIVE + Viewer count */}
                    <div className="absolute top-3 left-3 z-20 inline-flex items-stretch text-white text-xs font-semibold shadow-lg">
                      <span className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded-l">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </span>
                      {hostViewerCount !== undefined && (
                        <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-r">
                          <Eye className="w-4 h-4" />
                          <span>{hostViewerCount ?? 0}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Right: Elapsed time */}
                    <div className="absolute top-3 right-3 z-20 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg">
                      {elapsedTime}
                    </div>
                  </>
                )}
              </div>
            </div>

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
                  <div className="h-full bg-white border border-gray-200 rounded-lg flex flex-col">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200">
                      <button
                        onClick={() => setActiveTab('chat')}
                        className={cn(
                          'flex-1 px-4 py-2 text-sm font-medium transition-colors',
                          activeTab === 'chat'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )}
                      >
                        Chat
                      </button>
                      <button
                        onClick={() => setActiveTab('moderation')}
                        className={cn(
                          'flex-1 px-4 py-2 text-sm font-medium transition-colors',
                          activeTab === 'moderation'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )}
                      >
                        Kiểm duyệt
                      </button>
                      <button
                        onClick={() => setIsChatOpen(false)}
                        className="px-3 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                      >
                        ×
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-hidden">
                      {activeTab === 'chat' ? (
                        <HostChatPanel
                          sessionId={currentSession.id}
                          chatState={hostChatState}
                          className="h-full"
                          onClose={() => setIsChatOpen(false)}
                          sessionTitle={currentSession.title}
                          sessionDescription={currentSession.description || ''}
                          isHost={isHost}
                          onUpdateSession={async (data) => {
                            if (updateSession && sessionId) {
                              await updateSession.mutateAsync({
                                id: sessionId,
                                data: data as any,
                              });
                            }
                          }}
                        />
                      ) : (
                        <ModerationPanel
                          sessionId={currentSession.id}
                          className="h-full"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

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
                  console.warn('[LiveStreamSessionPage] Screen share ref not available');
                }
              }}
              onEndCall={handleEnd}
              onReactions={(emoji) => {
                if (emoji && hostSendReaction) {
                  // Optimistic update: thêm reaction vào UI ngay lập tức
                  setHostReactions((prev) => [...prev, { emoji, userName: userDisplayName }]);
                  // Gửi reaction qua socket
                  hostSendReaction(emoji);
                }
              }}
              onRaiseHand={() => console.log('Raise hand clicked')}
              onMoreOptions={() => console.log('More options clicked')}
              onToggleChat={() => setIsChatOpen(!isChatOpen)}
              isChatOpen={isChatOpen}
              onAudioDeviceChange={(deviceId) => {
                setCurrentAudioDeviceId(deviceId);
              }}
              onVideoDeviceChange={(deviceId) => {
                setCurrentVideoDeviceId(deviceId);
              }}
              currentAudioDeviceId={currentAudioDeviceId}
              currentVideoDeviceId={currentVideoDeviceId}
            />
          </div>
        </div>
        </div>
      </MainLayout>
      {showEndedModal && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Livestream đã kết thúc</h2>
              <p className="text-gray-600">Bạn sẽ được chuyển về trang danh sách livestream sau</p>
            </div>
            <div className="mb-6">
              <div className="text-6xl font-bold text-blue-600 mb-2">{countdown}</div>
              <p className="text-sm text-gray-500">giây</p>
            </div>
            <Button 
              onClick={() => navigate(ROUTES.LIVESTREAM.HUB)}
              className="w-full"
            >
              Quay lại ngay
            </Button>
          </div>
        </div>
      )}
      </>
    );
  }

  // Render Viewer UI
  return (
    <>
    <MainLayout showSidebar>
      <div className="w-full h-[calc(100vh-64px)] overflow-hidden bg-white">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex gap-4 flex-1 min-h-0 px-4 pt-4 pb-2 overflow-hidden">
            <div className="flex flex-col min-h-0 flex-1">
              <div className="relative bg-zinc-900 rounded-lg overflow-hidden shadow-lg h-full">
                <ViewerSection
                  mode={mode}
                  sessionId={session.id}
                  sessionTitle={session.title}
                  playbackUrl={session.playback_url || undefined}
                  reactions={reactions}
                  iceServers={iceServers}
                  isLive={isLive}
                  viewerCount={viewerCount}
                  showViewerCount={Boolean(isJoined && isConnected)}
                  chatState={chatState}
                  chatEnabled={chatEnabled}
                  sessionStatus={session.status as 'scheduled' | 'live' | 'ended' | 'cancelled' | undefined}
                  recentReactions={recentChatReactions}
                />
                
                {/* Overlay: Host info + LIVE badge + Viewer count (left) - All in one row */}
                {isLive && (
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                    {/* Host Avatar + Name */}
                    {hostInfo && (
                      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-2 py-1.5 rounded-lg shadow-lg">
                        {hostInfo.avatar ? (
                          <img 
                            src={hostInfo.avatar} 
                            alt={hostInfo.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                            {getInitials(hostInfo.name)}
                          </div>
                        )}
                        <span className="text-white text-xs font-medium">{hostInfo.name}</span>
                      </div>
                    )}
                    
                    {/* LIVE + Viewer count */}
                    <div className="inline-flex items-stretch text-white text-xs font-semibold shadow-lg">
                      <span className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded-l">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </span>
                      {viewerCount !== undefined && (
                        <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-r">
                          <Eye className="w-4 h-4" />
                          <span>{viewerCount ?? 0}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col min-h-0 w-[400px] flex-shrink-0">
              <ChatPanel
                isLive={isLive}
                sessionId={session.id}
                enabled={chatEnabled}
                chatState={chatState}
                recentReactions={recentChatReactions}
                sessionTitle={session.title}
                sessionDescription={session.description || ''}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
    {showEndedModal && (
      <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Livestream đã kết thúc</h2>
            <p className="text-gray-600">Bạn sẽ được chuyển về trang danh sách livestream sau</p>
          </div>
          <div className="mb-6">
            <div className="text-6xl font-bold text-blue-600 mb-2">{countdown}</div>
            <p className="text-sm text-gray-500">giây</p>
          </div>
          <Button 
            onClick={() => navigate(ROUTES.LIVESTREAM.HUB)}
            className="w-full"
          >
            Quay lại ngay
          </Button>
        </div>
      </div>
    )}
    </>
  );
}

export default LiveStreamSessionPage;

