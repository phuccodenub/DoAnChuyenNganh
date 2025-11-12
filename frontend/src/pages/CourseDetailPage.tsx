import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Award, 
  CheckCircle,
  PlayCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { useCourse } from '@/hooks/useCoursesData';
import { useEnrollCourse } from '@/hooks/useCoursesData';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardNew';
import { Button } from '@/components/ui/ButtonNew';
import Modal, { ModalBody, ModalFooter } from '@/components/ui/Modal';
import { ROUTES, generateRoute } from '@/constants/routes';

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
export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const courseId = Number(id);
  const { data: course, isLoading, error } = useCourse(courseId);
  const { mutate: enrollCourse, isPending: isEnrolling } = useEnrollCourse();

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      // Redirect to login với return URL
      navigate(ROUTES.LOGIN, { state: { from: location.pathname } });
      return;
    }
    setShowEnrollModal(true);
  };

  const handleConfirmEnroll = () => {
    enrollCourse(courseId, {
      onSuccess: () => {
        setShowEnrollModal(false);
        // Redirect to learning page
        navigate(generateRoute.student.learning(courseId));
      },
    });
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
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
                    onClick={handleEnrollClick}
                    fullWidth
                    size="lg"
                    className="mb-4"
                  >
                    Đăng ký ngay
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Course content */}
          <div className="lg:col-span-2 space-y-8">
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

          {/* Right: Instructor info */}
          <div className="lg:col-span-1">
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
          </div>
        </div>
      </div>

      {/* Enrollment confirmation modal */}
      <Modal
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
      </Modal>
    </div>
  );
}

export default CourseDetailPage;
