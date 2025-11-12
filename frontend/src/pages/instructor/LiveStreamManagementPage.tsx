/**
 * LiveStreamManagementPage - Instructor
 * 
 * Trang quản lý các phiên livestream của giảng viên
 * Features:
 * - Danh sách sessions với filters (status tabs)
 * - Create new session button
 * - Actions: Edit, Start, End, Delete
 * - Real-time attendance tracking
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Video, Users, Calendar, Clock, ExternalLink, Trash2, Edit, Play, Square } from 'lucide-react';
import { useMySessions } from '@/hooks/useLivestream';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

type SessionStatus = 'all' | 'scheduled' | 'live' | 'ended' | 'cancelled';

/**
 * LiveStreamManagementPage Component
 */
export function LiveStreamManagementPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<SessionStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sessions
  const { data: sessionsResponse, isLoading } = useMySessions();

  // Extract sessions array
  const sessionsArray = sessionsResponse?.data?.sessions || [];

  // Filter sessions
  const filteredSessions = sessionsArray.filter((session: any) => {
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    const matchesSearch = !searchQuery || 
      session.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Status tabs
  const statusTabs = [
    { value: 'all' as const, label: 'Tất cả', count: sessionsArray.length },
    { value: 'scheduled' as const, label: 'Sắp diễn ra', count: sessionsArray.filter((s: any) => s.status === 'scheduled').length },
    { value: 'live' as const, label: 'Đang live', count: sessionsArray.filter((s: any) => s.status === 'live').length },
    { value: 'ended' as const, label: 'Đã kết thúc', count: sessionsArray.filter((s: any) => s.status === 'ended').length },
    { value: 'cancelled' as const, label: 'Đã hủy', count: sessionsArray.filter((s: any) => s.status === 'cancelled').length },
  ];

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: 'bg-blue-100 text-blue-800',
      live: 'bg-red-100 text-red-800 animate-pulse',
      ended: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-yellow-100 text-yellow-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const labels = {
      scheduled: 'Sắp diễn ra',
      live: 'Đang live',
      ended: 'Đã kết thúc',
      cancelled: 'Đã hủy',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Livestream</h1>
          <p className="text-gray-600 mt-2">
            Tạo và quản lý các phiên livestream cho khóa học của bạn
          </p>
        </div>
        <Button
          onClick={() => navigate('/instructor/livestream/create')}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tạo phiên mới
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        {/* Status Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`
                  px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap
                  ${statusFilter === tab.value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Đang tải...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredSessions.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'Không tìm thấy phiên nào' : 'Chưa có phiên livestream'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? 'Thử tìm kiếm với từ khóa khác'
              : 'Tạo phiên livestream đầu tiên của bạn để kết nối với học viên'
            }
          </p>
          {!searchQuery && (
            <Button onClick={() => navigate('/instructor/livestream/create')}>
              Tạo phiên mới
            </Button>
          )}
        </div>
      )}

      {/* Sessions List */}
      {!isLoading && filteredSessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session: any) => (
            <div
              key={session.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Session Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {session.title}
                  </h3>
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap
                    ${getStatusBadge(session.status)}
                  `}>
                    {getStatusLabel(session.status)}
                  </span>
                </div>

                {/* Course Badge */}
                {session.course && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mb-4">
                    <Video className="w-3 h-3" />
                    {session.course.title}
                  </div>
                )}

                {/* Session Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(session.scheduled_at), 'dd MMM yyyy', { locale: vi })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {format(new Date(session.scheduled_at), 'HH:mm', { locale: vi })} • {session.duration_minutes} phút
                  </div>
                  {session.status === 'ended' && session.attendance_count !== undefined && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {session.attendance_count} người tham gia
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                {/* Primary Action */}
                {session.status === 'scheduled' && (
                  <Button
                    size="sm"
                    onClick={() => navigate(`/instructor/livestream/${session.id}`)}
                    className="flex items-center gap-1"
                  >
                    <Play className="w-4 h-4" />
                    Bắt đầu
                  </Button>
                )}
                {session.status === 'live' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => navigate(`/instructor/livestream/${session.id}`)}
                    className="flex items-center gap-1"
                  >
                    <Square className="w-4 h-4" />
                    Kết thúc
                  </Button>
                )}
                {session.status === 'ended' && session.recording_url && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(session.recording_url, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ghi hình
                  </Button>
                )}
                {(session.status === 'ended' || session.status === 'cancelled') && !session.recording_url && (
                  <span className="text-sm text-gray-500">Không có hành động</span>
                )}

                {/* Secondary Actions */}
                <div className="flex items-center gap-2">
                  {session.status === 'scheduled' && (
                    <button
                      onClick={() => navigate(`/instructor/livestream/${session.id}/edit`)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {(session.status === 'scheduled' || session.status === 'cancelled') && (
                    <button
                      onClick={() => {
                        if (confirm('Bạn có chắc muốn xóa phiên này?')) {
                          // TODO: Delete session
                        }
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LiveStreamManagementPage;
