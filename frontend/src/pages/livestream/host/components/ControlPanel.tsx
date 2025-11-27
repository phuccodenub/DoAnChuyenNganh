import { Button } from '@/components/ui/Button';
import { Play, Square, Video as VideoIcon, ExternalLink } from 'lucide-react';

type SessionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

interface ControlPanelProps {
  status: SessionStatus;
  isUpdating: boolean;
  hasRecording: boolean;
  onStart: () => void;
  onEnd: () => void;
  onViewStream: () => void;
  onOpenRecording: () => void;
}

export function ControlPanel({
  status,
  isUpdating,
  hasRecording,
  onStart,
  onEnd,
  onViewStream,
  onOpenRecording,
}: ControlPanelProps) {
  if (status === 'cancelled') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Điều khiển</h2>

      <div className="flex items-center gap-4 flex-wrap">
        {status === 'scheduled' && (
          <Button
            onClick={onStart}
            disabled={isUpdating}
            className="flex items-center gap-2"
            size="lg"
          >
            <Play className="w-5 h-5" />
            Bắt đầu livestream
          </Button>
        )}

        {status === 'live' && (
          <>
            <Button
              onClick={onEnd}
              disabled={isUpdating}
              variant="danger"
              className="flex items-center gap-2"
              size="lg"
            >
              <Square className="w-5 h-5" />
              Kết thúc livestream
            </Button>
            <Button
              onClick={onViewStream}
              variant="secondary"
              className="flex items-center gap-2"
              size="lg"
            >
              <VideoIcon className="w-5 h-5" />
              Xem stream
            </Button>
          </>
        )}

        {status === 'ended' && hasRecording && (
          <Button
            onClick={onOpenRecording}
            variant="secondary"
            className="flex items-center gap-2"
            size="lg"
          >
            <ExternalLink className="w-5 h-5" />
            Xem ghi hình
          </Button>
        )}
      </div>

      {status === 'scheduled' && (
        <p className="text-sm text-gray-600 mt-4">💡 Nhấn "Bắt đầu livestream" khi bạn đã sẵn sàng</p>
      )}
    </div>
  );
}

