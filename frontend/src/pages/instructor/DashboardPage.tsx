import { Link } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, DollarSign, Plus, Eye, Edit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ROUTES, generateRoute } from '@/constants/routes';

/**
 * InstructorDashboardPage
 * 
 * Dashboard cho giảng viên với:
 * - Stats cards
 * - Recent courses
 * - Quick actions
 * - Vietnamese UI
 */
export function InstructorDashboardPage() {
  // TODO: Replace with real data from API
  const stats = {
    totalCourses: 12,
    totalStudents: 456,
    activeCourses: 8,
    monthlyRevenue: 15000000,
  };

  const recentCourses = [
    {
      id: '1',
      title: 'Lập trình Web với React',
      status: 'published',
      students: 89,
      lessons: 24,
      updated_at: '2024-01-10',
    },
    {
      id: '2',
      title: 'JavaScript nâng cao',
      status: 'draft',
      students: 0,
      lessons: 15,
      updated_at: '2024-01-09',
    },
    {
      id: '3',
      title: 'TypeScript từ cơ bản đến nâng cao',
      status: 'published',
      students: 124,
      lessons: 32,
      updated_at: '2024-01-08',
    },
  ];

  const statusLabels = {
    published: 'Đã xuất bản',
    draft: 'Nháp',
    private: 'Riêng tư',
  };

  const statusColors = {
    published: 'success',
    draft: 'warning',
    private: 'default',
  } as const;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-600 mt-1">Chào mừng quay trở lại! Đây là tổng quan khóa học của bạn.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Courses */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng khóa học</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Students */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng học viên</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Courses */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đang hoạt động</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeCourses}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Doanh thu tháng</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(stats.monthlyRevenue / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hành động nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to={ROUTES.INSTRUCTOR.COURSE_CREATE}>
              <Button fullWidth className="gap-2">
                <Plus className="w-4 h-4" />
                Tạo khóa học mới
              </Button>
            </Link>

            <Link to={ROUTES.INSTRUCTOR.MY_COURSES}>
              <Button fullWidth variant="outline" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Xem tất cả khóa học
              </Button>
            </Link>

            <Button fullWidth variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              Quản lý học viên
            </Button>

            <Link to={ROUTES.INSTRUCTOR.ANALYTICS}>
              <Button fullWidth variant="outline" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Xem báo cáo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Courses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Khóa học gần đây</CardTitle>
            <Link to={ROUTES.INSTRUCTOR.MY_COURSES}>
              <Button variant="ghost" size="sm">
                Xem tất cả
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{course.title}</h3>
                      <Badge variant={statusColors[course.status as keyof typeof statusColors]}>
                        {statusLabels[course.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.students} học viên
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.lessons} bài học
                      </span>
                      <span>Cập nhật: {new Date(course.updated_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={generateRoute.courseDetail(course.id)}>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Xem
                    </Button>
                  </Link>
                  
                  <Link to={generateRoute.instructor.courseEdit(course.id)}>
                    <Button size="sm" className="gap-2">
                      <Edit className="w-4 h-4" />
                      Chỉnh sửa
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <strong>Nguyễn Văn A</strong> đã đăng ký khóa học <strong>Lập trình Web với React</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1">2 giờ trước</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <strong>Trần Thị B</strong> đã hoàn thành bài tập <strong>Thực hành React Hooks</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1">5 giờ trước</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Có <strong>3 bài tập</strong> cần chấm điểm trong khóa <strong>JavaScript nâng cao</strong>
                </p>
                <p className="text-xs text-gray-500 mt-1">1 ngày trước</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InstructorDashboardPage;
