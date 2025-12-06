import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle, 
  BookOpen,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useCourseContent } from '@/hooks/useLessonData';
import { lessonApi } from '@/services/api/lesson.api';
import type { CourseProgressSummary } from '@/services/api/lesson.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizApi, type Quiz } from '@/services/api/quiz.api';
import { assignmentApi, type Assignment } from '@/services/api/assignment.api';
import { ClipboardList, FileText, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    student_id?: string;
    enrolled_at: string;
    progress_percent: number;
    last_activity_at?: string;
    completed_lessons: number;
    total_lessons: number;
  };
  courseId: string;
}

/**
 * StudentDetailModal
 * 
 * Modal hiển thị chi tiết học viên bao gồm:
 * - Thông tin cá nhân
 * - Tiến độ học tập chi tiết
 * - Danh sách bài học đã hoàn thành
 * - Hoạt động gần nhất
 */
export function StudentDetailModal({ isOpen, onClose, student, courseId }: StudentDetailModalProps) {
  const [progressDetail, setProgressDetail] = useState<CourseProgressSummary | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const { data: courseContent } = useCourseContent(courseId);
  const queryClient = useQueryClient();

  // Fetch detailed progress when modal opens
  useEffect(() => {
    if (isOpen && student.id) {
      setIsLoadingProgress(true);
      lessonApi.getStudentProgress(courseId, student.id)
        .then((data) => {
          console.log('[StudentDetailModal] Progress data received:', data);
          if (data && data.sections) {
            console.log('[StudentDetailModal] Sections with completion:', data.sections.map((s: any) => ({
              section_id: s.section_id,
              section_title: s.section_title,
              completion_percentage: s.completion_percentage,
              total_lessons: s.total_lessons,
              completed_lessons: s.completed_lessons
            })));
            setProgressDetail(data);
          } else {
            console.warn('[StudentDetailModal] Invalid progress data:', data);
            setProgressDetail(null);
          }
          setIsLoadingProgress(false);
        })
        .catch((error) => {
          console.error('[StudentDetailModal] Error fetching student progress:', error);
          setProgressDetail(null);
          setIsLoadingProgress(false);
        });
    } else {
      setProgressDetail(null);
    }
  }, [isOpen, student.id, courseId]);

  // Get sections từ progressDetail (có đầy đủ thông tin progress) hoặc courseContent
  // progressDetail.sections có thông tin về completion, courseContent.sections có thông tin về lessons
  const progressSections = progressDetail?.sections || [];
  const contentSections = courseContent?.sections || [];
  
  // Merge sections: ưu tiên progressDetail vì có thông tin completion
  // Nếu không có progressDetail, dùng courseContent
  const sections = progressSections.length > 0 
    ? progressSections.map((ps: any) => {
        // Tìm section tương ứng trong courseContent để lấy lessons
        const contentSection = contentSections.find((cs: any) => cs.id === ps.section_id);
        return {
          ...ps,
          id: ps.section_id,
          title: ps.section_title,
          lessons: contentSection?.lessons || []
        };
      })
    : contentSections;
  
  const allLessons = sections.flatMap((section: any) => section.lessons || []);

  // Fetch tất cả quizzes (bao gồm cả course-level và section-level)
  const { data: allQuizzes } = useQuery<Quiz[]>({
    queryKey: ['all-quizzes-student-detail', courseId],
    queryFn: async () => {
      const res = await quizApi.getQuizzes({ course_id: courseId, status: 'published' });
      const list = Array.isArray(res?.data) ? res.data : [];
      return list
        .filter((q: any) => {
          // Chỉ lấy quizzes đã published, không có lesson_id
          const hasLessonId = q.lesson_id != null && q.lesson_id !== '';
          return !hasLessonId && q.is_published;
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateA - dateB;
        });
    },
    enabled: !!courseId && isOpen,
    staleTime: 60 * 1000,
  });

  // Course-level quizzes (không có lesson_id và không có section_id, có course_id)
  const courseLevelQuizzes = (allQuizzes || []).filter((q: any) => {
    const hasLessonId = q.lesson_id != null && q.lesson_id !== '';
    const hasSectionId = q.section_id != null && q.section_id !== '';
    const hasCourseId = q.course_id != null && q.course_id !== '';
    return !hasLessonId && !hasSectionId && hasCourseId;
  });

  // Section-level quizzes (có section_id nhưng không có lesson_id)
  const sectionLevelQuizzes = (allQuizzes || []).filter((q: any) => {
    const hasLessonId = q.lesson_id != null && q.lesson_id !== '';
    const hasSectionId = q.section_id != null && q.section_id !== '';
    return !hasLessonId && hasSectionId;
  });

  // Fetch tất cả assignments (bao gồm cả course-level và section-level)
  const { data: allAssignments } = useQuery<Assignment[]>({
    queryKey: ['all-assignments-student-detail', courseId],
    queryFn: async () => {
      const res = await assignmentApi.getCourseAssignments(courseId);
      const list = Array.isArray((res as any)?.data) ? (res as any).data : Array.isArray(res) ? res : [];
      return list
        .filter((a: any) => {
          // Chỉ lấy assignments đã published, không có lesson_id
          const hasLessonId = a.lesson_id != null && a.lesson_id !== '';
          return !hasLessonId && a.is_published;
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateA - dateB;
        });
    },
    enabled: !!courseId && isOpen,
    staleTime: 60 * 1000,
  });

  // Course-level assignments (không có lesson_id và không có section_id, có course_id)
  const courseLevelAssignments = (allAssignments || []).filter((a: any) => {
    const hasLessonId = a.lesson_id != null && a.lesson_id !== '';
    const hasSectionId = a.section_id != null && a.section_id !== '';
    const hasCourseId = a.course_id != null && a.course_id !== '';
    return !hasLessonId && !hasSectionId && hasCourseId;
  });

  // Section-level assignments (có section_id nhưng không có lesson_id)
  const sectionLevelAssignments = (allAssignments || []).filter((a: any) => {
    const hasLessonId = a.lesson_id != null && a.lesson_id !== '';
    const hasSectionId = a.section_id != null && a.section_id !== '';
    return !hasLessonId && hasSectionId;
  });

  // Fetch quiz attempts for student (cho cả course-level và section-level quizzes, chỉ quiz không phải practice)
  // Dùng API mới để instructor lấy attempts của học viên cụ thể
  // Practice quiz thường không lưu attempts hoặc không cần kiểm tra trạng thái
  const { data: quizAttempts } = useQuery<any[]>({
    queryKey: ['student-quiz-attempts', student.id, courseId, allQuizzes?.length],
    queryFn: async () => {
      // Lấy tất cả quizzes (course-level + section-level) không phải practice
      const allNonPracticeQuizzes = [
        ...(courseLevelQuizzes || []),
        ...(sectionLevelQuizzes || [])
      ].filter((q: any) => !q.is_practice);
      
      console.log('[StudentDetailModal] Fetching quiz attempts for:', {
        allQuizzesCount: allQuizzes?.length || 0,
        courseLevelQuizzesCount: courseLevelQuizzes?.length || 0,
        sectionLevelQuizzesCount: sectionLevelQuizzes?.length || 0,
        allNonPracticeQuizzesCount: allNonPracticeQuizzes.length,
        allNonPracticeQuizzes: allNonPracticeQuizzes.map((q: any) => ({ id: q.id, title: q.title, section_id: q.section_id }))
      });
      
      if (allNonPracticeQuizzes.length === 0) {
        console.log('[StudentDetailModal] No non-practice quizzes found, returning empty array');
        return [];
      }
      
      const attempts = await Promise.all(
        allNonPracticeQuizzes.map(async (quiz) => {
          try {
            // Dùng API mới để lấy attempts của học viên cụ thể
            const studentAttempts = await quizApi.getStudentAttempts(quiz.id, student.id);
            const attemptsList = Array.isArray(studentAttempts) ? studentAttempts : [];
            
            console.log('[StudentDetailModal] Student quiz attempts:', {
              quizId: quiz.id,
              quizTitle: quiz.title,
              sectionId: quiz.section_id,
              studentId: student.id,
              attemptsCount: attemptsList.length,
              attempts: attemptsList.map((a: any) => ({
                id: a.id,
                status: a.status,
                submitted_at: a.submitted_at,
                score: a.score,
                max_score: a.max_score
              })),
            });
            
            // Lấy attempt mới nhất (submitted hoặc graded) cho mỗi quiz
            // Nếu không có submitted/graded, lấy attempt mới nhất có submitted_at
            const submittedAttempts = attemptsList.filter(
              (a: any) => a.status === 'submitted' || a.status === 'graded' || a.submitted_at != null
            );
            
            console.log('[StudentDetailModal] Filtered submitted attempts:', {
              quizId: quiz.id,
              submittedCount: submittedAttempts.length,
              submittedAttempts: submittedAttempts.map((a: any) => ({
                id: a.id,
                status: a.status,
                submitted_at: a.submitted_at
              }))
            });
            
            if (submittedAttempts.length === 0) {
              console.log('[StudentDetailModal] No submitted attempts found for quiz:', quiz.id);
              return null;
            }
            
            const latestAttempt = submittedAttempts.sort((a: any, b: any) => {
              const dateA = new Date(a.submitted_at || a.started_at || 0).getTime();
              const dateB = new Date(b.submitted_at || b.started_at || 0).getTime();
              return dateB - dateA; // Mới nhất trước
            })[0];
            
            console.log('[StudentDetailModal] Latest attempt selected:', {
              quizId: quiz.id,
              attemptId: latestAttempt.id,
              status: latestAttempt.status,
              submitted_at: latestAttempt.submitted_at,
              score: latestAttempt.score
            });
            
            if (latestAttempt) {
              return { ...latestAttempt, quiz_id: quiz.id };
            }
            return null;
          } catch (error) {
            console.error('[StudentDetailModal] Error fetching student quiz attempts:', error);
            return null;
          }
        })
      );
      const filteredAttempts = attempts.filter(Boolean);
      console.log('[StudentDetailModal] Final quiz attempts:', filteredAttempts);
      return filteredAttempts; // Loại bỏ null values
    },
    enabled: !!student.id && !!courseId && isOpen && !!allQuizzes,
    staleTime: 60 * 1000,
  });

  // Fetch assignment submissions for student
  const { data: assignmentSubmissions } = useQuery<any[]>({
    queryKey: ['student-assignment-submissions', student.id, courseId],
    queryFn: async () => {
      if (!courseLevelAssignments || courseLevelAssignments.length === 0) return [];
      const submissions = await Promise.all(
        courseLevelAssignments.map(async (asmt) => {
          try {
            const submission = await assignmentApi.getSubmission(asmt.id);
            return submission && (submission as any).user_id === student.id ? submission : null;
          } catch {
            return null;
          }
        })
      );
      return submissions.filter(Boolean);
    },
    enabled: !!student.id && !!courseId && isOpen && !!courseLevelAssignments,
    staleTime: 60 * 1000,
  });

  // Debug logs
  useEffect(() => {
    if (isOpen) {
      console.log('[StudentDetailModal] courseContent:', courseContent);
      console.log('[StudentDetailModal] progressDetail:', progressDetail);
      console.log('[StudentDetailModal] progressDetail.sections:', progressDetail?.sections);
      console.log('[StudentDetailModal] sections (merged):', sections);
      console.log('[StudentDetailModal] isLoadingProgress:', isLoadingProgress);
      console.log('[StudentDetailModal] sectionLevelQuizzes:', sectionLevelQuizzes);
      console.log('[StudentDetailModal] quizAttempts:', quizAttempts);
    }
  }, [isOpen, courseContent, sections, progressDetail, isLoadingProgress, sectionLevelQuizzes, quizAttempts]);
  
  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Component nút Reset lượt làm bài
   */
  function ResetAttemptButton({ 
    quizId, 
    studentId, 
    quizTitle,
    courseId 
  }: { 
    quizId: string; 
    studentId: string; 
    quizTitle: string;
    courseId: string;
  }) {
    const queryClient = useQueryClient();
    
    const resetMutation = useMutation({
      mutationFn: () => quizApi.resetStudentAttempts(quizId, studentId),
      onSuccess: () => {
        toast.success(`Đã reset lượt làm bài cho "${quizTitle}"`);
        // Invalidate queries để refetch data
        queryClient.invalidateQueries({ queryKey: ['student-quiz-attempts', studentId, courseId] });
        queryClient.invalidateQueries({ queryKey: ['student-progress', courseId, studentId] });
        // Refetch progress detail
        if (student.id) {
          lessonApi.getStudentProgress(courseId, student.id)
            .then((data) => {
              if (data && data.sections) {
                setProgressDetail(data);
              }
            })
            .catch((error) => {
              console.error('[StudentDetailModal] Error refetching progress after reset:', error);
            });
        }
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || 'Không thể reset lượt làm bài';
        toast.error(message);
      },
    });

    const handleReset = () => {
      if (!confirm(`Bạn có chắc muốn reset lượt làm bài cho "${quizTitle}"? Học viên sẽ có thể làm lại bài kiểm tra này.`)) {
        return;
      }
      resetMutation.mutate();
    };

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        disabled={resetMutation.isPending}
        className="h-7 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
        title="Reset lượt làm bài"
      >
        <RotateCcw className="w-3.5 h-3.5 mr-1" />
        Reset
      </Button>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết học viên" size="xl">
      <div className="space-y-6">
        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin học viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                {student.avatar_url ? (
                  <img 
                    src={student.avatar_url} 
                    alt={student.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gray-600 font-medium">
                    {student.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-lg font-semibold text-gray-900">{student.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{student.email}</span>
                </div>
                {student.student_id && (
                  <div className="flex items-center gap-2">
                    <Badge variant="info" size="sm">MSSV: {student.student_id}</Badge>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Đăng ký: {formatDate(student.enrolled_at)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tiến độ học tập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tiến độ tổng thể</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {progressDetail?.completion_percentage?.toFixed(2) || student.progress_percent.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressDetail?.completion_percentage || student.progress_percent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Tiến độ hoàn thành</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {progressDetail?.completion_percentage?.toFixed(1) || student.progress_percent?.toFixed(1) || '0.0'}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(progressDetail?.completion_percentage || student.progress_percent || 0) > 0 ? 'Đang học' : 'Chưa bắt đầu'}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Hoạt động gần nhất</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatDate(student.last_activity_at)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {student.last_activity_at ? 'Đã học gần đây' : 'Chưa có hoạt động'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Lessons List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Danh sách bài học</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingProgress ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="md" />
                <span className="ml-2 text-gray-600">Đang tải chi tiết...</span>
              </div>
            ) : progressDetail && progressDetail.sections && progressDetail.sections.length > 0 ? (
                <div className="space-y-4">
                  {progressDetail.sections.map((sectionProgress) => {
                    // Lấy section-level quizzes và assignments cho section này
                    const sectionQuizzes = sectionLevelQuizzes.filter((q: any) => {
                      const quizSectionId = q.section_id ? String(q.section_id).trim() : null;
                      const currentSectionId = sectionProgress.section_id ? String(sectionProgress.section_id).trim() : null;
                      return quizSectionId === currentSectionId && quizSectionId !== null;
                    });

                    const sectionAssignments = sectionLevelAssignments.filter((a: any) => {
                      const assignmentSectionId = a.section_id ? String(a.section_id).trim() : null;
                      const currentSectionId = sectionProgress.section_id ? String(sectionProgress.section_id).trim() : null;
                      return assignmentSectionId === currentSectionId && assignmentSectionId !== null;
                    });

                    // Hiển thị section nếu có lessons, quizzes, hoặc assignments
                    const hasLessons = sectionProgress.lessons && sectionProgress.lessons.length > 0;
                    const hasQuizzes = sectionQuizzes.length > 0;
                    const hasAssignments = sectionAssignments.length > 0;
                    const hasContent = hasLessons || hasQuizzes || hasAssignments;

                    if (!hasContent) {
                      return null;
                    }

                    return (
                      <div key={sectionProgress.section_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">
                            {sectionProgress.section_title}
                          </h4>
                          <Badge variant="info" size="sm">
                            {sectionProgress.completion_percentage.toFixed(1)}% hoàn thành
                          </Badge>
                        </div>
                        <div className="mb-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(sectionProgress.completion_percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2 mt-4">
                          {/* Lessons */}
                          {hasLessons && sectionProgress.lessons.map((lessonProgress) => {
                            const isCompleted = lessonProgress.is_completed || lessonProgress.completion_percentage >= 100;
                            
                            return (
                              <div
                                key={lessonProgress.lesson_id}
                                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                              >
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : lessonProgress.completion_percentage > 0 ? (
                                    <div className="relative w-5 h-5">
                                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                      <div
                                        className="absolute top-0 left-0 w-5 h-5 rounded-full border-2 border-blue-600"
                                        style={{
                                          clipPath: `inset(0 ${100 - lessonProgress.completion_percentage}% 0 0)`
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {lessonProgress.lesson_title}
                                  </div>
                                  {lessonProgress.completion_percentage > 0 && lessonProgress.completion_percentage < 100 && (
                                    <div className="text-xs text-gray-500">
                                      {lessonProgress.completion_percentage.toFixed(0)}% hoàn thành
                                    </div>
                                  )}
                                </div>
                                {isCompleted ? (
                                  <Badge variant="success" size="sm">Đã hoàn thành</Badge>
                                ) : lessonProgress.completion_percentage > 0 ? (
                                  <Badge variant="info" size="sm">
                                    {lessonProgress.completion_percentage.toFixed(0)}%
                                  </Badge>
                                ) : null}
                              </div>
                            );
                          })}

                          {/* Section-level Quizzes */}
                          {hasQuizzes && sectionQuizzes.map((quiz) => {
                            const isPractice = quiz.is_practice === true;
                            const quizAttempt = quizAttempts?.find((a: any) => a.quiz_id === quiz.id);
                            // Kiểm tra completion: có submitted_at hoặc status là submitted/graded
                            const isCompleted = !isPractice && quizAttempt && (
                              quizAttempt.submitted_at != null || 
                              quizAttempt.submitted_at !== undefined ||
                              quizAttempt.status === 'submitted' || 
                              quizAttempt.status === 'graded'
                            );
                            const hasAttempt = !isPractice && quizAttempt != null;
                            
                            console.log('[StudentDetailModal] Rendering quiz:', {
                              quizId: quiz.id,
                              quizTitle: quiz.title,
                              sectionId: quiz.section_id,
                              isPractice,
                              hasQuizAttempt: !!quizAttempt,
                              quizAttempt: quizAttempt ? {
                                id: quizAttempt.id,
                                quiz_id: quizAttempt.quiz_id,
                                submitted_at: quizAttempt.submitted_at,
                                status: quizAttempt.status,
                                score: quizAttempt.score,
                                max_score: quizAttempt.max_score,
                                total_score: quizAttempt.total_score,
                                total_points: quizAttempt.total_points
                              } : null,
                              isCompleted,
                              hasAttempt,
                              checkSubmittedAt: quizAttempt?.submitted_at != null,
                              checkStatus: quizAttempt?.status === 'submitted' || quizAttempt?.status === 'graded'
                            });

                            return (
                              <div
                                key={`section-quiz-${quiz.id}`}
                                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                              >
                                <div className="flex-shrink-0">
                                  {isPractice ? (
                                    <ClipboardList className="w-5 h-5 text-purple-600" />
                                  ) : isCompleted ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : hasAttempt ? (
                                    <div className="relative w-5 h-5">
                                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                      <div className="absolute top-0 left-0 w-5 h-5 rounded-full border-2 border-blue-600" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                                    </div>
                                  ) : (
                                    <ClipboardList className="w-5 h-5 text-blue-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {isPractice ? 'Bài luyện tập' : 'Quiz'}: {quiz.title}
                                  </div>
                                  {quiz.description && (
                                    <div className="text-xs text-gray-500 mt-1">{quiz.description}</div>
                                  )}
                                  {isPractice && (
                                    <div className="text-xs text-gray-500 mt-1 italic">
                                      Điểm số không được tính vào tổng kết khóa học
                                    </div>
                                  )}
                                  {!isPractice && quizAttempt && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {quizAttempt.score != null || quizAttempt.total_score != null ? (
                                        <>
                                          Điểm: {Number(quizAttempt.score || quizAttempt.total_score || 0).toFixed(1)}/{Number(quizAttempt.max_score || quizAttempt.total_points || 100).toFixed(1)}
                                        </>
                                      ) : (quizAttempt.status === 'submitted' || quizAttempt.status === 'graded') ? (
                                        <span className="text-gray-600">Đã nộp bài</span>
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {isPractice ? (
                                    <Badge variant="secondary" size="sm">Luyện tập</Badge>
                                  ) : isCompleted ? (
                                    <Badge variant="success" size="sm">Đã hoàn thành</Badge>
                                  ) : hasAttempt ? (
                                    <Badge variant="info" size="sm">Đang làm</Badge>
                                  ) : null}
                                  {/* Nút Reset lượt làm - chỉ hiển thị cho non-practice quiz có attempt */}
                                  {!isPractice && hasAttempt && (
                                    <ResetAttemptButton
                                      quizId={quiz.id}
                                      studentId={student.id}
                                      quizTitle={quiz.title}
                                      courseId={courseId}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* Section-level Assignments */}
                          {hasAssignments && sectionAssignments.map((asmt) => {
                            const submission = assignmentSubmissions?.find((s: any) => s.assignment_id === asmt.id);
                            const isCompleted = submission?.submitted_at != null;
                            const hasSubmission = submission != null;

                            return (
                              <div
                                key={`section-assignment-${asmt.id}`}
                                className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                              >
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : hasSubmission ? (
                                    <div className="relative w-5 h-5">
                                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                      <div className="absolute top-0 left-0 w-5 h-5 rounded-full border-2 border-blue-600" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                                    </div>
                                  ) : (
                                    <FileText className="w-5 h-5 text-green-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    Assignment: {asmt.title}
                                  </div>
                                  {asmt.description && (
                                    <div className="text-xs text-gray-500 mt-1">{asmt.description}</div>
                                  )}
                                  {submission && submission.score != null && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Điểm: {submission.score}/{asmt.max_score || 100}
                                    </div>
                                  )}
                                </div>
                                {isCompleted ? (
                                  <Badge variant="success" size="sm">Đã nộp</Badge>
                                ) : hasSubmission ? (
                                  <Badge variant="info" size="sm">Đang làm</Badge>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Course-level Quizzes */}
                  {courseLevelQuizzes?.map((quiz) => {
                    const isPractice = quiz.is_practice === true;
                    const quizAttempt = quizAttempts?.find((a: any) => a.quiz_id === quiz.id);
                    // Kiểm tra completion: có submitted_at hoặc status là submitted/graded
                    const isCompleted = !isPractice && quizAttempt && (
                      quizAttempt.submitted_at != null || 
                      quizAttempt.submitted_at !== undefined ||
                      quizAttempt.status === 'submitted' || 
                      quizAttempt.status === 'graded'
                    );
                    const hasAttempt = !isPractice && quizAttempt != null;

                    return (
                      <div key={`quiz-${quiz.id}`} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                          <div className="flex-shrink-0">
                            {isPractice ? (
                              <ClipboardList className="w-5 h-5 text-purple-600" />
                            ) : isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : hasAttempt ? (
                              <div className="relative w-5 h-5">
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                <div className="absolute top-0 left-0 w-5 h-5 rounded-full border-2 border-blue-600" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                              </div>
                            ) : (
                              <ClipboardList className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {isPractice ? 'Bài luyện tập' : 'Quiz'}: {quiz.title}
                            </div>
                            {quiz.description && (
                              <div className="text-xs text-gray-500 mt-1">{quiz.description}</div>
                            )}
                            {isPractice && (
                              <div className="text-xs text-gray-500 mt-1 italic">
                                Điểm số không được tính vào tổng kết khóa học
                              </div>
                            )}
                            {!isPractice && quizAttempt && (
                              <div className="text-xs text-gray-500 mt-1">
                                {quizAttempt.score != null || quizAttempt.total_score != null ? (
                                  <>
                                    Điểm: {Number(quizAttempt.score || quizAttempt.total_score || 0).toFixed(1)}/{Number(quizAttempt.max_score || quizAttempt.total_points || 100).toFixed(1)}
                                  </>
                                ) : (quizAttempt.status === 'submitted' || quizAttempt.status === 'graded') ? (
                                  <span className="text-gray-600">Đã nộp bài</span>
                                ) : null}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isPractice ? (
                              <Badge variant="secondary" size="sm">Luyện tập</Badge>
                            ) : isCompleted ? (
                              <Badge variant="success" size="sm">Đã hoàn thành</Badge>
                            ) : hasAttempt ? (
                              <Badge variant="info" size="sm">Đang làm</Badge>
                            ) : null}
                            {/* Nút Reset lượt làm - chỉ hiển thị cho non-practice quiz có attempt */}
                            {!isPractice && hasAttempt && (
                              <ResetAttemptButton
                                quizId={quiz.id}
                                studentId={student.id}
                                quizTitle={quiz.title}
                                courseId={courseId}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Course-level Assignments */}
                  {courseLevelAssignments?.map((asmt) => {
                    const submission = assignmentSubmissions?.find((s: any) => s.assignment_id === asmt.id);
                    const isCompleted = submission?.submitted_at != null;
                    const hasSubmission = submission != null;

                    return (
                      <div key={`assignment-${asmt.id}`} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : hasSubmission ? (
                              <div className="relative w-5 h-5">
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                <div className="absolute top-0 left-0 w-5 h-5 rounded-full border-2 border-blue-600" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                              </div>
                            ) : (
                              <FileText className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              Assignment: {asmt.title}
                            </div>
                            {asmt.description && (
                              <div className="text-xs text-gray-500 mt-1">{asmt.description}</div>
                            )}
                            {submission && submission.score != null && (
                              <div className="text-xs text-gray-500 mt-1">
                                Điểm: {submission.score}/{asmt.max_score || 100}
                              </div>
                            )}
                          </div>
                          {isCompleted ? (
                            <Badge variant="success" size="sm">Đã nộp</Badge>
                          ) : hasSubmission ? (
                            <Badge variant="info" size="sm">Đang làm</Badge>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((section) => {
                    const sectionLessons = (section.lessons || []).sort((a, b) => 
                      (a.order_index || 0) - (b.order_index || 0)
                    );
                    if (sectionLessons.length === 0) return null;

                    return (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">{section.title}</h4>
                        <div className="space-y-2">
                          {sectionLessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                            >
                              <div className="flex-shrink-0">
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {lesson.title}
                                </div>
                                {lesson.duration_minutes && (
                                  <div className="text-xs text-gray-500">
                                    {lesson.duration_minutes} phút
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Course-level Quizzes (fallback khi không có progressDetail) */}
                  {courseLevelQuizzes?.map((quiz) => (
                    <div key={`quiz-${quiz.id}`} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                        <ClipboardList className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            Quiz: {quiz.title}
                          </div>
                          {quiz.description && (
                            <div className="text-xs text-gray-500 mt-1">{quiz.description}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Course-level Assignments (fallback khi không có progressDetail) */}
                  {courseLevelAssignments?.map((asmt) => (
                    <div key={`assignment-${asmt.id}`} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            Assignment: {asmt.title}
                          </div>
                          {asmt.description && (
                            <div className="text-xs text-gray-500 mt-1">{asmt.description}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        {/* Footer */}
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}

