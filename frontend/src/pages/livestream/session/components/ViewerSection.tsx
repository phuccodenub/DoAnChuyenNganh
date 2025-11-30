import { memo, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { WebRTCViewer } from '@/pages/livestream/components/viewer';
import { ReactionOverlay } from '@/pages/livestream/components/shared';
import { LiveStreamChatState } from '../../components/shared/LiveStreamChat';

type Reaction = { emoji: string; userName: string };

const DEFAULT_TARGET_DURATION = 4;
const START_BUFFER_SEGMENTS = 3;
const RESUME_BUFFER_SEGMENTS = 1.5;
const CRITICAL_BUFFER_SEGMENTS = 0.75;
const BUFFER_CHECK_INTERVAL_MS = 500;

const HlsPreview = memo(({ playbackUrl }: { playbackUrl: string }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const isInitializedRef = useRef(false);
  const currentUrlRef = useRef<string | null>(null);
  const bufferCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastBufferCheckRef = useRef<number>(0);
  const targetDurationRef = useRef(DEFAULT_TARGET_DURATION);
  const playlistDurationRef = useRef(DEFAULT_TARGET_DURATION * (START_BUFFER_SEGMENTS + 1));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const playAttemptedRef = useRef(false);

  const getBufferThresholds = () => {
    const target = Math.max(targetDurationRef.current || DEFAULT_TARGET_DURATION, 1);
    const playlist = Math.max(
      playlistDurationRef.current || target * (START_BUFFER_SEGMENTS + 1),
      target * (START_BUFFER_SEGMENTS + 1),
    );

    const playlistAllowance = Math.max(playlist - target, target * (START_BUFFER_SEGMENTS - 0.25));
    const startBufferSeconds = Math.max(
      Math.min(target * START_BUFFER_SEGMENTS, playlistAllowance),
      target * 1.5,
    );

    const resumeUpperBound = Math.max(startBufferSeconds - target * 0.5, target * 1.25);
    const resumeBufferSeconds = Math.min(
      Math.max(target * RESUME_BUFFER_SEGMENTS, target),
      Math.max(resumeUpperBound, target * RESUME_BUFFER_SEGMENTS),
    );

    const criticalUpperBound = Math.max(resumeBufferSeconds - target * 0.4, target * 0.75);
    const criticalBufferSeconds = Math.min(
      Math.max(target * CRITICAL_BUFFER_SEGMENTS, target * 0.5),
      criticalUpperBound,
    );

    return {
      start: startBufferSeconds,
      resume: Math.max(Math.min(resumeBufferSeconds, startBufferSeconds - target * 0.25), target),
      critical: Math.max(Math.min(criticalBufferSeconds, resumeBufferSeconds - target * 0.2), target * 0.5),
    };
  };

  useEffect(() => {
    if (!isInitializedRef.current || currentUrlRef.current !== playbackUrl) {
      console.log('[HlsPreview] useEffect triggered:', {
        playbackUrl,
        hasVideoRef: !!videoRef.current,
        isInitialized: isInitializedRef.current,
        currentUrl: currentUrlRef.current,
      });
    }

    if (!playbackUrl) {
      console.warn('[HlsPreview] No playback URL provided');
      return;
    }

    if (!videoRef.current) {
      console.warn('[HlsPreview] Video element not available yet');
      return;
    }

    if (isInitializedRef.current && currentUrlRef.current === playbackUrl && hlsRef.current) {
      const hlsState = hlsRef.current.media?.readyState;
      if (hlsState !== undefined) {
        return;
      } else {
        console.log('[HlsPreview] HLS instance was destroyed, recreating...');
        isInitializedRef.current = false;
        currentUrlRef.current = null;
      }
    }

    if (currentUrlRef.current && currentUrlRef.current !== playbackUrl && hlsRef.current) {
      console.log('[HlsPreview] URL changed, cleaning up old instance');
      hlsRef.current.destroy();
      hlsRef.current = null;
      isInitializedRef.current = false;
    }

    console.log('[HlsPreview] Checking HLS.js support:', Hls.isSupported());

    if (Hls.isSupported()) {
      console.log('[HlsPreview] HLS.js is supported, initializing...');
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        maxBufferSize: 200 * 1000 * 1000,
        maxBufferHole: 1.0,
        maxStarvationDelay: 15,
        startLevel: -1,
        manifestLoadingTimeOut: 30000,
        manifestLoadingMaxRetry: 10,
        manifestLoadingRetryDelay: 3000,
        levelLoadingTimeOut: 30000,
        levelLoadingMaxRetry: 10,
        levelLoadingRetryDelay: 3000,
        fragLoadingTimeOut: 30000,
        fragLoadingMaxRetry: 20,
        fragLoadingRetryDelay: 2000,
        startFragPrefetch: true,
        testBandwidth: true,
        liveSyncDurationCount: 15,
        liveMaxLatencyDurationCount: 30,
        liveDurationInfinity: true,
        liveBackBufferLength: 15,
        highBufferWatchdogPeriod: 2,
        abrEwmaDefaultEstimate: 500000,
        abrBandWidthFactor: 0.95,
        abrBandWidthUpFactor: 0.7,
      });

      hlsRef.current = hls;
      let retryCount = 0;
      const maxRetries = 3;
      let loadedFragmentsCount = 0;

      console.log('[HlsPreview] Registering event listeners...');

      const attemptPlay = async () => {
        if (!videoRef.current || playAttemptedRef.current) return;

        try {
          playAttemptedRef.current = true;
          await videoRef.current.play();
          setIsPlaying(true);
          setAutoplayBlocked(false);
        } catch (error: any) {
          playAttemptedRef.current = false;

          if (error.name === 'NotAllowedError') {
            setAutoplayBlocked(true);
            console.log('[HlsPreview] Autoplay blocked, waiting for user interaction');
          } else if (error.name === 'AbortError') {
            console.debug('[HlsPreview] Play aborted (likely due to state change)');
          } else {
            console.warn('[HlsPreview] Play error:', error.name, error.message);
          }
        }
      };

      hls.on(Hls.Events.MANIFEST_LOADING, (_: any, data: any) => {
        console.log('[HlsPreview] Loading manifest from:', playbackUrl, data);
      });

      hls.on(Hls.Events.MANIFEST_LOADED, (_: any, data: any) => {
        console.log('[HlsPreview] Manifest loaded:', {
          levels: data.levels?.length || 0,
          firstLevel: data.levels?.[0],
          url: playbackUrl,
          data,
        });
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        retryCount = 0;
        playAttemptedRef.current = false;
        loadedFragmentsCount = 0;
        const fragmentCount = (data as any).levels?.[0]?.fragments?.length || 0;
        console.log('[HlsPreview] Manifest parsed:', {
          levels: data.levels?.length || 0,
          fragments: fragmentCount,
          totalDuration: (data as any).levels?.[0]?.totalduration,
        });

        if (fragmentCount === 0) {
          console.warn('[HlsPreview] No fragments found. Waiting for stream to start...');
        } else {
          console.log(`[HlsPreview] Found ${fragmentCount} fragments, starting to load...`);
        }
      });

      hls.on(Hls.Events.LEVEL_LOADED, (_: any, data: any) => {
        retryCount = 0;
        const targetDuration = Math.max(data.details?.targetduration || DEFAULT_TARGET_DURATION, 1);
        const totalDuration = Math.max(
          data.details?.totalduration ||
            targetDuration * (data.details?.fragments?.length || START_BUFFER_SEGMENTS + 1),
          targetDuration * (START_BUFFER_SEGMENTS + 1),
        );
        targetDurationRef.current = targetDuration;
        playlistDurationRef.current = totalDuration;

        const thresholds = getBufferThresholds();
        console.log('[HlsPreview] Level loaded:', {
          level: data.level,
          targetDuration: targetDuration.toFixed(2),
          fragments: data.details?.fragments.length || 0,
          playlistDuration: totalDuration.toFixed(2),
          thresholds,
        });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, () => {});

      hls.on(Hls.Events.FRAG_LOADING, (_, data) => {
        if (loadedFragmentsCount % 10 === 0) {
          console.debug(`[HlsPreview] Fragment loading: ${data.frag?.relurl || 'unknown'}`);
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, (_: any, data: any) => {
        loadedFragmentsCount++;
        if (loadedFragmentsCount % 10 === 0 || loadedFragmentsCount === 1) {
          console.debug(`[HlsPreview] Fragment loaded (${loadedFragmentsCount}): ${data.frag?.relurl || 'unknown'}`);
        }
      });

      hls.on(Hls.Events.FRAG_PARSING_INIT_SEGMENT, () => {
        console.debug('[HlsPreview] Parsing init segment');
      });

      hls.on(Hls.Events.FRAG_PARSING_USERDATA, () => {});

      hls.on(Hls.Events.FRAG_PARSED, () => {
        if (loadedFragmentsCount % 10 === 0) {
          console.debug('[HlsPreview] Fragment parsed');
        }
      });

      hls.on(Hls.Events.BUFFER_APPENDING, () => {
        console.debug('[HlsPreview] Buffer appending');
      });

      hls.on(Hls.Events.BUFFER_APPENDED, () => {
        if (videoRef.current && videoRef.current.buffered.length > 0) {
          const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
          const currentTime = videoRef.current.currentTime || 0;
          const bufferLength = Math.max(0, bufferedEnd - currentTime);

          const { critical } = getBufferThresholds();
          if (!videoRef.current.paused && bufferLength < critical) {
            console.warn(
              `[HlsPreview] Buffer too low during playback (${bufferLength.toFixed(2)}s), pausing to build buffer...`,
            );
            videoRef.current.pause();
            setIsPlaying(false);
            playAttemptedRef.current = false;
          }
        }
      });

      if (videoRef.current) {
        let waitingCount = 0;
        videoRef.current.addEventListener('waiting', () => {
          waitingCount++;
          if (waitingCount % 5 === 0) {
            console.warn(`[HlsPreview] Video waiting (buffering) - ${waitingCount} times`);
          }
        });

        videoRef.current.addEventListener('stalled', () => {
          console.warn('[HlsPreview] Video stalled - stream may be stuck');
        });

        videoRef.current.addEventListener(
          'canplay',
          () => {
            if (videoRef.current && videoRef.current.paused) {
              const bufferedEnd =
                videoRef.current.buffered.length > 0
                  ? videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
                  : 0;
              const currentTime = videoRef.current.currentTime || 0;
              const bufferLength = Math.max(0, bufferedEnd - currentTime);

              const { start } = getBufferThresholds();
              if (bufferLength < start) {
                console.log(
                  `[HlsPreview] Video can play but buffer too low (${bufferLength.toFixed(2)}s / ${start.toFixed(2)}s), keeping paused...`,
                );
                videoRef.current.pause();
              }
            }
          },
          { once: false },
        );

        videoRef.current.addEventListener(
          'canplaythrough',
          () => {
            if (videoRef.current && videoRef.current.paused) {
              const bufferedEnd =
                videoRef.current.buffered.length > 0
                  ? videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
                  : 0;
              const currentTime = videoRef.current.currentTime || 0;
              const bufferLength = Math.max(0, bufferedEnd - currentTime);

              const { start } = getBufferThresholds();
              if (bufferLength < start) {
                console.log(
                  `[HlsPreview] Video can playthrough but buffer too low (${bufferLength.toFixed(2)}s / ${start.toFixed(2)}s), keeping paused...`,
                );
                videoRef.current.pause();
              }
            }
          },
          { once: false },
        );
      }

      hls.on(Hls.Events.ERROR, (_: any, data: any) => {
        console.error('[HlsPreview] HLS Error:', {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
          error: data.error,
          frag: data.frag,
          response: data.response,
          url: data.url,
          context: data.context,
          code: data.code,
          reason: data.reason,
        });

        if (!data.fatal) {
          if (data.details === 'fragLoadTimeOut') {
            console.debug('[HlsPreview] Fragment load timeout (file may be writing). HLS.js will retry automatically.');
            return;
          }

          if (data.details === 'levelLoadTimeOut') {
            console.warn(
              '[HlsPreview] Level load timeout (playlist may be updating or stream not ready). HLS.js will retry automatically.',
            );
            return;
          }

          if (data.details === 'bufferStalledError') {
            return;
          }

          if (data.details === 'bufferSeekOverHole') {
            return;
          }

          if (
            data.type === 'bufferAppendingError' ||
            data.type === 'bufferAppendError' ||
            data.type === 'bufferStalledError'
          ) {
            return;
          }

          console.warn('[HlsPreview] Non-fatal error:', data.type, data.details);
          return;
        }

        console.error('[HlsPreview] Fatal error:', data.type, data.details);

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            if (data.details === 'manifestLoadTimeOut') {
              console.log(
                `[HlsPreview] Manifest timeout (stream may not be ready yet), retrying (${retryCount + 1}/${maxRetries})...`,
              );
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                  console.log(`[HlsPreview] Retrying manifest load (attempt ${retryCount})...`);
                  hls.loadSource(playbackUrl);
                }, 3000 * retryCount);
              } else {
                console.error(
                  '[HlsPreview] Max retries reached. Stream may not be active yet. Please ensure OBS is streaming.',
                );
              }
            } else if (data.details === 'levelLoadTimeOut') {
              console.warn(
                `[HlsPreview] Level load timeout (playlist may not be ready), retrying (${retryCount + 1}/${maxRetries})...`,
              );
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                  console.log(`[HlsPreview] Retrying level load (attempt ${retryCount})...`);
                  hls.loadSource(playbackUrl);
                }, 3000 * retryCount);
              } else {
                console.error(
                  '[HlsPreview] Max retries reached for level load. Stream may not be active yet. Please ensure OBS is streaming.',
                );
              }
            } else {
              console.log(
                `[HlsPreview] Network error (${data.details}), retrying (${retryCount + 1}/${maxRetries})...`,
              );
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                  hls.startLoad();
                }, 2000 * retryCount);
              } else {
                console.error('[HlsPreview] Max retries reached, cannot recover from network error');
              }
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.warn(
              `[HlsPreview] Media error (${data.details}), attempting recovery (${retryCount + 1}/${maxRetries})...`,
            );
            try {
              hls.recoverMediaError();
              retryCount = 0;
              console.log('[HlsPreview] Media error recovery initiated');
            } catch (recoverError) {
              console.error('[HlsPreview] Recovery failed:', recoverError);
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                  console.log(`[HlsPreview] Reloading source after media error (attempt ${retryCount})...`);
                  hls.loadSource(playbackUrl);
                }, 3000 * retryCount);
              } else {
                console.error(
                  '[HlsPreview] Max retries reached, cannot recover from media error. Please refresh the page.',
                );
              }
            }
            break;
          default:
            console.error('[HlsPreview] Unknown fatal error, destroying HLS instance');
            hls.destroy();
            break;
        }
      });

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.autoplay = false;
        videoRef.current.addEventListener(
          'canplay',
          () => {
            if (videoRef.current && !videoRef.current.paused) {
              console.warn('[HlsPreview] Video tried to auto-play before buffer ready, pausing...');
              videoRef.current.pause();
              setIsPlaying(false);
              playAttemptedRef.current = false;
            }
          },
          { once: false },
        );
      }

      console.log('[HlsPreview] Loading source and attaching media...');
      hls.loadSource(playbackUrl);
      hls.attachMedia(videoRef.current);
      currentUrlRef.current = playbackUrl;
      isInitializedRef.current = true;
      console.log('[HlsPreview] Source loaded and media attached');

      bufferCheckIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !hlsRef.current || hlsRef.current !== hls) {
          if (bufferCheckIntervalRef.current) {
            clearInterval(bufferCheckIntervalRef.current);
            bufferCheckIntervalRef.current = null;
          }
          return;
        }

        if (videoRef.current.readyState >= 2) {
          if (videoRef.current.buffered.length > 0) {
            const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
            const currentTime = videoRef.current.currentTime || 0;
            const bufferLength = Math.max(0, bufferedEnd - currentTime);
            const { start, resume } = getBufferThresholds();

            if (bufferLength >= start && videoRef.current.paused && !playAttemptedRef.current) {
              console.log(
                `[HlsPreview] Buffer ready (${bufferLength.toFixed(2)}s / ${start.toFixed(2)}s target), starting playback...`,
              );
              attemptPlay();
            } else if (bufferLength < start && videoRef.current.paused) {
              const now = Date.now();
              if (!lastBufferCheckRef.current || now - lastBufferCheckRef.current > 5000) {
                console.log(
                  `[HlsPreview] Building buffer... (${bufferLength.toFixed(2)}s / ${start.toFixed(2)}s)`,
                );
                lastBufferCheckRef.current = now;
              }
            } else if (!videoRef.current.paused && bufferLength < resume) {
              console.warn(
                `[HlsPreview] Buffer dropped (${bufferLength.toFixed(2)}s < ${resume.toFixed(2)}s), pausing to rebuild...`,
              );
              videoRef.current.pause();
              setIsPlaying(false);
              playAttemptedRef.current = false;
            }
          }
        }
      }, BUFFER_CHECK_INTERVAL_MS);
    } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = playbackUrl;
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch((error: any) => {
          if (error.name === 'NotAllowedError') {
            setAutoplayBlocked(true);
            console.log('[HlsPreview] Autoplay blocked on Safari');
          } else if (error.name !== 'AbortError') {
            console.warn('[HlsPreview] Play error:', error.name);
          }
        });
    }

    return () => {
      const shouldCleanup = currentUrlRef.current !== playbackUrl;

      if (bufferCheckIntervalRef.current) {
        clearInterval(bufferCheckIntervalRef.current);
        bufferCheckIntervalRef.current = null;
      }

      if (shouldCleanup && hlsRef.current) {
        console.log('[HlsPreview] Cleanup: URL changed or component unmounting, destroying HLS instance...');
        hlsRef.current.destroy();
        hlsRef.current = null;
        isInitializedRef.current = false;
        currentUrlRef.current = null;
      }
    };
  }, [playbackUrl]);

  const handlePlay = async () => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
    } catch (error: any) {
      console.error('[HlsPreview] Manual play failed:', error);
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume;
    videoRef.current.muted = isMuted || volume === 0;
  }, [volume, isMuted]);

  const handleVolumeChange = (nextVolume: number) => {
    setVolume(nextVolume);
    if (nextVolume > 0 && isMuted) {
      setIsMuted(false);
    }
    if (nextVolume === 0 && !isMuted) {
      setIsMuted(true);
    }
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden border border-gray-800 relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay={false}
        playsInline
        muted={isMuted}
        onPlay={() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        }}
        onPause={() => setIsPlaying(false)}
      />

      {autoplayBlocked && !isPlaying && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer z-10" onClick={handlePlay}>
          <div className="text-center">
            <button
              type="button"
              onClick={handlePlay}
              className="w-20 h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors mb-4"
            >
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </button>
            <p className="text-white text-sm">Nhấn để phát video</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                if (videoRef.current) {
                  if (isPlaying) {
                    videoRef.current.pause();
                  } else {
                    try {
                      await videoRef.current.play();
                      setIsPlaying(true);
                      setAutoplayBlocked(false);
                    } catch (error: any) {
                      if (error.name === 'NotAllowedError') {
                        setAutoplayBlocked(true);
                        console.log('[HlsPreview] Play blocked, user interaction required');
                      } else {
                        console.error('[HlsPreview] Play failed:', error);
                      }
                    }
                  }
                }
              }}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              title={isPlaying ? 'Tạm dừng' : 'Phát'}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.617a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              className="w-28 h-1 accent-white bg-white/30 rounded-full"
              value={isMuted ? 0 : Math.round(volume * 100)}
              onChange={(event) => handleVolumeChange(Number(event.target.value) / 100)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">LIVE</span>
            <button
              type="button"
              onClick={() => videoRef.current?.requestFullscreen?.()}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              title="Toàn màn hình"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zM17 4a1 1 0 00-1-1h-4a1 1 0 100 2h1.586l-2.293 2.293a1 1 0 101.414 1.414L14 6.414V8a1 1 0 102 0V4zM3 16a1 1 0 001 1h4a1 1 0 100-2H6.414l2.293-2.293a1 1 0 10-1.414-1.414L5 13.586V12a1 1 0 10-2 0v4zM17 16a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L14 13.586V12a1 1 0 112 0v4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

HlsPreview.displayName = 'HlsPreview';

interface ViewerSectionProps {
  mode: 'webrtc' | 'rtmp' | 'unknown';
  sessionId: string | number;
  sessionTitle: string;
  playbackUrl?: string;
  reactions: Reaction[];
  iceServers?: RTCIceServer[];
  isLive?: boolean;
  viewerCount?: number;
  showViewerCount?: boolean;
  chatState: LiveStreamChatState;
  chatEnabled: boolean;
  sessionStatus?: 'scheduled' | 'live' | 'ended' | 'cancelled';
  recentReactions?: Array<{ emoji: string; userName: string; timestamp: number }>;
}

export function ViewerSection({
  mode,
  sessionId,
  sessionTitle,
  playbackUrl,
  reactions,
  iceServers,
  isLive,
  viewerCount,
  showViewerCount,
  chatState,
  chatEnabled,
  sessionStatus,
  recentReactions,
}: ViewerSectionProps) {
  if (mode === 'webrtc') {
    return (
      <div className="w-full h-full">
        <WebRTCViewer
          sessionId={sessionId}
          displayName={sessionTitle}
          reactions={reactions}
          iceServers={iceServers}
          isLive={isLive}
          viewerCount={viewerCount}
          showViewerCount={showViewerCount}
          chatState={chatState}
          chatEnabled={chatEnabled}
          sessionStatus={sessionStatus}
          recentReactions={recentReactions}
        />
      </div>
    );
  }

  if (mode === 'rtmp') {
    if (!playbackUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          Phiên này yêu cầu stream key/Playback URL nhưng chưa được cấu hình. Vui lòng kiểm tra lại với người host.
        </div>
      );
    }

    return (
      <div className="w-full h-full relative">
        <HlsPreview playbackUrl={playbackUrl} />
        <ReactionOverlay reactions={reactions} />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 border border-gray-200 px-4 py-3 rounded-lg text-gray-700">
      Phiên này chưa cấu hình kiểu ingest. Liên hệ instructor để cập nhật thông tin.
    </div>
  );
}

