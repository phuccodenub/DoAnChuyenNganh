/**
 * LiveStreamHostPage - Instructor
 * 
 * Trang host livestream session
 * Features:
 * - Start/End session controls
 * - Real-time attendance tracking
 * - Meeting info display
 * - Session status management
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Square, Users, Clock, ExternalLink, 
  Copy, CheckCircle, Video 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSession, useSessionViewers, useUpdateSession } from '@/hooks/useLivestream';
import { format, differenceInMinutes } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * LiveStreamHostPage Component
 */
export function LiveStreamHostPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Fetch session data
  const sessionIdNum = sessionId ? parseInt(sessionId, 10) : 0;
  const { data: session, isLoading } = useSession(sessionIdNum);
  const { data: viewersData } = useSessionViewers(sessionIdNum);
  const viewers = (viewersData?.viewers || []) as any[];
  const updateSession = useUpdateSession();

  // Timer for live session
  useEffect(() => {
    if (session?.status === 'live' && session?.started_at) {
      const interval = setInterval(() => {
        const elapsed = differenceInMinutes(new Date(), new Date(session.started_at!));
        setElapsedMinutes(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Start session
  const handleStart = async () => {
    if (!sessionIdNum) return;
    
    try {
      await updateSession.mutateAsync({
        id: sessionIdNum,
        data: {
          status: 'live',
        } as any,
      });
      alert('Đã bắt đầu livestream!');
    } catch (error) {
      console.error('Start session error:', error);
      alert('Có lỗi khi bắt đầu livestream');
    }
  };

  // End session
  const handleEnd = async () => {
    if (!sessionIdNum || !confirm('Bạn có chắc muốn kết thúc livestream?')) return;

    try {
      await updateSession.mutateAsync({
        id: sessionIdNum,
        data: {
          status: 'ended',
        } as any,
      });
      alert('Đã kết thúc livestream!');
      navigate('/instructor/livestream');
    } catch (error) {
      console.error('End session error:', error);
      alert('Có lỗi khi kết thúc livestream');
    }
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} phút`;
  };

  // Get status badge
  const getStatusBadge = () => {
    if (!session) return null;

    const badges = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Sắp diễn ra' },
      live: { color: 'bg-red-100 text-red-800 animate-pulse', label: '● Đang live' },
      ended: { color: 'bg-gray-100 text-gray-800', label: 'Đã kết thúc' },
      cancelled: { color: 'bg-yellow-100 text-yellow-800', label: 'Đã hủy' },
    };

    const badge = badges[session.status as keyof typeof badges];
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy phiên livestream
          </h3>
          <Button onClick={() => navigate('/instructor/livestream')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/instructor/livestream')}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
              {getStatusBadge()}
            </div>
            {session.course && (
              <p className="text-gray-600">
                Khóa học: <span className="font-medium">{session.course.title}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin phiên</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Lịch trình</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(session.scheduled_at), 'dd MMM yyyy, HH:mm', { locale: vi })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Thời lượng dự kiến</p>
                <p className="font-medium text-gray-900">
                  {session.duration_minutes} phút
                </p>
              </div>

              {session.status === 'live' && session.started_at && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bắt đầu lúc</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(session.started_at), 'HH:mm', { locale: vi })}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Đã diễn ra</p>
                    <p className="font-medium text-red-600">
                      {formatDuration(elapsedMinutes)}
                    </p>
                  </div>
                </>
              )}

              {session.status === 'ended' && session.ended_at && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Thời gian thực tế</p>
                    <p className="font-medium text-gray-900">
                      {formatDuration(differenceInMinutes(
                        new Date(session.ended_at),
                        new Date(session.started_at!)
                      ))}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tổng người xem</p>
                    <p className="font-medium text-gray-900">
                      {viewers.length || 0} người
                    </p>
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

          {/* Controls */}
          {session && session.status !== 'cancelled' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Điều khiển</h2>

              <div className="flex items-center gap-4">
                {session.status === 'scheduled' && (
                  <Button
                    onClick={handleStart}
                    disabled={updateSession.isPending}
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <Play className="w-5 h-5" />
                    Bắt đầu livestream
                  </Button>
                )}

                {session.status === 'live' && (
                  <Button
                    onClick={handleEnd}
                    disabled={updateSession.isPending}
                    variant="danger"
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <Square className="w-5 h-5" />
                    Kết thúc livestream
                  </Button>
                )}

                {session.status === 'ended' && session.recording_url && (
                  <Button
                    onClick={() => window.open(session.recording_url!, '_blank')}
                    variant="secondary"
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Xem ghi hình
                  </Button>
                )}
              </div>

              {session.status === 'scheduled' && (
                <p className="text-sm text-gray-600 mt-4">
                  💡 Nhấn "Bắt đầu livestream" khi bạn đã sẵn sàng
                </p>
              )}
            </div>
          )}

          {/* Meeting Info */}
          {session && (session.meeting_url || session.meeting_id) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin họp</h2>

              <div className="space-y-3">
                {session.meeting_url && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Link họp</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={session.meeting_url}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(session.meeting_url!)}
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {session.meeting_id && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Meeting ID</p>
                    <p className="font-mono text-gray-900">{session.meeting_id}</p>
                  </div>
                )}

                {session.meeting_password && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mật khẩu</p>
                    <p className="font-mono text-gray-900">{session.meeting_password}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Real-time Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Thống kê
            </h2>

            <div className="space-y-4">
              {session.status === 'live' && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đang xem</p>
                  <p className="text-3xl font-bold text-red-600">
                    {viewers.filter((v: any) => !v.left_at).length || 0}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng đã tham gia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {viewers.length || 0}
                </p>
              </div>

              {session.status === 'ended' && viewers.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Thời gian xem trung bình</p>
                  <p className="text-lg font-medium text-gray-900">
                    {Math.round(
                      viewers.reduce((sum: number, v: any) => 
                        sum + (v.duration_minutes || 0), 0
                      ) / viewers.length
                    )} phút
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Viewer List */}
          {viewers.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Danh sách {session.status === 'live' ? 'đang xem' : 'đã xem'}
              </h2>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {viewers
                  .filter((v: any) => session.status === 'live' ? !v.left_at : true)
                  .map((viewer: any) => (
                    <div
                      key={viewer.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {viewer.user?.full_name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {viewer.user?.full_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(viewer.joined_at), 'HH:mm', { locale: vi })}
                          {viewer.duration_minutes && ` • ${viewer.duration_minutes}m`}
                        </p>
                      </div>
                      {!viewer.left_at && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveStreamHostPage;
