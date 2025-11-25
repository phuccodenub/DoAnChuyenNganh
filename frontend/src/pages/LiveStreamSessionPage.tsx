import { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Hls from 'hls.js';
import { useSession } from '@/hooks/useLivestream';
import { useLivestreamSocket } from '@/hooks/useLivestreamSocket';
import { Button } from '@/components/ui/Button';
import { WebRTCViewer } from '@/components/livestream/WebRTCViewer';
import { LiveStreamChat } from '@/components/livestream/LiveStreamChat';
import { ReactionOverlay } from '@/components/livestream/ReactionOverlay';
import { ROUTES } from '@/constants/routes';
import { Eye, Users } from 'lucide-react';

const DEFAULT_TARGET_DURATION = 4; // giây - fallback khi chưa biết target duration thực tế
const START_BUFFER_SEGMENTS = 3;   // số segment cần có trước khi play
const RESUME_BUFFER_SEGMENTS = 1.5; // số segment tối thiểu để tiếp tục play
const CRITICAL_BUFFER_SEGMENTS = 0.75; // buffer quá thấp → pause ngay
const BUFFER_CHECK_INTERVAL_MS = 500; // chu kỳ check buffer

const HlsPreview = memo(({ playbackUrl }: { playbackUrl: string }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const isInitializedRef = useRef(false);
  const currentUrlRef = useRef<string | null>(null);
  const bufferCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastBufferCheckRef = useRef<number>(0); // Track last buffer check time for logging
  const targetDurationRef = useRef(DEFAULT_TARGET_DURATION);
  const playlistDurationRef = useRef(DEFAULT_TARGET_DURATION * (START_BUFFER_SEGMENTS + 1));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Muted by default để autoplay có thể hoạt động
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
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
    // Chỉ log khi component thực sự mount hoặc playbackUrl thay đổi (giảm log noise)
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
    
    // Nếu đã initialize với URL này rồi, không cần recreate
    // Điều này quan trọng để tránh recreate trong React Strict Mode (dev mode)
    if (isInitializedRef.current && currentUrlRef.current === playbackUrl && hlsRef.current) {
      // Kiểm tra xem HLS instance còn hoạt động không
      const hlsState = hlsRef.current.media?.readyState;
      if (hlsState !== undefined) {
        // HLS instance đang hoạt động, không cần recreate
        return;
      } else {
        // HLS instance đã bị destroy, cần recreate
        console.log('[HlsPreview] HLS instance was destroyed, recreating...');
        isInitializedRef.current = false;
        currentUrlRef.current = null;
      }
    }
    
    // Nếu URL thay đổi, cleanup instance cũ
    if (currentUrlRef.current && currentUrlRef.current !== playbackUrl && hlsRef.current) {
      console.log('[HlsPreview] URL changed, cleaning up old instance');
      hlsRef.current.destroy();
      hlsRef.current = null;
      isInitializedRef.current = false;
    }
    
    console.log('[HlsPreview] Checking HLS.js support:', Hls.isSupported());

    if (Hls.isSupported()) {
      console.log('[HlsPreview] HLS.js is supported, initializing...');
      // Cấu hình HLS.js tối ưu cho livestream ổn định
      // Tắt lowLatencyMode để có buffer lớn hơn và ổn định hơn
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false, // Tắt để có buffer lớn hơn, ổn định hơn
        
        // Buffer settings - tăng buffer để tránh bufferStalledError
        maxBufferLength: 30, // Buffer tối đa 30 fragments (tăng để có buffer lớn hơn)
        maxMaxBufferLength: 60, // Tối đa 60 fragments khi đã phát (buffer rất lớn để ổn định)
        maxBufferSize: 200 * 1000 * 1000, // 200MB buffer size (tăng để có buffer lớn hơn)
        maxBufferHole: 1.0, // Tolerance cho buffer gaps (tăng để cho phép holes lớn hơn)
        maxStarvationDelay: 15, // Max delay khi buffer starved (tăng để có thời gian recover)
        
        // Level selection
        startLevel: -1, // Tự động chọn level tốt nhất
        // startFragPrefetch đã được move xuống dưới
        
        // Retry logic - đợi stream khởi động (tăng timeout vì stream mới bắt đầu cần thời gian tạo file)
        manifestLoadingTimeOut: 30000, // 30s timeout (tăng từ 15s để đợi stream khởi động)
        manifestLoadingMaxRetry: 10, // Retry 10 lần (tăng từ 5 để đợi stream sẵn sàng)
        manifestLoadingRetryDelay: 3000, // Delay 3s giữa các retry
        
        levelLoadingTimeOut: 30000, // 30s timeout cho level (tăng để đợi playlist sẵn sàng)
        levelLoadingMaxRetry: 10, // Retry 10 lần (tăng để đợi stream sẵn sàng)
        levelLoadingRetryDelay: 3000, // Delay 3s giữa các retry
        
        fragLoadingTimeOut: 30000, // 30s timeout cho fragment (tăng để tránh timeout)
        fragLoadingMaxRetry: 20, // Retry 20 lần (tăng để đợi file sẵn sàng)
        fragLoadingRetryDelay: 2000, // Delay 2s (tăng để đợi file sẵn sàng)
        
        // Tối ưu fragment loading để build buffer nhanh hơn
        startFragPrefetch: true, // Prefetch fragment đầu tiên ngay
        testBandwidth: true, // Test bandwidth để chọn level tốt nhất
        
        // Tối ưu cho live stream - ưu tiên stability hơn latency
        liveSyncDurationCount: 15, // Sync với 15 fragments (tăng cao để có buffer rất lớn)
        liveMaxLatencyDurationCount: 30, // Max latency = 30 fragments (tăng cao để có buffer rất lớn)
        liveDurationInfinity: true,
        liveBackBufferLength: 15, // Giữ 15 fragments trong back buffer (tăng cao để recover tốt hơn)
        highBufferWatchdogPeriod: 2, // Kiểm tra buffer mỗi 2s
        
        // Tự động recover khi có lỗi
        abrEwmaDefaultEstimate: 500000,
        abrBandWidthFactor: 0.95,
        abrBandWidthUpFactor: 0.7,
      });
      
      hlsRef.current = hls;
      let retryCount = 0;
      const maxRetries = 3;
      let loadedFragmentsCount = 0;
      const minFragmentsBeforePlay = 30; // Đợi ít nhất 30 fragments để có buffer đủ

      // Đăng ký event listeners TRƯỚC khi load source
      console.log('[HlsPreview] Registering event listeners...');

      // Helper function để play video với error handling
      const attemptPlay = async () => {
        if (!videoRef.current || playAttemptedRef.current) return;
        
        try {
          playAttemptedRef.current = true;
          await videoRef.current.play();
          setIsPlaying(true);
          setAutoplayBlocked(false);
        } catch (error: any) {
          playAttemptedRef.current = false;
          
          // NotAllowedError: Autoplay bị chặn (cần user interaction)
          if (error.name === 'NotAllowedError') {
            setAutoplayBlocked(true);
            console.log('[HlsPreview] Autoplay blocked, waiting for user interaction');
          }
          // AbortError: play() bị interrupt (có thể do pause() được gọi)
          else if (error.name === 'AbortError') {
            // Ignore AbortError - có thể do cleanup hoặc state change
            console.debug('[HlsPreview] Play aborted (likely due to state change)');
          }
          // Các lỗi khác
          else {
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
          data: data,
        });
      });
      
      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        retryCount = 0; // Reset retry count khi manifest parsed thành công
        playAttemptedRef.current = false; // Reset để có thể thử lại
        loadedFragmentsCount = 0; // Reset fragment counter
        const fragmentCount = (data as any).levels?.[0]?.fragments?.length || 0;
        console.log('[HlsPreview] Manifest parsed:', {
          levels: data.levels?.length || 0,
          fragments: fragmentCount,
          totalDuration: (data as any).levels?.[0]?.totalduration,
        });
        
        // Nếu không có fragments, có thể stream chưa bắt đầu hoặc đang được tạo
        if (fragmentCount === 0) {
          console.warn('[HlsPreview] No fragments found. Waiting for stream to start...');
        } else {
          // Có fragments, bắt đầu load ngay để build buffer
          console.log(`[HlsPreview] Found ${fragmentCount} fragments, starting to load...`);
          // HLS.js sẽ tự động bắt đầu load fragments
        }
      });
      
      // Level loaded event - khi level playlist được load thành công
      hls.on(Hls.Events.LEVEL_LOADED, (_: any, data: any) => {
        retryCount = 0; // Reset retry count khi level loaded thành công
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
      
      // Level switching event - khi switch level
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        // Không log để giảm noise
      });
      
      // Bắt đầu phát ngay khi có fragment đầu tiên
      hls.on(Hls.Events.FRAG_LOADING, (_, data) => {
        // Chỉ log mỗi 10 fragments để giảm noise
        if (loadedFragmentsCount % 10 === 0) {
          console.debug(`[HlsPreview] Fragment loading: ${data.frag?.relurl || 'unknown'}`);
        }
      });
      
      hls.on(Hls.Events.FRAG_LOADED, (_: any, data: any) => {
        loadedFragmentsCount++;
        // Log fragment loaded để debug (chỉ log mỗi 10 fragments để giảm noise)
        if (loadedFragmentsCount % 10 === 0 || loadedFragmentsCount === 1) {
          console.debug(`[HlsPreview] Fragment loaded (${loadedFragmentsCount}): ${data.frag?.relurl || 'unknown'}`);
        }
      });
      
      hls.on(Hls.Events.FRAG_PARSING_INIT_SEGMENT, () => {
        console.debug('[HlsPreview] Parsing init segment');
      });
      
      hls.on(Hls.Events.FRAG_PARSING_USERDATA, () => {
        // Không log để giảm noise
      });
      
      hls.on(Hls.Events.FRAG_PARSED, () => {
        // Chỉ log mỗi 10 fragments
        if (loadedFragmentsCount % 10 === 0) {
          console.debug('[HlsPreview] Fragment parsed');
        }
      });
      
      // Monitor buffer state để detect khi stream bị đứng
      hls.on(Hls.Events.BUFFER_APPENDING, () => {
        // Buffer đang được append - stream đang hoạt động
        console.debug('[HlsPreview] Buffer appending');
      });
      
      hls.on(Hls.Events.BUFFER_APPENDED, () => {
        // Buffer đã được append thành công
        // QUAN TRỌNG: KHÔNG play ở đây - để buffer check interval xử lý
        // Điều này đảm bảo buffer được check đúng cách trước khi play
        if (videoRef.current && videoRef.current.buffered.length > 0) {
          const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
          const currentTime = videoRef.current.currentTime || 0;
          const bufferLength = Math.max(0, bufferedEnd - currentTime);
          
          const { critical } = getBufferThresholds();
          // Nếu video đang play nhưng buffer quá thấp, pause ngay để build buffer
          // Điều này quan trọng để tránh bufferStalledError
          if (!videoRef.current.paused && bufferLength < critical) {
            console.warn(`[HlsPreview] Buffer too low during playback (${bufferLength.toFixed(2)}s), pausing to build buffer...`);
            videoRef.current.pause();
            setIsPlaying(false);
            playAttemptedRef.current = false;
          }
        }
      });
      
      // Detect khi video bị stalled (đứng) - chỉ log khi thực sự cần
      if (videoRef.current) {
        let waitingCount = 0;
        videoRef.current.addEventListener('waiting', () => {
          waitingCount++;
          // Chỉ log mỗi 5 lần waiting để giảm noise
          if (waitingCount % 5 === 0) {
            console.warn(`[HlsPreview] Video waiting (buffering) - ${waitingCount} times`);
          }
        });
        
        videoRef.current.addEventListener('stalled', () => {
          console.warn('[HlsPreview] Video stalled - stream may be stuck');
        });
        
        // QUAN TRỌNG: Ngăn video tự động play khi có data
        videoRef.current.addEventListener('canplay', () => {
          // Nếu video đang paused và buffer chưa đủ, giữ paused
          if (videoRef.current && videoRef.current.paused) {
            const bufferedEnd = videoRef.current.buffered.length > 0 
              ? videoRef.current.buffered.end(videoRef.current.buffered.length - 1) 
              : 0;
            const currentTime = videoRef.current.currentTime || 0;
            const bufferLength = Math.max(0, bufferedEnd - currentTime);
            
            const { start } = getBufferThresholds();
            if (bufferLength < start) {
              console.log(`[HlsPreview] Video can play but buffer too low (${bufferLength.toFixed(2)}s / ${start.toFixed(2)}s), keeping paused...`);
              // Đảm bảo video vẫn paused
              videoRef.current.pause();
            }
          }
        }, { once: false });
        
        // Ngăn video tự động play khi có đủ data để playthrough
        videoRef.current.addEventListener('canplaythrough', () => {
          // Vẫn check buffer trước khi cho phép play
          if (videoRef.current && videoRef.current.paused) {
            const bufferedEnd = videoRef.current.buffered.length > 0 
              ? videoRef.current.buffered.end(videoRef.current.buffered.length - 1) 
              : 0;
            const currentTime = videoRef.current.currentTime || 0;
            const bufferLength = Math.max(0, bufferedEnd - currentTime);
            
            const { start } = getBufferThresholds();
            if (bufferLength < start) {
              console.log(`[HlsPreview] Video can playthrough but buffer too low (${bufferLength.toFixed(2)}s / ${start.toFixed(2)}s), keeping paused...`);
              videoRef.current.pause();
            }
          }
        }, { once: false });
      }

      hls.on(Hls.Events.ERROR, (_: any, data: any) => {
        // Log tất cả errors để debug (bao gồm cả non-fatal)
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
        
        // Log non-fatal errors để debug (nhưng không xử lý)
        if (!data.fatal) {
          // Fragment load timeout - có thể file đang được ghi, không phải lỗi nghiêm trọng
          if (data.details === 'fragLoadTimeOut') {
            console.debug('[HlsPreview] Fragment load timeout (file may be writing). HLS.js will retry automatically.');
            return; // HLS.js sẽ tự động retry
          }
          
          // Level load timeout - có thể playlist đang được update hoặc stream chưa sẵn sàng
          if (data.details === 'levelLoadTimeOut') {
            console.warn('[HlsPreview] Level load timeout (playlist may be updating or stream not ready). HLS.js will retry automatically.');
            // Không return ngay, để HLS.js tự retry với config đã set
            return; // HLS.js sẽ tự động retry với levelLoadingMaxRetry và levelLoadingRetryDelay
          }
          
          // BufferStalledError - buffer quá thấp, HLS.js sẽ tự recover
          // Đây là expected behavior trong livestream - HLS.js sẽ tự stall và recover
          // KHÔNG cần can thiệp - để HLS.js tự xử lý
          if (data.details === 'bufferStalledError') {
            // Không log và không can thiệp - HLS.js sẽ tự recover
            return;
          }
          
          // BufferSeekOverHole - HLS.js tự động seek qua hole (không log để giảm noise)
          if (data.details === 'bufferSeekOverHole') {
            return; // HLS.js sẽ tự động xử lý, không cần log
          }
          
          // Buffer-related errors khác
          if (data.type === 'bufferAppendingError' || 
              data.type === 'bufferAppendError' ||
              data.type === 'bufferStalledError') {
            // Không log để giảm noise
            return;
          }
          
          // Log các non-fatal errors khác ở warn level
          console.warn('[HlsPreview] Non-fatal error:', data.type, data.details);
          return;
        }
        
        // Xử lý fatal errors
        console.error('[HlsPreview] Fatal error:', data.type, data.details);
        
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // Kiểm tra các loại network error
            if (data.details === 'manifestLoadTimeOut') {
              // Manifest timeout - stream chưa sẵn sàng hoặc chưa có file .m3u8
              console.log(`[HlsPreview] Manifest timeout (stream may not be ready yet), retrying (${retryCount + 1}/${maxRetries})...`);
              if (retryCount < maxRetries) {
                retryCount++;
                // Tăng delay cho manifest timeout (stream cần thời gian để tạo file)
                setTimeout(() => {
                  console.log(`[HlsPreview] Retrying manifest load (attempt ${retryCount})...`);
                  hls.loadSource(playbackUrl);
                }, 3000 * retryCount); // Delay 3s, 6s, 9s...
              } else {
                console.error('[HlsPreview] Max retries reached. Stream may not be active yet. Please ensure OBS is streaming.');
              }
            } else if (data.details === 'levelLoadTimeOut') {
              // Level timeout - level playlist không load được (có thể stream chưa sẵn sàng hoặc network issue)
              console.warn(`[HlsPreview] Level load timeout (playlist may not be ready), retrying (${retryCount + 1}/${maxRetries})...`);
              if (retryCount < maxRetries) {
                retryCount++;
                // Retry bằng cách reload source hoặc startLoad
                setTimeout(() => {
                  console.log(`[HlsPreview] Retrying level load (attempt ${retryCount})...`);
                  // Thử reload source để reset state
                  hls.loadSource(playbackUrl);
                }, 3000 * retryCount); // Delay 3s, 6s, 9s...
              } else {
                console.error('[HlsPreview] Max retries reached for level load. Stream may not be active yet. Please ensure OBS is streaming.');
              }
            } else {
              // Các network errors khác
              console.log(`[HlsPreview] Network error (${data.details}), retrying (${retryCount + 1}/${maxRetries})...`);
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                  // Thử startLoad để resume
                  hls.startLoad();
                }, 2000 * retryCount);
              } else {
                console.error('[HlsPreview] Max retries reached, cannot recover from network error');
              }
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.warn(`[HlsPreview] Media error (${data.details}), attempting recovery (${retryCount + 1}/${maxRetries})...`);
            try {
              // Thử recover media error trước (HLS.js sẽ tự động recover)
              hls.recoverMediaError();
              retryCount = 0; // Reset retry count nếu recover thành công
              console.log('[HlsPreview] Media error recovery initiated');
            } catch (recoverError) {
              console.error('[HlsPreview] Recovery failed:', recoverError);
              // Nếu recoverMediaError() fail, thử reload source
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(() => {
                  console.log(`[HlsPreview] Reloading source after media error (attempt ${retryCount})...`);
                  // Reload source để reset state
                  hls.loadSource(playbackUrl);
                }, 3000 * retryCount);
              } else {
                console.error('[HlsPreview] Max retries reached, cannot recover from media error. Please refresh the page.');
              }
            }
            break;
          default:
            console.error('[HlsPreview] Unknown fatal error, destroying HLS instance');
            hls.destroy();
            break;
        }
      });
      
      // QUAN TRỌNG: Đảm bảo video luôn paused trước khi load source
      // Ngăn HLS.js hoặc browser tự động play khi có data
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.autoplay = false;
        // Ngăn video tự động play khi có data
        videoRef.current.addEventListener('canplay', () => {
          if (videoRef.current && !videoRef.current.paused) {
            console.warn('[HlsPreview] Video tried to auto-play before buffer ready, pausing...');
            videoRef.current.pause();
            setIsPlaying(false);
            playAttemptedRef.current = false;
          }
        }, { once: false });
      }
      
      // Sau khi đăng ký tất cả event listeners, mới load source
      console.log('[HlsPreview] Loading source and attaching media...');
      hls.loadSource(playbackUrl);
      hls.attachMedia(videoRef.current);
      currentUrlRef.current = playbackUrl;
      isInitializedRef.current = true;
      console.log('[HlsPreview] Source loaded and media attached');
      
      // Monitor buffer và chỉ play khi buffer đủ
      bufferCheckIntervalRef.current = setInterval(() => {
        if (!videoRef.current || !hlsRef.current || hlsRef.current !== hls) {
          if (bufferCheckIntervalRef.current) {
            clearInterval(bufferCheckIntervalRef.current);
            bufferCheckIntervalRef.current = null;
          }
          return;
        }
        
        // Chỉ check buffer nếu video element đã sẵn sàng
        if (videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA hoặc cao hơn
          if (videoRef.current.buffered.length > 0) {
            const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
            const currentTime = videoRef.current.currentTime || 0;
            const bufferLength = Math.max(0, bufferedEnd - currentTime);
            const { start, resume } = getBufferThresholds();
            
            // CHỈ play khi buffer đủ và video đang paused
            // QUAN TRỌNG: Đảm bảo buffer đủ trước khi play để tránh bufferStalledError
            if (bufferLength >= start && videoRef.current.paused && !playAttemptedRef.current) {
              console.log(`[HlsPreview] Buffer ready (${bufferLength.toFixed(2)}s / ${start.toFixed(2)}s target), starting playback...`);
              attemptPlay();
            } else if (bufferLength < start && videoRef.current.paused) {
              // Log tiến trình build buffer (chỉ log mỗi 5 giây)
              const now = Date.now();
              if (!lastBufferCheckRef.current || now - lastBufferCheckRef.current > 5000) {
                console.log(`[HlsPreview] Building buffer... (${bufferLength.toFixed(2)}s / ${start.toFixed(2)}s)`);
                lastBufferCheckRef.current = now;
              }
            } else if (!videoRef.current.paused && bufferLength < resume) {
              console.warn(`[HlsPreview] Buffer dropped (${bufferLength.toFixed(2)}s < ${resume.toFixed(2)}s), pausing to rebuild...`);
              videoRef.current.pause();
              setIsPlaying(false);
              playAttemptedRef.current = false;
            }
          }
        }
      }, BUFFER_CHECK_INTERVAL_MS); // Check thường xuyên để phản ứng nhanh
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      videoRef.current.src = playbackUrl;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      }).catch((error: any) => {
        if (error.name === 'NotAllowedError') {
          setAutoplayBlocked(true);
          console.log('[HlsPreview] Autoplay blocked on Safari');
        } else if (error.name !== 'AbortError') {
          console.warn('[HlsPreview] Play error:', error.name);
        }
      });
    }

    return () => {
      // Cleanup function - chỉ cleanup khi component unmount hoặc playbackUrl thay đổi
      // Trong React Strict Mode (dev), useEffect chạy 2 lần, nhưng cleanup chỉ chạy khi thực sự unmount
      // Chỉ cleanup nếu URL thay đổi (không cleanup trong React Strict Mode double mount)
      const shouldCleanup = currentUrlRef.current !== playbackUrl;
      
      // Clear buffer check interval luôn luôn (an toàn)
      if (bufferCheckIntervalRef.current) {
        clearInterval(bufferCheckIntervalRef.current);
        bufferCheckIntervalRef.current = null;
      }
      
      // Chỉ destroy HLS instance nếu URL thay đổi (không destroy trong React Strict Mode double mount)
      if (shouldCleanup && hlsRef.current) {
        console.log('[HlsPreview] Cleanup: URL changed or component unmounting, destroying HLS instance...');
        hlsRef.current.destroy();
        hlsRef.current = null;
        isInitializedRef.current = false;
        currentUrlRef.current = null;
      }
    };
  }, [playbackUrl]); // Chỉ re-run khi playbackUrl thay đổi

  // Manual play handler (khi user click play button)
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

  return (
    <div className="bg-black rounded-2xl overflow-hidden border border-gray-800 relative">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay={false}
        playsInline
        muted={isMuted}
        onPlay={() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        }}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Overlay với nút play nếu autoplay bị chặn */}
      {autoplayBlocked && !isPlaying && (
        <div 
          className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer z-10"
          onClick={handlePlay}
        >
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
      {/* Custom controls cho livestream (không có seek) */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
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
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
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
                if (videoRef.current) {
                  if (videoRef.current.requestFullscreen) {
                    videoRef.current.requestFullscreen();
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
  );
});

HlsPreview.displayName = 'HlsPreview';

export default function LiveStreamSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession(sessionId);

  // Track reactions for overlay
  const [reactions, setReactions] = useState<Array<{ emoji: string; userName: string }>>([]);

  // Memoize callbacks để tránh re-render không cần thiết
  const handleViewerCountUpdate = useCallback((data: any) => {
    console.log('[LiveStreamSessionPage] Viewer count updated:', data);
  }, []);

  const handleReaction = useCallback((data: { emoji: string; userName: string }) => {
    // Add reaction to overlay
    setReactions((prev) => [...prev, { emoji: data.emoji, userName: data.userName }]);
  }, []);

  // Socket.IO connection for real-time features
  const { viewerCount, isJoined, isConnected } = useLivestreamSocket({
    sessionId,
    enabled: !!sessionId && !!session,
    sessionStatus: session?.status,
    onViewerCountUpdate: handleViewerCountUpdate,
    onReaction: handleReaction,
  });

  const mode: 'webrtc' | 'rtmp' | 'unknown' = session
    ? (session.ingest_type as 'webrtc' | 'rtmp') ||
      (session.playback_url ? 'rtmp' : 'webrtc')
    : 'unknown';

  const isLive = session?.status === 'live';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">Livestream session</p>
            {isLive && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </span>
            )}
            {isJoined && isConnected && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                <span className="font-medium">{viewerCount}</span>
                <span className="text-gray-500">người đang xem</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
          {session.course?.title && <p className="text-gray-600">Khoá học: {session.course.title}</p>}
          {session.description && (
            <p className="text-gray-600 mt-2 max-w-2xl">{session.description}</p>
          )}
        </div>
        <Button variant="ghost" onClick={() => navigate(ROUTES.LIVESTREAM.HUB)}>
          Quay lại
        </Button>
      </div>

      {/* Main Content: Video + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player - 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          {mode === 'webrtc' && (
            <WebRTCViewer
              sessionId={session.id}
              displayName={session.title}
              reactions={reactions}
              iceServers={session.webrtc_config?.iceServers as RTCIceServer[] | undefined}
            />
          )}

          {mode === 'rtmp' && session.playback_url && (
            <div className="space-y-3">
              <div className="relative">
                <HlsPreview playbackUrl={session.playback_url} />
                <ReactionOverlay reactions={reactions} />
              </div>
              <p className="text-sm text-gray-500">
                Độ trễ có thể cao hơn do đang phát qua HLS tiêu chuẩn. Đảm bảo OBS của bạn vẫn đang phát luồng tới máy chủ.
              </p>
            </div>
          )}

          {mode === 'rtmp' && !session.playback_url && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              Phiên này yêu cầu stream key/Playback URL nhưng chưa được cấu hình. Vui lòng kiểm tra lại với người host.
            </div>
          )}

          {mode === 'unknown' && (
            <div className="bg-gray-100 border border-gray-200 px-4 py-3 rounded-lg text-gray-700">
              Phiên này chưa cấu hình kiểu ingest. Liên hệ instructor để cập nhật thông tin.
            </div>
          )}

          {/* Connection status */}
          {!isConnected && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
              Đang kết nối tới server real-time...
            </div>
          )}
        </div>

        {/* Chat Sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          {isLive ? (
            <LiveStreamChat sessionId={session.id} enabled={isConnected && isJoined} sessionStatus={session.status} />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">
                Chat sẽ được bật khi livestream bắt đầu
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

