import { Video } from 'lucide-react';
import type { LiveSession } from '@/services/api/livestream.api';
import { SessionCard } from './SessionCard';

interface SessionsGridProps {
  sessions: LiveSession[];
  isLoading: boolean;
  onSelectSession: (sessionId: string | number) => void;
}

export function SessionsGrid({ sessions, isLoading, onSelectSession }: SessionsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="animate-pulse bg-white rounded-xl border border-gray-200 p-4 h-64"
          >
            <div className="h-32 bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="col-span-full bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
        <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-900 font-medium text-lg mb-2">Không tìm thấy livestream nào</p>
        <p className="text-sm text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} onSelect={onSelectSession} />
      ))}
    </div>
  );
}

