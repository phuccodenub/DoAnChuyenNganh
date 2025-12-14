import { Link } from 'react-router-dom';
import { 
  BookOpen, Users, TrendingUp, DollarSign, Plus, Eye, Edit, 
  Star, Clock, CheckCircle, FileText, BarChart3, GraduationCap,
  AlertCircle, ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ROUTES, generateRoute } from '@/constants/routes';
import { useInstructorDashboardStats, useInstructorCourses } from '@/hooks/useInstructorCourse';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * InstructorDashboardPage
 * 
 * Dashboard chuyên nghiệp cho giảng viên với:
 * - Stats cards (real data)
 * - Recent courses list
 * - Quick actions
 * - Performance overview
 * - Vietnamese UI
 */
export function InstructorDashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useInstructorDashboardStats();
  const { data: coursesData, isLoading: coursesLoading } = useInstructorCourses({ limit: 5 });

  const courses = coursesData?.data?.data || [];

  const statusLabels: Record<string, string> = {
    published: 'Đã xuất bản',
    draft: 'Nháp',
    archived: 'Lưu trữ',
  };

  const statusColors: Record<string, 'success' | 'warning' | 'default'> = {
    published: 'success',
    draft: 'warning',
    archived: 'default',
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-600 mt-1">Chào mừng quay trở lại! Đây là tổng quan hoạt động giảng dạy của bạn.</p>
        </div>
        <Link to={ROUTES.INSTRUCTOR.COURSE_CREATE}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Tạo khóa học mới
          </Button>
        </Link>
      </div>

      {/* Stats Grid - Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Courses */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng khóa học</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_courses || 0}</p>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="text-green-600">{stats?.published_courses || 0} đã xuất bản</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-yellow-600">{stats?.draft_courses || 0} nháp</span>
                </div>
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
                <p className="text-3xl font-bold text-gray-900">{stats?.total_students || 0}</p>
                {stats?.this_month_enrollments ? (
                  <p className="text-xs text-green-600 mt-2">
                    +{stats.this_month_enrollments} tháng này
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">Trong tất cả khóa học</p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Doanh thu</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats?.total_revenue || 0)}đ
                </p>
                <p className="text-xs text-gray-500 mt-2">Tổng doanh thu</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đánh giá TB</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.avg_rating ? stats.avg_rating.toFixed(1) : '0.0'}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-gray-500">
                    ({stats?.total_reviews || 0} đánh giá)
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Lessons */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_lessons || 0}</p>
                <p className="text-sm text-gray-600">Bài học</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Sections */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_sections || 0}</p>
                <p className="text-sm text-gray-600">Chương học</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.completion_rate ? `${stats.completion_rate}%` : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Tỷ lệ hoàn thành</p>
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
                Quản lý khóa học
              </Button>
            </Link>

            <Link to={ROUTES.INSTRUCTOR.STUDENTS}>
              <Button fullWidth variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                Quản lý học viên
              </Button>
            </Link>

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
              <Button variant="ghost" size="sm" className="gap-1">
                Xem tất cả
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Thumbnail */}
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{course.title}</h3>
                        <Badge variant={statusColors[course.status] || 'default'}>
                          {statusLabels[course.status] || course.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.total_students || 0} học viên
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {course.total_lessons || 0} bài học
                        </span>
                        {(course.rating ?? 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {(course.rating ?? 0).toFixed(1)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.updated_at 
                            ? format(new Date(course.updated_at), 'dd/MM/yyyy', { locale: vi })
                            : 'N/A'
                          }
                        </span>
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
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có khóa học nào</h3>
              <p className="text-gray-500 mb-4">Bắt đầu tạo khóa học đầu tiên của bạn</p>
              <Link to={ROUTES.INSTRUCTOR.COURSE_CREATE}>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Tạo khóa học mới
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card - shown when no courses */}
      {courses.length === 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Bắt đầu với khóa học đầu tiên</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Tạo khóa học với tiêu đề hấp dẫn và mô tả chi tiết</li>
                  <li>• Thêm các chương và bài học có cấu trúc rõ ràng</li>
                  <li>• Upload video chất lượng cao và tài liệu hỗ trợ</li>
                  <li>• Thiết lập giá và xuất bản khi sẵn sàng</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default InstructorDashboardPage;
