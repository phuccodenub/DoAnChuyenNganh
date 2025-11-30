import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Video, Radio, Settings, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCreateSession } from '@/hooks/useLivestream';
import { useCourses } from '@/hooks/useCoursesData';
import { ROUTES } from '@/constants/routes';
import { livestreamApi } from '@/services/api/livestream.api';
import { useQueryClient } from '@tanstack/react-query';
import { livestreamQueryKeys } from '@/hooks/useLivestream';
import { VideoSourceSelector, PostDetailsForm } from './components';
import { generateStreamKey, generateRoomId, sanitizeStreamKeyForFilename, DEFAULT_SERVER_URL, DEFAULT_PLAYBACK_BASE, HLS_HTTP_BASE } from './utils';
import type { CreateSessionForm } from './types';

export function CreateLiveStreamPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: coursesResponse } = useCourses();
  const courses = coursesResponse?.data?.courses || [];
  const createSession = useCreateSession();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<CreateSessionForm>({
    mode: 'onChange', // Validate onChange để hiển thị error ngay
    defaultValues: {
      title: '', // Không có default value để user phải nhập
      description: '',
      duration_minutes: 60,
      videoSource: 'webcam',
      cameraDevice: 'camera-1',
      microphoneDevice: 'mic-1',
      shareScreen: false,
      shareToStory: true,
      notifyFollowers: true,
      crosspostGroup: false,
      audience: 'public',
      goLiveTiming: 'now',
      presetCommentEnabled: false,
      stream_key: generateStreamKey(),
      server_url: DEFAULT_SERVER_URL,
      usePersistentKey: false,
      enableBackupStream: false,
      playback_url: '',
      webrtcRoomId: generateRoomId(),
      scheduled_start: '',
    },
  });


  const goLiveTiming = watch('goLiveTiming');
  const audience = watch('audience');
  const videoSource = watch('videoSource');
  const presetCommentEnabled = watch('presetCommentEnabled');
  const cameraDevice = watch('cameraDevice');
  const microphoneDevice = watch('microphoneDevice');
  const streamKey = watch('stream_key');
  const serverUrl = watch('server_url');
  const usePersistentKey = watch('usePersistentKey');
  const enableBackupStream = watch('enableBackupStream');
  const playbackUrl = watch('playback_url');
  const webrtcRoomId = watch('webrtcRoomId');

  const [cameraOptions, setCameraOptions] = useState<Array<{ deviceId: string; label: string }>>([
    { deviceId: 'camera-1', label: 'Default Camera' },
  ]);
  const [microphoneOptions, setMicrophoneOptions] = useState<Array<{ deviceId: string; label: string }>>([
    { deviceId: 'mic-1', label: 'Default Microphone' },
  ]);
  const [cameraPreviewLoading, setCameraPreviewLoading] = useState(false);
  const [cameraPreviewError, setCameraPreviewError] = useState<string | null>(null);
  const [streamPreviewLoading, setStreamPreviewLoading] = useState(false);
  const [streamPreviewError, setStreamPreviewError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamingVideoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const previewBufferCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previewPlayAttemptedRef = useRef(false);
  const previewTargetDurationRef = useRef(2);
  const previewPlaylistDurationRef = useRef(8);
  const previewThroughputRef = useRef(1);
  const bufferLowGraceRef = useRef(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<'idle' | 'key' | 'server' | 'room'>('idle');
  const [playbackUrlTouched, setPlaybackUrlTouched] = useState(false);

  const getPreviewBufferThresholds = () => {
    const target = Math.max(previewTargetDurationRef.current || 2, 0.5);
    const start = Math.max(target * 0.7, Math.min(target * 1.1, 6));
    const resume = Math.max(start - target * 0.15, target * 0.5);
    const critical = Math.max(resume - target * 0.2, target * 0.3);
    return { start, resume, critical, target };
  };

  const stopPreviewBufferMonitor = () => {
    if (previewBufferCheckIntervalRef.current) {
      clearInterval(previewBufferCheckIntervalRef.current);
      previewBufferCheckIntervalRef.current = null;
    }
    previewPlayAttemptedRef.current = false;
    bufferLowGraceRef.current = 0;
  };

  const fetchActiveStreamKey = async (): Promise<string | null> => {
    try {
      const response = await fetch(`${HLS_HTTP_BASE}/stat`, { method: 'GET' });
      if (!response.ok) {
        return null;
      }
      const xml = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const streamNode = doc.querySelector('application > live > stream > name');
      const key = streamNode?.textContent?.trim();
      return key || null;
    } catch (error) {
      console.debug('Could not fetch active stream key from /stat:', error);
      return null;
    }
  };

  const syncPreviewWithActiveStream = async (): Promise<boolean> => {
    const activeKey = await fetchActiveStreamKey();
    if (!activeKey) {
      return false;
    }

    const sanitizedActiveKey = sanitizeStreamKeyForFilename(activeKey);
    const activePlaybackUrl = `${DEFAULT_PLAYBACK_BASE}/${sanitizedActiveKey}.m3u8`;

    const currentStreamKey = getValues('stream_key') || '';
    const sanitizedCurrentKey = sanitizeStreamKeyForFilename(currentStreamKey);
    const currentPlaybackUrl = (getValues('playback_url') || '').trim();

    if (
      sanitizedActiveKey === sanitizedCurrentKey &&
      activePlaybackUrl === currentPlaybackUrl
    ) {
      return false;
    }

    console.warn(
      '[CreateLiveStreamPage] Active stream key differs from current form values. Auto-syncing preview to',
      activeKey,
    );

    setValue('stream_key', activeKey, { shouldDirty: true });
    setPlaybackUrlTouched(false);
    setValue('playback_url', activePlaybackUrl, { shouldDirty: true });
    setStreamPreviewError(
      'Đã phát hiện OBS đang stream với Stream Key khác. Preview đã tự đồng bộ để khớp với luồng hiện tại.',
    );
    setStreamPreviewLoading(true);

    // Clear helper text sau vài giây để tránh dính lỗi
    setTimeout(() => {
      setStreamPreviewError(null);
    }, 8000);

    return true;
  };

  const stopPreviewStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const destroyStreamPreview = () => {
    // Clear polling interval nếu có
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    stopPreviewBufferMonitor();
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (streamingVideoRef.current) {
      streamingVideoRef.current.src = '';
      streamingVideoRef.current.load(); // Reset video element
    }
    previewThroughputRef.current = 1;
    bufferLowGraceRef.current = 0;
  };

  const handleCopy = async (value: string, type: 'key' | 'server' | 'room') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyFeedback(type);
      setTimeout(() => setCopyFeedback('idle'), 2000);
    } catch (error) {
      console.error('Copy failed', error);
      alert('Không thể copy. Vui lòng copy thủ công.');
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchDevices = async () => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        stream.getTracks().forEach((track) => track.stop());
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!mounted) return;
        const cameras = devices
          .filter((d) => d.kind === 'videoinput')
          .map((d, index) => ({
            deviceId: d.deviceId || `camera-${index + 1}`,
            label: d.label || `Camera ${index + 1}`,
          }));
        const microphones = devices
          .filter((d) => d.kind === 'audioinput')
          .map((d, index) => ({
            deviceId: d.deviceId || `mic-${index + 1}`,
            label: d.label || `Microphone ${index + 1}`,
          }));
        if (cameras.length) {
          setCameraOptions(cameras);
          let nextCamera = cameras[0].deviceId;
          if (typeof window !== 'undefined') {
            const storedCamera = localStorage.getItem('livestream:cameraDevice');
            if (storedCamera && cameras.some((camera) => camera.deviceId === storedCamera)) {
              nextCamera = storedCamera;
            }
          }
          setValue('cameraDevice', nextCamera);
        }
        if (microphones.length) {
          setMicrophoneOptions(microphones);
          let nextMic = microphones[0].deviceId;
          if (typeof window !== 'undefined') {
            const storedMic = localStorage.getItem('livestream:microphoneDevice');
            if (storedMic && microphones.some((mic) => mic.deviceId === storedMic)) {
              nextMic = storedMic;
            }
          }
          setValue('microphoneDevice', nextMic);
        }
      } catch (error) {
        console.warn('Cannot load media devices', error);
      }
    };
    fetchDevices();
    return () => {
      mounted = false;
    };
  }, [setValue]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (cameraDevice) {
      localStorage.setItem('livestream:cameraDevice', cameraDevice);
    }
  }, [cameraDevice]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (microphoneDevice) {
      localStorage.setItem('livestream:microphoneDevice', microphoneDevice);
    }
  }, [microphoneDevice]);

  // Tự động generate playback URL (chỉ để preview, backend sẽ tự generate khi tạo session)
  useEffect(() => {
    if (videoSource === 'software' && streamKey) {
      // Sanitize stream key để đảm bảo filename hợp lệ
      const sanitizedKey = sanitizeStreamKeyForFilename(streamKey);
      // Chỉ set nếu chưa có hoặc chưa được user chỉnh sửa
      if (!playbackUrl || !playbackUrlTouched) {
        setValue('playback_url', `${DEFAULT_PLAYBACK_BASE}/${sanitizedKey}.m3u8`, { shouldDirty: false });
      }
    }
  }, [videoSource, streamKey, playbackUrl, playbackUrlTouched, setValue]);

  useEffect(() => {
    if (videoSource === 'software') {
      stopPreviewStream();
      setCameraPreviewError(null);
    } else {
      destroyStreamPreview();
      setStreamPreviewError(null);
    }
  }, [videoSource]);

  useEffect(() => {
    const setupPreview = async () => {
      if (videoSource !== 'webcam') {
        stopPreviewStream();
        setCameraPreviewError(null);
        return;
      }
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setCameraPreviewError('Trình duyệt không hỗ trợ truy cập camera.');
        return;
      }
      setCameraPreviewLoading(true);
      setCameraPreviewError(null);
      try {
        const constraints: MediaStreamConstraints = {
          video: cameraDevice ? { deviceId: { exact: cameraDevice } } : true,
          audio: microphoneDevice ? { deviceId: { exact: microphoneDevice } } : true,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stopPreviewStream();
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch (error) {
        console.error('Camera preview error', error);
        setCameraPreviewError('Không thể truy cập camera/micro. Vui lòng kiểm tra quyền trình duyệt.');
        stopPreviewStream();
      } finally {
        setCameraPreviewLoading(false);
      }
    };

    setupPreview();
    return () => {
      stopPreviewStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoSource, cameraDevice, microphoneDevice]);

  useEffect(() => {
    if (videoSource !== 'software') {
      destroyStreamPreview();
      setStreamPreviewError(null);
      setStreamPreviewLoading(false);
      return;
    }
    const url = (playbackUrl || '').trim();
    if (!url) {
      setStreamPreviewError('Vui lòng nhập Playback URL hợp lệ.');
      return;
    }

    // Đợi một chút để đảm bảo stream đã bắt đầu và file .m3u8 đã được tạo
    // Nginx-rtmp cần 5-10 giây để tạo file đầu tiên
    const setupHls = async () => {
      // Delay 1 giây trước khi bắt đầu load để tránh request quá sớm (giảm delay)
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        setStreamPreviewLoading(true);
        setStreamPreviewError(null);
        if (Hls.isSupported()) {
          // ============================================
          // HLS.js Configuration - Low Latency Optimized
          // ============================================
          // Tối ưu cho livestream với Nginx-RTMP:
          // - Fragment: 1s
          // - Playlist length: 3s
          // - Target latency: ~3-5s
          const instance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          
            maxBufferLength: 4,
            maxMaxBufferLength: 3,
            maxBufferSize: 20 * 1000 * 1000,
            maxBufferHole: 0.5,
            maxStarvationDelay: 4,
          
            startLevel: -1,
            startFragPrefetch: true,
          
            manifestLoadingTimeOut: 15000,
            manifestLoadingMaxRetry: 5,
            manifestLoadingRetryDelay: 3000,
            levelLoadingTimeOut: 20000,
            levelLoadingMaxRetry: 8,
            levelLoadingRetryDelay: 2000,
            fragLoadingTimeOut: 15000,
            fragLoadingMaxRetry: 4,
            fragLoadingRetryDelay: 2000,
          
            // 🔥 QUAN TRỌNG
            liveSyncDurationCount: 1,
            liveMaxLatencyDurationCount: 3,
            liveDurationInfinity: true,
            liveBackBufferLength: 1,
          
            highBufferWatchdogPeriod: 2,
            maxLiveSyncPlaybackRate: 1.05,
            nudgeOffset: 0.1,
            nudgeMaxRetry: 3,
          
            abrEwmaDefaultEstimate: 500000,
            abrBandWidthFactor: 0.95,
            abrBandWidthUpFactor: 0.7,
            
            xhrSetup: (xhr: any, url: any) => {
              xhr.withCredentials = false;
            },
          });
          
          hlsRef.current = instance;
          previewPlayAttemptedRef.current = false;
          
          const attemptPreviewPlay = async () => {
            if (!streamingVideoRef.current || previewPlayAttemptedRef.current) {
              return;
            }
            try {
              previewPlayAttemptedRef.current = true;
              await streamingVideoRef.current.play();
              setIsPlaying(true);
              setStreamPreviewLoading(false);
            } catch (error: any) {
              previewPlayAttemptedRef.current = false;
              if (error?.name === 'NotAllowedError') {
                setStreamPreviewLoading(false);
              }
            }
          };
          
          let retryCount = 0;
          const maxRetries = 3;
          
          instance.loadSource(url);
          if (streamingVideoRef.current) {
            instance.attachMedia(streamingVideoRef.current);
            
            instance.on(Hls.Events.MANIFEST_PARSED, () => {
              retryCount = 0; // Reset retry khi manifest parsed thành công
              previewPlayAttemptedRef.current = false;
              setStreamPreviewLoading(true);
            });
            
            instance.on(Hls.Events.LEVEL_LOADED, (_: any, data: any) => {
              const targetDuration = Math.max(data.details?.targetduration || 2, 0.5);
              const totalDuration = Math.max(
                data.details?.totalduration ||
                  targetDuration * (data.details?.fragments?.length || 4),
                targetDuration * 3,
              );
              previewTargetDurationRef.current = targetDuration;
              previewPlaylistDurationRef.current = totalDuration;
              console.debug('Preview level loaded', {
                level: data.level,
                targetDuration: targetDuration.toFixed(2),
                fragments: data.details?.fragments?.length || 0,
                playlistDuration: totalDuration.toFixed(2),
                thresholds: getPreviewBufferThresholds(),
              });
            });

            instance.on(Hls.Events.FRAG_LOADED, (_: any, data: any) => {
              const fragStatsWrapper = data as unknown as { stats?: { trequest?: number; tload?: number } };
              const tRequest = fragStatsWrapper.stats?.trequest ?? 0;
              const tLoad = fragStatsWrapper.stats?.tload ?? 0;
              const loadMs = tLoad && tRequest ? tLoad - tRequest : 0;
              const fragDuration = Math.max(data.frag?.duration || previewTargetDurationRef.current || 1, 0.25);
              if (loadMs > 0) {
                const playbackMs = fragDuration * 1000;
                const ratio = playbackMs / loadMs;
                previewThroughputRef.current = Math.max(0.1, Math.min(ratio, 5));
              }
            });
            
            instance.on(Hls.Events.BUFFER_APPENDED, () => {
              if (!streamingVideoRef.current || streamingVideoRef.current.buffered.length === 0) {
                return;
              }
              const video = streamingVideoRef.current;
              const bufferedEnd = video.buffered.end(video.buffered.length - 1);
              const bufferLength = Math.max(0, bufferedEnd - (video.currentTime || 0));
              const { critical } = getPreviewBufferThresholds();
              
              if (!video.paused && bufferLength < critical) {
                console.warn(
                  `[Preview] Buffer dropped to ${bufferLength.toFixed(2)}s (< critical ${critical.toFixed(2)}s), pausing...`,
                );
                video.pause();
                setIsPlaying(false);
                previewPlayAttemptedRef.current = false;
                setStreamPreviewLoading(true);
              }
            });
            
            if (previewBufferCheckIntervalRef.current) {
              clearInterval(previewBufferCheckIntervalRef.current);
            }
            previewBufferCheckIntervalRef.current = setInterval(() => {
              if (!streamingVideoRef.current || !hlsRef.current) {
                return;
              }
              
              if (streamingVideoRef.current.readyState >= 2 && streamingVideoRef.current.buffered.length > 0) {
                const video = streamingVideoRef.current;
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                const bufferLength = Math.max(0, bufferedEnd - (video.currentTime || 0));
                const { start, resume, critical, target } = getPreviewBufferThresholds();
                const pauseThreshold = Math.max(critical, resume - Math.min(0.3, target * 0.15));
                const healthyThroughput = previewThroughputRef.current >= 0.9;
                const gracefulBuffer = Math.max(target * 0.35, critical * 0.9);
                
                if (video.paused && bufferLength >= start && !previewPlayAttemptedRef.current) {
                  console.debug(`[Preview] Buffer ready (${bufferLength.toFixed(2)}s / ${start.toFixed(2)}s), starting play`);
                  bufferLowGraceRef.current = 0;
                  attemptPreviewPlay();
                } else if (!video.paused && bufferLength <= critical) {
                  bufferLowGraceRef.current = 0;
                  console.warn(
                    `[Preview] Buffer critical (${bufferLength.toFixed(2)}s <= ${critical.toFixed(2)}s), pausing`,
                  );
                  video.pause();
                  setIsPlaying(false);
                  previewPlayAttemptedRef.current = false;
                  setStreamPreviewLoading(true);
                } else if (!video.paused && bufferLength < pauseThreshold) {
                  const canGrace =
                    healthyThroughput && bufferLength >= gracefulBuffer && bufferLength > critical * 0.9;
                  if (canGrace) {
                    bufferLowGraceRef.current += 1;
                    if (bufferLowGraceRef.current < 4) {
                      console.debug(
                        `[Preview] Buffer dip ${bufferLength.toFixed(
                          2,
                        )}s but throughput healthy (${previewThroughputRef.current.toFixed(
                          2,
                        )}x). Grace ${bufferLowGraceRef.current}/4`,
                      );
                      return;
                    }
                  }
                  bufferLowGraceRef.current = 0;
                  console.warn(
                    `[Preview] Buffer insufficient (${bufferLength.toFixed(2)}s < resume ${resume.toFixed(
                      2,
                    )}s, pause threshold ${pauseThreshold.toFixed(2)}s)`,
                  );
                  video.pause();
                  setIsPlaying(false);
                  previewPlayAttemptedRef.current = false;
                  setStreamPreviewLoading(true);
                } else if (!video.paused && bufferLength >= resume) {
                  bufferLowGraceRef.current = 0;
                }
              }
            }, 500);
            
            instance.on(Hls.Events.ERROR, (_: any, data: any) => {
              // Bỏ qua non-fatal errors (có thể tự recover)
              if (!data.fatal) {
                // BufferStalledError - cần xử lý để tránh giật lag
                if (data.details === 'bufferStalledError') {
                  console.debug('Buffer stalled detected, attempting recovery...');
                  // HLS.js sẽ tự recover, nhưng có thể cần seek để sync lại
                  if (instance && streamingVideoRef.current) {
                    try {
                      // Thử seek đến vị trí hiện tại để trigger buffer reload
                      const currentTime = streamingVideoRef.current.currentTime;
                      if (currentTime > 0) {
                        streamingVideoRef.current.currentTime = currentTime;
                      }
                      // Start load lại để đảm bảo buffer được fill
                      instance.startLoad();
                    } catch (error) {
                      console.debug('Buffer recovery attempt failed, HLS.js will auto-recover');
                    }
                  }
                } else if (data.details === 'fragLoadTimeOut') {
                  // fragLoadTimeOut: fragment không load được trong timeout
                  // HLS.js sẽ tự động retry, chỉ log ở debug level
                  console.debug('Fragment load timeout (non-fatal), HLS.js will retry:', data.frag?.url);
                } else if (data.details === 'levelLoadTimeOut') {
                  // levelLoadTimeOut: level playlist không load được trong timeout
                  // Có thể do stream chưa sẵn sàng, HLS.js sẽ tự động retry
                  console.debug('Level load timeout (non-fatal), HLS.js will retry:', data.url);
                } else {
                  // Các non-fatal errors khác - chỉ log ở debug level để giảm noise
                  console.debug('Non-fatal HLS error (auto-recovering):', data.details);
                }
                return;
              }
              
              // Fatal errors - log và xử lý
              console.error('Fatal HLS error:', data);
              
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    // Kiểm tra nếu là 404 (stream chưa bắt đầu) hoặc levelLoadTimeOut
                    const responseCode = data.response?.code;
                    const is404 = data.details === 'manifestLoadError' || 
                                 responseCode === 404 ||
                                 (responseCode !== undefined && responseCode >= 400 && responseCode < 500);
                    const isLevelTimeout = data.details === 'levelLoadTimeOut';
                    
                    // Xử lý levelLoadTimeOut như 404 - stream có thể chưa sẵn sàng
                    if (is404 || isLevelTimeout) {
                      // Stream chưa bắt đầu - poll manifest URL để tự động retry khi stream sẵn sàng
                      instance.destroy();
                      hlsRef.current = null;
                      // Clear video src để tránh video element error
                      if (streamingVideoRef.current) {
                        streamingVideoRef.current.src = '';
                        streamingVideoRef.current.load();
                      }
                      
                      // Polling mechanism: kiểm tra manifest URL mỗi 3 giây
                      let pollCount = 0;
                      const maxPolls = 10; // Tối đa 10 lần = 30 giây
                      
                      // Clear interval cũ nếu có
                      if (pollIntervalRef.current) {
                        clearInterval(pollIntervalRef.current);
                      }
                      
                      setStreamPreviewError('Đang đợi stream khởi động...\nVui lòng:\n1. Mở OBS Studio\n2. Settings → Stream → Dán Server URL và Stream Key\n3. Nhấn "Start Streaming"\n4. Đợi 5-10 giây để stream khởi động');
                      setStreamPreviewLoading(true);
                      
                      pollIntervalRef.current = setInterval(async () => {
                        pollCount++;
                        
                        try {
                          // Kiểm tra xem manifest URL có tồn tại không
                          const response = await fetch(url, { method: 'HEAD' });
                          
                      if (response.ok) {
                            // Stream đã sẵn sàng, retry setup HLS.js
                            if (pollIntervalRef.current) {
                              clearInterval(pollIntervalRef.current);
                              pollIntervalRef.current = null;
                            }
                            console.log('Stream ready, retrying HLS setup...');
                            setStreamPreviewError(null);
                            setupHls(); // Retry setup
                            return;
                      } else {
                        const synced = await syncPreviewWithActiveStream();
                        if (synced) {
                          if (pollIntervalRef.current) {
                            clearInterval(pollIntervalRef.current);
                            pollIntervalRef.current = null;
                          }
                          return;
                        }
                          }
                        } catch (error) {
                          // Vẫn 404, tiếp tục poll
                          console.log(`Polling attempt ${pollCount}/${maxPolls}: stream not ready yet`);
                        }
                        
                        // Nếu đã poll quá nhiều lần, dừng và hiển thị message
                        if (pollCount >= maxPolls) {
                          if (pollIntervalRef.current) {
                            clearInterval(pollIntervalRef.current);
                            pollIntervalRef.current = null;
                          }
                          setStreamPreviewError('Stream chưa bắt đầu sau 30 giây. Vui lòng:\n1. Kiểm tra OBS đang phát\n2. Kiểm tra Stream Key có đúng không\n3. Nhấn "Thử lại" để thử lại');
                          setStreamPreviewLoading(false);
                        }
                      }, 3000); // Poll mỗi 3 giây
                    }
                    
                    console.log('Network error, attempting to recover...');
                    if (retryCount < maxRetries) {
                      retryCount++;
                      setTimeout(() => {
                        if (instance && hlsRef.current === instance) {
                          instance.startLoad();
                        }
                      }, 1000 * retryCount); // Exponential backoff
                    } else {
                      // Max retries reached, destroy instance
                      instance.destroy();
                      hlsRef.current = null;
                      if (streamingVideoRef.current) {
                        streamingVideoRef.current.src = '';
                        streamingVideoRef.current.load();
                      }
                      setStreamPreviewError('Không thể kết nối tới stream. Đảm bảo OBS đang phát và stream key đúng.');
                      setStreamPreviewLoading(false);
                    }
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    // Media error thường xảy ra khi stream đang buffer hoặc có vấn đề tạm thời
                    console.log('Media error, attempting to recover...');
                    try {
                      instance.recoverMediaError();
                      // Reset retry count khi recover thành công
                      retryCount = 0;
                    } catch (recoverError) {
                      console.error('Recovery failed:', recoverError);
                      // Chỉ retry nếu không phải lỗi buffer stalled (có thể do stream chưa sẵn sàng)
                      if (data.details !== 'bufferStalledError' && retryCount < maxRetries) {
                        retryCount++;
                        setTimeout(() => {
                          if (instance && hlsRef.current === instance) {
                            instance.destroy();
                            setupHls(); // Retry setup
                          }
                        }, 2000 * retryCount);
                      } else {
                        // Max retries reached, destroy instance
                        instance.destroy();
                        hlsRef.current = null;
                        if (streamingVideoRef.current) {
                          streamingVideoRef.current.src = '';
                          streamingVideoRef.current.load();
                        }
                        setStreamPreviewError('Lỗi phát media. Đảm bảo OBS đang phát stream ổn định.');
                        setStreamPreviewLoading(false);
                      }
                    }
                    break;
                  default:
                    console.log('Fatal error, destroying HLS instance...');
                    instance.destroy();
                    hlsRef.current = null;
                    if (streamingVideoRef.current) {
                      streamingVideoRef.current.src = '';
                      streamingVideoRef.current.load();
                    }
                    setStreamPreviewError('Lỗi không thể khắc phục. Vui lòng kiểm tra lại cấu hình.');
                    setStreamPreviewLoading(false);
                    break;
                }
              }
            });
            
            // Theo dõi buffering để cải thiện UX
            instance.on(Hls.Events.BUFFER_APPENDING, () => {
              setStreamPreviewLoading(false);
              setStreamPreviewError(null); // Clear error khi buffer đang append
            });
            
            // Theo dõi khi buffer đầy đủ để bắt đầu phát
            instance.on(Hls.Events.BUFFER_RESET, () => {
              console.log('HLS buffer reset');
            });
            
            // Theo dõi khi có đủ data để play
            instance.on(Hls.Events.BUFFER_APPENDED, () => {
              if (streamingVideoRef.current) {
                streamingVideoRef.current.play().catch(() => {
                  setStreamPreviewLoading(false);
                });
              }
            });
            
            // Log khi stream đã sẵn sàng để play
            instance.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log('HLS manifest parsed, stream ready');
              retryCount = 0; // Reset retry count khi manifest parsed
            });
          }
        } else if (streamingVideoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
          // ============================================
          // Native HLS Support (Safari/iOS)
          // ============================================
          // Safari có native HLS support, không cần HLS.js
          streamingVideoRef.current.src = url;
          
          streamingVideoRef.current.addEventListener('loadedmetadata', () => {
            setStreamPreviewLoading(false);
            setStreamPreviewError(null);
          });
          
          streamingVideoRef.current.addEventListener('error', (e) => {
            console.error('Native HLS error:', e);
            setStreamPreviewError('Không thể tải stream. Kiểm tra Playback URL hoặc đảm bảo stream đang chạy.');
            setStreamPreviewLoading(false);
          });
          
          streamingVideoRef.current
            .play()
            .then(() => {
              setStreamPreviewLoading(false);
              setStreamPreviewError(null);
            })
            .catch((err) => {
              console.error('Autoplay blocked:', err);
              // Autoplay có thể bị chặn, nhưng stream đã load
              setStreamPreviewLoading(false);
            });
        } else {
          // Browser không hỗ trợ HLS
          setStreamPreviewError('Trình duyệt không hỗ trợ HLS. Hãy dùng Chrome/Edge/Firefox mới hoặc Safari.');
          setStreamPreviewLoading(false);
        }
      } catch (error) {
        console.error('HLS preview error', error);
        setStreamPreviewError('Không thể khởi tạo preview. Kiểm tra Playback URL.');
        setStreamPreviewLoading(false);
      }
    };

    setupHls();
    return () => {
      destroyStreamPreview();
    };
  }, [videoSource, playbackUrl]);

  const onSubmit = async (data: CreateSessionForm) => {
    try {
      setIsSubmitting(true);
      console.log('[CreateLiveStreamPage] ✅ Form submitted!');
      console.log('[CreateLiveStreamPage] Form data:', data);

      const scheduled =
        data.goLiveTiming === 'now'
          ? new Date().toISOString()
          : data.scheduled_start;

      if (data.goLiveTiming === 'schedule') {
        if (!data.scheduled_start) {
          alert('Vui lòng chọn thời gian bắt đầu');
          setIsSubmitting(false);
          return;
        }
        const scheduledDate = new Date(data.scheduled_start);
        if (scheduledDate <= new Date()) {
          alert('Thời gian bắt đầu phải ở tương lai');
          setIsSubmitting(false);
          return;
        }
      }

      const ingestType: 'webrtc' | 'rtmp' = data.videoSource === 'software' ? 'rtmp' : 'webrtc';
      console.log('[CreateLiveStreamPage] Ingest type:', ingestType);

      const payload = {
        course_id: data.course_id || null,
        title: data.title,
        description: data.description,
        scheduled_start: scheduled,
        duration_minutes: Number(data.duration_minutes),
        meeting_url: ingestType === 'rtmp' ? data.server_url : data.meeting_url,
        meeting_password: ingestType === 'rtmp' ? data.stream_key : data.meeting_password,
        platform: data.platform || (ingestType === 'rtmp' ? 'rtmp' : 'internal'),
        ingest_type: ingestType,
        webrtc_room_id: ingestType === 'webrtc' ? data.webrtcRoomId : undefined,
        // Backend sẽ tự động generate playback_url từ stream_key cho RTMP
        // Không cần gửi từ frontend, để backend tự xử lý
        playback_url: undefined,
        stream_key: ingestType === 'rtmp' ? data.stream_key : undefined,
        category: data.category,
        thumbnail_url: data.thumbnail_url,
        is_public: data.audience === 'public',
        metadata: {
          ingestType,
          videoSource: data.videoSource,
          cameraDevice: data.cameraDevice,
          microphoneDevice: data.microphoneDevice,
          shareScreen: data.shareScreen,
          shareToStory: data.shareToStory,
          notifyFollowers: data.notifyFollowers,
          crosspostGroup: data.crosspostGroup,
          audience: data.audience,
          presetCommentEnabled: data.presetCommentEnabled,
          presetComment: data.presetComment,
          webrtc: ingestType === 'webrtc' ? { roomId: data.webrtcRoomId } : undefined,
          streamingSoftware:
            ingestType === 'rtmp'
              ? {
                  streamKey: data.stream_key,
                  serverUrl: data.server_url,
                  usePersistentKey: data.usePersistentKey,
                  enableBackupStream: data.enableBackupStream,
                  playbackUrl: data.playback_url,
                }
              : undefined,
        },
      };

      console.log('[CreateLiveStreamPage] Creating session with payload:', payload);
      const createdSession = await createSession.mutateAsync(payload);
      console.log('[CreateLiveStreamPage] Session created successfully:', createdSession);

      // Redirect đến trang host session sau khi tạo thành công
      if (createdSession?.id) {
        // Nếu "go live now", tự động start session ngay và redirect đến trang host
        if (data.goLiveTiming === 'now') {
          console.log('[CreateLiveStreamPage] Auto-starting session (Go live now)');
          
          try {
            // Tự động start session ngay bằng cách gọi API trực tiếp
            const updatedSession = await livestreamApi.updateSession(createdSession.id, {
              status: 'live',
              actual_start: new Date().toISOString(),
            });
            
            // Invalidate và update cache để session được refresh
            queryClient.setQueryData(livestreamQueryKeys.session(createdSession.id), updatedSession);
            queryClient.invalidateQueries({ queryKey: livestreamQueryKeys.all });
            
            console.log('[CreateLiveStreamPage] Session auto-started successfully');
          } catch (error) {
            console.error('[CreateLiveStreamPage] Auto-start failed, but continuing:', error);
            // Vẫn redirect dù auto-start fail, user có thể start thủ công
          }
          
          console.log('[CreateLiveStreamPage] Redirecting to session page:', createdSession.id);
          // Redirect đến trang session (tự động detect host/viewer)
          navigate(ROUTES.LIVESTREAM.SESSION.replace(':sessionId', createdSession.id));
        } else {
          // Nếu schedule, redirect đến danh sách
          console.log('[CreateLiveStreamPage] Redirecting to list page (scheduled)');
          navigate(ROUTES.INSTRUCTOR.LIVESTREAM);
        }
      } else {
        // Fallback: redirect về danh sách nếu không có session ID
        console.error('[CreateLiveStreamPage] Created session không có ID:', createdSession);
        alert('Tạo phiên thành công nhưng không có ID. Vui lòng kiểm tra lại.');
        navigate(ROUTES.INSTRUCTOR.LIVESTREAM);
      }
    } catch (error: any) {
      console.error('[CreateLiveStreamPage] Create session error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi tạo phiên livestream';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(ROUTES.INSTRUCTOR.LIVESTREAM)} 
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Tạo livestream mới</h1>
            <p className="text-sm text-gray-500">Thiết lập và cấu hình buổi phát trực tiếp của bạn</p>
          </div>
        </div>

        <form onSubmit={(e) => {
          console.log('[CreateLiveStreamPage] 🔵 Form submit event fired');
          console.log('[CreateLiveStreamPage] Current errors:', errors);
          handleSubmit(
            (data) => {
              console.log('[CreateLiveStreamPage] ✅ Validation passed, calling onSubmit');
              onSubmit(data);
            },
            (errors) => {
              console.error('[CreateLiveStreamPage] ❌ Validation failed:', errors);
              const firstError = Object.values(errors)[0];
              if (firstError?.message) {
                alert(firstError.message);
              } else {
                alert('Vui lòng kiểm tra lại thông tin đã nhập. Đảm bảo đã điền tiêu đề.');
              }
            }
          )(e);
        }}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            {/* Main Content */}
            <main className="space-y-4">
              {/* Video Source Selection */}
              <VideoSourceSelector
                value={videoSource}
                onChange={(value) => setValue('videoSource', value)}
              />

              {/* {videoSource === 'webcam' && (
                <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">WebRTC livestream</h3>
                    <p className="text-sm text-gray-500">Phát trực tiếp ngay trên trình duyệt với độ trễ thấp</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 block">Mã phòng WebRTC</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        readOnly
                        {...register('webrtcRoomId', { required: true })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 text-gray-700"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopy(webrtcRoomId || '', 'room')}
                        >
                          {copyFeedback === 'room' ? 'Đã copy' : 'Copy'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setValue('webrtcRoomId', generateRoomId())}
                        >
                          Tạo mới
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Mã phòng dùng cho signaling WebRTC. Hệ thống sẽ tự đồng bộ tới trang host/view.
                    </p>
                  </div>
                </section>
              )} */}

              {videoSource === 'webcam' && (
                <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-600" />
                      Điều khiển camera
                    </h3>
                    <p className="text-sm text-gray-500">Kiểm tra camera & micro của bạn</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Camera</label>
                      <select
                        {...register('cameraDevice')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        {cameraOptions.map((option) => (
                          <option key={option.deviceId} value={option.deviceId}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Microphone</label>
                      <select
                        {...register('microphoneDevice')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        {microphoneOptions.map((option) => (
                          <option key={option.deviceId} value={option.deviceId}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" {...register('shareScreen')} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                    Bật chia sẻ màn hình
                  </label> */}

                  <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden w-full aspect-video min-h-[300px]">
                    {!cameraPreviewError ? (
                      <>
                        {cameraPreviewLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                            <div className="text-center space-y-2">
                              <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
                              <p className="text-sm text-gray-500">Đang kiểm tra camera...</p>
                            </div>
                          </div>
                        )}
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover rounded-xl"
                          muted
                          playsInline
                          autoPlay
                        />
                        {!cameraPreviewLoading && !streamRef.current && (
                          <div className="text-center text-sm text-gray-600">
                            Video preview sẽ hiển thị sau khi bạn cấp quyền camera.
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center px-6">
                        <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center mx-auto mb-3">
                          <Video className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600">
                          {cameraPreviewError || 'Video preview sẽ hiển thị sau khi bạn cấp quyền camera.'}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {videoSource === 'software' && (
                <>
                  {/* Live stream preview section */}
                  <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">Xem trước livestream</h3>
                      <p className="text-sm text-gray-500 mb-3">
                        Xem trực tiếp luồng từ OBS để kiểm tra tín hiệu trước khi phát sóng
                      </p>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-medium text-blue-900 mb-1">📋 Hướng dẫn:</p>
                        <ol className="text-xs text-blue-800 list-decimal list-inside space-y-1">
                          <li>Copy <strong>Server URL</strong> và <strong>Stream Key</strong> ở trên (phải copy key MỚI NHẤT)</li>
                          <li>Mở OBS Studio → Settings → Stream</li>
                          <li>Chọn "Custom..." và dán thông tin (đảm bảo Stream Key khớp chính xác)</li>
                          <li>Nhấn "Start Streaming" trong OBS</li>
                          <li>Đợi 5-10 giây, preview sẽ tự động hiển thị</li>
                        </ol>
                        <p className="text-xs text-amber-700 mt-2 font-medium">
                          ⚠️ Nếu preview không hiển thị: Kiểm tra Stream Key trong OBS có khớp với Stream Key ở trên không. Nếu không khớp, hãy copy lại và cập nhật trong OBS.
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden w-full aspect-video min-h-[300px]">
                      {streamPreviewLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                          <div className="text-center space-y-3">
                            <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Đang kết nối tới stream...</p>
                              <p className="text-xs text-gray-500 mt-1">Vui lòng đảm bảo OBS đang phát luồng</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="relative w-full h-full">
                        <video
                          ref={streamingVideoRef}
                          className="w-full h-full object-cover rounded-xl"
                          playsInline
                          muted={isMuted}
                          onLoadedMetadata={() => {
                            setStreamPreviewError(null);
                          }}
                          onPlay={() => {
                            setIsPlaying(true);
                            previewPlayAttemptedRef.current = true;
                            setStreamPreviewLoading(false);
                          }}
                          onPause={() => {
                            setIsPlaying(false);
                            previewPlayAttemptedRef.current = false;
                          }}
                          onError={(e) => {
                            const video = e.target as HTMLVideoElement;
                            const error = video.error;
                            
                            if (error) {
                              let errorMsg = 'Lỗi phát video. ';
                              switch (error.code) {
                                case error.MEDIA_ERR_ABORTED:
                                  errorMsg += 'Video bị dừng.';
                                  break;
                                case error.MEDIA_ERR_NETWORK:
                                  errorMsg += 'Lỗi mạng. Kiểm tra kết nối.';
                                  break;
                                case error.MEDIA_ERR_DECODE:
                                  errorMsg += 'Lỗi decode video. Codec không được hỗ trợ.';
                                  break;
                                case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                  errorMsg += 'Format không được hỗ trợ.';
                                  break;
                                default:
                                  errorMsg += `Code: ${error.code}`;
                              }
                              
                              // Nếu HLS.js instance đã bị destroy, video element error là expected
                              // (vì browser không thể play .m3u8 trực tiếp)
                              // Không log và không hiển thị error - đây là expected behavior
                              if (!hlsRef.current) {
                                // Silent ignore - expected behavior khi HLS.js đã destroy
                                return;
                              }
                              
                              // Nếu HLS.js instance vẫn tồn tại, đây là lỗi thực sự
                              console.error('Video element error with active HLS.js instance:', {
                                code: error.code,
                                message: errorMsg
                              });
                              
                              // Chỉ hiển thị error nếu chưa có error message từ HLS.js
                              if (!streamPreviewError) {
                                setStreamPreviewError(errorMsg);
                              }
                              setStreamPreviewLoading(false);
                            }
                          }}
                          style={{ pointerEvents: 'none' }}
                        />
                        {/* Custom controls cho livestream (không có seek) */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-xl">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (streamingVideoRef.current) {
                                    if (isPlaying) {
                                      streamingVideoRef.current.pause();
                                    } else {
                                      streamingVideoRef.current
                                        .play()
                                        .then(() => {
                                          previewPlayAttemptedRef.current = true;
                                          setStreamPreviewLoading(false);
                                        })
                                        .catch(() => {
                                          previewPlayAttemptedRef.current = false;
                                        });
                                    }
                                  }
                                }}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                                title={isPlaying ? 'Tạm dừng' : 'Phát'}
                              >
                                {isPlaying ? (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (streamingVideoRef.current) {
                                    streamingVideoRef.current.muted = !isMuted;
                                    setIsMuted(!isMuted);
                                  }
                                }}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                                title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                              >
                                {isMuted ? (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.617a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.617a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">LIVE</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (streamingVideoRef.current) {
                                    if (streamingVideoRef.current.requestFullscreen) {
                                      streamingVideoRef.current.requestFullscreen();
                                    }
                                  }
                                }}
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
                      {streamPreviewError && !streamPreviewLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 px-6 text-center z-10 rounded-xl">
                          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                            <Video className="w-6 h-6 text-yellow-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-3 whitespace-pre-line">{streamPreviewError}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setStreamPreviewError(null);
                              setStreamPreviewLoading(true);
                              // Retry loading
                              if (streamingVideoRef.current && playbackUrl) {
                                const url = playbackUrl.trim();
                                if (Hls.isSupported() && hlsRef.current) {
                                  hlsRef.current.loadSource(url);
                                } else if (streamingVideoRef.current) {
                                  streamingVideoRef.current.src = url;
                                  streamingVideoRef.current.load();
                                }
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Thử lại
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-900 mb-1">Live Stream URL (tự động tạo)</p>
                      <p className="text-xs text-blue-700 font-mono break-all">
                        {playbackUrl || (streamKey ? `${DEFAULT_PLAYBACK_BASE}/${sanitizeStreamKeyForFilename(streamKey)}.m3u8` : 'Sẽ được tạo sau khi bắt đầu stream')}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        URL này sẽ được dùng để người xem xem stream trực tiếp. Không cần cấu hình thủ công.
                      </p>
                    </div>
                  </section>

                  {/* Streaming software setup section */}
                  <section className="bg-gray-900 text-white rounded-lg border border-gray-800 shadow-sm p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-semibold mb-1">Cấu hình phần mềm streaming</h3>
                      <p className="text-sm text-gray-300">
                        Sao chép thông tin này và dán vào OBS, Streamlabs hoặc phần mềm RTMP khác
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-200 mb-1 block">Stream key</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            readOnly
                            {...register('stream_key')}
                            className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              className="bg-slate-700 text-white hover:bg-slate-600"
                              onClick={() => handleCopy(streamKey, 'key')}
                            >
                              {copyFeedback === 'key' ? 'Copied!' : 'Copy'}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="bg-slate-700 text-white hover:bg-slate-600 text-xs px-3"
                              onClick={() => {
                                const newKey = generateStreamKey();
                                setValue('stream_key', newKey);
                                setPlaybackUrlTouched(false);
                                // Reset playback URL
                                const sanitizedKey = sanitizeStreamKeyForFilename(newKey);
                                setValue('playback_url', `${DEFAULT_PLAYBACK_BASE}/${sanitizedKey}.m3u8`, { shouldDirty: false });
                              }}
                            >
                              Tạo mới
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          ⚠️ <strong>Quan trọng:</strong> Đảm bảo Stream Key trong OBS khớp với Stream Key ở đây. Nếu đã copy key cũ, hãy copy lại key mới và cập nhật trong OBS.
                        </p>
                      </div>

                      <div className="space-y-3 border-t border-slate-800 pt-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-200">Persistent stream key</p>
                            <p className="text-xs text-slate-400">Tái sử dụng cho mỗi lần livestream.</p>
                          </div>
                          <input
                            type="checkbox"
                            {...register('usePersistentKey')}
                            className="w-4 h-4 accent-blue-400"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-200">Backup stream</p>
                            <p className="text-xs text-slate-400">
                              Thêm luồng dự phòng. Không thể tắt khi đã bật.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            {...register('enableBackupStream')}
                            className="w-4 h-4 accent-blue-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-200 mb-1 block">Server URL</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            {...register('server_url')}
                            className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-sm"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            className="bg-slate-700 text-white hover:bg-slate-600"
                            onClick={() => handleCopy(serverUrl, 'server')}
                          >
                            {copyFeedback === 'server' ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Đây có thể được gọi là "URL" hoặc "address" trong phần mềm streaming của bạn.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Hướng dẫn kết nối OBS/Streamlabs</h3>
                    <ol className="list-decimal text-sm text-gray-600 pl-5 space-y-2">
                      <li>Mở OBS → Settings → Stream</li>
                      <li>Chọn Service là "Custom...", dán "Server URL" và "Stream Key" ở trên</li>
                      <li>Nếu muốn backup stream, bật chế độ này trong OBS và cấu hình luồng phụ</li>
                      <li>Bitrate đề xuất: 4500 - 6000 kbps, encoder H.264</li>
                      <li>Nhấn "Start Streaming" để gửi tín hiệu preview về nền tảng này</li>
                    </ol>
                  </section>
                </>
              )}

              {/* <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-600" />
                    Cấu hình stream / meeting
                  </h3>
                  <p className="text-sm text-gray-500">Điền link họp hoặc stream key nếu dùng nền tảng khác</p>
                </div>

                {videoSource === 'software' ? (
                  <div className="text-sm text-gray-500">
                    Bạn đang dùng phần mềm streaming, thông tin kết nối đã được cấu hình ở mục trên. Stream URL và
                    Stream key sẽ tự động lưu vào phiên khi bạn nhấn Tạo phiên.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Link họp / RTMP URL</label>
                      <input
                        type="url"
                        {...register('meeting_url')}
                        placeholder="https://live.example.com/rtmp/stream"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus-border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Stream key / Passcode</label>
                      <input
                        type="text"
                        {...register('meeting_password')}
                        placeholder="sk_live_abcxyz"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus-border-transparent"
                      />
                    </div>
                  </div>
                )}
              </section> */}
            </main>

            {/* Right Sidebar - Form Details */}
            <PostDetailsForm
              register={register}
              errors={errors}
              watch={watch}
              courses={courses}
            />
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 mt-6 bg-white border-t border-gray-200 py-4 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock3 className="w-4 h-4" />
              <span>{goLiveTiming === 'now' ? 'Sẵn sàng phát sóng ngay' : 'Bạn đang lên lịch livestream'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(ROUTES.INSTRUCTOR.LIVESTREAM)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex items-center gap-2 min-w-[140px] justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4" />
                    <span>{goLiveTiming === 'now' ? 'Phát sóng ngay' : 'Lên lịch'}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
        
      </div>
    </div>
  );
}

export default CreateLiveStreamPage;
