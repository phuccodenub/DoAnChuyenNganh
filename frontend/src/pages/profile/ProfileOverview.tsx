import React, { useEffect, useState } from 'react';
import { 
  BookOpen, Award, Activity, Users, DollarSign, Star, FileText, 
  TrendingUp, Clock, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { enrollmentApi, type EnrollmentStats, type Enrollment } from '@/services/api/enrollment.api';
import { instructorApi, type InstructorCourse } from '@/services/api/instructor.api';
import { Link } from 'react-router-dom';

// --- STUDENT OVERVIEW ---
interface StudentOverviewProps {
  enrollmentStats: EnrollmentStats | null;
  isLoadingStats: boolean;
  bio: string;
}

const StudentOverview = ({ enrollmentStats, isLoadingStats, bio }: StudentOverviewProps) => {
  const [recentEnrollments, setRecentEnrollments] = useState<Enrollment[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);

  useEffect(() => {
    const fetchRecentEnrollments = async () => {
      try {
        setIsLoadingEnrollments(true);
        const response = await enrollmentApi.getMyEnrollments();
        if (response.data?.success && Array.isArray(response.data.data)) {
          // Take top 3 recent
          setRecentEnrollments(response.data.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch enrollments:', error);
      } finally {
        setIsLoadingEnrollments(false);
      }
    };
    fetchRecentEnrollments();
  }, []);

  return (
    <div className="space-y-6">
      {/* About Me */}
      <Card>
        <CardHeader><CardTitle>Giới thiệu</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {bio || 'Chưa có thông tin giới thiệu. Hãy cập nhật hồ sơ của bạn.'}
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={24} /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoadingStats ? '...' : (enrollmentStats?.active_enrollments || 0)}
            </p>
            <p className="text-sm text-gray-500">Khóa học đang học</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Award size={24} /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoadingStats ? '...' : (enrollmentStats?.completed_enrollments || 0)}
            </p>
            <p className="text-sm text-gray-500">Khóa học hoàn thành</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Activity size={24} /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoadingStats ? '...' : (enrollmentStats?.total_enrollments || 0)}
            </p>
            <p className="text-sm text-gray-500">Tổng khóa học</p>
          </div>
        </div>
      </div>

      {/* Recent Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Khóa học đang học</CardTitle>
          <Link to="/my-courses">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              Xem tất cả <ArrowRight size={16} className="ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoadingEnrollments ? (
            <div className="flex justify-center py-8"><Spinner size="sm" /></div>
          ) : recentEnrollments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Bạn chưa tham gia khóa học nào.</p>
              <Link to="/courses" className="text-blue-600 hover:underline mt-2 inline-block">
                Khám phá khóa học ngay →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEnrollments.map((enrollment) => {
                const progress = Math.round(enrollment.progress_percentage || 0);
                const isCompleted = progress >= 100;
                const progressColor = isCompleted ? 'bg-green-600' : progress >= 50 ? 'bg-blue-600' : progress >= 25 ? 'bg-yellow-500' : 'bg-gray-400';
                
                return (
                  <Link 
                    key={enrollment.id} 
                    to={`/courses/${enrollment.course_id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group bg-white"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 shrink-0 group-hover:scale-105 transition-transform">
                      {enrollment.course?.thumbnail_url ? (
                        <img
                          src={enrollment.course.thumbnail_url}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Ngăn vòng lặp lỗi
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.course?.title || 'Khóa học')}&size=200&background=2563EB&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-600">
                          <BookOpen size={28} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {enrollment.course?.title || 'Khóa học'}
                      </h4>
                      <p className="text-sm text-gray-600 truncate mt-0.5">
                        {enrollment.course?.instructor?.full_name || 'Giảng viên'}
                      </p>
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 font-medium">Tiến độ: {progress}%</span>
                          {isCompleted && (
                            <span className="text-green-600 font-semibold flex items-center gap-1">
                              <Award size={14} /> Hoàn thành
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// --- INSTRUCTOR OVERVIEW ---
interface InstructorOverviewProps {
  bio: string;
}

const InstructorOverview = ({ bio }: InstructorOverviewProps) => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);

  useEffect(() => {
    const fetchInstructorStats = async () => {
      try {
        setIsLoading(true);
        const response = await instructorApi.getMyCourses({ limit: 100 }); // Get all courses to calc stats
        if (response.success && response.data?.data) {
          const courseList = response.data.data;
          setCourses(courseList.slice(0, 5)); // Keep top 5 for display

          // Calculate stats
          const totalCourses = courseList.length;
          const totalStudents = courseList.reduce((sum, course) => sum + (course.total_students || 0), 0);
          
          // Calculate weighted average rating
          let totalRatingSum = 0;
          let totalRatingCount = 0;
          
          courseList.forEach(course => {
            if (course.average_rating && course.total_ratings) {
              totalRatingSum += course.average_rating * course.total_ratings;
              totalRatingCount += course.total_ratings;
            }
          });

          const averageRating = totalRatingCount > 0 ? totalRatingSum / totalRatingCount : 0;
          const totalReviews = totalRatingCount;

          setStats({
            totalCourses,
            totalStudents,
            averageRating,
            totalReviews
          });
        }
      } catch (error) {
        console.error('Failed to fetch instructor stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructorStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* About Me */}
      <Card>
        <CardHeader><CardTitle>Giới thiệu</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {bio || 'Chưa có thông tin giới thiệu. Hãy cập nhật hồ sơ giảng viên của bạn.'}
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={24} /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : stats.totalCourses}
            </p>
            <p className="text-sm text-gray-500">Khóa học đang dạy</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Users size={24} /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : stats.totalStudents}
            </p>
            <p className="text-sm text-gray-500">Tổng học viên</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><Star size={24} /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : stats.averageRating.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500">Đánh giá trung bình</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><FileText size={24} /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : stats.totalReviews}
            </p>
            <p className="text-sm text-gray-500">Tổng đánh giá</p>
          </div>
        </div>
      </div>

      {/* Teaching Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Khóa học đang dạy</CardTitle>
          <Link to="/instructor/courses">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              Quản lý khóa học <ArrowRight size={16} className="ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner size="sm" /></div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Bạn chưa tạo khóa học nào.</p>
              <Link to="/instructor/courses/create" className="text-blue-600 hover:underline mt-2 inline-block">
                Tạo khóa học mới
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-200 shrink-0">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <BookOpen size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{course.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Users size={14} /> {course.total_students || 0} học viên</span>
                      <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500" /> {course.average_rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'published' ? 'bg-green-100 text-green-700' : 
                      course.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {course.status === 'published' ? 'Đang hoạt động' : course.status === 'draft' ? 'Bản nháp' : 'Đã ẩn'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// --- ADMIN OVERVIEW ---
interface AdminOverviewProps {
  bio: string;
}

const AdminOverview = ({ bio }: AdminOverviewProps) => {
  return (
    <div className="space-y-6">
      {/* About Me */}
      <Card>
        <CardHeader><CardTitle>Giới thiệu</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
            {bio || 'Chưa có thông tin giới thiệu.'}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Trang quản trị hệ thống</h3>
          <p className="text-gray-300 mb-6">Truy cập Dashboard để quản lý người dùng, khóa học và xem thống kê chi tiết.</p>
          <Link to="/admin">
            <Button className="bg-white text-gray-900 hover:bg-gray-100">
              Đi tới Dashboard <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

// --- MAIN COMPONENT ---
interface ProfileOverviewProps {
  enrollmentStats: EnrollmentStats | null;
  isLoadingStats: boolean;
  bio: string;
}

export const ProfileOverview = ({ enrollmentStats, isLoadingStats, bio }: ProfileOverviewProps) => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'instructor':
      return <InstructorOverview bio={bio} />;
    case 'admin':
    case 'super_admin':
      return <AdminOverview bio={bio} />;
    case 'student':
    default:
      return <StudentOverview enrollmentStats={enrollmentStats} isLoadingStats={isLoadingStats} bio={bio} />;
  }
};
