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
import { useCourse, useEnrollCourse, useCourseProgress } from '@/hooks/useCoursesData';
import { usePrerequisites } from '@/hooks/usePrerequisites';
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
import { StudentDashboardLayout } from '@/layouts/StudentDashboardLayout';
import { InstructorDashboardLayout } from '@/layouts/InstructorDashboardLayout';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { quizApi, type Quiz } from '@/services/api/quiz.api';
import { assignmentApi, type Assignment } from '@/services/api/assignment.api';
import { getCourseThumbnailUrl } from '@/utils/course.utils';
import { ReviewsTab } from './components/ReviewsTab';
import { RatingDisplay } from '@/components/domain/course/RatingDisplay';
import { RatingForm } from '@/components/domain/course/RatingForm';
import { ReviewsList } from '@/components/domain/course/ReviewsList';
import { useCourseReviews, useCourseReviewStats, useMyReview, useCreateReview, useUpdateReview, useDeleteReview } from '@/hooks/useReviewData';
import { useUserCertificates } from '@/hooks/useCertificateData';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews' | 'certificate'>('overview');
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);
  const [missingPrereqs, setMissingPrereqs] = useState<Array<{ id: string; title: string; is_required: boolean }>>([]);

  const courseId = id!;
  const { data: courseData, isLoading, error } = useCourse(courseId);
  const course = courseData as DetailedCourse | undefined;
  const { data: prerequisitesData } = usePrerequisites(courseId);

  const { mutate: enrollCourse, isPending: isEnrolling } = useEnrollCourse();
  const { user } = useAuth();

  // Check if current user is the instructor of this course
  const isInstructor = user && course && (
    String(user.id) === String(course.instructor_id) || 
    String(user.id) === String(course.instructor?.id)
  );

  // User can access course content if enrolled OR is the instructor
  const canAccessContent = isUserEnrolled || isInstructor;

  // Determine the appropriate layout based on user role and enrollment status
  const getLayout = () => {
    // If user is not logged in or not enrolled → use public MainLayout
    if (!user || !isAuthenticated) {
      return MainLayout;
    }
    // If user is admin → use AdminDashboardLayout
    if (user.role === 'admin' || user.role === 'super_admin') {
      return AdminDashboardLayout;
    }
    // If user is instructor → use InstructorDashboardLayout
    if (user.role === 'instructor' || isInstructor) {
      return InstructorDashboardLayout;
    }
    // If student is enrolled → use StudentDashboardLayout
    if (isUserEnrolled) {
      return StudentDashboardLayout;
    }
    // Default: public MainLayout for non-enrolled users browsing courses
    return MainLayout;
  };
  const LayoutWrapper = getLayout();

  // Fetch reviews data
  const [reviewPage, setReviewPage] = useState(1);
  const { data: reviewsData, isLoading: isLoadingReviews } = useCourseReviews(courseId, reviewPage, 10);
  const { data: reviewStats } = useCourseReviewStats(courseId);
  const { data: myReview } = useMyReview(courseId, user?.id, isAuthenticated);
  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch additional data - chỉ khi user đã enrolled hoặc là instructor
  const { data: progressData } = useCourseProgress(courseId, !!canAccessContent);

  // Fetch user certificates để check xem có certificate cho course này không
  const { data: userCertificates } = useUserCertificates(user?.id || '', {
    enabled: !!user?.id && isAuthenticated,
  });

  // Tìm certificate của user cho course hiện tại
  const courseCertificate = userCertificates?.find(
    (cert) => cert.course_id === courseId && cert.status && cert.status === 'active'
  );

  // Disable text selection và F12 khi ở tab certificate
  useEffect(() => {
    if (activeTab === 'certificate') {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      const handleKeyDown = (e: KeyboardEvent) => {
        // F12
        if (e.key === 'F12') {
          e.preventDefault();
          return false;
        }
        // Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
          e.preventDefault();
          return false;
        }
        // Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
          e.preventDefault();
          return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
          e.preventDefault();
          return false;
        }
        // Ctrl+S (Save Page)
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          return false;
        }
      };

      // Disable right-click context menu
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };

      // Disable text selection
      const handleSelectStart = (e: Event) => {
        e.preventDefault();
        return false;
      };

      // Disable drag
      const handleDragStart = (e: DragEvent) => {
        e.preventDefault();
        return false;
      };

      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('selectstart', handleSelectStart);
      document.addEventListener('dragstart', handleDragStart);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('selectstart', handleSelectStart);
        document.removeEventListener('dragstart', handleDragStart);
      };
    }
  }, [activeTab]);

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
  // Logic giống hệt với quizzes
  const { data: allAssignments } = useQuery<Assignment[]>({
    queryKey: ['all-assignments-detail', courseId],
    queryFn: async () => {
      try {
        const res = await assignmentApi.getCourseAssignments(courseId);
        
        // Xử lý response giống quiz - có thể là array hoặc { data: [...] }
        const list = Array.isArray((res as any)?.data) ? (res as any).data : Array.isArray(res) ? res : [];
        
        const filtered = list
          .filter((a: any) => {
            // Chỉ lấy assignments đã published, không có lesson_id (giống quiz)
            const hasLessonId = a.lesson_id != null && a.lesson_id !== '';
            const isPublished = a.is_published === true;
            const result = !hasLessonId && isPublished;
            return result;
          })
          .sort((a: any, b: any) => {
            // Sắp xếp theo created_at (cũ nhất trước) - giống quiz
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateA - dateB; // ASC: cũ nhất trước
          });
        
        return filtered;
      } catch (error: any) {
        console.error('[DetailPage] Error fetching assignments:', error);
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
    queryKey: ['quiz-attempts-for-completion', courseId, canAccessContent],
    queryFn: async () => {
      if (!canAccessContent || !allQuizzes || allQuizzes.length === 0) return [];
      
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
    enabled: !!canAccessContent && !!allQuizzes && allQuizzes.length > 0,
    staleTime: 60 * 1000,
  });

  // Fetch assignment submissions
  const { data: assignmentSubmissions } = useQuery({
    queryKey: ['assignment-submissions-for-completion', courseId, canAccessContent],
    queryFn: async () => {
      if (!canAccessContent || !allAssignments || allAssignments.length === 0) return [];
      
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
    enabled: !!canAccessContent && !!allAssignments && allAssignments.length > 0,
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
    // Nếu section đã có quizzes/assignments từ courseContent (backend), dùng chúng
    // Nếu không, thêm từ sectionLevelQuizzes/sectionLevelAssignments (fetch riêng)
    const sectionQuizzes = (section.quizzes && section.quizzes.length > 0) 
      ? section.quizzes 
      : sectionLevelQuizzes.filter((q: any) => {
          const quizSectionId = q.section_id ? String(q.section_id).trim() : null;
          const currentSectionId = section.id ? String(section.id).trim() : null;
          return quizSectionId === currentSectionId && quizSectionId !== null;
        });

    // Ưu tiên dùng assignments từ courseContent (backend), nếu không có thì dùng từ sectionLevelAssignments (fetch riêng)
    // Đảm bảo luôn filter và gán assignments vào sections, kể cả khi section đến từ fallback (course.sections)
    // Logic giống hệt với quizzes
    const sectionAssignments = (section.assignments && section.assignments.length > 0)
      ? section.assignments
      : sectionLevelAssignments.filter((a: any) => {
          // Convert sang string và trim để so sánh chính xác (giống quiz)
          const assignmentSectionId = a.section_id ? String(a.section_id).trim() : null;
          const currentSectionId = section.id ? String(section.id).trim() : null;
          const match = assignmentSectionId && currentSectionId && assignmentSectionId === currentSectionId;
          return match;
        });

    // Merge completion status từ progressData vào lessons
    const sectionProgress = progressData?.sections?.find((s: any) => s.section_id === section.id);
    const completedLessonMap = new Map(
      sectionProgress?.lessons?.map((l: any) => [l.lesson_id, l.is_completed]) || []
    );

    // Thêm quizzes và assignments vào section (riêng biệt, không merge vào lessons)
    // CurriculumTree sẽ hiển thị chúng riêng biệt từ section.quizzes và section.assignments
    return {
      ...section,
      // Giữ nguyên lessons (chỉ lessons thật, không bao gồm quiz/assignment)
      lessons: (section.lessons || []).map((lesson: any) => ({
        ...lesson,
        is_completed: completedLessonMap.get(lesson.id) || completedLessonIds.has(lesson.id) || false,
      })),
      // Thêm quizzes và assignments riêng biệt
      quizzes: sectionQuizzes.length > 0 ? sectionQuizzes.map((quiz: any) => ({
        ...quiz,
        is_completed: !quiz.is_practice && completedQuizIds.has(quiz.id),
      })) : undefined,
      assignments: sectionAssignments.length > 0 ? sectionAssignments.map((assignment: any) => ({
        ...assignment,
        is_completed: !assignment.is_practice && completedAssignmentIds.has(assignment.id),
      })) : (sectionAssignments.length === 0 && sectionLevelAssignments.some((a: any) => {
        const aSectionId = a.section_id ? String(a.section_id).trim() : null;
        const currentSectionId = section.id ? String(section.id).trim() : null;
        return aSectionId === currentSectionId;
      })) ? [] : undefined,
    };
  });
  const learningPath = courseId ? generateRoute.student.learning(courseId) : ROUTES.COURSES;

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
      if (canAccessContent) {
        navigate(generateRoute.student.quiz(courseId, quizId));
      } else {
        toast.error('Vui lòng đăng ký khóa học để làm bài kiểm tra');
      }
      return;
    }

    if (lessonId.startsWith('assignment-')) {
      const assignmentId = lessonId.replace('assignment-', '');
      if (canAccessContent) {
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
    // 2. Là instructor của course, HOẶC
    // 3. Lesson có is_free_preview = true (cho phép xem trước miễn phí)
    if (canAccessContent || isFreePreview) {
      navigate(generateRoute.student.lesson(courseId, lessonId));
    } else {
      // Nếu chưa enrolled và không phải preview lesson, yêu cầu đăng ký
      toast.error('Vui lòng đăng ký khóa học để xem nội dung bài học');
    }
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

    // Nếu đã enrolled hoặc là instructor, navigate đến learning page ngay
    if (canAccessContent) {
      // Tìm lesson đầu tiên từ curriculumSections (public data, đã có sẵn)
      // Hoặc từ courseContent nếu đã có
      const sectionsToUse = (courseContent?.sections && courseContent.sections.length > 0)
        ? courseContent.sections
        : curriculumSections;
      
      const firstLesson = sectionsToUse
        .flatMap(s => s.lessons || [])
        .find(lesson => lesson);
      
      if (firstLesson) {
        // Navigate đến trang chi tiết bài học đầu tiên
        navigate(generateRoute.student.lesson(courseId, firstLesson.id));
      } else {
        // Nếu không có lesson, navigate đến learning page
        navigate(learningPath);
      }
      return;
    }

    // Enroll trực tiếp không cần modal
    enrollCourse(courseId, {
      onSuccess: async () => {
        setIsUserEnrolled(true);
        setMissingPrereqs([]);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.enrolled() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lessons.content(courseId) });
        
        // Refetch courseContent để có data mới nhất
        await queryClient.refetchQueries({ queryKey: QUERY_KEYS.lessons.content(courseId) });
        
        // Đợi một chút để data được update
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Lấy data mới nhất từ cache
        const updatedCourseContent = queryClient.getQueryData<{ data?: CourseContent }>(
          QUERY_KEYS.lessons.content(courseId)
        );
        
        // Tìm lesson đầu tiên từ nhiều nguồn (ưu tiên courseContent, sau đó course.sections)
        const sectionsToUse = (updatedCourseContent?.data?.sections && updatedCourseContent.data.sections.length > 0)
          ? updatedCourseContent.data.sections
          : (course?.sections && course.sections.length > 0)
          ? course.sections
          : [];
        
        const firstLesson = sectionsToUse
          .flatMap(s => s.lessons || [])
          .find(lesson => lesson);
        
        if (firstLesson) {
          // Navigate đến trang chi tiết bài học đầu tiên
          navigate(generateRoute.student.lesson(courseId, firstLesson.id));
        } else {
          // Nếu không có lesson, navigate đến learning page
          navigate(learningPath);
        }
      },
      onError: (error: any) => {
        console.error('Enrollment failed:', error);
        const errorMessage = error?.response?.data?.message || '';
        const missing = error?.response?.data?.missingPrerequisites || error?.response?.data?.data?.missingPrerequisites;
        
        // Nếu lỗi là "already enrolled", xử lý như đã enrolled
        if (errorMessage.toLowerCase().includes('already enrolled') || 
            errorMessage.toLowerCase().includes('đã đăng ký')) {
          setIsUserEnrolled(true);
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.detail(courseId) });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.courses.enrolled() });
          
          // Navigate đến learning page
          const sectionsToUse = (courseContent?.sections && courseContent.sections.length > 0)
            ? courseContent.sections
            : curriculumSections;
          
          const firstLesson = sectionsToUse
            .flatMap(s => s.lessons || [])
            .find(lesson => lesson);
          
          if (firstLesson) {
            navigate(generateRoute.student.lesson(courseId, firstLesson.id));
          } else {
            navigate(learningPath);
          }
        } else if (missing && Array.isArray(missing) && missing.length > 0) {
          setMissingPrereqs(missing);
          toast.error('Bạn cần hoàn thành các khóa học yêu cầu trước.');
        } else {
          toast.error(errorMessage || 'Không thể đăng ký khóa học. Vui lòng thử lại.');
        }
      }
    });
  };

  const handlePrimaryAction = () => {
    if (!courseId) {
      return;
    }

    if (canAccessContent) {
      // Tìm bài học đầu tiên từ curriculumSections
      const firstLesson = (() => {
        // Sắp xếp sections theo order_index
        const sortedSections = [...curriculumSections].sort(
          (a, b) => (a.order_index || 0) - (b.order_index || 0)
        );
        
        // Tìm bài học đầu tiên (lesson thật, không phải quiz/assignment)
        for (const section of sortedSections) {
          if (section.lessons && section.lessons.length > 0) {
            // Sắp xếp lessons theo order_index
            const sortedLessons = [...section.lessons].sort(
              (a, b) => (a.order_index || 0) - (b.order_index || 0)
            );
            
            // Tìm lesson đầu tiên (content_type là video, document, text, link - không phải quiz/assignment)
            const firstRealLesson = sortedLessons.find(
              (lesson: any) => 
                lesson.content_type && 
                ['video', 'document', 'text', 'link'].includes(lesson.content_type) &&
                lesson.id &&
                !lesson.id.startsWith('quiz-') &&
                !lesson.id.startsWith('assignment-')
            );
            
            if (firstRealLesson) {
              return firstRealLesson;
            }
          }
        }
        
        return null;
      })();
      
      // Nếu có bài học đầu tiên, navigate đến nó
      if (firstLesson && firstLesson.id) {
        navigate(generateRoute.student.lesson(courseId, firstLesson.id));
        return;
      }
      
      // Fallback về trang learning nếu không có bài học
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
    <LayoutWrapper>
      {/* Hero section */}
      <div className="relative bg-gradient-to-b from-teal-400 via-teal-500 to-green-600 text-white overflow-hidden">
        {/* Decorative background elements - làm mờ */}
        <div className="absolute inset-0 opacity-10">
          {/* Animated floating circles - làm mờ */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Animated geometric shapes - làm mờ */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 border-4 border-white/30 rounded-lg rotate-45 animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-24 h-24 border-4 border-white/30 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/20 rounded-lg rotate-12 animate-bounce" style={{ animationDuration: '3s' }}></div>
          <div className="absolute bottom-10 left-1/2 w-20 h-20 border-2 border-white/40 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
          
          {/* Additional animated circles - làm mờ */}
          <div className="absolute top-20 right-1/4 w-40 h-40 border-3 border-white/25 rounded-full animate-pulse" style={{ animationDelay: '0.8s', animationDuration: '3s' }}></div>
          <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '2.5s' }}></div>
        </div>

        {/* Pattern overlay - grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Gradient mesh overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>

        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Course info */}
            <div className="lg:col-span-2 relative">
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

              {/* Last Updated - góc dưới bên trái */}
              {course.updated_at && (
                <div className="absolute bottom-0 left-0 flex items-center gap-2 text-sm text-blue-100">
                  <Clock className="w-4 h-4" />
                  <span>
                    Cập nhật gần nhất: {format(new Date(course.updated_at), 'dd/MM/yyyy', { locale: vi })}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Thumbnail collage */}
            <div className="lg:col-span-1 sticky top-8">
              {(() => {
                // Dùng logo mặc định nếu course không có thumbnail để tránh vỡ hero và mất nút CTA
                const realThumbnail = getCourseThumbnailUrl(course);
                const isFallback = !realThumbnail;
                const thumbnailUrl = realThumbnail || '/GekLearn.png';
                
                return (
                  <div className="relative w-full aspect-video">
                    {/* 2 ảnh nhỏ phía sau - làm mờ (luôn hiển thị, fallback cũng dùng logo) */}
                    <div className="absolute -top-8 -left-8 w-1/2 h-1/2 rounded-lg overflow-hidden opacity-60 blur-sm z-0 bg-white">
                      <img
                        src={thumbnailUrl}
                        alt={course.title}
                        className={`w-full h-full ${isFallback ? 'object-contain p-3' : 'object-cover'}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/GekLearn.png';
                          target.classList.remove('object-cover');
                          target.classList.add('object-contain', 'p-3');
                        }}
                      />
                    </div>
                    <div className="absolute -bottom-8 -right-8 w-1/2 h-1/2 rounded-lg overflow-hidden opacity-60 blur-sm z-0 bg-white">
                      <img
                        src={thumbnailUrl}
                        alt={course.title}
                        className={`w-full h-full ${isFallback ? 'object-contain p-3' : 'object-cover'}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/GekLearn.png';
                          target.classList.remove('object-cover');
                          target.classList.add('object-contain', 'p-3');
                        }}
                      />
                    </div>
                    
                    {/* Ảnh chính ở giữa */}
                    <div
                      className={`relative w-full h-full rounded-lg overflow-hidden shadow-xl z-10 ${isFallback ? 'bg-white flex items-center justify-center' : ''}`}
                    >
                      <img
                        src={thumbnailUrl}
                        alt={course.title}
                        className={`w-full h-full ${isFallback ? 'object-contain p-6' : 'object-cover'}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/GekLearn.png';
                          target.classList.remove('object-cover');
                          target.classList.add('object-contain', 'p-6');
                        }}
                      />
                      
                      {/* Nút Join course nhỏ ở góc */}
                      <button
                        onClick={handlePrimaryAction}
                        disabled={isEnrolling}
                        className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-20 flex items-center gap-1.5"
                      >
                        {isEnrolling ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            <span>Đang đăng ký...</span>
                          </>
                        ) : canAccessContent ? (
                          'Vào học'
                        ) : (
                          'Tham gia'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}
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
            Đánh giá {course?.total_ratings ? `(${course.total_ratings})` : ''}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'certificate'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Chứng nhận
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Tab content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' ? (
              <div className="space-y-8">
                {/* What you'll learn */}
                {course.learning_objectives && course.learning_objectives.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Bạn sẽ học được gì</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.learning_objectives.map((objective: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {course.tags && Array.isArray(course.tags) && course.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="info" className="px-3 py-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

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

                {/* Prerequisites */}
                {(prerequisitesData?.data && prerequisitesData.data.length > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Yêu cầu trước (Prerequisites)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {prerequisitesData.data.map((p) => (
                          <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {p.prerequisite_course?.title || 'Khóa học yêu cầu'}
                              </div>
                              <div className="text-xs text-gray-500">ID: {p.prerequisite_course_id}</div>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${p.is_required ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                              {p.is_required ? 'Bắt buộc' : 'Khuyến nghị'}
                            </span>
                          </div>
                        ))}
                      </div>
                      {missingPrereqs.length > 0 && (
                        <div className="mt-3 text-sm text-red-600">
                          Bạn còn thiếu: {missingPrereqs.map((m) => m.title || m.id).join(', ')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

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
              ) : activeTab === 'certificate' ? (
              // Certificate preview tab - design từ pdf.service.ts
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Chứng nhận hoàn thành khóa học</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white p-8 md:p-12">
                      {/* Certificate Preview - Design từ pdf.service.ts */}
                      <div className="max-w-4xl mx-auto">
                        <div 
                          className="relative bg-white select-none" 
                          style={{ 
                            fontFamily: 'Garamond, Georgia, Times New Roman, serif',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            WebkitTouchCallout: 'none',
                            pointerEvents: 'auto'
                          } as React.CSSProperties}
                          onContextMenu={(e) => e.preventDefault()}
                          onDragStart={(e) => e.preventDefault()}
                        >
                          {/* Main double border */}
                          <div className="absolute inset-0 border-4 border-double border-gray-800 pointer-events-none" style={{ top: '12mm', left: '12mm', right: '12mm', bottom: '12mm' }}></div>
                          <div className="absolute inset-0 border border-gray-700 pointer-events-none" style={{ top: '15mm', left: '15mm', right: '15mm', bottom: '15mm' }}></div>
                          
                          {/* Official seal watermark - circular */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-amber-200 rounded-full opacity-8 pointer-events-none"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 border border-amber-100 rounded-full opacity-5 pointer-events-none"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-300 text-xs font-bold tracking-widest opacity-4 pointer-events-none whitespace-nowrap">
                            OFFICIAL CERTIFICATE
                          </div>

                          {/* Certificate Content */}
                          <div 
                            className="relative z-10 p-8 md:p-12 select-none"
                            style={{ 
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                              MozUserSelect: 'none',
                              msUserSelect: 'none',
                              WebkitTouchCallout: 'none'
                            } as React.CSSProperties}
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                            onCopy={(e) => e.preventDefault()}
                            onCut={(e) => e.preventDefault()}
                            onPaste={(e) => e.preventDefault()}
                          >
                            {/* Header */}
                            <div className="text-center mb-12" style={{ paddingTop: '8mm' }}>
                              <div className="text-lg font-bold text-gray-900 tracking-widest uppercase mb-2 select-none" style={{ letterSpacing: '3px', userSelect: 'none' }}>
                                GekLearn
                              </div>
                              <div className="text-xs text-gray-600 italic mb-10 tracking-wide select-none" style={{ letterSpacing: '1px', userSelect: 'none' }}>
                                PhucNguyen, NguyenChidi, KimHuong
                              </div>
                              
                              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-widest uppercase mb-3 py-5 select-none" style={{ letterSpacing: '6px', fontSize: '38px', userSelect: 'none' }}>
                                Certificate
                              </h1>
                              <p className="text-sm text-gray-700 tracking-wide uppercase select-none" style={{ letterSpacing: '2px', fontSize: '13px', userSelect: 'none' }}>
                                of Completion
                              </p>
                            </div>

                            {/* Body */}
                            <div className="text-center px-8 md:px-12 mb-5 select-none">
                              <p className="text-sm text-gray-700 mb-5 tracking-wide uppercase font-semibold select-none" style={{ letterSpacing: '2px', fontSize: '14px', userSelect: 'none' }}>
                                This is presented to
                              </p>
                              
                              <div className="text-4xl md:text-5xl font-bold text-gray-900 my-8 leading-tight pb-3 tracking-wide select-none" style={{ fontSize: '42px', letterSpacing: '2px', userSelect: 'none' }}>
                                [Student Name]
                              </div>
                              
                              <p className="text-sm text-gray-700 leading-relaxed my-6 max-w-2xl mx-auto font-normal select-none" style={{ fontSize: '13px', lineHeight: '1.6', userSelect: 'none' }}>
                                In recognition of successful completion of the comprehensive course of study and 
                                demonstrated proficiency in the subject matter as prescribed by the curriculum requirements
                              </p>
                              
                              {/* Course Info */}
                              <div className="my-7 py-7 px-8 select-none">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight tracking-wide select-none" style={{ fontSize: '26px', letterSpacing: '1px', userSelect: 'none' }}>
                                  [Course Title]
                                </h2>
                                <div className="flex justify-center gap-12 md:gap-20 text-xs text-gray-600 mt-5 select-none" style={{ fontSize: '12px', userSelect: 'none' }}>
                                  <div className="text-center">
                                    <div className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-widest select-none" style={{ fontSize: '10px', letterSpacing: '1.5px', userSelect: 'none' }}>
                                      Instructed By
                                    </div>
                                    <div className="text-sm font-semibold text-gray-700 select-none" style={{ fontSize: '13px', userSelect: 'none' }}>
                                      [Instructor Name]
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-widest select-none" style={{ fontSize: '10px', letterSpacing: '1.5px', userSelect: 'none' }}>
                                      Course Level
                                    </div>
                                    <div className="text-sm font-semibold text-gray-700 select-none" style={{ fontSize: '13px', userSelect: 'none' }}>
                                      [Level]
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Completion Info */}
                              <div className="flex justify-center gap-12 md:gap-16 my-7 select-none">
                                <div className="text-center py-6 px-8 bg-white min-w-32 select-none">
                                  <div className="text-xs text-gray-600 mb-3 uppercase tracking-widest font-bold select-none" style={{ fontSize: '10px', letterSpacing: '1.5px', userSelect: 'none' }}>
                                    Date of Completion
                                  </div>
                                  <div className="text-lg font-bold text-gray-900 select-none" style={{ fontSize: '18px', userSelect: 'none' }}>
                                    [Date]
                                  </div>
                                </div>
                                <div className="text-center py-6 px-8 bg-white min-w-32 select-none">
                                  <div className="text-xs text-gray-600 mb-3 uppercase tracking-widest font-bold select-none" style={{ fontSize: '10px', letterSpacing: '1.5px', userSelect: 'none' }}>
                                    Final Achievement
                                  </div>
                                  <div className="text-lg font-bold text-gray-900 select-none" style={{ fontSize: '18px', userSelect: 'none' }}>
                                    [Grade]%
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Footer */}
                            <div className="pt-8 mt-6 select-none">
                              <div className="text-center select-none">
                                <div className="text-xs text-gray-900 mb-3 uppercase tracking-wide font-bold select-none" style={{ letterSpacing: '2px', fontSize: '12px', userSelect: 'none' }}>
                                  Số chứng chỉ <span className="font-mono text-sm bg-gray-100 px-3 py-1 ml-2 inline-block select-none" style={{ fontSize: '14px', letterSpacing: '2px', fontFamily: 'Courier New, monospace', userSelect: 'none' }}>[CERT-XXXXXX]</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-3 leading-relaxed select-none" style={{ fontSize: '9px', lineHeight: '1.5', userSelect: 'none' }}>
                                  <p className="select-none" style={{ userSelect: 'none' }}>URL xác minh:</p>
                                  <p className="text-gray-700 font-mono text-xs mt-1 break-all select-none" style={{ fontSize: '8px', fontWeight: '500', fontFamily: 'Courier New, monospace', userSelect: 'none' }}>
                                    [Verification URL]
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Info Text */}
                      <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                          Đây là mẫu chứng nhận. Chứng nhận thực tế sẽ được cấp sau khi bạn hoàn thành khóa học.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              ) : activeTab === 'reviews' ? (
              // Reviews tab
              <div className="space-y-6">
                {/* Rating Display */}
                {course && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Đánh giá khóa học</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="text-4xl font-bold text-gray-900">
                          {course.rating?.toFixed(1) || '0.0'}
                        </div>
                        <div>
                          <RatingDisplay
                            rating={course.rating || 0}
                            totalRatings={course.total_ratings || 0}
                            size="lg"
                          />
                        </div>
                      </div>

                      {/* Review Form - chỉ hiển thị nếu user đã enrolled và chưa có review */}
                      {isUserEnrolled && isAuthenticated && !myReview && !showReviewForm && (
                        <div className="border-t pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setShowReviewForm(true)}
                          >
                            Viết đánh giá
                          </Button>
                        </div>
                      )}

                      {/* Review Form */}
                      {(showReviewForm || (myReview && isEditingReview)) && (
                        <div className="border-t pt-4 mt-4">
                          <RatingForm
                            courseId={courseId}
                            initialRating={myReview?.rating || 0}
                            initialComment={myReview?.comment || ''}
                            isEditing={!!myReview}
                            onSubmit={async (rating, comment) => {
                              if (myReview) {
                                await updateReviewMutation.mutateAsync({
                                  reviewId: myReview.id,
                                  payload: { rating, comment },
                                });
                                setIsEditingReview(false);
                                setShowReviewForm(false);
                              } else {
                                await createReviewMutation.mutateAsync({
                                  course_id: courseId,
                                  rating,
                                  comment,
                                });
                                setShowReviewForm(false);
                              }
                            }}
                            onCancel={() => {
                              setShowReviewForm(false);
                              setIsEditingReview(false);
                            }}
                          />
                        </div>
                      )}

                      {/* My Review Display */}
                      {myReview && !isEditingReview && !showReviewForm && (
                        <div className="border-t pt-4 mt-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-medium text-gray-900 mb-1">
                                  Đánh giá của bạn
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <RatingDisplay
                                    rating={myReview.rating}
                                    totalRatings={0}
                                    showLabel={false}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setIsEditingReview(true)}
                                >
                                  Sửa
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    if (confirm('Bạn có chắc muốn xóa đánh giá này?')) {
                                      await deleteReviewMutation.mutateAsync(myReview.id);
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Xóa
                                </Button>
                              </div>
                            </div>
                            {myReview.comment && (
                              <p className="text-gray-700 mt-2">{myReview.comment}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Reviews List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tất cả đánh giá</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewsList
                      reviews={reviewsData?.reviews || []}
                      stats={reviewStats}
                      currentUserId={user?.id}
                      isLoading={isLoadingReviews}
                      hasMore={
                        reviewsData?.pagination
                          ? reviewPage < reviewsData.pagination.totalPages
                          : false
                      }
                      onLoadMore={() => setReviewPage((p) => p + 1)}
                      onEdit={(review) => {
                        setIsEditingReview(true);
                        setShowReviewForm(true);
                      }}
                      onDelete={async (reviewId) => {
                        if (confirm('Bạn có chắc muốn xóa đánh giá này?')) {
                          await deleteReviewMutation.mutateAsync(reviewId);
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
              ) : (
              // Curriculum tab - hiển thị nội dung hoặc thông báo
              curriculumSections.length > 0 || (courseLevelQuizzes && courseLevelQuizzes.length > 0) || (courseLevelAssignments && courseLevelAssignments.length > 0) ? (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
                  {/* Sections - hiển thị trước */}
                  {curriculumSections.length > 0 && (
                    <div className="[&>div]:border-0 [&>div]:rounded-none [&>div]:shadow-none">
                      <CurriculumTree
                        sections={curriculumSections}
                        onLessonClick={handleLessonPreviewClick}
                        onQuizClick={(quizId) => {
                          if (canAccessContent) {
                            navigate(generateRoute.student.quiz(courseId, quizId));
                          } else {
                            toast.error('Vui lòng đăng ký khóa học để làm bài kiểm tra');
                          }
                        }}
                        onAssignmentClick={(assignmentId) => {
                          if (canAccessContent) {
                            navigate(generateRoute.student.assignment(courseId, assignmentId));
                          } else {
                            toast.error('Vui lòng đăng ký khóa học để làm bài tập');
                          }
                        }}
                        courseLevelQuizzes={courseLevelQuizzes}
                        courseLevelAssignments={courseLevelAssignments}
                        isPreviewMode={true}
                      />
                    </div>
                  )}
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
                      <span>{course.total_students || 0} học viên</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {course.total_ratings && course.total_ratings > 0 ? (
                        <RatingDisplay
                          rating={course.rating || 0}
                          totalRatings={course.total_ratings}
                          size="sm"
                        />
                      ) : (
                        <span className="text-gray-500">Chưa có đánh giá</span>
                      )}
                    </div>
                  </div>

                  {/* Nút nhắn tin với giảng viên - chỉ hiển thị khi đã enrolled */}
                  {isUserEnrolled && (course.instructor?.id || course.instructor_id) && (
                    <Button
                      variant="outline"
                      fullWidth
                      className="mt-4 gap-2"
                      onClick={() => navigate(generateRoute.shared.dmWithUser(course.instructor?.id || course.instructor_id))}
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

                      {/* Certificate Badge - hiển thị nếu user đã có certificate */}
                      {courseCertificate && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <Link
                            to={`/certificates/${courseCertificate.id}`}
                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-colors group"
                          >
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                              <Award className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                Chứng chỉ hoàn thành
                              </p>
                              <p className="text-xs text-gray-600">
                                Xem chứng chỉ của bạn
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        </div>
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
    </LayoutWrapper>
  );
}

export default DetailPage;
