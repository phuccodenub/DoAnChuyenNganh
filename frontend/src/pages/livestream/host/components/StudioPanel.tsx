import { WebRTCLiveStudio, type WebRTCLiveStudioHandle } from '@/pages/livestream/components/host';
import { useRef, useEffect } from 'react';

interface StudioPanelProps {
  ingestType?: string;
  sessionId: string | number;
  sessionTitle: string;
  iceServers?: RTCIceServer[];
  onEndCall?: () => void;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
  onAudioToggle?: (isOn: boolean) => void;
  onVideoToggle?: (isOn: boolean) => void;
  externalAudioState?: boolean;
  externalVideoState?: boolean;
  onScreenShare?: () => void;
  onScreenShareRef?: (ref: React.RefObject<WebRTCLiveStudioHandle>) => void;
}

export function StudioPanel({
  ingestType, 
  sessionId, 
  sessionTitle, 
  iceServers, 
  onEndCall, 
  onToggleChat, 
  isChatOpen,
  onAudioToggle,
  onVideoToggle,
  externalAudioState,
  externalVideoState,
  onScreenShare,
  onScreenShareRef,
}: StudioPanelProps) {
  const webRTCRef = useRef<WebRTCLiveStudioHandle>(null);

  useEffect(() => {
    if (onScreenShareRef) {
      onScreenShareRef(webRTCRef);
    }
  }, [onScreenShareRef]);

  if (ingestType !== 'webrtc') {
    return null;
  }

  return (
    <WebRTCLiveStudio
      ref={webRTCRef}
      sessionId={String(sessionId)}
      displayName={sessionTitle}
      iceServers={iceServers}
      onEndCall={onEndCall}
      onToggleChat={onToggleChat}
      isChatOpen={isChatOpen}
      onAudioToggle={onAudioToggle}
      onVideoToggle={onVideoToggle}
      externalAudioState={externalAudioState}
      externalVideoState={externalVideoState}
      onScreenShare={onScreenShare}
    />
  );
}

