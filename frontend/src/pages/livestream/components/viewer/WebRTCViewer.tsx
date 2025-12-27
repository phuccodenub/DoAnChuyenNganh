import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, TouchEventHandler } from 'react';
import { ChevronLeft, ChevronRight, Eye, Maximize2, MessageSquare, Minimize2, Volume2, VolumeX, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import webrtcService from '@/services/webrtcService';
import { ReactionOverlay } from '../shared/ReactionOverlay';
import { LiveStreamChat, LiveStreamChatState } from '../shared/LiveStreamChat';

interface WebRTCViewerProps {
  sessionId: string;
  displayName?: string;
  reactions?: Array<{ emoji: string; userName: string }>;
  iceServers?: RTCIceServer[];
  isLive?: boolean;
  viewerCount?: number;
  showViewerCount?: boolean;
  sessionStatus?: 'scheduled' | 'live' | 'ended' | 'cancelled';
  chatState: LiveStreamChatState;
  chatEnabled: boolean;
  recentReactions?: Array<{ emoji: string; userName: string; timestamp: number }>;
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
  isLive?: boolean;
  viewerCount?: number;
  showViewerCount?: boolean;
  sessionId: string;
  sessionStatus?: 'scheduled' | 'live' | 'ended' | 'cancelled';
  chatState: LiveStreamChatState;
  chatEnabled: boolean;
  recentReactions?: Array<{ emoji: string; userName: string; timestamp: number }>;
  reactions?: Array<{ emoji: string; userName: string }>;
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
  isLive,
  viewerCount,
  showViewerCount,
  sessionId,
  sessionStatus,
  chatState,
  chatEnabled,
  recentReactions,
  reactions,
}: RemoteTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isMobileChatVisible, setIsMobileChatVisible] = useState(true);
  const [mobileChatDragOffset, setMobileChatDragOffset] = useState(0);
  const [isMobileChatDragging, setIsMobileChatDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true));
  const hideControlsTimeoutRef = useRef<number | null>(null);
  const mobileChatTouchStartX = useRef<number | null>(null);

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

  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      window.clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    scheduleHideControls();

    return () => {
      if (hideControlsTimeoutRef.current) {
        window.clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [scheduleHideControls]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const nowFullscreen = document.fullscreenElement === containerRef.current;
      setIsFullscreen(nowFullscreen);
      if (!nowFullscreen) {
        // Thoát fullscreen thì luôn thu gọn chat, lần sau user tự mở lại
        setIsChatVisible(false);
        setIsMobileChatVisible(true);
        setMobileChatDragOffset(0);
        setIsMobileChatDragging(false);
        mobileChatTouchStartX.current = null;
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const nowDesktop = window.innerWidth >= 1024;
      setIsDesktop(nowDesktop);
      if (nowDesktop) {
        setIsMobileChatVisible(true);
        setMobileChatDragOffset(0);
        setIsMobileChatDragging(false);
        mobileChatTouchStartX.current = null;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUserInteraction = useCallback(() => {
    setShowControls(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

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

  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await containerRef.current.requestFullscreen();
    }
  };

  const controlsVisibilityClass = showControls ? 'opacity-100' : 'opacity-0 pointer-events-none';
  const shouldShowDesktopChat = isFullscreen && isDesktop && chatEnabled;
  const shouldShowMobileChat = isFullscreen && !isDesktop && chatEnabled;
  const isFullscreenMobile = isFullscreen && !isDesktop;
  const desktopChatWidth = 360;
  const mobileChatMaxDrag = 260;
  const mobileChatDismissThreshold = mobileChatMaxDrag * 0.35;
  const handleMobileChatTouchStart: TouchEventHandler<HTMLDivElement> = useCallback((event) => {
    mobileChatTouchStartX.current = event.touches[0]?.clientX ?? null;
    setIsMobileChatDragging(true);
  }, []);

  const handleMobileChatTouchMove: TouchEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (mobileChatTouchStartX.current === null) return;
      const currentX = event.touches[0]?.clientX ?? mobileChatTouchStartX.current;
      const deltaX = currentX - mobileChatTouchStartX.current;
      if (isMobileChatVisible && deltaX <= 0) {
        setMobileChatDragOffset(Math.max(deltaX, -mobileChatMaxDrag));
      } else if (!isMobileChatVisible && deltaX >= 0) {
        setMobileChatDragOffset(Math.min(deltaX, mobileChatMaxDrag));
      }
    },
    [isMobileChatVisible, mobileChatMaxDrag]
  );

  const handleMobileChatTouchEnd: TouchEventHandler<HTMLDivElement> = useCallback(() => {
    if (isMobileChatVisible && Math.abs(mobileChatDragOffset) >= mobileChatDismissThreshold) {
      setIsMobileChatVisible(false);
    } else if (!isMobileChatVisible && mobileChatDragOffset >= mobileChatDismissThreshold * 0.8) {
      setIsMobileChatVisible(true);
    }
    setMobileChatDragOffset(0);
    setIsMobileChatDragging(false);
    mobileChatTouchStartX.current = null;
  }, [isMobileChatVisible, mobileChatDragOffset, mobileChatDismissThreshold]);

  const mobileChatTransformStyle = useMemo<CSSProperties>(() => {
    const base = isMobileChatVisible ? '0%' : '-105%';
    const easedOffset = mobileChatDragOffset * 0.92;
    return {
      transform: `translate3d(calc(${base} + ${easedOffset}px), 0, 0)`,
      opacity: isMobileChatVisible ? 1 : 0.9,
      transition: isMobileChatDragging ? 'none' : 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease',
    };
  }, [isMobileChatVisible, mobileChatDragOffset, isMobileChatDragging]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-zinc-900 webrtc-container"
      onPointerDown={handleUserInteraction}
      onPointerMove={handleUserInteraction}
    >
      <div
        className="w-full h-full"
        onTouchStart={handleMobileChatTouchStart}
        onTouchMove={handleMobileChatTouchMove}
        onTouchEnd={handleMobileChatTouchEnd}
      >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        className="w-full h-full object-contain bg-zinc-900"
        muted={muted}
        />
      </div>
      {/* <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{label}</div> */}

      {/* LIVE badge and viewer count - Hidden here, shown in parent overlay instead to be in same row with host info */}

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

      <div className={`absolute bottom-2 right-2 z-30 flex items-center gap-2 transition-opacity duration-200 ${controlsVisibilityClass}`}>
        {!isFullscreenMobile && (
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/20 transition-colors"
            aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {isFullscreenMobile && (
        <button
          type="button"
          onClick={handleToggleFullscreen}
          className={`absolute top-2 right-2 z-30 p-2 rounded-full bg-black/60 text-white border border-white/20 hover:bg-black/80 transition-colors ${controlsVisibilityClass}`}
          aria-label="Thoát toàn màn hình"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {!isFullscreenMobile && (
        <div
          className={`absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 text-white rounded-full px-2 py-1 backdrop-blur-sm z-20 group transition-opacity duration-200 ${controlsVisibilityClass}`}
        >
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
      )}

      <ReactionOverlay reactions={reactions ?? []} />

      {shouldShowDesktopChat && (
        <>
          <button
            type="button"
            onClick={() => setIsChatVisible((prev) => !prev)}
            style={{ right: `${isChatVisible ? desktopChatWidth : 0}px` }}
            className={`mr-2 absolute top-1/2 z-40 -translate-y-1/2 flex items-center gap-2 rounded-full bg-black/60 text-white border border-white/40 px-2 py-2 shadow-lg hover:bg-black/80 hover:scale-105 active:scale-95 transition-all ${
              !isChatVisible ? 'animate-pulse' : ''
            }`}
            aria-label={isChatVisible ? 'Thu gọn chat' : 'Mở chat'}
          >
            {isChatVisible ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            <MessageSquare className="w-4 h-4" />
          </button>
          {isChatVisible && (
            <div className="absolute inset-y-0 right-0 flex justify-end pointer-events-none">
              <div
                style={{ width: desktopChatWidth }}
                className="h-full transition-all duration-300 ease-out translate-x-0 opacity-100"
              >
                <LiveStreamChat
                  sessionId={sessionId}
                  enabled={chatEnabled}
                  chatState={chatState}
                  variant="fullscreenDesktop"
                  recentReactions={recentReactions}
                  className="h-full pointer-events-auto px-4"
                />
              </div>
            </div>
          )}
        </>
      )}

      {shouldShowMobileChat && (
        <div className="absolute inset-x-0 bottom-0 z-30 px-3 pb-3 pointer-events-none">
          <div className="relative">
            <div
              className="pointer-events-auto will-change-transform"
              style={mobileChatTransformStyle}
              onTouchStart={handleMobileChatTouchStart}
              onTouchMove={handleMobileChatTouchMove}
              onTouchEnd={handleMobileChatTouchEnd}
            >
              <LiveStreamChat
                sessionId={sessionId}
                enabled={chatEnabled}
                chatState={chatState}
                variant="fullscreenMobile"
                recentReactions={recentReactions}
                className="max-h-[45vh] min-h-[220px]"
              />
            </div>
            {!isMobileChatVisible && (
              <div className="pointer-events-none absolute inset-0" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function WebRTCViewer({
  sessionId,
  displayName,
  reactions = [],
  iceServers,
  isLive,
  viewerCount,
  showViewerCount,
  sessionStatus,
  chatState,
  chatEnabled,
  recentReactions,
}: WebRTCViewerProps) {
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [autoplayWarning, setAutoplayWarning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'waiting' | 'connected'>('connecting');
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
        console.log('[WebRTCViewer] Successfully joined session, waiting for remote stream...');
      } catch (error) {
        console.error('[WebRTCViewer] Join error', error);
      } finally {
        isJoining = false;
      }
    };

    join();

    webrtcService.onRemoteStream = (userId, stream) => {
      if (!mounted) return;
      console.log(`[WebRTCViewer] ✅ Remote stream received from ${userId}`, {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        streamId: stream.id
      });
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
    <div className="w-full h-full">
      {Object.keys(remoteStreams).length === 0 ? (
        <div className="bg-zinc-900 text-white h-full flex items-center justify-center text-sm relative">
          Đang chờ host phát trực tiếp...
          <ReactionOverlay reactions={reactions} />
        </div>
      ) : (
        <div className="w-full h-full">
          {Object.entries(remoteStreams).map(([userId, stream]) => (
            <div key={userId} className="relative w-full h-full">
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
                isLive={isLive}
                viewerCount={viewerCount}
                showViewerCount={showViewerCount}
                sessionId={sessionId}
                sessionStatus={sessionStatus}
                chatState={chatState}
                chatEnabled={chatEnabled}
                recentReactions={recentReactions}
                reactions={reactions}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WebRTCViewer;
