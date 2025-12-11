import { 
  Users, 
  DollarSign, 
  Star, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  FileText,
  Loader2,
  Globe,
  EyeOff,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUpdateCourse } from '@/hooks/useInstructorCourse';
import toast from 'react-hot-toast';
import type { InstructorCourse, CourseStats } from '@/services/api/instructor.api';
import { useState } from 'react';
import { useCourseAnalytics, useEnrollmentTrends, useEngagementMetrics } from '@/hooks/useAnalytics';
import { EnrollmentTrendsChart, RatingDistributionChart } from '@/components/domain/course/analytics';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { AlertTriangle, BookOpen, Award } from 'lucide-react';

interface DashboardTabProps {
  courseId: string;
  course: InstructorCourse;
  stats?: CourseStats;
  isLoading: boolean;
}

/**
 * CourseDashboardTab
 * 
 * Tab Dashboard hiển thị thống kê tổng quát của khóa học:
 * - Tổng số học viên
 * - Doanh thu
 * - Đánh giá trung bình
 * - Tỷ lệ hoàn thành
 * - Tiến độ trung bình
 * - Điểm trung bình
 * - Bài tập chờ chấm
 * - Học viên mới tuần này
 */
export function CourseDashboardTab({ course, stats, isLoading, courseId }: DashboardTabProps) {
  const updateCourseMutation = useUpdateCourse();
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [analyticsDays, setAnalyticsDays] = useState<number>(30);

  // Fetch analytics data
  const { data: analytics, isLoading: isAnalyticsLoading, error: analyticsError } = useCourseAnalytics(courseId, analyticsPeriod, analyticsDays);
  const { data: enrollmentTrends } = useEnrollmentTrends(courseId, analyticsPeriod, analyticsDays);
  const { data: engagement } = useEngagementMetrics(courseId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const handlePublish = async () => {
    try {
      await updateCourseMutation.mutateAsync({
        courseId,
        data: { status: 'published' },
      });
      toast.success('Khóa học đã được xuất bản');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể xuất bản khóa học');
    }
  };

  const handleUnpublish = async () => {
    try {
      await updateCourseMutation.mutateAsync({
        courseId,
        data: { status: 'draft' },
      });
      toast.success('Khóa học đã được chuyển về trạng thái nháp');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể chuyển trạng thái khóa học');
    }
  };

  const handleArchive = async () => {
    if (!confirm('Bạn có chắc chắn muốn lưu trữ khóa học này? Khóa học sẽ không còn hiển thị công khai.')) {
      return;
    }
    try {
      await updateCourseMutation.mutateAsync({
        courseId,
        data: { status: 'archived' },
      });
      toast.success('Khóa học đã được lưu trữ');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể lưu trữ khóa học');
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Đang tải thống kê...</span>
      </div>
    );
  }

  const statsData = stats || {
    total_students: 0,
    total_revenue: 0,
    average_rating: 0,
    total_reviews: 0,
    completion_rate: 0,
    avg_progress: 0,
    avg_score: 0,
    pending_grading: 0,
    max_students: 0,
    new_students_this_week: 0,
  };

  const statCards = [
    {
      title: 'Tổng học viên',
      value: formatNumber(statsData.total_students),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: statsData.new_students_this_week > 0 ? `+${statsData.new_students_this_week} tuần này` : undefined,
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(statsData.total_revenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Đánh giá trung bình',
      value: statsData.average_rating > 0 ? statsData.average_rating.toFixed(1) : '(Trống)',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      subtitle: `${formatNumber(statsData.total_reviews)} đánh giá`,
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: `${statsData.completion_rate}%`,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Tiến độ trung bình',
      value: `${Math.round(statsData.avg_progress)}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Điểm trung bình',
      value: statsData.avg_score > 0 ? statsData.avg_score.toFixed(1) : '(Trống)',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Bài tập chờ chấm',
      value: formatNumber(statsData.pending_grading),
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Học viên mới',
      value: formatNumber(statsData.new_students_this_week),
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      subtitle: 'Tuần này',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tổng quan khóa học</h2>
          <p className="text-gray-600 mt-1">Thống kê và hiệu suất của khóa học "{course.title}"</p>
        </div>
        <div className={`px-4 py-2 rounded-lg ${
          course.status === 'published' ? 'bg-green-50 text-green-700' : 
          course.status === 'draft' ? 'bg-yellow-50 text-yellow-700' : 
          'bg-gray-50 text-gray-700'
        }`}>
          <span className="text-sm font-medium">
            {course.status === 'published' ? 'Đã xuất bản' : 
             course.status === 'draft' ? 'Nháp' : 
             'Lưu trữ'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.change && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    {stat.change}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Info & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khóa học</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Giá:</span>
              <span className="text-sm font-medium text-gray-900">
                {course.is_free ? 'Miễn phí' : formatCurrency(course.price || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Số bài học:</span>
              <span className="text-sm font-medium text-gray-900">
                {course.total_lessons || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cập nhật lần cuối:</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(course.updated_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Xem khóa học công khai
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Chia sẻ khóa học
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              Xuất báo cáo
            </button>
          </div>
        </div>

        {/* Status Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý trạng thái</h3>
          <div className="space-y-2">
            {course.status === 'draft' ? (
              <Button
                onClick={handlePublish}
                disabled={updateCourseMutation.isPending}
                className="w-full"
                variant="primary"
              >
                <Globe className="w-4 h-4 mr-2" />
                {updateCourseMutation.isPending ? 'Đang xuất bản...' : 'Xuất bản khóa học'}
              </Button>
            ) : course.status === 'published' ? (
              <>
                <Button
                  onClick={handleUnpublish}
                  disabled={updateCourseMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  {updateCourseMutation.isPending ? 'Đang chuyển...' : 'Chuyển về nháp'}
                </Button>
                <Button
                  onClick={handleArchive}
                  disabled={updateCourseMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Lưu trữ
                </Button>
              </>
            ) : (
              <Button
                onClick={handlePublish}
                disabled={updateCourseMutation.isPending}
                className="w-full"
                variant="primary"
              >
                <Globe className="w-4 h-4 mr-2" />
                {updateCourseMutation.isPending ? 'Đang khôi phục...' : 'Khôi phục khóa học'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Phân tích chi tiết</h2>
          <p className="text-gray-600 mt-1">Dữ liệu phân tích và xu hướng của khóa học</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <label className="text-sm font-medium text-gray-700">Khoảng thời gian:</label>
          <select
            value={analyticsPeriod}
            onChange={(e) => setAnalyticsPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="daily">Theo ngày</option>
            <option value="weekly">Theo tuần</option>
            <option value="monthly">Theo tháng</option>
          </select>
          <label className="text-sm font-medium text-gray-700 ml-4">Số ngày:</label>
          <select
            value={analyticsDays}
            onChange={(e) => setAnalyticsDays(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">7 ngày</option>
            <option value="30">30 ngày</option>
            <option value="90">90 ngày</option>
            <option value="365">1 năm</option>
          </select>
        </div>

        {/* Analytics Loading/Error */}
        {isAnalyticsLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" />
            <span className="ml-3 text-gray-600">Đang tải dữ liệu phân tích...</span>
          </div>
        )}

        {analyticsError && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Không thể tải dữ liệu phân tích. Vui lòng thử lại sau.</p>
          </div>
        )}

        {/* Analytics Content */}
        {!isAnalyticsLoading && !analyticsError && analytics && (
          <>
            {/* Enrollment Trends Chart */}
            {enrollmentTrends && enrollmentTrends.length > 0 && (
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng đăng ký</h3>
                <EnrollmentTrendsChart data={enrollmentTrends} period={analyticsPeriod} />
              </Card>
            )}


            {/* Rating Distribution */}
            {analytics.ratingAnalytics && analytics.ratingAnalytics.totalReviews > 0 && (
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích đánh giá</h3>
                <RatingDistributionChart data={analytics.ratingAnalytics} />
              </Card>
            )}

            {/* Completion Time & Dropout Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {analytics.completionTime && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Thời gian hoàn thành
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trung bình:</span>
                      <span className="font-semibold">{analytics.completionTime.averageDays} ngày</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trung vị:</span>
                      <span className="font-semibold">{analytics.completionTime.medianDays} ngày</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nhanh nhất:</span>
                      <span className="font-semibold">{analytics.completionTime.minDays} ngày</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lâu nhất:</span>
                      <span className="font-semibold">{analytics.completionTime.maxDays} ngày</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <span className="text-sm text-gray-500">
                        Tổng số học viên đã hoàn thành: {analytics.completionTime.totalCompleted}
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {analytics.dropoutRate && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Tỷ lệ bỏ học & Duy trì
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tỷ lệ bỏ học:</span>
                      <span className="font-semibold text-red-600">{analytics.dropoutRate.dropoutRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tỷ lệ duy trì:</span>
                      <span className="font-semibold text-green-600">{analytics.dropoutRate.retentionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Học viên không hoạt động:</span>
                      <span className="font-semibold text-orange-600">{analytics.dropoutRate.inactiveStudents}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Đang học:</span>
                        <span className="font-medium">{analytics.dropoutRate.activeEnrollments}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Đã hoàn thành:</span>
                        <span className="font-medium">{analytics.dropoutRate.completedEnrollments}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Đã hủy:</span>
                        <span className="font-medium">{analytics.dropoutRate.cancelledEnrollments}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Performance Metrics */}
            {analytics.performanceMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Hiệu suất Quiz
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Điểm trung bình:</span>
                      <span className="font-semibold">{analytics.performanceMetrics.quiz.avgScore.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Điểm cao nhất:</span>
                      <span className="font-semibold">{analytics.performanceMetrics.quiz.maxScore.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Điểm thấp nhất:</span>
                      <span className="font-semibold">{analytics.performanceMetrics.quiz.minScore.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tỷ lệ đạt:</span>
                      <span className="font-semibold">{analytics.performanceMetrics.quiz.passRate}%</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <span className="text-sm text-gray-500">
                        Tổng số lần làm: {analytics.performanceMetrics.quiz.totalAttempts} | 
                        Đã đạt: {analytics.performanceMetrics.quiz.passedCount}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Hiệu suất Assignment
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Điểm trung bình:</span>
                      <span className="font-semibold">{analytics.performanceMetrics.assignment.avgScore.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Điểm cao nhất:</span>
                      <span className="font-semibold">{analytics.performanceMetrics.assignment.maxScore.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Điểm thấp nhất:</span>
                      <span className="font-semibold">{analytics.performanceMetrics.assignment.minScore.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tỷ lệ chấm điểm:</span>
                      <span className="font-semibold">{analytics.performanceMetrics.assignment.gradingRate}%</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <span className="text-sm text-gray-500">
                        Tổng số bài nộp: {analytics.performanceMetrics.assignment.totalSubmissions} | 
                        Đã chấm: {analytics.performanceMetrics.assignment.gradedCount}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Most Engaged Content */}
            {analytics.engagedContent && (analytics.engagedContent.topLessons.length > 0 || analytics.engagedContent.topSections.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.engagedContent.topLessons.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài học được tương tác nhiều nhất</h3>
                    <div className="space-y-3">
                      {analytics.engagedContent.topLessons.slice(0, 5).map((lesson, index) => (
                        <div key={lesson.lessonId} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                              <span className="text-sm font-semibold text-gray-900">{lesson.lessonTitle}</span>
                            </div>
                            <p className="text-xs text-gray-500">{lesson.sectionTitle}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{lesson.completionCount}</p>
                            <p className="text-xs text-gray-500">lần hoàn thành</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {analytics.engagedContent.topSections.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Phần được tương tác nhiều nhất</h3>
                    <div className="space-y-3">
                      {analytics.engagedContent.topSections.slice(0, 5).map((section, index) => (
                        <div key={section.sectionId} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                              <span className="text-sm font-semibold text-gray-900">{section.sectionTitle}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Hoàn thành trung bình: {section.avgCompletion.toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{section.totalProgress}</p>
                            <p className="text-xs text-gray-500">tiến độ</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

