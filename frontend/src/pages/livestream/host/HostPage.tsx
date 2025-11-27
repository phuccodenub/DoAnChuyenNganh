import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { differenceInMinutes } from 'date-fns';
import { Video } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSession, useSessionViewers, useUpdateSession } from '@/hooks/useLivestream';
import { useIceServers } from '@/hooks/useIceServers';
import { ROUTES, generateRoute } from '@/constants/routes';
import {
  HostHeader,
  StudioPanel,
  SessionInfoCard,
  ControlPanel,
  RtmpInfoCard,
  StatsPanel,
  ViewerList,
} from './components';
import type { LiveSession } from '@/services/api/livestream.api';

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins} phút`;
}

export function LiveStreamHostPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  const { data: session, isLoading } = useSession(sessionId);
  const { data: viewersData } = useSessionViewers(sessionId);
  const viewers = (viewersData?.viewers || []) as any[];
  const updateSession = useUpdateSession();
  const sessionIceServers = session?.webrtc_config?.iceServers as RTCIceServer[] | undefined;
  const iceServers = useIceServers(sessionIceServers, session?.ingest_type === 'webrtc');

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

  useEffect(() => {
    if (session?.status === 'live' && session?.actual_start) {
      const interval = setInterval(() => {
        const elapsed = differenceInMinutes(new Date(), new Date(session.actual_start!));
        setElapsedMinutes(elapsed);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    if (!sessionId) return;
    try {
      await updateSession.mutateAsync({
        id: sessionId,
        data: {
          status: 'live',
          actual_start: new Date().toISOString(),
        } as any,
      });
      alert('Đã bắt đầu livestream!');
    } catch (error) {
      console.error('Start session error:', error);
      alert('Có lỗi khi bắt đầu livestream');
    }
  };

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

  const handleViewStream = () => {
    if (!session) return;
    navigate(generateRoute.livestream.session(session.id));
  };

  const handleOpenRecording = () => {
    if (session?.recording_url) {
      window.open(session.recording_url, '_blank');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <HostHeader
        title={currentSession.title}
        courseTitle={currentSession.course?.title}
        status={currentSession.status as 'scheduled' | 'live' | 'ended' | 'cancelled'}
        onBack={() => navigate(ROUTES.INSTRUCTOR.LIVESTREAM)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StudioPanel
            ingestType={currentSession.ingest_type}
            sessionId={currentSession.id}
            sessionTitle={currentSession.title}
            iceServers={iceServers}
          />

          <SessionInfoCard
            session={currentSession}
            elapsedMinutes={elapsedMinutes}
            formatDuration={formatDuration}
          />

          <ControlPanel
            status={currentSession.status as 'scheduled' | 'live' | 'ended' | 'cancelled'}
            isUpdating={updateSession.isPending}
            hasRecording={Boolean(currentSession.recording_url)}
            onStart={handleStart}
            onEnd={handleEnd}
            onViewStream={handleViewStream}
            onOpenRecording={handleOpenRecording}
          />

          {currentSession.ingest_type === 'rtmp' && (
            <RtmpInfoCard
              serverUrl={currentSession.meeting_url}
              streamKey={currentSession.meeting_password}
              playbackUrl={currentSession.playback_url}
              copied={copied}
              onCopy={copyToClipboard}
            />
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <StatsPanel status={currentSession.status} viewers={viewers} />
          <ViewerList viewers={viewers} sessionStatus={currentSession.status} />
        </div>
      </div>
    </div>
  );
}

export default LiveStreamHostPage;

