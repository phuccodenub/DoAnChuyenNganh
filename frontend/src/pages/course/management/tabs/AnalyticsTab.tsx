import { useState } from 'react';
import { Loader2, TrendingUp, Users, Clock, AlertTriangle, Star, BookOpen, Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useCourseAnalytics, useEnrollmentTrends, useStudentDemographics, useEngagementMetrics } from '@/hooks/useAnalytics';
import { EnrollmentTrendsChart, DemographicsChart, RatingDistributionChart } from '@/components/domain/course/analytics';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface AnalyticsTabProps {
  courseId: string;
}

export function AnalyticsTab({ courseId }: AnalyticsTabProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [days, setDays] = useState<number>(30);

  // Fetch all analytics data
  const { data: analytics, isLoading, error } = useCourseAnalytics(courseId, period, days);
  const { data: enrollmentTrends } = useEnrollmentTrends(courseId, period, days);
  const { data: demographics } = useStudentDemographics(courseId);
  const { data: engagement } = useEngagementMetrics(courseId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Đang tải dữ liệu phân tích...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Không thể tải dữ liệu phân tích. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không có dữ liệu phân tích.</p>
      </div>
    );
  }

  const { dropoutRate, completionTime, ratingAnalytics, performanceMetrics, engagedContent } = analytics;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <label className="text-sm font-medium text-gray-700">Khoảng thời gian:</label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="daily">Theo ngày</option>
          <option value="weekly">Theo tuần</option>
          <option value="monthly">Theo tháng</option>
        </select>
        <label className="text-sm font-medium text-gray-700 ml-4">Số ngày:</label>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7">7 ngày</option>
          <option value="30">30 ngày</option>
          <option value="90">90 ngày</option>
          <option value="365">1 năm</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enrollments */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng đăng ký</p>
              <p className="text-2xl font-bold text-gray-900">{dropoutRate.totalEnrollments}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500" />
          </div>
        </Card>

        {/* Active Students */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Học viên đang học</p>
              <p className="text-2xl font-bold text-gray-900">{dropoutRate.activeEnrollments}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </Card>

        {/* Completion Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tỷ lệ hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">
                {dropoutRate.totalEnrollments > 0
                  ? ((dropoutRate.completedEnrollments / dropoutRate.totalEnrollments) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <Award className="w-10 h-10 text-purple-500" />
          </div>
        </Card>

        {/* Average Rating */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Đánh giá trung bình</p>
              <p className="text-2xl font-bold text-gray-900">{ratingAnalytics.averageRating.toFixed(1)}</p>
            </div>
            <Star className="w-10 h-10 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Enrollment Trends Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng đăng ký</h3>
        {enrollmentTrends && enrollmentTrends.length > 0 ? (
          <EnrollmentTrendsChart data={enrollmentTrends} period={period} />
        ) : (
          <div className="text-center py-8 text-gray-500">Chưa có dữ liệu đăng ký</div>
        )}
      </Card>

      {/* Demographics */}
      {demographics && demographics.total > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nhân khẩu học học viên</h3>
          <DemographicsChart data={demographics} />
        </Card>
      )}

      {/* Rating Distribution */}
      {ratingAnalytics.totalReviews > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích đánh giá</h3>
          <RatingDistributionChart data={ratingAnalytics} />
        </Card>
      )}

      {/* Completion Time & Dropout Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completion Time */}
        {completionTime && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Thời gian hoàn thành
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Trung bình:</span>
                <span className="font-semibold">{completionTime.averageDays} ngày</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trung vị:</span>
                <span className="font-semibold">{completionTime.medianDays} ngày</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nhanh nhất:</span>
                <span className="font-semibold">{completionTime.minDays} ngày</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lâu nhất:</span>
                <span className="font-semibold">{completionTime.maxDays} ngày</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  Tổng số học viên đã hoàn thành: {completionTime.totalCompleted}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Dropout & Retention */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Tỷ lệ bỏ học & Duy trì
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Tỷ lệ bỏ học:</span>
              <span className="font-semibold text-red-600">{dropoutRate.dropoutRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tỷ lệ duy trì:</span>
              <span className="font-semibold text-green-600">{dropoutRate.retentionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Học viên không hoạt động:</span>
              <span className="font-semibold text-orange-600">{dropoutRate.inactiveStudents}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Đang học:</span>
                <span className="font-medium">{dropoutRate.activeEnrollments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Đã hoàn thành:</span>
                <span className="font-medium">{dropoutRate.completedEnrollments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Đã hủy:</span>
                <span className="font-medium">{dropoutRate.cancelledEnrollments}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quiz Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Hiệu suất Quiz
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Điểm trung bình:</span>
              <span className="font-semibold">{performanceMetrics.quiz.avgScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Điểm cao nhất:</span>
              <span className="font-semibold">{performanceMetrics.quiz.maxScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Điểm thấp nhất:</span>
              <span className="font-semibold">{performanceMetrics.quiz.minScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tỷ lệ đạt:</span>
              <span className="font-semibold">{performanceMetrics.quiz.passRate}%</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                Tổng số lần làm: {performanceMetrics.quiz.totalAttempts} | 
                Đã đạt: {performanceMetrics.quiz.passedCount}
              </span>
            </div>
          </div>
        </Card>

        {/* Assignment Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Hiệu suất Assignment
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Điểm trung bình:</span>
              <span className="font-semibold">{performanceMetrics.assignment.avgScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Điểm cao nhất:</span>
              <span className="font-semibold">{performanceMetrics.assignment.maxScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Điểm thấp nhất:</span>
              <span className="font-semibold">{performanceMetrics.assignment.minScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tỷ lệ chấm điểm:</span>
              <span className="font-semibold">{performanceMetrics.assignment.gradingRate}%</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                Tổng số bài nộp: {performanceMetrics.assignment.totalSubmissions} | 
                Đã chấm: {performanceMetrics.assignment.gradedCount}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Most Engaged Content */}
      {engagedContent && (engagedContent.topLessons.length > 0 || engagedContent.topSections.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Lessons */}
          {engagedContent.topLessons.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bài học được tương tác nhiều nhất</h3>
              <div className="space-y-3">
                {engagedContent.topLessons.slice(0, 5).map((lesson, index) => (
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

          {/* Top Sections */}
          {engagedContent.topSections.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phần được tương tác nhiều nhất</h3>
              <div className="space-y-3">
                {engagedContent.topSections.slice(0, 5).map((section, index) => (
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
    </div>
  );
}

