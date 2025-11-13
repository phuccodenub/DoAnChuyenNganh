import { Link } from 'react-router-dom';
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react';
import { StudentDashboardLayout } from '@/layouts/StudentDashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useEnrolledCourses } from '@/hooks/useCoursesData';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, generateRoute } from '@/constants/routes';

/**
 * Student Dashboard Page
 * 
 * Trang chủ dashboard cho student
 * - Stats cards (khóa học đã đăng ký, đang học, hoàn thành)
 * - Danh sách khóa học đang học
 * - Hoạt động gần đây
 */
export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useEnrolledCourses({ limit: 6 });

  const enrolledCourses = data?.data?.courses || [];

  // Calculate stats from enrolled courses
  const stats = {
    total: enrolledCourses.length,
    inProgress: enrolledCourses.filter(
      (course: any) => course.enrollment?.progress_percentage > 0 && course.enrollment?.progress_percentage < 100
    ).length,
    completed: enrolledCourses.filter(
      (course: any) => course.enrollment?.progress_percentage === 100
    ).length,
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-8">
        {/* Welcome header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng trở lại, {user?.full_name}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Tiếp tục hành trình học tập của bạn
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng khóa học</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang học</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.inProgress}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.completed}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tiến độ TB</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stats.total > 0
                      ? Math.round(
                          enrolledCourses.reduce(
                            (acc: number, course: any) => acc + (course.enrollment?.progress_percentage || 0),
                            0
                          ) / stats.total
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled courses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Khóa học của tôi</CardTitle>
              <Link
                to={ROUTES.STUDENT.MY_COURSES}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Xem tất cả →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Không thể tải danh sách khóa học</p>
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Bạn chưa đăng ký khóa học nào</p>
                <Link
                  to={ROUTES.COURSES}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Khám phá khóa học
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course: any) => (
                  <div
                    key={course.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gray-200 relative">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {course.enrollment?.progress_percentage === 100 && (
                        <Badge variant="success" className="absolute top-2 right-2">
                          Hoàn thành
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3">
                        {course.instructor?.full_name}
                      </p>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Tiến độ</span>
                          <span className="font-medium text-gray-900">
                            {course.enrollment?.progress_percentage || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${course.enrollment?.progress_percentage || 0}%`,
                            }}
                          />
                        </div>
                      </div>

                      <Link
                        to={generateRoute.student.learning(course.id)}
                        className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {course.enrollment?.progress_percentage > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}

export default DashboardPage;
