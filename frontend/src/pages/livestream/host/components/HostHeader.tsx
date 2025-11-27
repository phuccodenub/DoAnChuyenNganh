import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

type SessionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

interface HostHeaderProps {
  title: string;
  courseTitle?: string;
  status: SessionStatus;
  onBack: () => void;
}

const STATUS_BADGES: Record<SessionStatus, { label: string; className: string }> = {
  scheduled: { label: 'Sắp diễn ra', className: 'bg-blue-100 text-blue-800' },
  live: { label: '● Đang live', className: 'bg-red-100 text-red-800 animate-pulse' },
  ended: { label: 'Đã kết thúc', className: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Đã hủy', className: 'bg-yellow-100 text-yellow-800' },
};

export function HostHeader({ title, courseTitle, status, onBack }: HostHeaderProps) {
  const badge = STATUS_BADGES[status];

  return (
    <div className="mb-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách
      </Button>

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${badge.className}`}>
              {badge.label}
            </span>
          </div>
          {courseTitle && (
            <p className="text-gray-600">
              Khóa học: <span className="font-medium">{courseTitle}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

