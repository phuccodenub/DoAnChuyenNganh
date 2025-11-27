import { format, differenceInMinutes } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { LiveSession } from '@/services/api/livestream.api';

interface SessionInfoCardProps {
  session: LiveSession;
  elapsedMinutes: number;
  formatDuration: (minutes: number) => string;
}

export function SessionInfoCard({ session, elapsedMinutes, formatDuration }: SessionInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin phiên</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Lịch trình</p>
          <p className="font-medium text-gray-900">
            {session.scheduled_start
              ? format(new Date(session.scheduled_start), 'dd MMM yyyy, HH:mm', { locale: vi })
              : 'Chưa xác định'}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Thời lượng dự kiến</p>
          <p className="font-medium text-gray-900">{session.duration_minutes} phút</p>
        </div>

        {session.status === 'live' && session.actual_start && (
          <>
            <div>
              <p className="text-sm text-gray-600 mb-1">Bắt đầu lúc</p>
              <p className="font-medium text-gray-900">
                {format(new Date(session.actual_start), 'HH:mm', { locale: vi })}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Đã diễn ra</p>
              <p className="text-sm font-medium text-red-600">{formatDuration(elapsedMinutes)}</p>
            </div>
          </>
        )}

        {session.status === 'ended' && session.actual_end && session.actual_start && (
          <>
            <div>
              <p className="text-sm text-gray-600 mb-1">Thời gian thực tế</p>
              <p className="font-medium text-gray-900">
                {formatDuration(
                  differenceInMinutes(new Date(session.actual_end), new Date(session.actual_start)),
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng người xem</p>
              <p className="font-medium text-gray-900">{session.viewer_count || 0} người</p>
            </div>
          </>
        )}
      </div>

      {session.description && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Mô tả</p>
          <p className="text-gray-900">{session.description}</p>
        </div>
      )}
    </div>
  );
}

