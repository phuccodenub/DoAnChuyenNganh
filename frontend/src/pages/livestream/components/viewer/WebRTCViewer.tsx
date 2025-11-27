import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import webrtcService from '@/services/webrtcService';
import { ReactionOverlay } from '../shared/ReactionOverlay';

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
  volume: number;
  userId: string;
  registerRef: (userId: string, element: HTMLVideoElement | null) => void;
  onAutoplayBlocked: () => void;
  onToggleMute: () => void;
  onVolumeChange: (value: number) => void;
}

function RemoteTile({
  stream,
  label,
  muted,
  volume,
  userId,
  registerRef,
  onAutoplayBlocked,
  onToggleMute,
  onVolumeChange,
}: RemoteTileProps) {
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
    <div className="relative bg-black rounded-xl overflow-hidden border border-gray-800 aspect-video min-h-[480px] w-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        className="w-full h-full object-cover"
        muted={muted}
        style={{ minHeight: '400px' }}
      />
      {/* <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{label}</div> */}

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

      <div className="absolute bottom-3 left-2 flex items-center gap-2 bg-black/60 text-white rounded-full px-2 py-1 backdrop-blur-sm z-20 group">
        <button
          type="button"
          onClick={onToggleMute}
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <div className="w-0 group-hover:w-24 overflow-hidden transition-all duration-200 ease-out flex items-center">
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={muted ? 0 : Math.round(volume * 100)}
            onChange={(event) => onVolumeChange(Number(event.target.value) / 100)}
            className="w-24 h-1 accent-white bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto"
            style={{ margin: 0 }}
          />
        </div>
      </div>
    </div>
  );
}

export function WebRTCViewer({ sessionId, displayName, reactions = [], iceServers }: WebRTCViewerProps) {
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
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
      element.volume = volume;
      element.muted = isMuted || volume === 0;
    } else {
      delete remoteVideoRefs.current[userId];
    }
  }, [volume, isMuted]);

  const handleAutoplayBlocked = useCallback(() => {
    setAutoplayWarning(true);
  }, []);

  useEffect(() => {
    Object.values(remoteVideoRefs.current).forEach((videoElement) => {
      if (!videoElement) return;
      videoElement.volume = volume;
      videoElement.muted = isMuted || volume === 0;
    });
  }, [volume, isMuted]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setAutoplayWarning(false);
  };

  const handleVolumeChange = useCallback((nextVolume: number) => {
    setVolume(nextVolume);
    if (nextVolume > 0 && isMuted) {
      setIsMuted(false);
    }
    if (nextVolume === 0 && !isMuted) {
      setIsMuted(true);
    }
  }, [isMuted]);

  return (
    <div className="space-y-4">
      {Object.keys(remoteStreams).length === 0 ? (
        <div className="bg-gray-900 text-white rounded-2xl h-96 flex items-center justify-center text-sm relative">
          Đang chờ host phát trực tiếp...
          <ReactionOverlay reactions={reactions} />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 w-full">
          {Object.entries(remoteStreams).map(([userId, stream]) => (
            <div key={userId} className="relative w-full">
              <RemoteTile
                stream={stream}
                label={`Host ${userId.slice(0, 4)}`}
                muted={isMuted}
                volume={volume}
                userId={userId}
                registerRef={registerVideoRef}
                onAutoplayBlocked={handleAutoplayBlocked}
                onToggleMute={toggleMute}
                onVolumeChange={handleVolumeChange}
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
