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
  Share2,
  MessageCircle,
  ClipboardList
} from 'lucide-react';
import { useCourse, useEnrollCourse, useUnenrollCourse, useCourseProgress } from '@/hooks/useCoursesData';
import { useCourseContent } from '@/hooks/useLessonData';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ROUTES, generateRoute } from '@/constants/routes';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { CurriculumTree } from '@/components/domain/lesson/CurriculumTree';
import type { Section, CourseContent } from '@/services/api/lesson.api';
import type { Course } from '@/services/api/course.api';
import { MainLayout } from '@/layouts/MainLayout';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { quizApi, type Quiz } from '@/services/api/quiz.api';
import { assignmentApi, type Assignment } from '@/services/api/assignment.api';
import { getCourseThumbnailUrl } from '@/utils/course.utils';
import { ReviewsTab } from './components/ReviewsTab';

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

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews'>('overview');
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);

  const courseId = id!;
  const { data: courseData, isLoading, error } = useCourse(courseId);
  const course = courseData as DetailedCourse | undefined;

  const { mutate: enrollCourse, isPending: isEnrolling } = useEnrollCourse();
  const { mutate: unenrollCourse, isPending: isUnenrolling } = useUnenrollCourse();
  const [showUnenrollConfirm, setShowUnenrollConfirm] = useState(false);

  // Fetch additional data - chỉ khi user đã enrolled và authenticated
  const { data: progressData } = useCourseProgress(courseId, isUserEnrolled);

  // useCourseContent đã tự động check authentication bên trong hook
  // Không cần truyền điều kiện ở đây nữa
  const { data: courseContent, isLoading: isContentLoading } = useCourseContent(courseId);

  // Fetch tất cả quizzes (bao gồm cả course-level và section-level)
  const { data: allQuizzes } = useQuery<Quiz[]>({
    queryKey: ['all-quizzes-detail', courseId],
    queryFn: async () => {
      try {
        const res = await quizApi.getQuizzes({ course_id: courseId, status: 'published' });
        const list = Array.isArray(res?.data) ? res.data : [];
        return list
          .filter((q: any) => {
            // Chỉ lấy quizzes đã published, không có lesson_id
            const hasLessonId = q.lesson_id != null && q.lesson_id !== '';
            return !hasLessonId && q.is_published;
          })
          .sort((a: any, b: any) => {
            // Sắp xếp theo created_at (cũ nhất trước)
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateA - dateB; // ASC: cũ nhất trước
          });
      } catch (error: any) {
        // Nếu lỗi permission, chỉ log và trả về mảng rỗng (không hiển thị toast)
        if (error?.response?.status === 403 || error?.response?.status === 401) {
          console.warn('[DetailPage] Permission denied when fetching quizzes:', error?.response?.data?.message);
          return [];
        }
        // Nếu lỗi khác, throw để React Query xử lý
        throw error;
      }
    },
    enabled: !!courseId,
    staleTime: 60 * 1000,
    retry: false, // Không retry khi lỗi permission
  });

  // Course-level quizzes (không có lesson_id và không có section_id, có course_id)
  const courseLevelQuizzes = (allQuizzes || []).filter((q: any) => {
    const hasLessonId = q.lesson_id != null && q.lesson_id !== '';
    const hasSectionId = q.section_id != null && q.section_id !== '';
    const hasCourseId = q.course_id != null && q.course_id !== '';
    return !hasLessonId && !hasSectionId && hasCourseId;
  });

  // Fetch tất cả assignments (bao gồm cả course-level và section-level)
  const { data: allAssignments } = useQuery<Assignment[]>({
    queryKey: ['all-assignments-detail', courseId],
    queryFn: async () => {
      try {
        const res = await assignmentApi.getCourseAssignments(courseId);
        const list = Array.isArray((res as any)?.data) ? (res as any).data : Array.isArray(res) ? res : [];
        return list
          .filter((a: any) => {
            // Chỉ lấy assignments đã published, không có lesson_id
            const hasLessonId = a.lesson_id != null && a.lesson_id !== '';
            return !hasLessonId && a.is_published;
          })
          .sort((a: any, b: any) => {
            // Sắp xếp theo created_at (cũ nhất trước)
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateA - dateB; // ASC: cũ nhất trước
          });
      } catch (error: any) {
        // Nếu lỗi permission, chỉ log và trả về mảng rỗng (không hiển thị toast)
        if (error?.response?.status === 403 || error?.response?.status === 401) {
          console.warn('[DetailPage] Permission denied when fetching assignments:', error?.response?.data?.message);
          return [];
        }
        // Nếu lỗi khác, throw để React Query xử lý
        throw error;
      }
    },
    enabled: !!courseId,
    staleTime: 60 * 1000,
    retry: false, // Không retry khi lỗi permission
  });

  // Course-level assignments (không có lesson_id và không có section_id, có course_id)
  const courseLevelAssignments = (allAssignments || []).filter((a: any) => {
    const hasLessonId = a.lesson_id != null && a.lesson_id !== '';
    const hasSectionId = a.section_id != null && a.section_id !== '';
    const hasCourseId = a.course_id != null && a.course_id !== '';
    return !hasLessonId && !hasSectionId && hasCourseId;
  });

  // Sử dụng sections từ courseContent (nếu authenticated) hoặc course.sections (public fallback)
  // Nếu courseContent.sections là empty array, vẫn fallback về course.sections
  let curriculumSections = (courseContent?.sections && courseContent.sections.length > 0)
    ? courseContent.sections
    : (course?.sections ?? []);

  // Thêm section-level quizzes và assignments vào sections
  // Lấy section-level quizzes (có section_id nhưng không có lesson_id)
  const sectionLevelQuizzes = (allQuizzes || []).filter((q: any) => {
    const hasLessonId = q.lesson_id != null && q.lesson_id !== '';
    const hasSectionId = q.section_id != null && q.section_id !== '';
    return !hasLessonId && hasSectionId;
  });

  // Lấy section-level assignments (có section_id nhưng không có lesson_id)
  const sectionLevelAssignments = (allAssignments || []).filter((a: any) => {
    const hasLessonId = a.lesson_id != null && a.lesson_id !== '';
    const hasSectionId = a.section_id != null && a.section_id !== '';
    return !hasLessonId && hasSectionId;
  });

  // Fetch quiz attempts và assignment submissions để biết quiz/assignment nào đã hoàn thành
  const { data: quizAttempts } = useQuery({
    queryKey: ['quiz-attempts-for-completion', courseId, isUserEnrolled],
    queryFn: async () => {
      if (!isUserEnrolled || !allQuizzes || allQuizzes.length === 0) return [];

      const nonPracticeQuizzes = allQuizzes.filter((q: any) => !q.is_practice);
      if (nonPracticeQuizzes.length === 0) return [];

      try {
        const attempts = await Promise.all(
          nonPracticeQuizzes.map(async (quiz: any) => {
            try {
              const studentAttempts = await quizApi.getAttempts(quiz.id);
              const submittedAttempts = studentAttempts.filter(
                (a: any) => a.submitted_at != null
              );
              if (submittedAttempts.length === 0) return null;

              const latestAttempt = submittedAttempts.sort(
                (a: any, b: any) =>
                  new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime()
              )[0];

              return { quiz_id: quiz.id, attempt: latestAttempt };
            } catch (error: any) {
              if (error?.response?.status === 401 || error?.response?.status === 403) {
                return null;
              }
              return null;
            }
          })
        );
        return attempts.filter(Boolean);
      } catch (error) {
        return [];
      }
    },
    enabled: !!isUserEnrolled && !!allQuizzes && allQuizzes.length > 0,
    staleTime: 60 * 1000,
  });

  // Fetch assignment submissions
  const { data: assignmentSubmissions } = useQuery({
    queryKey: ['assignment-submissions-for-completion', courseId, isUserEnrolled],
    queryFn: async () => {
      if (!isUserEnrolled || !allAssignments || allAssignments.length === 0) return [];

      const nonPracticeAssignments = allAssignments.filter((a: any) => !a.is_practice);
      if (nonPracticeAssignments.length === 0) return [];

      try {
        const submissions = await Promise.all(
          nonPracticeAssignments.map(async (assignment: any) => {
            try {
              const submission = await assignmentApi.getSubmission(assignment.id);
              return submission && submission.submitted_at
                ? { assignment_id: assignment.id, submission }
                : null;
            } catch (error: any) {
              if (error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 404) {
                return null;
              }
              return null;
            }
          })
        );
        return submissions.filter(Boolean);
      } catch (error) {
        return [];
      }
    },
    enabled: !!isUserEnrolled && !!allAssignments && allAssignments.length > 0,
    staleTime: 60 * 1000,
  });

  // Tạo map để lookup completion status
  const completedLessonIds = new Set(
    progressData?.sections?.flatMap((s: any) =>
      s.lessons?.filter((l: any) => l.is_completed).map((l: any) => l.lesson_id) || []
    ) || []
  );

  const completedQuizIds = new Set(
    (quizAttempts || []).map((item: any) => item.quiz_id)
  );

  const completedAssignmentIds = new Set(
    (assignmentSubmissions || []).map((item: any) => item.assignment_id)
  );

  // Gắn quizzes và assignments vào sections tương ứng và thêm completion status
  curriculumSections = curriculumSections.map((section: any) => {
    const sectionQuizzes = sectionLevelQuizzes.filter((q: any) => {
      const quizSectionId = q.section_id ? String(q.section_id).trim() : null;
      const currentSectionId = section.id ? String(section.id).trim() : null;
      return quizSectionId === currentSectionId && quizSectionId !== null;
    });

    const sectionAssignments = sectionLevelAssignments.filter((a: any) => {
      const assignmentSectionId = a.section_id ? String(a.section_id).trim() : null;
      const currentSectionId = section.id ? String(section.id).trim() : null;
      return assignmentSectionId === currentSectionId && assignmentSectionId !== null;
    });

    // Merge completion status từ progressData vào lessons
    const sectionProgress = progressData?.sections?.find((s: any) => s.section_id === section.id);
    const completedLessonMap = new Map(
      sectionProgress?.lessons?.map((l: any) => [l.lesson_id, l.is_completed]) || []
    );

    // Tạo lesson items từ quizzes và assignments với completion status
    const quizLessons = sectionQuizzes.map((quiz: any) => ({
      id: `quiz-${quiz.id}`,
      title: quiz.title,
      content_type: 'quiz' as const,
      section_id: quiz.section_id,
      order_index: quiz.order_index || 999,
      is_practice: quiz.is_practice,
      is_free_preview: false,
      duration_minutes: quiz.duration_minutes,
      quiz_id: quiz.id,
      is_completed: !quiz.is_practice && completedQuizIds.has(quiz.id),
    }));

    const assignmentLessons = sectionAssignments.map((assignment: any) => ({
      id: `assignment-${assignment.id}`,
      title: assignment.title,
      content_type: 'assignment' as const,
      section_id: assignment.section_id,
      order_index: assignment.order_index || 999,
      is_practice: assignment.is_practice,
      is_free_preview: false,
      duration_minutes: assignment.duration_minutes,
      assignment_id: assignment.id,
      is_completed: !assignment.is_practice && completedAssignmentIds.has(assignment.id),
    }));

    return {
      ...section,
      lessons: [
        ...(section.lessons || []).map((lesson: any) => ({
          ...lesson,
          is_completed: completedLessonMap.get(lesson.id) || completedLessonIds.has(lesson.id) || false,
        })),
        ...quizLessons,
        ...assignmentLessons,
      ].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    };
  });

  // Debug: Log để kiểm tra data
  useEffect(() => {
    if (course) {
      console.log('[DetailPage] Course data:', course);
      console.log('[DetailPage] Course sections:', course.sections);
      console.log('[DetailPage] CourseContent sections:', courseContent?.sections);
      console.log('[DetailPage] Final curriculumSections:', curriculumSections);
    }
  }, [course, courseContent, curriculumSections]);

  // Extract counts from API data - ưu tiên dùng data từ progressData (chính xác nhất)
  const totalSections = progressData?.total_sections ??
    courseContent?.total_sections ??
    courseContent?.sections?.length ??
    course?.sections?.length ?? 0;

  const totalLessons = progressData?.total_lessons ??
    courseContent?.total_lessons ??
    (course?.sections?.reduce((sum, section) => sum + (section.lessons?.length || 0), 0) || 0) ??
    course?.total_lessons ?? 0;

  const completedLessons = progressData?.completed_lessons ??
    courseContent?.completed_lessons ?? 0;

  // completion_percentage từ progressData là giá trị chuẩn từ backend (đã tính toán đầy đủ)
  const progressPercentage = progressData?.completion_percentage != null
    ? Number(progressData.completion_percentage)
    : (courseContent?.progress_percentage != null
      ? Number(courseContent.progress_percentage)
      : 0);

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
    if (!courseId) return;

    // Xử lý quiz/assignment items (có id dạng quiz-${id} hoặc assignment-${id})
    if (lessonId.startsWith('quiz-')) {
      const quizId = lessonId.replace('quiz-', '');
      if (isUserEnrolled) {
        navigate(generateRoute.student.quiz(courseId, quizId));
      } else {
        toast.error('Vui lòng đăng ký khóa học để làm bài kiểm tra');
      }
      return;
    }

    if (lessonId.startsWith('assignment-')) {
      const assignmentId = lessonId.replace('assignment-', '');
      if (isUserEnrolled) {
        navigate(`/assignments/${assignmentId}`);
      } else {
        toast.error('Vui lòng đăng ký khóa học để làm bài tập');
      }
      return;
    }

    // Tìm lesson trong curriculumSections để kiểm tra is_free_preview
    const lesson = curriculumSections
      .flatMap(s => s.lessons || [])
      .find(l => l.id === lessonId);

    const isFreePreview = lesson?.is_free_preview || false;

    // Cho phép xem nếu:
    // 1. Đã enrolled, HOẶC
    // 2. Lesson có is_free_preview = true (cho phép xem trước miễn phí)
    if (isUserEnrolled || isFreePreview) {
      navigate(generateRoute.student.lesson(courseId, lessonId));
    } else {
      // Nếu chưa enrolled và không phải preview lesson, yêu cầu đăng ký
      toast.error('Vui lòng đăng ký khóa học để xem nội dung bài học');
    }
  };

  /**
   * Helper: Tìm lesson đầu tiên từ sections
   */
  const getFirstLesson = () => {
    const sectionsToUse = (courseContent?.sections && courseContent.sections.length > 0)
      ? courseContent.sections
      : curriculumSections;

    return sectionsToUse
      .flatMap(s => s.lessons || [])
      .find(lesson => lesson);
  };

  /**
   * Helper: Navigate đến bài học đầu tiên
   */
  const navigateToFirstLesson = () => {
    if (!courseId) return;

    const firstLesson = getFirstLesson();
    if (firstLesson) {
      navigate(generateRoute.student.lesson(courseId, firstLesson.id));
    } else {
      toast.error('Khóa học chưa có bài học nào');
    }
  };

  /**
   * Handle click button chính (Đăng ký ngay / Vào học ngay)
   * 
   * Logic:
   * - Chưa login → Redirect đến login
   * - Đã login + Đã enrolled → Navigate đến lesson đầu tiên
   * - Đã login + Chưa enrolled → Gọi API enroll → Button đổi thành "Vào học ngay"
   */
  const handleEnrollClick = () => {
    if (!courseId) {
      return;
    }

    // Chưa đăng nhập → Redirect to login
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: location.pathname } });
      return;
    }

    // Đã enrolled → Navigate đến lesson đầu tiên
    if (isUserEnrolled) {
      navigateToFirstLesson();
      return;
    }

    // Chưa enrolled → Gọi API enroll, KHÔNG navigate sau khi thành công
    // User cần click lần 2 vào button "Vào học ngay" để vào học
    enrollCourse(courseId, {
      onSuccess: async () => {
        // Chỉ set state, không navigate
        setIsUserEnrolled(true);

        // Invalidate queries để refresh data
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.enrolled() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lessons.content(courseId) });

        // Hiển thị thông báo thành công
        toast.success('Đăng ký khóa học thành công! Nhấn "Vào học ngay" để bắt đầu.');
      },
      onError: (error: any) => {
        console.error('Enrollment failed:', error);
        const errorMessage = error?.response?.data?.message || '';

        // Nếu lỗi là "already enrolled", xử lý như đã enrolled
        if (errorMessage.toLowerCase().includes('already enrolled') ||
          errorMessage.toLowerCase().includes('đã đăng ký')) {
          setIsUserEnrolled(true);
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.enrolled() });
          toast.success('Bạn đã đăng ký khóa học này. Nhấn "Vào học ngay" để bắt đầu.');
        } else {
          toast.error('Không thể đăng ký khóa học. Vui lòng thử lại.');
        }
      }
    });
  };

  /**
   * Handle action cho button chính
   * Gọi handleEnrollClick() cho cả 2 trường hợp:
   * - Chưa enrolled: Gọi API enroll
   * - Đã enrolled: Navigate đến lesson đầu tiên
   */
  const handlePrimaryAction = () => {
    handleEnrollClick();
  };

  /**
   * Handle hủy đăng ký khóa học
   */
  const handleUnenrollClick = () => {
    if (!courseId) return;

    unenrollCourse(courseId, {
      onSuccess: () => {
        setIsUserEnrolled(false);
        setShowUnenrollConfirm(false);

        // Invalidate queries để refresh data
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.enrolled() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lessons.content(courseId) });

        toast.success('Hủy đăng ký khóa học thành công!');
      },
      onError: (error: any) => {
        console.error('Unenroll failed:', error);
        toast.error('Không thể hủy đăng ký. Vui lòng thử lại.');
      }
    });
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
      <MainLayout showSidebar>
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="xl" />
        </div>
      </MainLayout>
    );
  }

  if (error || !course) {
    return (
      <MainLayout showSidebar>
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
      </MainLayout>
    );
  }

  const difficultyLabels: Record<string, string> = {
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
    expert: 'Chuyên gia',
  };

  return (
    <MainLayout showSidebar>
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-green-500 via-teal-600 to-sky-900 text-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-25">
          {/* Animated floating circles */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>

          {/* Animated geometric shapes */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 border-4 border-white/30 rounded-lg rotate-45 animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-24 h-24 border-4 border-white/30 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/20 rounded-lg rotate-12 animate-bounce" style={{ animationDuration: '3s' }}></div>
          <div className="absolute bottom-10 left-1/2 w-20 h-20 border-2 border-white/40 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>

          {/* Additional animated circles */}
          <div className="absolute top-20 right-1/4 w-40 h-40 border-3 border-white/25 rounded-full animate-pulse" style={{ animationDelay: '0.8s', animationDuration: '3s' }}></div>
          <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '2.5s' }}></div>
        </div>

        {/* Pattern overlay - dots */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Gradient mesh overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>

        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Course info */}
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-blue-100 mb-4">
                <Link to={ROUTES.LANDING_PAGE} className="hover:text-white">
                  Trang chủ
                </Link>
                <span>/</span>
                <Link to={ROUTES.COURSES} className="hover:text-white">
                  Khóa học
                </Link>
                <span>/</span>
                <span className="text-white">{course.title}</span>
              </div>

              {/* Difficulty Badge */}
              <div className="mb-3">
                <Badge variant={(course.difficulty || course.level) === 'beginner' ? 'success' : 'warning'}>
                  {difficultyLabels[course.difficulty || course.level || 'beginner'] || 'Cơ bản'}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold">
                {course.title}
              </h1>
            </div>

            {/* Right: Enroll card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                    {(() => {
                      const thumbnailUrl = getCourseThumbnailUrl(course);
                      return thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null;
                    })()}
                    <div className={`w-full h-full flex items-center justify-center ${getCourseThumbnailUrl(course) ? 'hidden' : ''}`}>
                      <BookOpen className="w-16 h-16 text-gray-400" />
                    </div>
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

                  {/* Unenroll button - chỉ hiển thị khi đã enrolled */}
                  {isUserEnrolled && !showUnenrollConfirm && (
                    <button
                      onClick={() => setShowUnenrollConfirm(true)}
                      className="w-full text-sm text-gray-500 hover:text-red-600 transition-colors mb-4"
                    >
                      Hủy đăng ký khóa học
                    </button>
                  )}

                  {/* Confirm unenroll */}
                  {showUnenrollConfirm && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 mb-3">
                        Bạn có chắc chắn muốn hủy đăng ký khóa học này? Tiến độ học tập sẽ bị xóa.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowUnenrollConfirm(false)}
                          className="flex-1"
                        >
                          Không
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={handleUnenrollClick}
                          isLoading={isUnenrolling}
                          className="flex-1"
                        >
                          Xác nhận hủy
                        </Button>
                      </div>
                    </div>
                  )}

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
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 border-b border-gray-200 flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Tổng quan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'curriculum'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Mục lục khóa học
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'reviews'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Đánh giá
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
            ) : activeTab === 'curriculum' ? (
              // Curriculum tab - hiển thị nội dung hoặc thông báo
              curriculumSections.length > 0 || (courseLevelQuizzes && courseLevelQuizzes.length > 0) || (courseLevelAssignments && courseLevelAssignments.length > 0) ? (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
                  {/* Sections - hiển thị trước */}
                  {curriculumSections.length > 0 && (
                    <div className="[&>div]:border-0 [&>div]:rounded-none [&>div]:shadow-none">
                      <CurriculumTree
                        sections={curriculumSections}
                        onLessonClick={handleLessonPreviewClick}
                        isPreviewMode={true}
                      />
                    </div>
                  )}

                  {/* Course-level Quizzes - hiển thị sau sections, cùng cấp */}
                  {courseLevelQuizzes?.map((quiz) => {
                    const isCompleted = !quiz.is_practice && completedQuizIds.has(quiz.id);
                    return (
                      <div
                        key={`quiz-${quiz.id}`}
                        className="px-5 py-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          if (isUserEnrolled) {
                            navigate(generateRoute.student.quiz(courseId, quiz.id));
                          } else {
                            toast.error('Vui lòng đăng ký khóa học để làm bài kiểm tra');
                          }
                        }}
                      >
                        <ClipboardList className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">Quiz: {quiz.title}</h3>
                          {quiz.description && (
                            <p className="text-xs text-gray-500 mt-1">{quiz.description}</p>
                          )}
                        </div>
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}

                  {/* Course-level Assignments - hiển thị sau sections, cùng cấp */}
                  {courseLevelAssignments?.map((asmt) => {
                    const isCompleted = !asmt.is_practice && completedAssignmentIds.has(asmt.id);
                    return (
                      <div
                        key={`assignment-${asmt.id}`}
                        className="px-5 py-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          if (isUserEnrolled) {
                            navigate(`/assignments/${asmt.id}`);
                          } else {
                            toast.error('Vui lòng đăng ký khóa học để làm bài tập');
                          }
                        }}
                      >
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">Assignment: {asmt.title}</h3>
                          {asmt.description && (
                            <p className="text-xs text-gray-500 mt-1">{asmt.description}</p>
                          )}
                        </div>
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : isContentLoading ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Spinner size="lg" />
                      <p className="mt-4">Đang tải nội dung khóa học...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : !isAuthenticated ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <BookOpen className="w-12 h-12 mb-4 text-gray-400" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Đăng nhập để xem nội dung chi tiết
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Vui lòng đăng nhập để xem mục lục khóa học đầy đủ
                      </p>
                      <Button
                        onClick={() => navigate(ROUTES.LOGIN, { state: { from: location.pathname } })}
                        variant="primary"
                      >
                        Đăng nhập ngay
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <BookOpen className="w-12 h-12 mb-4 text-gray-400" />
                      <p className="text-lg font-medium text-gray-700">
                        Chưa có nội dung
                      </p>
                      <p className="text-sm text-gray-500">
                        Khóa học đang được cập nhật nội dung
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            ) : (
              // Reviews tab
              <ReviewsTab courseId={courseId} isEnrolled={isUserEnrolled} />
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
                      {course.instructor.full_name?.charAt(0).toUpperCase() || 'I'}
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

                  {/* Nút nhắn tin với giảng viên - chỉ hiển thị khi đã enrolled */}
                  {isUserEnrolled && (
                    <Button
                      variant="outline"
                      fullWidth
                      className="mt-4 gap-2"
                      onClick={() => navigate(generateRoute.student.chat(courseId))}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Nhắn tin với giảng viên
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Progress (only for enrolled students) */}
            {isUserEnrolled && (
              <Card>
                <CardHeader>
                  <CardTitle>Tiến độ học tập</CardTitle>
                </CardHeader>
                <CardContent>
                  {isUserEnrolled ? (
                    progressData ? (
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {completedLessons} / {totalLessons} bài học
                            </span>
                            <span className="text-sm font-semibold text-blue-600">
                              {Math.round(progressPercentage)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(Math.max(progressPercentage, 0), 100)}%` }}
                            />
                          </div>
                        </div>
                        {progressData.last_accessed_at && (
                          <p className="text-xs text-gray-500">
                            Hoạt động gần nhất: {new Date(progressData.last_accessed_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Spinner size="sm" />
                        <p className="text-sm text-gray-500 mt-2">Đang tải tiến độ...</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        Đăng ký khóa học để theo dõi tiến độ học tập
                      </p>
                    </div>
                  )}
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

export default DetailPage;
