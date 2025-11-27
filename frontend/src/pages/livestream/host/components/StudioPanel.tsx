import { WebRTCLiveStudio } from '@/pages/livestream/components/host';

interface StudioPanelProps {
  ingestType?: string;
  sessionId: string | number;
  sessionTitle: string;
  iceServers?: RTCIceServer[];
}

export function StudioPanel({ ingestType, sessionId, sessionTitle, iceServers }: StudioPanelProps) {
  if (ingestType !== 'webrtc') {
    return null;
  }

  return (
    <WebRTCLiveStudio
      sessionId={sessionId}
      displayName={sessionTitle}
      iceServers={iceServers}
    />
  );
}

