import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { ROUTES, generateRoute } from '@/constants/routes';
import { MainLayout } from '@/layouts/MainLayout';
import { useLiveSessions } from '@/hooks/useLivestream';
import { useDebounce } from '@/hooks/useDebounce';
import type { LiveSessionsQuery } from '@/services/api/livestream.api';
import { LobbyHeader, LobbyFilters, SessionsGrid } from './components';

/**
 * LiveStreamLobbyPage
 *
 * Trang danh sách livestream theo phong cách Nimo TV
 * - Grid layout với thumbnail lớn
 * - Hiển thị viewer count, avatar host, category
 * - Màu sắc phù hợp với hệ thống (light theme, blue chủ đạo)
 */
export function LiveStreamLobbyPage() {
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

  return (
    <MainLayout>
      <div className="w-full bg-gray-50 min-h-screen">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LobbyHeader canHost={canHost} onCreateSession={() => navigate(ROUTES.INSTRUCTOR.LIVESTREAM_CREATE)} />
          <LobbyFilters
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Error state */}
          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              Không thể tải danh sách livestream.{' '}
              {error instanceof Error ? error.message : 'Vui lòng thử lại.'}
            </div>
          )}

          <SessionsGrid
            sessions={sessions}
            isLoading={isLoading}
            onSelectSession={(id) => navigate(generateRoute.livestream.session(id.toString()))}
          />

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

export default LiveStreamLobbyPage;

