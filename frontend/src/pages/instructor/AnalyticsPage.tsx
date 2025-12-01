import React, { useState } from 'react';
import { useInstructorCourses, useCourseStats } from '@/hooks/useInstructorCourse';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, BookOpen, DollarSign, Star, Award,
  Activity, Clock, CheckCircle, AlertCircle, Calendar,
  Download, Filter, ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';

interface CoursePerformanceData {
  courseId: string;
  courseName: string;
  students: number;
  revenue: number;
  rating: number;
  completionRate: number;
  avgProgress: number;
}

export const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Fetch all instructor courses
  const { data: coursesData, isLoading: coursesLoading } = useInstructorCourses();
  const courses = coursesData?.data?.data || [];

  // Fetch stats for selected course (if not 'all')
  const { data: courseStats, isLoading: statsLoading } = useCourseStats(
    selectedCourseId !== 'all' ? selectedCourseId : courses[0]?.id || ''
  );

  const isLoading = coursesLoading || (selectedCourseId !== 'all' && statsLoading);

  // Calculate aggregate stats from all courses
  const aggregateStats = React.useMemo(() => {
    if (!courses.length) return null;

    return {
      totalStudents: courses.reduce((sum: number, c) => sum + (c.total_students || 0), 0),
      totalRevenue: courses.reduce((sum: number, c) => sum + (c.total_revenue || 0), 0),
      totalCourses: courses.length,
      avgRating: courses.reduce((sum: number, c) => sum + (c.average_rating || 0), 0) / courses.length,
      publishedCourses: courses.filter(c => c.status === 'published').length,
      totalLessons: courses.reduce((sum: number, c) => sum + (c.total_lessons || 0), 0),
    };
  }, [courses]);

  // Course performance data
  const coursePerformanceData: CoursePerformanceData[] = React.useMemo(() => {
    return courses.map((course) => ({
      courseId: course.id,
      courseName: course.title,
      students: course.total_students || 0,
      revenue: course.total_revenue || 0,
      rating: course.average_rating || 0,
      completionRate: 0, // Will be fetched from individual stats
      avgProgress: 0,
    }));
  }, [courses]);

  // Chart data - Revenue trend (mock data for now)
  const revenueTrendData = [
    { month: 'T1', revenue: 12000000 },
    { month: 'T2', revenue: 15000000 },
    { month: 'T3', revenue: 18000000 },
    { month: 'T4', revenue: 22000000 },
    { month: 'T5', revenue: 25000000 },
    { month: 'T6', revenue: 28000000 },
  ];

  // Student enrollment trend
  const enrollmentTrendData = [
    { month: 'T1', enrollments: 45 },
    { month: 'T2', enrollments: 62 },
    { month: 'T3', enrollments: 78 },
    { month: 'T4', enrollments: 95 },
    { month: 'T5', enrollments: 112 },
    { month: 'T6', enrollments: 128 },
  ];

  // Course status distribution
  const courseStatusData = [
    { name: 'Đã xuất bản', value: aggregateStats?.publishedCourses || 0, color: '#10b981' },
    { name: 'Nháp', value: courses.filter((c) => c.status === 'draft').length, color: '#f59e0b' },
    { name: 'Đã lưu trữ', value: courses.filter((c) => c.status === 'archived').length, color: '#6b7280' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!aggregateStats) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có khóa học</h2>
        <p className="text-gray-600">Tạo khóa học đầu tiên để xem phân tích</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Phân Tích & Thống Kê
            </h1>
            <p className="mt-1 text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Hiệu suất giảng dạy của bạn
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Period Selector */}
          {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'primary' : 'secondary'}
              onClick={() => setPeriod(p)}
              className={`transition-all duration-200 ${
                period === p ? 'shadow-md scale-105' : 'hover:scale-102'
              }`}
            >
              {p === 'week' && 'Tuần'}
              {p === 'month' && 'Tháng'}
              {p === 'quarter' && 'Quý'}
              {p === 'year' && 'Năm'}
            </Button>
          ))}
        </div>
      </div>

      {/* Course Filter */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Lọc theo khóa học</h2>
        </div>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        >
          <option value="all">Tất cả khóa học</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 opacity-10 rounded-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-blue-700 text-sm font-semibold uppercase tracking-wide">
              Tổng học viên
            </div>
            <div className="text-3xl font-bold text-blue-900 mt-2">
              {aggregateStats.totalStudents.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-green-700 text-sm font-medium mt-3">
              <TrendingUp className="w-4 h-4" />
              +{Math.floor(aggregateStats.totalStudents * 0.12)} tháng này
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-500 opacity-10 rounded-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-green-700 text-sm font-semibold uppercase tracking-wide">
              Tổng doanh thu
            </div>
            <div className="text-3xl font-bold text-green-900 mt-2">
              {aggregateStats.totalRevenue.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })}
            </div>
            <div className="flex items-center gap-1 text-green-700 text-sm font-medium mt-3">
              <TrendingUp className="w-4 h-4" />
              +{Math.floor(aggregateStats.totalRevenue * 0.08).toLocaleString()} VND
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-500 opacity-10 rounded-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
            <div className="text-yellow-700 text-sm font-semibold uppercase tracking-wide">
              Đánh giá TB
            </div>
            <div className="text-3xl font-bold text-yellow-900 mt-2">
              {aggregateStats.avgRating.toFixed(1)} / 5.0
            </div>
            <div className="flex items-center gap-1 text-yellow-700 text-sm font-medium mt-3">
              <Star className="w-4 h-4 fill-yellow-700" />
              Từ {courses.reduce((sum: number, c) => sum + (c.total_ratings || 0), 0)} đánh giá
            </div>
          </div>
        </div>

        {/* Total Courses */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500 opacity-10 rounded-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-purple-700 text-sm font-semibold uppercase tracking-wide">
              Khóa học
            </div>
            <div className="text-3xl font-bold text-purple-900 mt-2">
              {aggregateStats.totalCourses}
            </div>
            <div className="flex items-center gap-1 text-purple-700 text-sm font-medium mt-3">
              <CheckCircle className="w-4 h-4" />
              {aggregateStats.publishedCourses} đã xuất bản
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Xu hướng doanh thu
              </h2>
              <p className="text-sm text-gray-600 mt-1">6 tháng gần đây</p>
            </div>
            <Button variant="secondary" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Xuất
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                formatter={(value: number) =>
                  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                }
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                name="Doanh thu"
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Enrollment Trend */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Xu hướng đăng ký
              </h2>
              <p className="text-sm text-gray-600 mt-1">6 tháng gần đây</p>
            </div>
            <Button variant="secondary" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Xuất
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={enrollmentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="enrollments" fill="#3b82f6" name="Lượt đăng ký" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Status Distribution */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Phân bố trạng thái
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={courseStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {courseStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performing Courses */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Khóa học hiệu suất cao
            </h2>
            <Button variant="secondary" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Xem chi tiết
            </Button>
          </div>
          <div className="space-y-4">
            {coursePerformanceData.slice(0, 5).map((course, index) => (
              <div
                key={course.courseId}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold rounded-lg">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{course.courseName}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.students} HV
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      {course.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {course.revenue.toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats Table */}
      {selectedCourseId !== 'all' && courseStats && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Chi tiết khóa học: {courses.find((c) => c.id === selectedCourseId)?.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-2">
                <Users className="w-4 h-4" />
                Học viên hoạt động
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {courseStats.data?.total_students || 0}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-2">
                <CheckCircle className="w-4 h-4" />
                Tỷ lệ hoàn thành
              </div>
              <div className="text-2xl font-bold text-green-900">
                {((courseStats.data?.completion_rate || 0) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700 text-sm font-medium mb-2">
                <Activity className="w-4 h-4" />
                Tiến độ TB
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {(courseStats.data?.avg_progress || 0).toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 text-purple-700 text-sm font-medium mb-2">
                <AlertCircle className="w-4 h-4" />
                Chờ chấm điểm
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {courseStats.data?.pending_grading || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Xuất PDF
        </Button>
        <Button className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Xuất Excel
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsPage;
