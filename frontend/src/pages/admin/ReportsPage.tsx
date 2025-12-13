import React, { useState } from 'react';
import { useReportStats, useUserGrowth, useCoursePopularity, useUserActivity } from '@/hooks/admin/useReports';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Users, BookOpen, Award, DollarSign, TrendingUp, Download, Printer, 
  Calendar, Activity, Star, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  const { data: stats, isLoading: statsLoading } = useReportStats(period);
  const { data: userGrowth, isLoading: growthLoading } = useUserGrowth(30);
  const { data: topCourses, isLoading: coursesLoading } = useCoursePopularity(10);
  const { data: userActivity, isLoading: activityLoading } = useUserActivity(30);

  const isLoading = statsLoading || growthLoading || coursesLoading || activityLoading;

  const handleExportCsv = async () => {
    try {
      const { reportsApi } = await import('@/services/api/reports.api');
      const blob = await reportsApi.exportReport('admin_reports', 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-reports-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // Keep UX minimal: no extra toast here
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {t('admin.reports.reports_analytics')}
            </h1>
            <p className="mt-1 text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('admin.reports.platform_analytics_overview')}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['today', 'week', 'month', 'year'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'primary' : 'secondary'}
              onClick={() => setPeriod(p)}
              className={`transition-all duration-200 ${
                period === p ? 'shadow-md scale-105' : 'hover:scale-102'
              }`}
            >
              {t(`period.period_${p}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 opacity-10 rounded-full" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-blue-700 text-sm font-semibold uppercase tracking-wide">{t('admin.reports.total_users')}</div>
              <div className="text-3xl font-bold text-blue-900 mt-2">{stats.total_users?.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-green-700 text-sm font-medium mt-3">
                <TrendingUp className="w-4 h-4" />
                +{stats.active_users_month} {t('admin.reports.this_month')}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500 opacity-10 rounded-full" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-purple-700 text-sm font-semibold uppercase tracking-wide">{t('admin.reports.total_courses')}</div>
              <div className="text-3xl font-bold text-purple-900 mt-2">{stats.total_courses?.toLocaleString()}</div>
              <div className="text-purple-600 text-sm font-medium mt-3">{t('admin.reports.courses_available')}</div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-500 opacity-10 rounded-full" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-orange-700 text-sm font-semibold uppercase tracking-wide">{t('admin.reports.total_enrollments')}</div>
              <div className="text-3xl font-bold text-orange-900 mt-2">{stats.total_enrollments?.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-orange-600 text-sm font-medium mt-3">
                <Star className="w-4 h-4 fill-orange-600" />
                {((stats.completion_rate || 0) * 100).toFixed(1)}% {t('admin.reports.completion_rate')}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-500 opacity-10 rounded-full" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-700" />
              </div>
              <div className="text-green-700 text-sm font-semibold uppercase tracking-wide">{t('admin.reports.total_revenue')}</div>
              <div className="text-3xl font-bold text-green-900 mt-2">
                {(stats.total_revenue || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </div>
              <div className="text-green-600 text-sm font-medium mt-3">{t('admin.reports.from_paid_courses')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        {userGrowth && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.reports.user_growth')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  name={t('admin.reports.new_users')}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#10b981"
                  name={t('admin.reports.cumulative_users')}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* User Activity Chart */}
        {userActivity && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.reports.user_activity')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="logins" fill="#3b82f6" name={t('admin.reports.logins')} />
                <Bar dataKey="registrations" fill="#10b981" name={t('admin.reports.registrations')} />
                <Bar dataKey="course_enrollments" fill="#f59e0b" name={t('admin.reports.enrollments')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Courses */}
      {topCourses && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.reports.top_courses')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('admin.reports.course_name')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('admin.reports.enrollments')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('admin.reports.rating')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('admin.reports.revenue')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topCourses.map((course, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{course.course_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.enrollments.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center gap-1">
                        ⭐ {course.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {course.revenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-end gap-3">
        <Button 
          variant="secondary" 
          onClick={() => window.print()}
          className="flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          {t('admin.reports.print_report')}
        </Button>
        <Button className="flex items-center gap-2" onClick={handleExportCsv}>
          <Download className="w-4 h-4" />
          {t('admin.reports.export_as_csv')}
        </Button>
      </div>
    </div>
  );
};

export default ReportsPage;
