import { Users } from 'lucide-react';
import { LiveStreamChat, LiveStreamChatState } from '@/pages/livestream/components/shared/LiveStreamChat';

interface ChatPanelProps {
  isLive: boolean;
  sessionId: string | number;
  enabled: boolean;
  chatState: LiveStreamChatState;
  recentReactions?: Array<{ emoji: string; userName: string; timestamp: number }>;
  sessionTitle?: string;
  sessionDescription?: string;
}

export function ChatPanel({ 
  isLive, 
  sessionId, 
  enabled, 
  chatState, 
  recentReactions,
  sessionTitle,
  sessionDescription,
}: ChatPanelProps) {
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
      sessionId={sessionId}
      enabled={enabled}
      chatState={chatState}
      recentReactions={recentReactions}
      sessionTitle={sessionTitle}
      sessionDescription={sessionDescription}
    />
  );
}

