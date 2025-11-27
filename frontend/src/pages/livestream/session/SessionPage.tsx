import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/hooks/useLivestream';
import { useLivestreamSocket } from '@/hooks/useLivestreamSocket';
import { useIceServers } from '@/hooks/useIceServers';
import { ROUTES } from '@/constants/routes';
import { MainLayout } from '@/layouts/MainLayout';
import { SessionHeader, ViewerSection, ChatPanel, ConnectionNotice, SessionHostInfo } from './components';

type Reaction = { emoji: string; userName: string };

export function LiveStreamSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession(sessionId);

  const [reactions, setReactions] = useState<Reaction[]>([]);

  const handleViewerCountUpdate = useCallback((data: any) => {
    console.log('[LiveStreamSessionPage] Viewer count updated:', data);
  }, []);

  const handleReaction = useCallback((data: Reaction) => {
    setReactions((prev) => [...prev, data]);
  }, []);

  const { viewerCount, isJoined, isConnected } = useLivestreamSocket({
    sessionId,
    enabled: !!sessionId && !!session,
    sessionStatus: session?.status,
    onViewerCountUpdate: handleViewerCountUpdate,
    onReaction: handleReaction,
  });

  const mode: 'webrtc' | 'rtmp' | 'unknown' = session
    ? (session.ingest_type as 'webrtc' | 'rtmp') || (session.playback_url ? 'rtmp' : 'webrtc')
    : 'unknown';

  const isLive = session?.status === 'live';

  // Fetch ICE servers from Twilio NTS (for cross-network WebRTC)
  // Only fetch if WebRTC mode and session is loaded
  const iceServers = useIceServers(
    session?.webrtc_config?.iceServers as RTCIceServer[] | undefined,
    mode === 'webrtc' && !!session
  );

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
        <Button onClick={() => navigate(ROUTES.LIVESTREAM.HUB)}>Quay lại danh sách</Button>
      </div>
    );
  }

  return (
    <MainLayout showSidebar>
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-2">
          <SessionHeader
            title={session.title}
            courseTitle={session.course?.title}
            description={session.description}
            isLive={isLive}
            viewerCount={viewerCount}
            showViewerCount={Boolean(isJoined && isConnected)}
            onBack={() => navigate(ROUTES.LIVESTREAM.HUB)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)] gap-2 items-stretch">
            <div className="flex flex-col gap-4">
              <ViewerSection
                mode={mode}
                sessionId={session.id}
                sessionTitle={session.title}
                playbackUrl={session.playback_url || undefined}
                reactions={reactions}
                iceServers={iceServers}
              />
            </div>

            <div className="flex flex-col h-full min-h-0">
              <ChatPanel
                isLive={isLive}
                sessionId={session.id}
                sessionStatus={session.status as 'scheduled' | 'live' | 'ended' | 'cancelled' | undefined}
                enabled={Boolean(isConnected && isJoined)}
              />
            </div>

            <div className="lg:col-span-1 lg:col-start-1">
              <ConnectionNotice isConnected={isConnected} />
            </div>

            <div className="lg:col-span-1 lg:col-start-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
                <SessionHostInfo session={session} />
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
                  {session.course?.title && (
                    <p className="text-gray-600">Khoá học: {session.course.title}</p>
                  )}
                  {session.description && (
                    <p className="text-gray-600 max-w-3xl">{session.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default LiveStreamSessionPage;

