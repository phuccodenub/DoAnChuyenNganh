import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Clock, 
  CheckCircle,
  PlayCircle,
  FileText,
  Monitor,
  ArrowLeft,
  AlertCircle,
  ClipboardList
} from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import { PageWrapper } from '@/components/courseEditor';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CurriculumTree } from '@/components/domain/lesson/CurriculumTree';
import { DocumentViewer } from '@/components/domain/lesson/DocumentViewer';
import { useLesson, useCourseContent, useMarkLessonComplete } from '@/hooks/useLessonData';
import { useCourse, useCourseProgress } from '@/hooks/useCoursesData';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, generateRoute } from '@/constants/routes';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { toast } from 'react-hot-toast';
import type { Lesson, Section, LessonDetail } from '@/services/api/lesson.api';
import { httpClient } from '@/services/http/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { quizApi, type Quiz } from '@/services/api/quiz.api';
import { assignmentApi, type Assignment } from '@/services/api/assignment.api';

/**
 * Convert R2 URL to proxy URL to avoid CORS issues
 */
function getVideoProxyUrl(videoUrl: string): string {
  // Check if it's an R2 URL (contains .r2.dev)
  if (videoUrl.includes('.r2.dev')) {
    const baseURL = httpClient.defaults.baseURL || '/api/v1.3.0';
    return `${baseURL}/media/video-proxy?url=${encodeURIComponent(videoUrl)}`;
  }
  // Return original URL for YouTube, Vimeo, or other sources
  return videoUrl;
}

/**
 * Component để hiển thị nội dung bài học theo content_type
 * Tự động đánh dấu hoàn thành khi học sinh xem bài học
 */
