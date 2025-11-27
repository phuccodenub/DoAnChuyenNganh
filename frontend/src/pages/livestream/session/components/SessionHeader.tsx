import { Button } from '@/components/ui/Button';
import { Eye } from 'lucide-react';

interface SessionHeaderProps {
  title: string;
  courseTitle?: string;
  description?: string;
  isLive: boolean;
  viewerCount?: number;
  showViewerCount: boolean;
  onBack: () => void;
}

export function SessionHeader({
  title,
  courseTitle,
  description,
  isLive,
  viewerCount,
  showViewerCount,
  onBack,
}: SessionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          {isLive && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          )}
          <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">Livestream session</p>
          
          {showViewerCount && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span className="font-medium">{viewerCount ?? 0}</span>
              <span className="text-gray-500">người đang xem</span>
            </div>
          )}
        </div>

      </div>

      <Button variant="ghost" onClick={onBack}>
        Quay lại
      </Button>
    </div>
  );
}

