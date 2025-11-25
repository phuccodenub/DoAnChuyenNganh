import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Award, 
  CheckCircle,
  PlayCircle,
  FileText,
  DollarSign,
  Share2
} from 'lucide-react';
import { useCourse, useEnrollCourse, useCourseProgress, useCourseQuizzes } from '@/hooks/useCoursesData';
import { useCourseContent } from '@/hooks/useLessonData';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Modal, { ModalBody, ModalFooter } from '@/components/ui/Modal';
import { ROUTES, generateRoute } from '@/constants/routes';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { CurriculumSidebar } from '@/components/domain/learning/CurriculumSidebar';
import type { Section } from '@/services/api/lesson.api';
import type { Course } from '@/services/api/course.api';
import { MainLayout } from '@/layouts/MainLayout';

/**
 * Course Detail Page
 * 
 * Trang chi tiết khóa học với:
 * - Course overview (title, description, instructor)
 * - What you'll learn
 * - Course curriculum preview
 * - Instructor info
 * - Enroll button với confirmation modal
 */
type DetailedCourse = Course & { sections?: Section[]; is_enrolled?: boolean };

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum'>('overview');
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);

  const courseId = id ?? '';
  
  const { data: courseData, isLoading, error } = useCourse(courseId);
  const course = courseData as DetailedCourse | undefined;
  const { mutate: enrollCourse, isPending: isEnrolling } = useEnrollCourse();

  // Fetch additional data
  const { data: progressData } = useCourseProgress(courseId, isUserEnrolled);
  const { data: courseContent } = useCourseContent(courseId);
  const { data: quizzesData } = useCourseQuizzes(courseId, true);

  const curriculumSections = courseContent?.sections ?? course?.sections ?? [];
  const learningPath = courseId ? generateRoute.student.learning(courseId) : ROUTES.COURSES;
  
  // Extract counts from API data
  const totalSections = courseContent?.sections?.length || 0;
  const totalLessons = courseContent?.total_lessons || 0;
  const totalQuizzes = quizzesData?.length || 0;
  const completedLessons = courseContent?.completed_lessons || 0;
  const progressPercentage = progressData?.percent || courseContent?.progress_percentage || 0;

  useEffect(() => {
    if (!courseId) {
      setIsUserEnrolled(false);
      return;
    }

    const cachedEnrolled = queryClient.getQueryData<{ data?: { courses?: Course[] } }>(
      QUERY_KEYS.courses.enrolled()
    );

    const isCachedEnrollment = cachedEnrolled?.data?.courses?.some(
      (enrolledCourse) => String(enrolledCourse.id) === String(courseId)
    );

    setIsUserEnrolled(Boolean(course?.is_enrolled) || Boolean(isCachedEnrollment));
  }, [course?.is_enrolled, courseId, queryClient]);

  const handleLessonPreviewClick = (lessonId: string) => {
    console.log('Preview lesson', lessonId);
  };

  const handleEnrollClick = () => {
    if (!courseId) {
      return;
    }
    if (!isAuthenticated) {
      // Redirect to login với return URL
      navigate(ROUTES.LOGIN, { state: { from: location.pathname } });
      return;
    }
    
    // Enroll trực tiếp không cần modal
    enrollCourse(courseId, {
      onSuccess: () => {
        setIsUserEnrolled(true);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.enrolled() });
        // Navigate to learning page
        navigate(learningPath);
      },
      onError: (error) => {
        console.error('Enrollment failed:', error);
        // Still navigate even if enrollment fails (for testing)
        navigate(learningPath);
      }
    });
  };

  const handlePrimaryAction = () => {
    if (!courseId) {
      return;
    }

    if (isUserEnrolled) {
      navigate(learningPath);
      return;
    }

    handleEnrollClick();
  };

  // const handleConfirmEnroll = () => {
  //   if (!courseId) {
  //     return;
  //   }

  //   enrollCourse(courseId, {
  //     onSuccess: () => {
  //       setShowEnrollModal(false);
  //       setIsUserEnrolled(true);
  //       queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
  //       // Redirect to learning page
  //       navigate(learningPath);
  //     },
  //   });
  // };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy khóa học
          </h1>
          <Link
            to={ROUTES.COURSES}
            className="text-blue-600 hover:text-blue-700"
          >
            Quay lại danh sách khóa học
          </Link>
        </div>
      </div>
    );
  }

  const difficultyLabels = {
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
  };

  return (
    <MainLayout showSidebar={false}> {/* Chọn showSidebar=true nếu bạn muốn thanh điều hướng bên */}
      {/* Hero section */}
      <div className="bg-gradient-to-r from-green-500 via-teal-600 to-sky-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Course info */}
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-blue-100 mb-4">
                <Link to={ROUTES.HOME} className="hover:text-white">
                  Trang chủ
                </Link>
                <span>/</span>
                <Link to={ROUTES.COURSES} className="hover:text-white">
                  Khóa học
                </Link>
                <span>/</span>
                <span className="text-white">{course.title}</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                {course.title}
              </h1>

              <p className="text-lg text-blue-50 mb-6">
                {course.description}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Badge variant={course.difficulty === 'beginner' ? 'success' : 'warning'}>
                  {difficultyLabels[course.difficulty]}
                </Badge>
                
                {course._count && (
                  <div className="flex items-center gap-2 text-blue-50">
                    <Users className="w-5 h-5" />
                    <span>{course._count.enrollments} học viên</span>
                  </div>
                )}

                {course.duration_hours && (
                  <div className="flex items-center gap-2 text-blue-50">
                    <Clock className="w-5 h-5" />
                    <span>{course.duration_hours} giờ</span>
                  </div>
                )}

                {totalSections > 0 && (
                  <div className="flex items-center gap-2 text-blue-50">
                    <BookOpen className="w-5 h-5" />
                    <span>{totalSections} chương • {totalLessons} bài học</span>
                  </div>
                )}
              </div>

              {/* Instructor */}
              {course.instructor && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-semibold">
                    {course.instructor.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Giảng viên</p>
                    <p className="font-semibold">{course.instructor.full_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Enroll card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {course.is_free ? (
                      <p className="text-3xl font-bold text-green-600">Miễn phí</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-gray-600" />
                        <p className="text-3xl font-bold text-gray-900">
                          {course.price?.toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Enroll button */}
                  <Button
                    onClick={handlePrimaryAction}
                    fullWidth
                    size="lg"
                    className="mb-4"
                    isLoading={isEnrolling && !isUserEnrolled}
                  >
                    {isUserEnrolled ? 'Vào học ngay' : 'Đăng ký ngay'}
                  </Button>

                  <p className="text-sm text-gray-500 text-center">
                    30 ngày đảm bảo hoàn tiền
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 border-b border-gray-200 flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tổng quan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'curriculum'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Mục lục khóa học
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Tab content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' ? (
              <div className="space-y-8">
                {/* What you'll learn */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bạn sẽ học được gì</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        'Nắm vững các kiến thức nền tảng',
                        'Thực hành với các dự án thực tế',
                        'Áp dụng vào công việc ngay lập tức',
                        'Nhận được chứng chỉ hoàn thành',
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Course description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mô tả khóa học</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">
                        {course.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Yêu cầu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-600">•</span>
                        Máy tính có kết nối internet
                      </li>
                      <li className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-600">•</span>
                        Tinh thần học hỏi và kiên trì
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <CurriculumSidebar
                  sections={curriculumSections}
                  onLessonClick={handleLessonPreviewClick}
                />
                {curriculumSections.length === 0 && (
                  <div className="p-6 text-center text-gray-500 text-sm border-t border-gray-100">
                    Mục lục khóa học đang được cập nhật.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Instructor info */}
          <div className="lg:col-span-1 space-y-6">
            {course.instructor && (
              <Card>
                <CardHeader>
                  <CardTitle>Giảng viên</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-semibold text-blue-600">
                      {course.instructor.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {course.instructor.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">Giảng viên</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>Chuyên gia trong lĩnh vực</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>1000+ học viên</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress (only for enrolled students) */}
            {isUserEnrolled && progressData && (
              <Card>
                <CardHeader>
                  <CardTitle>Tiến độ học tập</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {completedLessons} / {totalLessons} bài học
                        </span>
                        <span className="text-sm font-semibold text-blue-600">
                          {progressPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                    {progressData.last_activity_at && (
                      <p className="text-xs text-gray-500">
                        Hoạt động gần nhất: {new Date(progressData.last_activity_at).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Nội dung bao gồm</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {totalSections > 0 && (
                    <li className="flex items-start gap-3 text-gray-700">
                      <BookOpen className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-semibold">{totalSections} chương học</p>
                        <p className="text-sm text-gray-500">{totalLessons} bài học</p>
                      </div>
                    </li>
                  )}
                  {totalQuizzes > 0 && (
                    <li className="flex items-start gap-3 text-gray-700">
                      <FileText className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-semibold">{totalQuizzes} bài kiểm tra</p>
                        <p className="text-sm text-gray-500">Đánh giá kiến thức định kỳ</p>
                      </div>
                    </li>
                  )}
                  <li className="flex items-start gap-3 text-gray-700">
                    <PlayCircle className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold">Video chất lượng HD</p>
                      <p className="text-sm text-gray-500">Truy cập mọi lúc, hỗ trợ thiết bị di động</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-gray-700">
                    <Award className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold">Chứng chỉ hoàn thành</p>
                      <p className="text-sm text-gray-500">Được cấp sau khi hoàn thành khóa học</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chia sẻ khóa học</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Giới thiệu khóa học đến bạn bè hoặc đồng nghiệp để cùng học và nhận ưu đãi nhóm.
                </p>
                <div className="flex flex-col gap-3">
                  <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Share2 className="w-4 h-4" />
                    Sao chép liên kết
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Users className="w-4 h-4" />
                    Mời vào lớp học
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enrollment confirmation modal */}
      {/* <Modal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        title="Xác nhận đăng ký"
      >
        <ModalBody>
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn đăng ký khóa học <strong>{course.title}</strong>?
          </p>
          {course.is_free ? (
            <p className="text-green-600 font-semibold">
              ✓ Khóa học này hoàn toàn miễn phí
            </p>
          ) : (
            <p className="text-gray-700">
              Giá: <strong>{course.price?.toLocaleString('vi-VN')} đ</strong>
            </p>
          )}
        </ModalBody>

        <ModalFooter>
          <button
            onClick={() => setShowEnrollModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isEnrolling}
          >
            Hủy
          </button>
          <Button
            onClick={handleConfirmEnroll}
            isLoading={isEnrolling}
          >
            Xác nhận đăng ký
          </Button>
        </ModalFooter>
      </Modal> */}
    </MainLayout>
  );
}

export default CourseDetailPage; 
 