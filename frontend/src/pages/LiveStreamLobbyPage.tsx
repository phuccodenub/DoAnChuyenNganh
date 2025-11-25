import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Search,
  Activity,
  Plus,
  Eye,
  Play,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { useRole } from '@/hooks/useRole';
import { ROUTES, generateRoute } from '@/constants/routes';
import { MainLayout } from '@/layouts/MainLayout';
import { useLiveSessions } from '@/hooks/useLivestream';
import { useDebounce } from '@/hooks/useDebounce';
import type { LiveSession, LiveSessionsQuery } from '@/services/api/livestream.api';

/**
 * LiveStreamLobbyPage
 *
 * Trang danh sách livestream theo phong cách Nimo TV
 * - Grid layout với thumbnail lớn
 * - Hiển thị viewer count, avatar host, category
 * - Màu sắc phù hợp với hệ thống (light theme, blue chủ đạo)
 */
export default function LiveStreamLobbyPage() {
  const navigate = useNavigate();
  const { isInstructor, isAdmin } = useRole();
  const canHost = isInstructor || isAdmin;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'live' | 'scheduled' | 'ended'>('all');

  const debouncedSearch = useDebounce(searchTerm, 400);
  const queryParams = useMemo<LiveSessionsQuery>(
    () => ({
      page: 1,
      limit: 12,
      status: selectedFilter !== 'all' ? selectedFilter : undefined,
      search: debouncedSearch || undefined,
    }),
    [selectedFilter, debouncedSearch]
  );

  const { data, isLoading, isError, error } = useLiveSessions(queryParams);
  const sessions = data?.sessions ?? [];
  const totalSessions = data?.pagination?.total ?? sessions.length;

  const formatViewerCount = (count?: number) => {
    const safeCount = count ?? 0;
    if (safeCount >= 1000) {
      return `${(safeCount / 1000).toFixed(1)}k`;
    }
    return safeCount.toString();
  };

  const getInitials = (name?: string) => {
    if (!name) return 'LV';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategory = (session: LiveSession) =>
    session.category || session.course?.category || session.platform || 'Livestream';

  const getHostName = (session: LiveSession) => {
    const fallback = session.instructor_name || 'Giảng viên';
    if (session.host) {
      const { first_name, last_name } = session.host;
      const full = [first_name, last_name].filter(Boolean).join(' ').trim();
      return full || fallback;
    }
    return fallback;
  };

  const getHostAvatar = (session: LiveSession) =>
    session.host?.avatar || session.instructor_avatar || undefined;

  const getCourseTitle = (session: LiveSession) =>
    session.course?.title || session.course_title || 'Khóa học';

  const getStartLabel = (session: LiveSession) => {
    if (session.status === 'live') return 'Đang phát';
    const time = session.scheduled_start || session.actual_start;
    if (!time) return 'Chưa xác định';
    return format(new Date(time), "dd/MM · HH:mm", { locale: vi });
  };

  const filterTabs = [
    { value: 'all' as const, label: 'Tất cả' },
    { value: 'live' as const, label: 'Đang phát' },
    { value: 'scheduled' as const, label: 'Đã lên lịch' },
    { value: 'ended' as const, label: 'Đã kết thúc' },
  ];

  return (
    <MainLayout>
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Livestream</h1>
              <p className="text-sm text-gray-600 mt-1">Xem và tham gia các phiên phát trực tiếp</p>
            </div>
            {canHost && (
              <Button
                onClick={() => navigate(ROUTES.INSTRUCTOR.LIVESTREAM_CREATE)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tạo phiên mới
              </Button>
            )}
          </div>

          {/* Filters & search */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setSelectedFilter(tab.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedFilter === tab.value
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full lg:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm livestream..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Error state */}
          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              Không thể tải danh sách livestream.{' '}
              {error instanceof Error ? error.message : 'Vui lòng thử lại.'}
            </div>
          )}

          {/* Sessions grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading &&
              Array.from({ length: 8 }).map((_, index) => (
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

            {!isLoading &&
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => navigate(generateRoute.livestream.session(session.id.toString()))}
                  className="group cursor-pointer bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 overflow-hidden">
                    {session.thumbnail_url ? (
                      <img
                        src={session.thumbnail_url}
                        alt={session.title}
                        className="w-full h-full object-cover"
                      />
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

                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded text-xs font-medium shadow">
                      {getCategory(session)}
                    </div>

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

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-gray-900 font-semibold text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {session.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm">
                        {getHostAvatar(session) ? (
                          <img
                            src={getHostAvatar(session)}
                            alt={getHostName(session)}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(getHostName(session))
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 text-xs font-medium truncate">{getHostName(session)}</p>
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
              ))}

            {!isLoading && sessions.length === 0 && (
              <div className="col-span-full bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-900 font-medium text-lg mb-2">Không tìm thấy livestream nào</p>
                <p className="text-sm text-gray-500">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            )}
          </div>

          {sessions.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Hiển thị <span className="text-gray-900 font-semibold">{sessions.length}</span> trong tổng số{' '}
                <span className="text-gray-900 font-semibold">{totalSessions}</span> livestream
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

