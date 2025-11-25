import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import webrtcService from '@/services/webrtcService';
import { ReactionOverlay } from './ReactionOverlay';
import { Button } from '@/components/ui/Button';

interface WebRTCViewerProps {
  sessionId: string;
  displayName?: string;
  reactions?: Array<{ emoji: string; userName: string }>;
  iceServers?: RTCIceServer[];
}

interface RemoteTileProps {
  stream: MediaStream;
  label: string;
  muted: boolean;
  userId: string;
  registerRef: (userId: string, element: HTMLVideoElement | null) => void;
  onAutoplayBlocked: () => void;
}

function RemoteTile({ stream, label, muted, userId, registerRef, onAutoplayBlocked }: RemoteTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    registerRef(userId, videoRef.current);
    return () => registerRef(userId, null);
  }, [registerRef, userId]);

  useEffect(() => {
    if (!videoRef.current || !stream) return;

    console.log(`[RemoteTile] Setting stream for ${userId}, tracks:`, {
      video: stream.getVideoTracks().length,
      audio: stream.getAudioTracks().length,
      videoEnabled: stream.getVideoTracks().some(t => t.enabled && t.readyState === 'live'),
    });

    videoRef.current.srcObject = stream;
    videoRef.current.muted = muted;

    // Check if stream has active video tracks
    const videoTracks = stream.getVideoTracks();
    const hasActiveVideo = videoTracks.some(track => track.enabled && track.readyState === 'live');
    setHasVideo(hasActiveVideo);

    // Listen for track events
    const handleTrackEnded = () => {
      console.log(`[RemoteTile] Track ended for ${userId}`);
      setHasVideo(false);
    };

    videoTracks.forEach(track => {
      track.addEventListener('ended', handleTrackEnded);
      track.addEventListener('mute', () => console.log(`[RemoteTile] Video track muted for ${userId}`));
      track.addEventListener('unmute', () => console.log(`[RemoteTile] Video track unmuted for ${userId}`));
    });

    // Attempt to play
    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(`[RemoteTile] Video playing for ${userId}`);
          setAutoplayBlocked(false);
        })
        .catch((error) => {
          console.warn(`[RemoteTile] Autoplay blocked for ${userId}:`, error);
          setAutoplayBlocked(true);
          onAutoplayBlocked();
        });
    }

    return () => {
      videoTracks.forEach(track => {
        track.removeEventListener('ended', handleTrackEnded);
      });
    };
  }, [stream, muted, onAutoplayBlocked, userId]);

  const handlePlayClick = async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
      setAutoplayBlocked(false);
      console.log(`[RemoteTile] Manual play successful for ${userId}`);
    } catch (error) {
      console.error(`[RemoteTile] Manual play failed for ${userId}:`, error);
    }
  };

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden border border-gray-800 aspect-video min-h-[400px]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        className="w-full h-full object-cover"
        muted={muted}
        style={{ minHeight: '400px' }}
      />
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{label}</div>

      {!hasVideo && stream && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-black/50">
          <div className="text-center">
            <p className="text-sm">Đang chờ video từ host...</p>
            <p className="text-xs text-gray-400 mt-1">Stream đã kết nối</p>
          </div>
        </div>
      )}

      {autoplayBlocked && (
        <button
          onClick={handlePlayClick}
          className="absolute inset-0 flex items-center justify-center text-white bg-black/50 z-10"
        >
          <div className="text-center">
            <p className="text-sm font-semibold">Nhấn để phát video</p>
            <p className="text-xs text-gray-300 mt-1">Trình duyệt chặn autoplay</p>
          </div>
        </button>
      )}
    </div>
  );
}

export function WebRTCViewer({ sessionId, displayName, reactions = [], iceServers }: WebRTCViewerProps) {
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isMuted, setIsMuted] = useState(true);
  const [autoplayWarning, setAutoplayWarning] = useState(false);
  const remoteVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    let mounted = true;
    let isJoining = false;

    const join = async () => {
      if (isJoining) return;
      isJoining = true;

      try {
        // Configure ICE servers trước khi join
        if (iceServers && iceServers.length > 0) {
          console.log('[WebRTCViewer] Configuring ICE servers:', iceServers);
          webrtcService.configure({ iceServers });
        } else {
          console.log('[WebRTCViewer] Using default ICE servers');
          webrtcService.configure(); // Reset to defaults
        }
        
        await webrtcService.joinSession(sessionId, displayName, 'student', { sendMedia: false });
      } catch (error) {
        console.error('[WebRTCViewer] Join error', error);
      } finally {
        isJoining = false;
      }
    };

    join();

    webrtcService.onRemoteStream = (userId, stream) => {
      if (!mounted) return;
      console.log(`[WebRTCViewer] Remote stream received from ${userId}`);
      setRemoteStreams((prev) => ({ ...prev, [userId]: stream }));
      setAutoplayWarning(false);
    };
    webrtcService.onUserLeft = (userId) => {
      if (!mounted) return;
      console.log(`[WebRTCViewer] User left: ${userId}`);
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    return () => {
      mounted = false;
      webrtcService.onRemoteStream = undefined;
      webrtcService.onUserLeft = undefined;
      webrtcService.leaveSession(sessionId).catch(console.error);
    };
  }, [sessionId, displayName, iceServers]);

  const registerVideoRef = useCallback((userId: string, element: HTMLVideoElement | null) => {
    if (element) {
      remoteVideoRefs.current[userId] = element;
    } else {
      delete remoteVideoRefs.current[userId];
    }
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setAutoplayWarning(false);

    // Chỉ đổi mute, không gọi play() lại để tránh lỗi Autoplay
    Object.values(remoteVideoRefs.current).forEach((videoElement) => {
      if (!videoElement) return;
      videoElement.muted = next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Bạn đang xem livestream qua WebRTC. Nếu video chưa phát, hãy nhấn vào video hoặc nút "Bật âm thanh".
          </p>
          {Object.keys(remoteStreams).length > 0 && (
            <Button
              type="button"
              size="sm"
              variant={isMuted ? 'secondary' : 'primary'}
              onClick={toggleMute}
              className="flex items-center gap-2 self-start"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            </Button>
          )}
        </div>
        {autoplayWarning && (
          <p className="text-xs text-amber-600 mt-2">
            Trình duyệt chặn autoplay có âm thanh. Vui lòng nhấn vào video hoặc nút "Bật âm thanh" sau khi tương tác.
          </p>
        )}
      </div>

      {Object.keys(remoteStreams).length === 0 ? (
        <div className="bg-gray-900 text-white rounded-2xl h-96 flex items-center justify-center text-sm relative">
          Đang chờ host phát trực tiếp...
          <ReactionOverlay reactions={reactions} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(remoteStreams).map(([userId, stream]) => (
            <div key={userId} className="relative">
              <RemoteTile
                stream={stream}
                label={`Host ${userId.slice(0, 4)}`}
                muted={isMuted}
                userId={userId}
                registerRef={registerVideoRef}
                onAutoplayBlocked={() => setAutoplayWarning(true)}
              />
              <ReactionOverlay reactions={reactions} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WebRTCViewer;
