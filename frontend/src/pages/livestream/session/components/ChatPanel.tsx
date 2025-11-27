import { Users } from 'lucide-react';
import { LiveStreamChat } from '@/pages/livestream/components/shared';

type SessionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled' | undefined;

interface ChatPanelProps {
  isLive: boolean;
  sessionId: string | number;
  sessionStatus: SessionStatus;
  enabled: boolean;
}

export function ChatPanel({ isLive, sessionId, sessionStatus, enabled }: ChatPanelProps) {
  if (!isLive) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 text-sm">Chat sẽ được bật khi livestream bắt đầu</p>
      </div>
    );
  }

  return (
    <LiveStreamChat
      sessionId={sessionId.toString()}
      enabled={enabled}
      sessionStatus={sessionStatus}
    />
  );
}

