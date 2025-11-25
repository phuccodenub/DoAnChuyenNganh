import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, MonitorUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import webrtcService from '@/services/webrtcService';

interface WebRTCLiveStudioProps {
  sessionId: string;
  displayName?: string;
  iceServers?: RTCIceServer[];
}

function RemoteVideo({ stream, label }: { stream: MediaStream; label: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative rounded-xl overflow-hidden bg-black shadow">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
        {label}
      </div>
    </div>
  );
}

export function WebRTCLiveStudio({ sessionId, displayName, iceServers }: WebRTCLiveStudioProps) {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const remoteEntries = Object.entries(remoteStreams);
  const viewerCount = remoteEntries.length;

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

    webrtcService.onRemoteStream = (userId, stream) => {
      if (!mounted) return;
      console.log(`[WebRTCLiveStudio] Remote stream received from ${userId}`);
      setRemoteStreams((prev) => ({ ...prev, [userId]: stream }));
    };
    webrtcService.onUserLeft = (userId) => {
      if (!mounted) return;
      console.log(`[WebRTCLiveStudio] User left: ${userId}`);
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
  }, [sessionId, displayName]);

  const toggleAudio = () => {
    const next = !isAudioOn;
    setIsAudioOn(next);
    webrtcService.toggleAudio(next);
  };

  const toggleVideo = () => {
    const next = !isVideoOn;
    setIsVideoOn(next);
    webrtcService.toggleVideo(next);
  };

  const handleScreenShare = async () => {
    try {
      await webrtcService.startScreenShare();
    } catch (error) {
      alert('Không thể chia sẻ màn hình. Vui lòng kiểm tra quyền trình duyệt.');
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-6 space-y-4 border border-slate-800 shadow-lg text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold">Studio WebRTC</p>
          <p className="text-sm text-slate-300">Phát trực tiếp với độ trễ thấp qua hạ tầng WebRTC.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isAudioOn ? 'secondary' : 'danger'}
            onClick={toggleAudio}
            className="flex items-center gap-2"
          >
            {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            {isAudioOn ? 'Mute' : 'Unmute'}
          </Button>
          <Button
            type="button"
            variant={isVideoOn ? 'secondary' : 'danger'}
            onClick={toggleVideo}
            className="flex items-center gap-2"
          >
            {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            {isVideoOn ? 'Tắt video' : 'Bật video'}
          </Button>
          <Button type="button" variant="primary" onClick={handleScreenShare} className="flex items-center gap-2">
            <MonitorUp className="w-4 h-4" />
            Chia sẻ màn hình
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-black rounded-2xl overflow-hidden border border-slate-800 relative">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
          <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
            Bạn (Host)
          </div>
          {!localStream && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
              Đang khởi tạo camera...
            </div>
          )}
        </div>
        {/* <div className="space-y-3 bg-slate-800/60 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center justify-between text-sm text-white font-semibold">
            <p>Người xem kết nối</p>
            <span className="text-lg font-bold text-emerald-300">{viewerCount}</span>
          </div>

          {viewerCount === 0 ? (
            <p className="text-xs text-slate-300">Chưa có ai tham gia. Chia sẻ link cho học viên nhé!</p>
          ) : (
            <p className="text-xs text-slate-300">
              Đã kết nối {viewerCount} {viewerCount === 1 ? 'người xem' : 'người xem'} – danh sách cập nhật theo thời gian thực.
            </p>
          )}

          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {remoteEntries.map(([userId, stream]) => (
              <RemoteVideo key={userId} stream={stream} label={`Viewer ${userId.slice(0, 4)}`} />
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default WebRTCLiveStudio;


