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
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">
            Livestream session
          </p>
        </div>
      </div>

      <Button variant="ghost" onClick={onBack}>
        Quay lại
      </Button>
    </div>
  );
}

