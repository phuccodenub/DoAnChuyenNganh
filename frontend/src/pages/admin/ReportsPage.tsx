import React, { useState } from 'react';
import { useReportStats, useUserGrowth, useCoursePopularity, useUserActivity } from '@/hooks/admin/useReports';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  const { data: stats, isLoading: statsLoading } = useReportStats(period);
  const { data: userGrowth, isLoading: growthLoading } = useUserGrowth(30);
  const { data: topCourses, isLoading: coursesLoading } = useCoursePopularity(10);
  const { data: userActivity, isLoading: activityLoading } = useUserActivity(30);

  const isLoading = statsLoading || growthLoading || coursesLoading || activityLoading;

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('reports_analytics')}</h1>
          <p className="mt-2 text-gray-600">{t('platform_analytics_overview')}</p>
        </div>
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'year'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'primary' : 'secondary'}
              onClick={() => setPeriod(p)}
            >
              {t(`period_${p}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">{t('total_users')}</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total_users?.toLocaleString()}</div>
            <div className="text-green-600 text-sm mt-2">
              +{stats.active_users_month} {t('this_month')}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">{t('total_courses')}</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total_courses?.toLocaleString()}</div>
            <div className="text-gray-500 text-sm mt-2">{t('courses_available')}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">{t('total_enrollments')}</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total_enrollments?.toLocaleString()}</div>
            <div className="text-gray-500 text-sm mt-2">
              {((stats.completion_rate || 0) * 100).toFixed(1)}% {t('completion_rate')}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">{t('total_revenue')}</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {(stats.total_revenue || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </div>
            <div className="text-gray-500 text-sm mt-2">{t('from_paid_courses')}</div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        {userGrowth && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('user_growth')}</h2>
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
                  name={t('new_users')}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#10b981"
                  name={t('cumulative_users')}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* User Activity Chart */}
        {userActivity && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('user_activity')}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="logins" fill="#3b82f6" name={t('logins')} />
                <Bar dataKey="registrations" fill="#10b981" name={t('registrations')} />
                <Bar dataKey="course_enrollments" fill="#f59e0b" name={t('enrollments')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Courses */}
      {topCourses && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('top_courses')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('course_name')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('enrollments')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('rating')}</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('revenue')}</th>
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
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => window.print()}>
          {t('print_report')}
        </Button>
        <Button>
          {t('export_as_csv')}
        </Button>
      </div>
    </div>
  );
};

export default ReportsPage;
