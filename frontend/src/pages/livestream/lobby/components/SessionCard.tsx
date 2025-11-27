import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Activity, Eye, Play, Video } from 'lucide-react';
import type { LiveSession } from '@/services/api/livestream.api';

interface SessionCardProps {
  session: LiveSession;
  onSelect: (sessionId: string | number) => void;
}

const formatViewerCount = (count?: number) => {
  const safeCount = count ?? 0;
  if (safeCount >= 1000) {
    return `${(safeCount / 1000).toFixed(1)}k`;
  }
  return safeCount.toString();
};

const getHostName = (session: LiveSession) => {
  const fallback = session.instructor_name || 'Giảng viên';
  if (session.host) {
    const { first_name, last_name } = session.host;
    const full = [first_name, last_name].filter(Boolean).join(' ').trim();
    return full || fallback;
  }
  return fallback;
};

const getHostAvatar = (session: LiveSession) => session.host?.avatar || session.instructor_avatar || undefined;

const getInitials = (name?: string) => {
  if (!name) return 'LV';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getCategory = (session: LiveSession) => session.category || session.course?.category || session.platform || 'Livestream';

const getCourseTitle = (session: LiveSession) => session.course?.title || session.course_title || 'Khóa học';

const getStartLabel = (session: LiveSession) => {
  if (session.status === 'live') return 'Đang phát';
  const time = session.scheduled_start || session.actual_start;
  if (!time) return 'Chưa xác định';
  return format(new Date(time), 'dd/MM · HH:mm', { locale: vi });
};

export function SessionCard({ session, onSelect }: SessionCardProps) {
  const hostName = getHostName(session);
  const hostAvatar = getHostAvatar(session);

  return (
    <div
      onClick={() => onSelect(session.id)}
      className="group cursor-pointer bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all hover:scale-[1.02]"
    >
      <div className="relative aspect-video bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 overflow-hidden">
        {session.thumbnail_url ? (
          <img src={session.thumbnail_url} alt={session.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Video className="w-16 h-16 text-white/30" />
          </div>
        )}

        {session.status === 'live' && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}

        {session.status === 'live' && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
            <Eye className="w-3 h-3" />
            {formatViewerCount(session.viewer_count)}
          </div>
        )}

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white rounded-full p-3 shadow-xl">
            <Play className="w-6 h-6 text-blue-600 fill-current" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-gray-900 font-semibold text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {session.title}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm">
            {hostAvatar ? (
              <img src={hostAvatar} alt={hostName} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(hostName)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-700 text-xs font-medium truncate">{hostName}</p>
            <p className="text-gray-500 text-xs truncate">{getCourseTitle(session)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-xs">
          {session.status === 'live' ? (
            <>
              <Activity className="w-3 h-3 text-red-500" />
              <span className="text-red-600 font-medium">Đang phát</span>
            </>
          ) : (
            <span>{getStartLabel(session)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

