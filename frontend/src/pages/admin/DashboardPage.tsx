import { Users, BookOpen, GraduationCap, DollarSign, TrendingUp, Clock, UserPlus, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { useAdminDashboardStats, useRecentActivities } from '@/hooks/useAdminUsers';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * AdminDashboardPage Component
 * 
 * Overview dashboard for admin with:
 * - System statistics cards
 * - Charts (simplified with text for now - can add recharts later)
 * - Recent activities timeline
 * - Quick actions
 */
export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities(10);
  const navigate = useNavigate();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-600 mt-1">Thống kê và hoạt động gần đây</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng người dùng</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total_users || 0}</p>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <span className="text-gray-600">Học viên: {stats?.users_by_role.student || 0}</span>
                <span className="text-gray-600">GV: {stats?.users_by_role.instructor || 0}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng khóa học</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total_courses || 0}</p>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <span className="text-green-600">Đã xuất bản: {stats?.courses_published || 0}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Enrollments */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng ghi danh</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total_enrollments || 0}</p>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <span className="text-blue-600">Đang học: {stats?.active_enrollments || 0}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Revenue this month */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Doanh thu tháng này</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.revenue_this_month ? `${(stats.revenue_this_month / 1000000).toFixed(1)}M` : '0'}đ
              </p>
              <div className="flex items-center gap-1 mt-3 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>+12.5%</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Status Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái người dùng</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Hoạt động</span>
                <span className="font-medium text-gray-900">{stats?.users_by_status.active || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${((stats?.users_by_status.active || 0) / (stats?.users_by_status.total || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Tạm ngưng</span>
                <span className="font-medium text-gray-900">{stats?.users_by_status.suspended || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${((stats?.users_by_status.suspended || 0) / (stats?.users_by_status.total || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Course Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái khóa học</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Đã xuất bản</span>
                <span className="font-medium text-gray-900">{stats?.courses_published || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${((stats?.courses_published || 0) / (stats?.total_courses || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Bản nháp</span>
                <span className="font-medium text-gray-900">{stats?.courses_draft || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{
                    width: `${((stats?.courses_draft || 0) / (stats?.total_courses || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate(ROUTES.ADMIN.USERS)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users className="w-5 h-5 text-blue-600" />
              <span>Xem tất cả người dùng</span>
            </button>
            <button
              onClick={() => navigate(ROUTES.ADMIN.COURSES)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-green-600" />
              <span>Xem tất cả khóa học</span>
            </button>
            <button
              onClick={() => navigate(ROUTES.ADMIN.REPORTS)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FileText className="w-5 h-5 text-purple-600" />
              <span>Xem báo cáo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
        {activitiesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {activity.user_avatar ? (
                    <img src={activity.user_avatar} alt={activity.user_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {activity.user_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user_name}</span> {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có hoạt động nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
