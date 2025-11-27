import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LobbyHeaderProps {
  canHost: boolean;
  onCreateSession: () => void;
}

export function LobbyHeader({ canHost, onCreateSession }: LobbyHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Livestream</h1>
        <p className="text-sm text-gray-600 mt-1">Xem và tham gia các phiên phát trực tiếp</p>
      </div>

      {canHost && (
        <Button onClick={onCreateSession} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tạo phiên mới
        </Button>
      )}
    </div>
  );
}

