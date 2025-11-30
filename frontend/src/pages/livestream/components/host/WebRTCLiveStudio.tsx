import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import webrtcService from '@/services/webrtcService';
import { livestreamApi } from '@/services/api/livestream.api';

export interface WebRTCLiveStudioHandle {
  startScreenShare: () => Promise<void>;
}

interface WebRTCLiveStudioProps {
  sessionId: string;
  displayName?: string;
  iceServers?: RTCIceServer[];
  onEndCall?: () => void;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
  onAudioToggle?: (isOn: boolean) => void;
  onVideoToggle?: (isOn: boolean) => void;
  externalAudioState?: boolean;
  externalVideoState?: boolean;
  onAudioDeviceChange?: (deviceId: string) => void;
  onVideoDeviceChange?: (deviceId: string) => void;
  currentAudioDeviceId?: string;
  currentVideoDeviceId?: string;
  onScreenShare?: () => void;
}

export const WebRTCLiveStudio = forwardRef<WebRTCLiveStudioHandle, WebRTCLiveStudioProps>(({ 
  sessionId, 
  displayName, 
  iceServers, 
  onEndCall, 
  onToggleChat, 
  isChatOpen,
  onAudioToggle,
  onVideoToggle,
  externalAudioState,
  externalVideoState,
  onAudioDeviceChange,
  onVideoDeviceChange,
  currentAudioDeviceId,
  currentVideoDeviceId,
  onScreenShare,
}, ref) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isAudioOn, setIsAudioOn] = useState(externalAudioState ?? true);
  const [isVideoOn, setIsVideoOn] = useState(externalVideoState ?? true);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string | undefined>(currentAudioDeviceId);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string | undefined>(currentVideoDeviceId);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [cameraPosition, setCameraPosition] = useState({ x: 8, y: 8 }); // Position for draggable camera với padding
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const thumbnailUploadedRef = useRef(false);
  const thumbnailAttemptsRef = useRef(0);
  const thumbnailRetryTimeoutRef = useRef<number | null>(null);
  const MAX_THUMBNAIL_ATTEMPTS = 5;
  
  // Refs for composite stream
  const compositeStreamRef = useRef<MediaStream | null>(null);
  const compositeAnimationFrameRef = useRef<number | null>(null);
  const cameraPositionRef = useRef(cameraPosition); // Ref để cập nhật vị trí camera trong draw loop
  const isVideoOnRef = useRef(isVideoOn); // Ref để kiểm tra trạng thái camera trong draw loop

  useEffect(() => {
    thumbnailUploadedRef.current = false;
  }, [sessionId]);

  // Configure ICE servers
  useEffect(() => {
    if (iceServers && iceServers.length > 0) {
      console.log('[WebRTCLiveStudio] Configuring ICE servers:', iceServers);
      webrtcService.configure({ iceServers });
    } else {
      console.log('[WebRTCLiveStudio] Using default ICE servers');
      webrtcService.configure(); // Reset to defaults
    }
  }, [iceServers]);

  useEffect(() => {
    let mounted = true;
    let isJoining = false;

    const join = async () => {
      if (isJoining) return;
      isJoining = true;

      try {
        await webrtcService.joinSession(sessionId, displayName, 'instructor', {
          sendMedia: true,
        });
        const stream = webrtcService.getLocalStream();
        if (stream && localVideoRef.current && mounted) {
          localVideoRef.current.srcObject = stream;
          setLocalStream(stream);
        }
      } catch (error) {
        console.error('[WebRTCLiveStudio] Join error', error);
      } finally {
        isJoining = false;
      }
    };

    join();

    // Lưu original handler để restore sau
    const originalOnRemoteStream = webrtcService.onRemoteStream;
    
    // Hàm helper để replace track cho peer
    const replaceTrackForPeer = (userId: string) => {
      const compositeVideoTrack = compositeStreamRef.current?.getVideoTracks()[0] || 
                                   (webrtcService as any).currentCompositeVideoTrack;
      
      if (compositeVideoTrack) {
        const peers = (webrtcService as any).peers;
        if (peers) {
          const peer = peers.get(userId);
          if (peer && peer.peerConnection) {
            const sender = peer.peerConnection.getSenders().find((s: any) => s.track?.kind === 'video');
            if (sender) {
              sender.replaceTrack(compositeVideoTrack).then(() => {
                console.log(`[WebRTCLiveStudio] Successfully replaced track for peer ${userId} with composite stream`);
              }).catch((err: any) => {
                console.error(`[WebRTCLiveStudio] Failed to replace track for peer ${userId}:`, err);
                // Retry sau 1 giây
                setTimeout(() => replaceTrackForPeer(userId), 1000);
              });
            }
          }
        }
      }
    };

    webrtcService.onRemoteStream = (userId, stream) => {
      if (!mounted) return;
      console.log(`[WebRTCLiveStudio] Remote stream received from ${userId}`);
      
      // Nếu đang screen sharing, replace track cho peer mới với composite stream
      if (compositeStreamRef.current || (webrtcService as any).currentCompositeVideoTrack) {
        // Thử replace ngay
        replaceTrackForPeer(userId);
        
        // Retry sau khi connection ổn định
        setTimeout(() => replaceTrackForPeer(userId), 500);
        setTimeout(() => replaceTrackForPeer(userId), 1500);
        setTimeout(() => replaceTrackForPeer(userId), 3000);
      }
      
      // Gọi original handler nếu có
      if (originalOnRemoteStream) {
        originalOnRemoteStream(userId, stream);
      }
    };
    
    // Lắng nghe khi peer connection state thay đổi để replace track sớm hơn
    const checkAndReplaceTracks = () => {
      if (compositeStreamRef.current || (webrtcService as any).currentCompositeVideoTrack) {
        const peers = (webrtcService as any).peers;
        if (peers) {
          peers.forEach((peer: any, userId: string) => {
            if (peer.peerConnection) {
              const state = peer.peerConnection.connectionState;
              if (state === 'connected' || state === 'connecting') {
                replaceTrackForPeer(userId);
              }
            }
          });
        }
      }
    };
    
    // Kiểm tra định kỳ để replace track cho peers mới
    const intervalId = setInterval(checkAndReplaceTracks, 2000);
    webrtcService.onUserLeft = (userId) => {
      if (!mounted) return;
      console.log(`[WebRTCLiveStudio] User left: ${userId}`);
    };

    return () => {
      mounted = false;
      clearInterval(intervalId);
      webrtcService.onRemoteStream = originalOnRemoteStream; // Restore original handler
      webrtcService.onUserLeft = undefined;
      webrtcService.leaveSession(sessionId).catch(console.error);
    };
  }, [sessionId, displayName]);

  const captureAndUploadThumbnail = useCallback(async (): Promise<boolean> => {
    if (thumbnailUploadedRef.current || !sessionId) return false;
    const video = localVideoRef.current;
    if (!video) return false;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    if (width === 0 || height === 0) return false;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    if (video.readyState < 2) {
      return false;
    }
    ctx.drawImage(video, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let brightnessSum = 0;
    const pixelCount = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // perceived brightness
      brightnessSum += 0.299 * r + 0.587 * g + 0.114 * b;
    }
    const averageBrightness = brightnessSum / pixelCount;
    if (averageBrightness < 15) {
      // frame is too dark (likely still black screen)
      return false;
    }
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85)
    );
    if (!blob) return false;
    const file = new File([blob], `livestream-thumbnail-${sessionId}.jpg`, {
      type: 'image/jpeg',
    });
    try {
      await livestreamApi.uploadThumbnail(sessionId, file);
      thumbnailUploadedRef.current = true;
      console.log('[WebRTCLiveStudio] Thumbnail uploaded automatically');
      return true;
    } catch (error) {
      console.error('[WebRTCLiveStudio] Failed to upload thumbnail', error);
    }
    return false;
  }, [sessionId]);

  useEffect(() => {
    if (!localStream) return () => undefined;
    thumbnailAttemptsRef.current = 0;

    const attemptUpload = async () => {
      if (thumbnailUploadedRef.current) return;
      if (thumbnailAttemptsRef.current >= MAX_THUMBNAIL_ATTEMPTS) return;
      thumbnailAttemptsRef.current += 1;
      const success = await captureAndUploadThumbnail();
      if (!success && thumbnailAttemptsRef.current < MAX_THUMBNAIL_ATTEMPTS) {
        thumbnailRetryTimeoutRef.current = window.setTimeout(attemptUpload, 1500);
      }
    };

    attemptUpload();

    return () => {
      if (thumbnailRetryTimeoutRef.current) {
        window.clearTimeout(thumbnailRetryTimeoutRef.current);
        thumbnailRetryTimeoutRef.current = null;
      }
    };
  }, [localStream, captureAndUploadThumbnail]);

  // Sync external state với internal state
  useEffect(() => {
    if (externalAudioState !== undefined) {
      setIsAudioOn(externalAudioState);
      webrtcService.toggleAudio(externalAudioState);
    }
  }, [externalAudioState]);

  useEffect(() => {
    if (externalVideoState !== undefined) {
      setIsVideoOn(externalVideoState);
      webrtcService.toggleVideo(externalVideoState);
    }
  }, [externalVideoState]);

  const toggleAudio = () => {
    const next = !isAudioOn;
    setIsAudioOn(next);
    webrtcService.toggleAudio(next);
    onAudioToggle?.(next);
  };

  const toggleVideo = () => {
    const next = !isVideoOn;
    setIsVideoOn(next);
    webrtcService.toggleVideo(next);
    onVideoToggle?.(next);
  };

  // Cập nhật cameraPositionRef khi cameraPosition thay đổi
  useEffect(() => {
    cameraPositionRef.current = cameraPosition;
  }, [cameraPosition]);

  // Cập nhật isVideoOnRef khi isVideoOn thay đổi
  useEffect(() => {
    isVideoOnRef.current = isVideoOn;
  }, [isVideoOn]);

  // Tạo composite stream với camera overlay
  const createCompositeStream = useCallback((screenStream: MediaStream, cameraStream: MediaStream): MediaStream => {
    // Tạo canvas ẩn
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');

    // Tạo video elements ẩn
    const screenVideo = document.createElement('video');
    screenVideo.srcObject = screenStream;
    screenVideo.autoplay = true;
    screenVideo.playsInline = true;
    screenVideo.style.display = 'none';
    document.body.appendChild(screenVideo);

    const cameraVideo = document.createElement('video');
    cameraVideo.srcObject = cameraStream;
    cameraVideo.autoplay = true;
    cameraVideo.playsInline = true;
    cameraVideo.style.display = 'none';
    document.body.appendChild(cameraVideo);

    // Đợi cả 2 video sẵn sàng
    let screenReady = false;
    let cameraReady = false;

    const checkReady = () => {
      if (screenReady && cameraReady) {
        startComposite();
      }
    };

    screenVideo.onloadedmetadata = () => {
      screenVideo.play();
      screenReady = true;
      checkReady();
    };

    cameraVideo.onloadedmetadata = () => {
      cameraVideo.play();
      cameraReady = true;
      checkReady();
    };

    const startComposite = () => {
      const draw = () => {
        if (!screenReady || !cameraReady) return;

        // Lấy kích thước thực tế của screen share video
        const screenVideoWidth = screenVideo.videoWidth || 1920;
        const screenVideoHeight = screenVideo.videoHeight || 1080;
        
        // Tính toán scale để fit screen share vào canvas (giữ tỷ lệ)
        const screenAspect = screenVideoWidth / screenVideoHeight;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;
        
        if (screenAspect > canvasAspect) {
          // Screen rộng hơn canvas, fit theo width
          drawHeight = canvas.width / screenAspect;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          // Screen cao hơn canvas, fit theo height
          drawWidth = canvas.height * screenAspect;
          offsetX = (canvas.width - drawWidth) / 2;
        }

        // Vẽ screen share làm background (centered và giữ tỷ lệ)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(screenVideo, offsetX, offsetY, drawWidth, drawHeight);

        // Chỉ vẽ camera nếu camera đang bật
        if (isVideoOnRef.current && cameraReady) {
          // Tính toán vị trí và kích thước camera trên canvas
          const currentPos = cameraPositionRef.current;
        const cameraWidgetWidth = 200; // Kích thước widget trên UI
        const cameraWidgetHeight = 150;
        
        // Lấy aspect ratio thực tế của camera video
        const cameraVideoWidth = cameraVideo.videoWidth || 640;
        const cameraVideoHeight = cameraVideo.videoHeight || 480;
        const cameraAspectRatio = cameraVideoWidth / cameraVideoHeight;
        const widgetAspectRatio = cameraWidgetWidth / cameraWidgetHeight;
        
        // Lấy container để tính scale
        const container = document.querySelector('.webrtc-container') as HTMLElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          
          // Scale dựa trên screen share area (drawWidth x drawHeight), không phải canvas size
          const scaleX = drawWidth / containerRect.width;
          const scaleY = drawHeight / containerRect.height;
          
          // Tính vị trí camera trên canvas (cộng thêm offset của screen share)
          const canvasX = offsetX + (currentPos.x * scaleX);
          const canvasY = offsetY + (currentPos.y * scaleY);
          
          // Tính kích thước camera trên canvas (giữ tỷ lệ widget)
          let canvasCameraWidth = cameraWidgetWidth * scaleX;
          let canvasCameraHeight = cameraWidgetHeight * scaleY;
          
          // Điều chỉnh để giữ aspect ratio của camera video (object-fit: cover)
          let finalWidth = canvasCameraWidth;
          let finalHeight = canvasCameraHeight;
          let finalX = canvasX;
          let finalY = canvasY;
          
          if (cameraAspectRatio > widgetAspectRatio) {
            // Camera video rộng hơn widget, fit theo height
            finalHeight = canvasCameraHeight;
            finalWidth = finalHeight * cameraAspectRatio;
            finalX = canvasX - (finalWidth - canvasCameraWidth) / 2;
          } else {
            // Camera video cao hơn widget, fit theo width
            finalWidth = canvasCameraWidth;
            finalHeight = finalWidth / cameraAspectRatio;
            finalY = canvasY - (finalHeight - canvasCameraHeight) / 2;
          }

            // Vẽ camera với aspect ratio đúng (crop nếu cần, giống object-fit: cover)
            ctx.drawImage(cameraVideo, finalX, finalY, finalWidth, finalHeight);
          } else {
            // Fallback: vẽ ở góc trên trái của screen share area, giữ aspect ratio
            let fallbackWidth = cameraWidgetWidth;
            let fallbackHeight = cameraWidgetHeight;
            let fallbackX = offsetX + 8;
            let fallbackY = offsetY + 8;
            
            if (cameraAspectRatio > widgetAspectRatio) {
              fallbackHeight = cameraWidgetHeight;
              fallbackWidth = fallbackHeight * cameraAspectRatio;
              fallbackX = offsetX + 8 - (fallbackWidth - cameraWidgetWidth) / 2;
            } else {
              fallbackWidth = cameraWidgetWidth;
              fallbackHeight = fallbackWidth / cameraAspectRatio;
              fallbackY = offsetY + 8 - (fallbackHeight - cameraWidgetHeight) / 2;
            }
            
            ctx.drawImage(cameraVideo, fallbackX, fallbackY, fallbackWidth, fallbackHeight);
          }
        }

        compositeAnimationFrameRef.current = requestAnimationFrame(draw);
      };

      draw();
    };

    // Capture canvas thành stream
    const compositeStream = canvas.captureStream(30); // 30 FPS

    // Cleanup khi stream kết thúc
    screenStream.getVideoTracks()[0].onended = () => {
      if (compositeAnimationFrameRef.current) {
        cancelAnimationFrame(compositeAnimationFrameRef.current);
      }
      if (document.body.contains(screenVideo)) {
        document.body.removeChild(screenVideo);
      }
      if (document.body.contains(cameraVideo)) {
        document.body.removeChild(cameraVideo);
      }
    };

    return compositeStream;
  }, []);

  const handleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        // Stop screen share
        if (screenShareStream) {
          screenShareStream.getTracks().forEach(track => track.stop());
          setScreenShareStream(null);
        }
        if (compositeStreamRef.current) {
          compositeStreamRef.current.getTracks().forEach(track => track.stop());
          compositeStreamRef.current = null;
        }
        if (compositeAnimationFrameRef.current) {
          cancelAnimationFrame(compositeAnimationFrameRef.current);
          compositeAnimationFrameRef.current = null;
        }
        
        // Clear composite track reference
        (webrtcService as any).currentCompositeVideoTrack = null;
        
        setIsScreenSharing(false);
        
        // Restore camera to main video
        if (localVideoRef.current && localStream) {
          localVideoRef.current.srcObject = localStream;
        }
        
        // Restore camera track in WebRTC - sử dụng localStream thay vì cameraStream
        if (localStream) {
          const cameraVideoTrack = localStream.getVideoTracks()[0];
          if (cameraVideoTrack && cameraVideoTrack.readyState === 'live') {
            // Đảm bảo track được enabled
            cameraVideoTrack.enabled = true;
            
            const peers = (webrtcService as any).peers;
            if (peers) {
              peers.forEach((peer: any) => {
                const sender = peer.peerConnection.getSenders().find((s: any) => s.track?.kind === 'video');
                if (sender) {
                  sender.replaceTrack(cameraVideoTrack).then(() => {
                    console.log('[WebRTCLiveStudio] Successfully restored camera track');
                  }).catch((err: any) => {
                    console.error('[WebRTCLiveStudio] Failed to restore camera track:', err);
                    // Retry sau 500ms
                    setTimeout(() => {
                      sender.replaceTrack(cameraVideoTrack).catch(console.error);
                    }, 500);
                  });
                }
              });
            }
          } else {
            console.warn('[WebRTCLiveStudio] Camera track not ready, waiting...');
            // Đợi track sẵn sàng
            setTimeout(() => {
              const track = localStream?.getVideoTracks()[0];
              if (track && track.readyState === 'live') {
                track.enabled = true;
                const peers = (webrtcService as any).peers;
                if (peers) {
                  peers.forEach((peer: any) => {
                    const sender = peer.peerConnection.getSenders().find((s: any) => s.track?.kind === 'video');
                    if (sender) {
                      sender.replaceTrack(track).catch(console.error);
                    }
                  });
                }
              }
            }, 500);
          }
        }
        
        onScreenShare?.();
        return;
      }

      // Store camera stream - luôn cập nhật từ localStream mới nhất
      if (!localStream) {
        console.error('[WebRTCLiveStudio] No local stream available');
        return;
      }
      
      // Luôn cập nhật cameraStream từ localStream mới nhất (kể cả khi đã có cameraStream)
      setCameraStream(localStream);

      // Get screen share stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        } as MediaTrackConstraints,
        audio: true,
      });

      // Tạo composite stream với camera overlay (sử dụng localStream mới nhất)
      const compositeStream = createCompositeStream(screenStream, localStream);

      // Set screen share as main video (host view)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }
      setScreenShareStream(screenStream);
      setIsScreenSharing(true);
      compositeStreamRef.current = compositeStream;

      // Gửi composite stream qua WebRTC (viewer sẽ thấy cả camera và screen share)
      const compositeVideoTrack = compositeStream.getVideoTracks()[0];
      
      // Replace track cho tất cả peers hiện tại
      const replaceTrackForAllPeers = () => {
        const peers = (webrtcService as any).peers;
        if (peers) {
          peers.forEach((peer: any) => {
            const sender = peer.peerConnection.getSenders().find((s: any) => s.track?.kind === 'video');
            if (sender) {
              sender.replaceTrack(compositeVideoTrack);
            }
          });
        }
      };
      
      replaceTrackForAllPeers();
      
      // Lưu composite track vào ref để replace cho peers mới join sau này
      (webrtcService as any).currentCompositeVideoTrack = compositeVideoTrack;

      // Notify via socket
      if (sessionId) {
        const socketService = (webrtcService as any).socketService;
        if (socketService) {
          socketService.emit('webrtc:screen_share_start', { sessionId });
        }
      }

      // Handle screen share end (user clicks stop in browser)
      const videoTrack = screenStream.getVideoTracks()[0];
      videoTrack.onended = () => {
        // Clear composite track reference
        (webrtcService as any).currentCompositeVideoTrack = null;
        
        setScreenShareStream(null);
        setIsScreenSharing(false);
        if (compositeStreamRef.current) {
          compositeStreamRef.current.getTracks().forEach(track => track.stop());
          compositeStreamRef.current = null;
        }
        if (compositeAnimationFrameRef.current) {
          cancelAnimationFrame(compositeAnimationFrameRef.current);
          compositeAnimationFrameRef.current = null;
        }
        
        // Restore camera to main video
        if (localVideoRef.current && localStream) {
          localVideoRef.current.srcObject = localStream;
        }
        
        // Restore camera track - sử dụng localStream
        if (localStream) {
          const cameraVideoTrack = localStream.getVideoTracks()[0];
          if (cameraVideoTrack && cameraVideoTrack.readyState === 'live') {
            cameraVideoTrack.enabled = true;
            
            const peers = (webrtcService as any).peers;
            if (peers) {
              peers.forEach((peer: any) => {
                const sender = peer.peerConnection.getSenders().find((s: any) => s.track?.kind === 'video');
                if (sender) {
                  sender.replaceTrack(cameraVideoTrack).then(() => {
                    console.log('[WebRTCLiveStudio] Successfully restored camera track after screen share ended');
                  }).catch((err: any) => {
                    console.error('[WebRTCLiveStudio] Failed to restore camera track:', err);
                    // Retry sau 500ms
                    setTimeout(() => {
                      sender.replaceTrack(cameraVideoTrack).catch(console.error);
                    }, 500);
                  });
                }
              });
            }
          } else {
            // Đợi track sẵn sàng
            setTimeout(() => {
              const track = localStream?.getVideoTracks()[0];
              if (track && track.readyState === 'live') {
                track.enabled = true;
                const peers = (webrtcService as any).peers;
                if (peers) {
                  peers.forEach((peer: any) => {
                    const sender = peer.peerConnection.getSenders().find((s: any) => s.track?.kind === 'video');
                    if (sender) {
                      sender.replaceTrack(track).catch(console.error);
                    }
                  });
                }
              }
            }, 500);
          }
        }
      };

      onScreenShare?.();
    } catch (error) {
      console.error('[WebRTCLiveStudio] Screen share error:', error);
      alert('Không thể chia sẻ màn hình. Vui lòng kiểm tra quyền trình duyệt.');
    }
  }, [onScreenShare, isScreenSharing, screenShareStream, cameraStream, localStream, createCompositeStream, sessionId]);

  // Expose handleScreenShare via ref
  useImperativeHandle(ref, () => ({
    startScreenShare: handleScreenShare,
  }), [handleScreenShare]);

  // Handle camera drag - Improved with better offset calculation
  const handleCameraMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cameraElement = e.currentTarget as HTMLElement;
    const rect = cameraElement.getBoundingClientRect();
    const container = cameraElement.closest('.webrtc-container') as HTMLElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // Calculate offset from mouse position to camera element's position
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({
      x: offsetX,
      y: offsetY,
    });
  }, []);

  const handleCameraMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = e.currentTarget as HTMLElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const maxX = rect.width - 200; // Camera width
    const maxY = rect.height - 150; // Camera height
    
    setCameraPosition({
      x: Math.max(0, Math.min(maxX, e.clientX - dragStart.x - rect.left)),
      y: Math.max(0, Math.min(maxY, e.clientY - dragStart.y - rect.top)),
    });
  }, [isDragging, dragStart]);

  const handleCameraMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Update camera stream when localStream changes (e.g., when camera is toggled)
  useEffect(() => {
    if (localStream && isScreenSharing) {
      // Cập nhật cameraStream khi localStream thay đổi (khi bật/tắt camera)
      setCameraStream(localStream);
    }
  }, [localStream, isScreenSharing]);

  // Update camera video when camera stream changes
  useEffect(() => {
    if (cameraVideoRef.current && cameraStream && isScreenSharing && isVideoOn) {
      cameraVideoRef.current.srcObject = cameraStream;
      // Đảm bảo video track được enabled
      const videoTrack = cameraStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = true;
      }
    } else if (cameraVideoRef.current && !isVideoOn) {
      // Clear video khi camera tắt
      cameraVideoRef.current.srcObject = null;
    }
  }, [cameraStream, isScreenSharing, isVideoOn]);

  // Global mouse handlers for dragging - Optimized for smooth movement
  useEffect(() => {
    if (!isDragging) return;

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      // Cancel previous animation frame
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      // Use requestAnimationFrame for smooth updates
      rafId = requestAnimationFrame(() => {
        const container = document.querySelector('.webrtc-container') as HTMLElement;
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        const cameraWidth = 200;
        const cameraHeight = 150;
        const padding = 8; // Khoảng cách từ các cạnh
        
        // Calculate new position: mouse position minus offset, relative to container
        const newX = e.clientX - dragStart.x - containerRect.left;
        const newY = e.clientY - dragStart.y - containerRect.top;
        
        // Constrain within container bounds với padding
        const maxX = containerRect.width - cameraWidth - padding;
        const maxY = containerRect.height - cameraHeight - padding;
        const minX = padding;
        const minY = padding;
        
        setCameraPosition({
          x: Math.max(minX, Math.min(maxX, newX)),
          y: Math.max(minY, Math.min(maxY, newY)),
        });
      });
    };

    const handleMouseUp = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div 
      className="relative w-full h-full bg-zinc-900 webrtc-container"
    >
      {/* Main Video - Screen Share or Camera */}
      <video
        ref={localVideoRef}
        className="w-full h-full object-contain bg-zinc-900"
        autoPlay
        muted
        playsInline
      />

      {/* Draggable Camera Widget - Only show when screen sharing and camera is on */}
      {isScreenSharing && cameraStream && isVideoOn && (
        <div
          className="absolute bg-zinc-800 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20 cursor-move select-none"
          style={{
            width: '200px',
            height: '150px',
            left: `${cameraPosition.x}px`,
            top: `${cameraPosition.y}px`,
            zIndex: 10,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'none',
            pointerEvents: 'auto',
          } as React.CSSProperties}
          onMouseDown={handleCameraMouseDown}
        >
          <video
            ref={cameraVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-2 py-1 text-xs">
            Camera
          </div>
        </div>
      )}

      {/* Loading State */}
      {!localStream && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
          Đang khởi tạo camera...
        </div>
      )}

      {/* Controls đã được di chuyển ra control bar dưới cùng */}
    </div>
  );
});

WebRTCLiveStudio.displayName = 'WebRTCLiveStudio';

export default WebRTCLiveStudio;


