import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, MonitorUp, Smile, Hand, MoreHorizontal, PhoneOff, ChevronUp, MessageSquare, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

interface MeetStyleControlsProps {
  isAudioOn: boolean;
  isVideoOn: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onScreenShare: () => void;
  onEndCall: () => void;
  onReactions?: (emoji?: string) => void;
  onCaptions?: () => void;
  onRaiseHand?: () => void;
  onMoreOptions?: () => void;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
  onAudioDeviceChange?: (deviceId: string) => void;
  onVideoDeviceChange?: (deviceId: string) => void;
  currentAudioDeviceId?: string;
  currentVideoDeviceId?: string;
}

const EMOJI_REACTIONS = ['👍', '❤️', '🔥', '👏', '🎉', '😄', '😮', '💯'];

export function MeetStyleControls({
  isAudioOn,
  isVideoOn,
  onToggleAudio,
  onToggleVideo,
  onScreenShare,
  onEndCall,
  onReactions = () => {},
  onCaptions,
  onRaiseHand = () => {},
  onMoreOptions = () => {},
  onToggleChat,
  isChatOpen = false,
  onAudioDeviceChange,
  onVideoDeviceChange,
  currentAudioDeviceId,
  currentVideoDeviceId,
}: MeetStyleControlsProps) {
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showVideoMenu, setShowVideoMenu] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([]);
  const audioMenuRef = useRef<HTMLDivElement>(null);
  const videoMenuRef = useRef<HTMLDivElement>(null);
  const reactionMenuRef = useRef<HTMLDivElement>(null);

  // Lấy danh sách thiết bị
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Yêu cầu quyền truy cập để lấy label
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices
          .filter((d) => d.kind === 'audioinput')
          .map((d) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 8)}`, kind: d.kind }));
        const videoInputs = devices
          .filter((d) => d.kind === 'videoinput')
          .map((d) => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 8)}`, kind: d.kind }));
        
        setAudioDevices(audioInputs);
        setVideoDevices(videoInputs);
      } catch (error) {
        console.error('Error getting devices:', error);
      }
    };

    getDevices();

    // Lắng nghe thay đổi thiết bị
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, []);

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (audioMenuRef.current && !audioMenuRef.current.contains(event.target as Node)) {
        setShowAudioMenu(false);
      }
      if (videoMenuRef.current && !videoMenuRef.current.contains(event.target as Node)) {
        setShowVideoMenu(false);
      }
      if (reactionMenuRef.current && !reactionMenuRef.current.contains(event.target as Node)) {
        setShowReactionMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-full relative">
      <div className="flex items-center gap-1 bg-gray-200 rounded-full px-1 py-1 shadow-2xl border border-gray-900">
        {/* Microphone Toggle - Google Meet Style */}
        <div className="relative" ref={audioMenuRef}>
          <div
            className={cn(
              'flex items-center rounded-full transition-all overflow-hidden',
              isAudioOn
                ? 'bg-[#3c4043] hover:bg-[#5f6368]'
                : 'bg-[#ea4335] hover:bg-[#d33b2c]'
            )}
          >
            {/* Left part with chevron - Dropdown */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAudioMenu(!showAudioMenu);
                setShowVideoMenu(false);
              }}
              className="px-2.5 py-2 border-r border-black/30 hover:bg-black/20 transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5 text-white" />
            </button>
            {/* Right part with icon - Toggle */}
            <button
              onClick={onToggleAudio}
              className="px-3 py-2 hover:bg-black/20 transition-colors"
            >
              {isAudioOn ? (
                <Mic className="w-5 h-5 text-white" />
              ) : (
                <MicOff className="w-5 h-5 text-white" />
              )}
            </button>
          </div>

          {/* Audio Device Dropdown */}
          {showAudioMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px] max-h-[300px] overflow-y-auto z-50">
              <div className="py-1">
                {audioDevices.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">Không có thiết bị</div>
                ) : (
                  audioDevices.map((device) => (
                    <button
                      key={device.deviceId}
                      onClick={() => {
                        onAudioDeviceChange?.(device.deviceId);
                        setShowAudioMenu(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between',
                        currentAudioDeviceId === device.deviceId && 'bg-blue-50'
                      )}
                    >
                      <span className="truncate">{device.label}</span>
                      {currentAudioDeviceId === device.deviceId && (
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Camera Toggle - Google Meet Style */}
        <div className="relative" ref={videoMenuRef}>
          <div
            className={cn(
              'flex items-center rounded-full transition-all overflow-hidden',
              isVideoOn
                ? 'bg-[#3c4043] hover:bg-[#5f6368]'
                : 'bg-[#ea4335] hover:bg-[#d33b2c]'
            )}
          >
            {/* Left part with chevron - Dropdown */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVideoMenu(!showVideoMenu);
                setShowAudioMenu(false);
              }}
              className="px-2.5 py-2 border-r border-black/30 hover:bg-black/20 transition-colors"
            >
              <ChevronUp className="w-3.5 h-3.5 text-white" />
            </button>
            {/* Right part with icon - Toggle */}
            <button
              onClick={onToggleVideo}
              className="px-3 py-2 hover:bg-black/20 transition-colors"
            >
              {isVideoOn ? (
                <Video className="w-5 h-5 text-white" />
              ) : (
                <VideoOff className="w-5 h-5 text-white" />
              )}
            </button>
          </div>

          {/* Video Device Dropdown */}
          {showVideoMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px] max-h-[300px] overflow-y-auto z-50">
              <div className="py-1">
                {videoDevices.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">Không có thiết bị</div>
                ) : (
                  videoDevices.map((device) => (
                    <button
                      key={device.deviceId}
                      onClick={() => {
                        onVideoDeviceChange?.(device.deviceId);
                        setShowVideoMenu(false);
                      }}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between',
                        currentVideoDeviceId === device.deviceId && 'bg-blue-50'
                      )}
                    >
                      <span className="truncate">{device.label}</span>
                      {currentVideoDeviceId === device.deviceId && (
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Screen Share - Separate button */}
        <button
          onClick={onScreenShare}
          className="w-10 h-10 rounded-full bg-[#3c4043] hover:bg-[#5f6368] flex items-center justify-center transition-colors"
          title="Chia sẻ màn hình"
        >
          <MonitorUp className="w-5 h-5 text-white" />
        </button>

        {/* Reactions */}
        <div className="relative" ref={reactionMenuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReactionMenu(!showReactionMenu);
              setShowAudioMenu(false);
              setShowVideoMenu(false);
            }}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              showReactionMenu
                ? 'bg-[#4285f4] hover:bg-[#357ae8]'
                : 'bg-[#3c4043] hover:bg-[#5f6368]'
            )}
            title="Phản ứng"
          >
            <Smile className="w-5 h-5 text-white" />
          </button>

          {/* Emoji Reactions Dropdown */}
          {showReactionMenu && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-[100] min-w-[180px]">
              <div className="grid grid-cols-4 gap-2">
                {EMOJI_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReactions(emoji);
                      setShowReactionMenu(false);
                    }}
                    className="w-10 h-10 text-2xl hover:bg-gray-100 rounded-lg transition-all flex items-center justify-center active:scale-90 hover:scale-110"
                    title={`Gửi ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Raise Hand */}
        <button
          onClick={onRaiseHand}
          className="w-10 h-10 rounded-full bg-[#3c4043] hover:bg-[#5f6368] flex items-center justify-center transition-colors"
          title="Giơ tay"
        >
          <Hand className="w-5 h-5 text-white" />
        </button>

        {/* Chat Toggle - Google Meet Style */}
        {onToggleChat && (
          <button
            onClick={onToggleChat}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              isChatOpen
                ? 'bg-[#4285f4] hover:bg-[#357ae8]'
                : 'bg-[#3c4043] hover:bg-[#5f6368]'
            )}
            title={isChatOpen ? 'Đóng chat' : 'Mở chat'}
          >
            <MessageSquare className="w-5 h-5 text-white" />
          </button>
        )}

        {/* More Options */}
        <button
          onClick={onMoreOptions}
          className="w-10 h-10 rounded-full bg-[#3c4043] hover:bg-[#5f6368] flex items-center justify-center transition-colors"
          title="Tùy chọn khác"
        >
          <MoreHorizontal className="w-5 h-5 text-white" />
        </button>

        {/* End Call */}
        <button
          onClick={onEndCall}
          className="w-10 h-10 rounded-full bg-[#ea4335] hover:bg-[#d33b2c] flex items-center justify-center transition-colors"
          title="Kết thúc cuộc gọi"
        >
          <PhoneOff className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