function LessonContentView({ lesson, onAutoComplete }: { lesson: LessonDetail; onAutoComplete?: () => void }) {
  const navigate = useNavigate();

  // ====== Quiz metadata: ưu tiên dùng quiz_id từ BE thay vì match theo title ======
  const courseId = lesson.course?.id || (lesson.section as any)?.course?.id;
  const isQuizLesson = lesson.content_type === 'quiz';
  const quizIdFromLesson = (lesson as any).quiz_id as string | undefined;

  const { data: resolvedQuiz } = useQuery<Quiz | null>({
    queryKey: ['lesson-quiz-by-id', quizIdFromLesson],
    queryFn: async () => {
      if (!quizIdFromLesson) return null;
      return await quizApi.getQuiz(quizIdFromLesson);
    },
    enabled: !!quizIdFromLesson && isQuizLesson,
    staleTime: 60 * 1000,
  });

  // Debug: Log content để kiểm tra format
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[LessonContentView] Rendering lesson:', {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        contentType: lesson.content_type,
        hasContent: !!lesson.content,
        contentLength: lesson.content?.length || 0,
        contentPreview: lesson.content?.substring(0, 200) || 'NO CONTENT',
        contentStartsWithHTML: lesson.content?.trim().startsWith('<') || false,
      });
    }
  }, [lesson.id, lesson.content, lesson.content_type, lesson.title]);

  if (lesson.content_type === 'video') {
    // Kiểm tra nếu là YouTube/Vimeo URL
    const isYouTube = lesson.video_url?.includes('youtube.com') || lesson.video_url?.includes('youtu.be');
    const isVimeo = lesson.video_url?.includes('vimeo.com');
    const isExternalVideo = isYouTube || isVimeo;
    
    // Kiểm tra nếu là blob URL (tạm thời, không hợp lệ)
    const isBlobUrl = lesson.video_url?.startsWith('blob:');
    
    // Lấy content/description để hiển thị (ưu tiên content, sau đó description)
    const contentToRender = lesson.content || lesson.description || '';
    const contentRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hasAutoCompletedRef = useRef(false);
    
    // Set innerHTML trực tiếp vào DOM element
    useEffect(() => {
      if (contentRef.current && contentToRender) {
        contentRef.current.innerHTML = '';
        contentRef.current.innerHTML = contentToRender;
      }
    }, [contentToRender]);

    // Auto-mark complete cho text content: khi scroll đến cuối hoặc sau 30 giây
    useEffect(() => {
      if (!contentToRender || hasAutoCompletedRef.current || lesson.is_completed) return;

      let timer: NodeJS.Timeout;
      let scrollTimer: NodeJS.Timeout;

      // Timer: tự động mark sau 30 giây nếu có content
      timer = setTimeout(() => {
        if (!hasAutoCompletedRef.current && !lesson.is_completed && onAutoComplete) {
          hasAutoCompletedRef.current = true;
          onAutoComplete();
        }
      }, 30000); // 30 giây

      // Scroll detection: mark khi scroll đến cuối
      const handleScroll = () => {
        if (hasAutoCompletedRef.current || lesson.is_completed) return;
        
        const element = contentRef.current;
        if (!element) return;

        const scrollTop = element.scrollTop || window.scrollY;
        const scrollHeight = element.scrollHeight || document.documentElement.scrollHeight;
        const clientHeight = element.clientHeight || window.innerHeight;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        // Nếu scroll đến 90% cuối cùng
        if (scrollPercentage >= 0.9) {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(() => {
            if (!hasAutoCompletedRef.current && !lesson.is_completed && onAutoComplete) {
              hasAutoCompletedRef.current = true;
              onAutoComplete();
            }
          }, 2000); // Đợi 2 giây để đảm bảo user thực sự đọc
        }
      };

      const element = contentRef.current;
      if (element) {
        element.addEventListener('scroll', handleScroll);
        window.addEventListener('scroll', handleScroll);
      }

      return () => {
        clearTimeout(timer);
        clearTimeout(scrollTimer);
        if (element) {
          element.removeEventListener('scroll', handleScroll);
          window.removeEventListener('scroll', handleScroll);
        }
      };
    }, [contentToRender, lesson.is_completed, onAutoComplete]);

    // Handle video ended - tự động mark complete
    const handleVideoEnded = () => {
      if (!hasAutoCompletedRef.current && !lesson.is_completed && onAutoComplete) {
        hasAutoCompletedRef.current = true;
        onAutoComplete();
      }
    };

    // Handle YouTube/Vimeo: track time-based (khó track chính xác, dùng fallback timer)
    useEffect(() => {
      if (!isExternalVideo || hasAutoCompletedRef.current || lesson.is_completed) return;

      // Với YouTube/Vimeo, dùng timer dựa trên duration (nếu có) hoặc 60 giây
      const estimatedDuration = lesson.duration_minutes ? lesson.duration_minutes * 60 * 1000 : 60000;
      const timer = setTimeout(() => {
        if (!hasAutoCompletedRef.current && !lesson.is_completed && onAutoComplete) {
          hasAutoCompletedRef.current = true;
          onAutoComplete();
        }
      }, Math.min(estimatedDuration, 120000)); // Tối đa 2 phút

      return () => clearTimeout(timer);
    }, [isExternalVideo, lesson.duration_minutes, lesson.is_completed, onAutoComplete]);
    
    return (
      <div className="space-y-6">
        {/* Nội dung tài liệu (content) - Hiển thị bình thường, giống hệt phần PDF */}
        {contentToRender && (
          <div 
            ref={contentRef}
            className="max-w-none lesson-content"
            style={{
              whiteSpace: 'normal',
              fontFamily: 'inherit',
              lineHeight: '1.6',
              color: '#333'
            }}
          />
        )}

        {/* Video Player - Hiển thị ở dưới */}
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
          {lesson.video_url && !isBlobUrl ? (
            isExternalVideo ? (
              // YouTube/Vimeo embed
              <iframe
                src={
                  isYouTube
                    ? lesson.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                    : lesson.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')
                }
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              // Direct video file (R2 hoặc server) - sử dụng proxy để tránh CORS
              <video
                ref={videoRef}
                controls
                className="w-full h-full"
                src={lesson.video_url ? getVideoProxyUrl(lesson.video_url) : ''}
                crossOrigin="anonymous"
                onEnded={handleVideoEnded}
                onError={(e) => {
                  console.error('[LessonContentView] Video playback error:', {
                    originalUrl: lesson.video_url,
                    proxyUrl: lesson.video_url ? getVideoProxyUrl(lesson.video_url) : '',
                    error: e
                  });
                }}
              >
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  {isBlobUrl ? 'Video đang được tải lên...' : 'Video chưa được tải lên'}
                </p>
                {isBlobUrl && (
                  <p className="text-sm text-gray-400 mt-2">
                    Vui lòng đợi video được upload hoàn tất
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (lesson.content_type === 'document' || lesson.content_type === 'text') {
    // Lấy tất cả PDF materials
    const pdfMaterials = lesson.materials?.filter(
      (m) => m.file_extension?.toLowerCase() === '.pdf' || 
             m.file_type === 'application/pdf' || 
             m.file_type?.includes('pdf')
    ) || [];

    // Lấy content để hiển thị
    const contentToRender = lesson.content || '';
    const contentRef = useRef<HTMLDivElement>(null);
    const hasAutoCompletedRef = useRef(false);
    
    // Set innerHTML trực tiếp vào DOM element
    useEffect(() => {
      if (contentRef.current && contentToRender) {
        // Clear content trước khi set để tránh hiển thị giá trị cũ
        contentRef.current.innerHTML = '';
        // Set content mới
        contentRef.current.innerHTML = contentToRender;
      }
    }, [contentToRender]);

    // Auto-mark complete: khi scroll đến cuối hoặc sau 30 giây
    useEffect(() => {
      if (hasAutoCompletedRef.current || lesson.is_completed) return;

      let timer: NodeJS.Timeout;
      let scrollTimer: NodeJS.Timeout;

      // Timer: tự động mark sau 30 giây
      timer = setTimeout(() => {
        if (!hasAutoCompletedRef.current && !lesson.is_completed && onAutoComplete) {
          hasAutoCompletedRef.current = true;
          onAutoComplete();
        }
      }, 30000); // 30 giây

      // Scroll detection: mark khi scroll đến cuối
      const handleScroll = () => {
        if (hasAutoCompletedRef.current || lesson.is_completed) return;
        
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        // Nếu scroll đến 90% cuối cùng
        if (scrollPercentage >= 0.9) {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(() => {
            if (!hasAutoCompletedRef.current && !lesson.is_completed && onAutoComplete) {
              hasAutoCompletedRef.current = true;
              onAutoComplete();
            }
          }, 2000); // Đợi 2 giây để đảm bảo user thực sự đọc
        }
      };

      window.addEventListener('scroll', handleScroll);
      // Trigger ngay để check nếu content ngắn
      handleScroll();

      return () => {
        clearTimeout(timer);
        clearTimeout(scrollTimer);
        window.removeEventListener('scroll', handleScroll);
      };
    }, [lesson.is_completed, onAutoComplete]);
    
    // Debug: Log để kiểm tra
    if (process.env.NODE_ENV === 'development') {
      console.log('[LessonContentView] Before render:', {
        type: typeof contentToRender,
        length: contentToRender.length,
        firstChars: contentToRender.substring(0, 50),
        hasHTMLTags: contentToRender.includes('<'),
        hasEscapedTags: contentToRender.includes('&lt;'),
        pdfMaterialsCount: pdfMaterials.length,
        hasContent: !!contentToRender
      });
    }

    return (
      <div className="space-y-6">
        {/* Nội dung tài liệu (content) - Hiển thị bình thường */}
        {contentToRender && (
          <div 
            ref={contentRef}
            className="max-w-none lesson-content"
            style={{
              whiteSpace: 'normal',
              fontFamily: 'inherit',
              lineHeight: '1.6',
              color: '#333'
            }}
          />
        )}

        {/* File PDF (materials) - Hiển thị thêm ở dưới nếu có */}
        {pdfMaterials.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Tài liệu PDF</h3>
            </div>
            {pdfMaterials.map((pdfMaterial, index) => (
              <div key={pdfMaterial.id} className={index > 0 ? 'border-t border-gray-200' : ''}>
                <DocumentViewer
                  lessonId={lesson.id}
                  documentUrl={pdfMaterial.file_url}
                  title={pdfMaterial.file_name || lesson.title}
                  documentType="pdf"
                />
              </div>
            ))}
          </div>
        )}

        {/* Nếu không có cả content và PDF */}
        {!contentToRender && pdfMaterials.length === 0 && (
          <div className="bg-gray-50 p-12 rounded-lg border border-gray-200 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Nội dung bài học đang được cập nhật.</p>
          </div>
        )}
      </div>
    );
  }

  // Quiz lesson: điều hướng sang trang làm bài kiểm tra
  if (lesson.content_type === 'quiz') {
    const effectiveQuizId =
      (lesson as any).quiz_id as string | undefined || resolvedQuiz?.id;
    const practiceFlag =
      lesson.is_practice !== undefined ? lesson.is_practice : resolvedQuiz?.is_practice;

    if (!courseId || !effectiveQuizId) {
      return (
        <div className="bg-gray-50 p-12 rounded-lg border border-gray-200 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">
            Bài kiểm tra này đang được cấu hình. Vui lòng quay lại sau khi giảng viên hoàn tất liên kết.
          </p>
        </div>
      );
    }

    const handleStartQuiz = () => {
      navigate(generateRoute.student.quiz(courseId!, effectiveQuizId));
    };

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>{lesson.title}</CardTitle>
              {practiceFlag !== undefined && (
                <Badge 
                  variant={practiceFlag ? "warning" : "success"} 
                  size="md"
                >
                  {practiceFlag ? 'Luyện tập' : 'Tính điểm'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lesson.description && (
              <p className="text-gray-700">{lesson.description}</p>
            )}

            {lesson.is_practice && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Bài luyện tập</p>
                    <p>
                      Bài kiểm tra này không tính điểm vào tổng kết khóa học. 
                      Bạn có thể làm nhiều lần để luyện tập.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Thời lượng ước tính: {lesson.duration_minutes || 15} phút
                </span>
              </div>
              <Button onClick={handleStartQuiz}>
                Bắt đầu làm bài kiểm tra
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Assignment lesson: điều hướng sang trang giao bài tập
  if (lesson.content_type === 'assignment') {
    const courseId = lesson.course?.id;
    const assignmentId = (lesson as any).assignment_id as string | undefined;

    if (!courseId || !assignmentId) {
      return (
        <div className="bg-gray-50 p-12 rounded-lg border border-gray-200 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">
            Bài tập này đang được cấu hình. Vui lòng quay lại sau khi giảng viên hoàn tất liên kết.
          </p>
        </div>
      );
    }

    const handleViewAssignment = () => {
      navigate(generateRoute.student.assignment(courseId, assignmentId));
    };

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>{lesson.title}</CardTitle>
              {lesson.is_practice !== undefined && (
                <Badge 
                  variant={lesson.is_practice ? "warning" : "success"} 
                  size="md"
                >
                  {lesson.is_practice ? 'Luyện tập' : 'Tính điểm'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lesson.description && (
              <p className="text-gray-700">{lesson.description}</p>
            )}

            {lesson.is_practice && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Bài luyện tập</p>
                    <p>
                      Bài tập này không tính điểm vào tổng kết khóa học. 
                      Bạn có thể nộp nhiều lần để luyện tập.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Thời lượng ước tính: {lesson.duration_minutes || 30} phút
                </span>
              </div>
              <Button onClick={handleViewAssignment}>
                Xem chi tiết bài tập
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback: loại bài học chưa hỗ trợ giao diện riêng
  return (
    <div className="bg-gray-50 p-12 rounded-lg border border-gray-200 text-center">
      <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <p className="text-gray-500">Loại bài học này sẽ có giao diện riêng.</p>
    </div>
  );
}

/**
 * LessonDetailPage - Trang xem chi tiết bài học
 * 
 * Features:
 * - Hiển thị nội dung bài học (video/document)
 * - Navigation giữa các bài học
 * - Sidebar với danh sách bài học
 * - Mark as complete
 */
export function LessonDetailPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: lessonData, isLoading: isLessonLoading, error: lessonError } = useLesson(lessonId!);
  const { data: courseContent, isLoading: isContentLoading } = useCourseContent(courseId!);
  const { data: courseData } = useCourse(courseId!);
  const { isAuthenticated } = useAuth();
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);
  
  // Fetch progress data để có thông tin completion status
  const { data: progressData } = useCourseProgress(courseId!, isUserEnrolled);
  
  // Check enrollment status
  useEffect(() => {
    if (!courseId) {
      setIsUserEnrolled(false);
      return;
    }
    const cachedEnrolled = queryClient.getQueryData<{ data?: { courses?: any[] } }>(
      QUERY_KEYS.courses.enrolled()
    );
    const isCachedEnrollment = cachedEnrolled?.data?.courses?.some(
      (enrolledCourse) => String(enrolledCourse.id) === String(courseId)
    );
    setIsUserEnrolled(Boolean(courseData?.is_enrolled) || Boolean(isCachedEnrollment));
  }, [courseData?.is_enrolled, courseId, queryClient]);

  // Fetch tất cả quizzes và assignments (bao gồm cả course-level và section-level)
  const { data: allQuizzes } = useQuery<Quiz[]>({
    queryKey: ['all-quizzes', courseId],
    queryFn: async () => {
      try {
        const res = await quizApi.getQuizzes({ course_id: courseId!, status: 'published' });
        const list = Array.isArray(res?.data) ? res.data : [];
        return list.filter((q: any) => q.is_published);
      } catch (error: any) {
        // Nếu lỗi 401/403 (chưa đăng nhập hoặc không có quyền), trả về mảng rỗng
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          console.warn('[LessonDetailPage] No permission to fetch quizzes, returning empty array');
          return [];
        }
        throw error;
      }
    },
    enabled: !!courseId,
    staleTime: 60 * 1000,
  });

  const { data: allAssignments } = useQuery<Assignment[]>({
    queryKey: ['all-assignments', courseId],
    queryFn: async () => {
      try {
        const res = await assignmentApi.getCourseAssignments(courseId!);
        const list = Array.isArray((res as any)?.data) ? (res as any).data : Array.isArray(res) ? res : [];
        return list.filter((a: any) => a.is_published);
      } catch (error: any) {
        // Nếu lỗi 401/403 (chưa đăng nhập hoặc không có quyền), trả về mảng rỗng
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          console.warn('[LessonDetailPage] No permission to fetch assignments, returning empty array');
          return [];
        }
        throw error;
      }
    },
    enabled: !!courseId,
    staleTime: 60 * 1000,
  });

  // Filter course-level và section-level quizzes/assignments
  const courseLevelQuizzes = (allQuizzes || []).filter((q: any) => {
    const hasLessonId = q.lesson_id != null && q.lesson_id !== '';
    const hasSectionId = q.section_id != null && q.section_id !== '';
    const hasCourseId = q.course_id != null && q.course_id !== '';
    return !hasLessonId && !hasSectionId && hasCourseId;
  });

  const sectionLevelQuizzes = (allQuizzes || []).filter((q: any) => {
    const hasLessonId = q.lesson_id != null && q.lesson_id !== '';
    const hasSectionId = q.section_id != null && q.section_id !== '';
    return !hasLessonId && hasSectionId;
  });

  const courseLevelAssignments = (allAssignments || []).filter((a: any) => {
    const hasLessonId = a.lesson_id != null && a.lesson_id !== '';
    const hasSectionId = a.section_id != null && a.section_id !== '';
    const hasCourseId = a.course_id != null && a.course_id !== '';
    return !hasLessonId && !hasSectionId && hasCourseId;
  });

  const sectionLevelAssignments = (allAssignments || []).filter((a: any) => {
    const hasLessonId = a.lesson_id != null && a.lesson_id !== '';
    const hasSectionId = a.section_id != null && a.section_id !== '';
    return !hasLessonId && hasSectionId;
  });

  // lessonApi.getLesson đã unwrap data rồi (return response.data.data), nên lessonData là LessonDetail trực tiếp
  const lesson: LessonDetail | undefined = lessonData;
  const course = courseData;

  // Debug: Kiểm tra lessonId và lesson.id có khớp không
  useEffect(() => {
    if (lesson && lessonId) {
      if (lesson.id !== lessonId) {
        console.warn('[LessonDetailPage] Lesson ID mismatch!', {
          urlLessonId: lessonId,
          lessonIdFromData: lesson.id,
          lessonTitle: lesson.title
        });
      }
    }
  }, [lesson, lessonId]);
  
  // Sử dụng sections từ courseContent (nếu authenticated) hoặc course.sections (public fallback)
  // Nếu courseContent.sections là empty array, vẫn fallback về course.sections (giống DetailPage)
  let curriculumSections = (courseContent?.sections && courseContent.sections.length > 0) 
    ? courseContent.sections 
    : (course?.sections ?? []);

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
              // Lấy attempt mới nhất có submitted_at
              const submittedAttempts = studentAttempts.filter(
                (a: any) => a.submitted_at != null
              );
              if (submittedAttempts.length === 0) return null;
              
              // Sắp xếp theo submitted_at DESC và lấy attempt mới nhất
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

  // Merge section-level quizzes và assignments vào sections và thêm completion status
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
      is_completed: !quiz.is_practice && completedQuizIds.has(quiz.id), // Chỉ tính non-practice quizzes
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
      is_completed: !assignment.is_practice && completedAssignmentIds.has(assignment.id), // Chỉ tính non-practice assignments
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

  const sections = curriculumSections;

  // Debug: Log để kiểm tra lesson và courseContent
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[LessonDetailPage] Current lesson:', {
        lessonId,
        lessonTitle: lesson?.title,
        lessonIdFromData: lesson?.id,
        hasLesson: !!lesson,
        lessonDataKeys: lessonData ? Object.keys(lessonData) : [],
        hasContent: !!lesson?.content,
        contentLength: lesson?.content?.length || 0,
        contentPreview: lesson?.content?.substring(0, 100) || 'NO CONTENT',
        contentType: lesson?.content_type,
        courseContentSectionsCount: courseContent?.sections?.length || 0,
        courseDataSectionsCount: courseData?.sections?.length || 0,
        finalSectionsCount: sections.length,
      });
    }
  }, [lessonId, lesson, lessonData, courseContent, courseData, sections]);

  // Tìm lesson hiện tại và các lesson liên quan
  const currentLesson = lesson;
  const allLessons: Array<{ lesson: Lesson; section: Section }> = [];
  sections.forEach((section: Section) => {
    // Sort lessons theo order_index trước khi thêm vào allLessons
    const sortedLessons = (section.lessons || []).sort((a, b) => 
      (a.order_index || 0) - (b.order_index || 0)
    );
    sortedLessons.forEach((lesson: Lesson) => {
      allLessons.push({ lesson, section });
    });
  });
  const currentIndex = allLessons.findIndex(item => item.lesson.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleMarkComplete = () => {
    if (!lessonId) return;
    markComplete(lessonId, {
      onSuccess: () => {
        toast.success('Đã đánh dấu hoàn thành bài học');
        // Refetch lesson data để cập nhật is_completed status
        if (courseId) {
          // Invalidate course content để cập nhật progress
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.lessons.content(courseId),
          });
        }
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Không thể đánh dấu hoàn thành');
      },
    });
  };

  const handleNavigateToLesson = (targetLessonId: string) => {
    // Xử lý quiz/assignment items (có id dạng quiz-${id} hoặc assignment-${id})
    if (targetLessonId.startsWith('quiz-')) {
      const quizId = targetLessonId.replace('quiz-', '');
      navigate(generateRoute.student.quiz(courseId!, quizId));
      return;
    }

    if (targetLessonId.startsWith('assignment-')) {
      const assignmentId = targetLessonId.replace('assignment-', '');
      navigate(`/student/courses/${courseId}/assignments/${assignmentId}`);
      return;
    }

    // Lesson thông thường
    navigate(generateRoute.student.lesson(courseId!, targetLessonId));
  };

  // Kiểm tra xem lesson có khớp với lessonId trong URL không
  // Tránh hiển thị lesson cũ khi đang chuyển sang lesson mới
  const isLessonMatching = lesson && lessonId && lesson.id === lessonId;

  // Hiển thị loading nếu đang fetch hoặc lesson không khớp với URL
  if (isLessonLoading || isContentLoading || !isLessonMatching) {
    return (
      <MainLayout showSidebar>
        <PageWrapper>
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" />
            <p className="ml-4 text-gray-600">Đang tải bài học...</p>
          </div>
        </PageWrapper>
      </MainLayout>
    );
  }

  // Hiển thị error nếu có lỗi hoặc không tìm thấy lesson
  if (lessonError || !lesson) {
    return (
      <MainLayout showSidebar>
        <PageWrapper>
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy bài học</h2>
              <p className="text-gray-500 mb-4">
                Bài học này không tồn tại hoặc bạn không có quyền truy cập.
              </p>
              <Button onClick={() => navigate(generateRoute.courseDetail(courseId!))}>
                Quay lại khóa học
              </Button>
            </CardContent>
          </Card>
        </PageWrapper>
      </MainLayout>
    );
  }

  return (
    <MainLayout showSidebar>
      <PageWrapper>
        <div className="max-w-8xl mx-auto">
          {/* Header với breadcrumb */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(generateRoute.courseDetail(courseId!))}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại khóa học
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link to={ROUTES.COURSES} className="hover:text-gray-700">Khóa học</Link>
              <span>/</span>
              <Link 
                to={generateRoute.courseDetail(courseId!)} 
                className="hover:text-gray-700"
              >
                {course?.title || 'Khóa học'}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{lesson.title}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content - 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              {/* Lesson Content */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
                      {/* Chỉ hiển thị description nếu nó khác với content và không phải HTML */}
                      {lesson.description && 
                       lesson.description.trim() && 
                       !lesson.description.trim().startsWith('<') &&
                       lesson.description !== lesson.content && (
                        <p className="text-gray-600 mt-2">{lesson.description}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {lesson && isLessonMatching ? (
                    <LessonContentView 
                      key={lesson.id} 
                      lesson={lesson} 
                      onAutoComplete={undefined}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <Spinner size="lg" />
                      <p className="mt-4 text-gray-600">Đang tải nội dung bài học...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => prevLesson && handleNavigateToLesson(prevLesson.lesson.id)}
                  disabled={!prevLesson}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Bài trước
                </Button>
                <Button
                  variant="outline"
                  onClick={() => nextLesson && handleNavigateToLesson(nextLesson.lesson.id)}
                  disabled={!nextLesson}
                >
                  Bài tiếp theo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
                  {/* Sections - hiển thị trước */}
                  {sections.length > 0 && (
                    <div className="[&>div]:border-0 [&>div]:rounded-none [&>div]:shadow-none">
                      <CurriculumTree
                        sections={sections}
                        activeLessonId={lessonId}
                        onLessonClick={handleNavigateToLesson}
                        isPreviewMode={false}
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
                        onClick={() => navigate(generateRoute.student.quiz(courseId!, quiz.id))}
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
                        onClick={() => navigate(`/student/courses/${courseId}/assignments/${asmt.id}`)}
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
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </MainLayout>
  );
}

export default LessonDetailPage;

