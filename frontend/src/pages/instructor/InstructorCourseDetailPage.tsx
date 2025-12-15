// InstructorCourseDetailPage - Course management for instructors
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Users,
    Settings,
    Star,
    BarChart3,
    Eye,
    ArrowLeft,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRoleBasedNavigation } from '@/hooks/useRoleBasedNavigation';

// Import hooks
import {
    useInstructorCourseDetail,
    useCourseStats,
    useCourseStudents,
    useCourseSections,
    useCreateSection,
    useUpdateSection,
    useDeleteSection,
    useCreateLesson,
    useUpdateLesson,
    useDeleteLesson,
    useUpdateCourse,
    usePublishCourse,
    useUnpublishCourse,
} from '@/hooks/useInstructorCourse';
import {
    useCourseAssignments,
    useCoursePendingGrading,
    useGradeSubmission,
} from '@/hooks/useAssignments';
import { mediaApi } from '@/services/api/media.api';
import toast from 'react-hot-toast';

// Import components từ courseDetail
import {
    // Types
    TabType,
    Section,
    Lesson,
    statusLabels,
    Assignment,
    CourseStats,
    Student,
    Submission,
    AssignmentStats,
    // Tab Components
    OverviewTab,
    CurriculumTab,
    StudentsTab,
    AssignmentsListTab,
    SubmissionsTab,
    SettingsTab,
    // Modal Components
    SectionModal,
    LessonModal,
} from './components/courseDetail';

/**
 * InstructorCourseDetailPage
 * 
 * Trang quản lý chi tiết khóa học cho Instructor.
 * Bao gồm các tabs:
 * - Tổng quan: Thống kê nhanh (doanh thu, học viên, trạng thái)
 * - Nội dung: Quản lý chương/bài học (CRUD)
 * - Học viên: Danh sách học viên và tiến độ
 * - Đánh giá: Xem và trả lời reviews
 * - Cài đặt: Chỉnh sửa thông tin khóa học
 */
export function InstructorDetailPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { navigateTo } = useRoleBasedNavigation();

    // ================== API QUERIES ==================
    const { 
        data: courseResponse, 
        isLoading: courseLoading, 
        error: courseError 
    } = useInstructorCourseDetail(courseId || '');
    
    const { 
        data: statsResponse, 
        isLoading: statsLoading 
    } = useCourseStats(courseId || '');
    
    const { 
        data: studentsResponse, 
        isLoading: studentsLoading 
    } = useCourseStudents(courseId || '');
    
    const { 
        data: sectionsResponse, 
        isLoading: sectionsLoading 
    } = useCourseSections(courseId || '');

    // Assignment queries
    const {
        data: assignmentsResponse,
        isLoading: assignmentsLoading
    } = useCourseAssignments(courseId || '');

    const {
        data: pendingGradingResponse,
        isLoading: pendingGradingLoading
    } = useCoursePendingGrading(courseId || '');

    // ================== MUTATIONS ==================
    const createSectionMutation = useCreateSection();
    const updateSectionMutation = useUpdateSection(courseId || '');
    const deleteSectionMutation = useDeleteSection(courseId || '');
    const createLessonMutation = useCreateLesson(courseId || '');
    const updateLessonMutation = useUpdateLesson(courseId || '');
    const deleteLessonMutation = useDeleteLesson(courseId || '');
    const updateCourseMutation = useUpdateCourse();

    // ================== STATE ==================
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

    // Section Modal State
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [sectionTitle, setSectionTitle] = useState('');

    // Lesson Modal State
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson | null; sectionId: string } | null>(null);
    const [lessonForm, setLessonForm] = useState<Omit<Lesson, 'id' | 'order_index'>>({
        title: '',
        content_type: 'video',
        duration_minutes: 0,
        is_preview: false,
        video_url: '',
    });

    // ================== DERIVED DATA ==================
    // Transform API data to match component types
    const course = useMemo(() => {
        if (!courseResponse?.data) return null;
        const c = courseResponse.data;
        return {
            id: c.id,
            title: c.title,
            description: c.description || '',
            thumbnail_url: c.thumbnail_url,
            status: c.status as 'draft' | 'published' | 'archived',
            difficulty: (c.difficulty || 'beginner') as 'beginner' | 'intermediate' | 'advanced',
            is_free: c.is_free,
            price: c.price,
            created_at: c.created_at,
            updated_at: c.updated_at,
        };
    }, [courseResponse]);

    const stats: CourseStats = useMemo(() => {
        if (!statsResponse?.data) {
            return {
                total_students: 0,
                total_revenue: 0,
                average_rating: 0,
                total_reviews: 0,
                completion_rate: 0,
                avg_progress: 0,
                avg_score: 0,
                pending_grading: 0,
                max_students: 100,
                new_students_this_week: 0,
            };
        }
        return statsResponse.data;
    }, [statsResponse]);

    const students: Student[] = useMemo(() => {
        if (!studentsResponse?.data) return [];
        // API returns { data: { data: [...], pagination: {...} } } or { data: { students: [...] } }
        const responseData = studentsResponse.data as any;
        const studentsData = responseData?.data || responseData?.students || [];
        return studentsData.map((s: any) => ({
            id: s.id,
            name: s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || 'Unknown',
            email: s.email,
            avatar_url: s.avatar_url,
            enrolled_at: s.enrolled_at || s.enrollments?.[0]?.created_at,
            progress_percent: s.progress_percent || 0,
            last_activity_at: s.last_activity_at || s.enrolled_at,
        }));
    }, [studentsResponse]);

    const sections: Section[] = useMemo(() => {
        if (!sectionsResponse?.data) return [];
        // API returns { data: [...], pagination: {...} } or just array
        const responseData = sectionsResponse.data as any;
        const sectionsData = Array.isArray(responseData) 
            ? responseData 
            : responseData?.data || [];
        return sectionsData.map((s: any) => ({
            id: s.id,
            title: s.title,
            order_index: s.order_index,
            isExpanded: expandedSections.has(s.id),
            lessons: (s.lessons || []).map((l: any) => ({
                id: l.id,
                title: l.title,
                content_type: l.content_type as 'video' | 'document' | 'quiz' | 'assignment',
                duration_minutes: l.duration_minutes || 0,
                is_preview: l.is_free_preview || false,
                order_index: l.order_index,
                video_url: l.video_url || '',
            })),
        }));
    }, [sectionsResponse, expandedSections]);

    // Transform assignments data from API
    const assignments: Assignment[] = useMemo(() => {
        if (!assignmentsResponse) return [];
        const data = Array.isArray(assignmentsResponse) ? assignmentsResponse : [];
        return data.map((a: any) => ({
            id: a.id,
            title: a.title,
            description: a.description || '',
            type: 'assignment' as const,
            due_date: a.due_date || '',
            max_score: a.max_score || 100,
            is_active: a.is_published || false,
            created_at: a.created_at || '',
            lesson_id: a.lesson_id,
            lesson_title: a.lesson?.title,
            section_title: a.lesson?.section?.title,
        }));
    }, [assignmentsResponse]);

    // Transform submissions data from pending grading
    const submissions: Submission[] = useMemo(() => {
        if (!pendingGradingResponse?.rows) return [];
        return pendingGradingResponse.rows.map((s: any) => ({
            id: s.id,
            student_id: s.user_id || s.student?.id || '',
            student_name: s.student ? `${s.student.first_name} ${s.student.last_name}` : 'Unknown',
            student_avatar: s.student?.avatar_url,
            student_mssv: s.student?.student_id,
            assignment_title: s.assignment?.title || '',
            assignment_type: 'assignment' as const,
            submitted_at: s.submitted_at || '',
            is_late: s.is_late || false,
            late_duration: s.late_duration,
            status: s.status || 'pending',
            score: s.score,
            max_score: s.assignment?.max_score || 100,
            submission_text: s.submission_text,
            file_urls: s.file_url ? [s.file_url] : [],
            feedback: s.feedback,
            graded_at: s.graded_at,
        }));
    }, [pendingGradingResponse]);

    // Calculate assignment stats
    const assignmentStats: AssignmentStats = useMemo(() => {
        const totalStudents = (studentsResponse?.data as any)?.students?.length || (studentsResponse?.data as any)?.length || 0;
        const submittedCount = submissions.filter(s => s.status !== 'missing').length;
        const pendingCount = submissions.filter(s => s.status === 'pending').length;
        const gradedSubmissions = submissions.filter(s => s.status === 'graded');
        const avgScore = gradedSubmissions.length > 0
            ? gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length
            : 0;

        return {
            total_students: totalStudents,
            submitted_count: submittedCount,
            pending_grading_count: pendingCount,
            average_score: avgScore,
            due_date: selectedAssignment?.due_date || '',
            is_overdue: selectedAssignment?.due_date ? new Date(selectedAssignment.due_date) < new Date() : false,
            time_remaining: selectedAssignment?.due_date 
                ? getTimeRemaining(selectedAssignment.due_date) 
                : undefined,
        };
    }, [submissions, studentsResponse, selectedAssignment]);

    // Helper function to calculate time remaining
    function getTimeRemaining(dueDate: string): string {
        const now = new Date();
        const due = new Date(dueDate);
        const diffMs = due.getTime() - now.getTime();
        
        if (diffMs <= 0) return 'Đã quá hạn';
        
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days} ngày ${hours} giờ`;
        if (hours > 0) return `${hours} giờ`;
        return 'Sắp hết hạn';
    }

    // ================== SECTION HANDLERS ==================

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };

    const handleAddSection = () => {
        setSectionTitle('');
        setEditingSection(null);
        setShowSectionModal(true);
    };

    const handleEditSection = (section: Section) => {
        setSectionTitle(section.title);
        setEditingSection(section);
        setShowSectionModal(true);
    };

    const handleSaveSection = async () => {
        if (!courseId) return;
        
        try {
            if (editingSection) {
                await updateSectionMutation.mutateAsync({
                    sectionId: editingSection.id,
                    data: { title: sectionTitle }
                });
            } else {
                const nextOrderIndex =
                    sections.length > 0
                        ? Math.max(...sections.map(s => s.order_index ?? 0)) + 1
                        : 0;
                await createSectionMutation.mutateAsync({
                    course_id: courseId,
                    title: sectionTitle,
                    order_index: nextOrderIndex
                });
            }
            setShowSectionModal(false);
        } catch (error) {
            console.error('Error saving section:', error);
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (confirm('Xóa chương này? Tất cả bài học trong chương sẽ bị xóa.')) {
            try {
                await deleteSectionMutation.mutateAsync(sectionId);
            } catch (error) {
                console.error('Error deleting section:', error);
            }
        }
    };

    // ================== LESSON HANDLERS ==================

    const handleAddLesson = (sectionId: string) => {
        setLessonForm({ title: '', content_type: 'video', duration_minutes: 0, is_preview: false, video_url: '' });
        setEditingLesson({ lesson: null, sectionId });
        setShowLessonModal(true);
    };

    const handleEditLesson = (lesson: Lesson, sectionId: string) => {
        setLessonForm({
            title: lesson.title,
            content_type: lesson.content_type,
            duration_minutes: lesson.duration_minutes,
            is_preview: lesson.is_preview,
            video_url: lesson.video_url || '',
        });
        setEditingLesson({ lesson, sectionId });
        setShowLessonModal(true);
    };

    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleSaveLesson = async () => {
        console.log('[handleSaveLesson] Called with editingLesson:', editingLesson);
        console.log('[handleSaveLesson] lessonForm:', lessonForm);
        
        if (!editingLesson) {
            console.error('[handleSaveLesson] editingLesson is null, aborting');
            return;
        }

        try {
            let videoUrl = lessonForm.video_url;

            // Upload video file to R2 if there's a new file
            if (lessonForm.video_file && lessonForm.video_url?.startsWith('blob:')) {
                setIsUploadingVideo(true);
                setUploadProgress(0);
                toast.loading('Đang tải video lên...', { id: 'upload-video' });
                
                try {
                    const uploadResult = await mediaApi.uploadLessonVideo(
                        lessonForm.video_file,
                        courseId,
                        editingLesson.lesson?.id,
                        (progress) => setUploadProgress(progress)
                    );
                    videoUrl = uploadResult.data.url;
                    toast.success('Tải video thành công!', { id: 'upload-video' });
                } catch (uploadError) {
                    console.error('Error uploading video:', uploadError);
                    toast.error('Không thể tải video lên. Vui lòng thử lại.', { id: 'upload-video' });
                    setIsUploadingVideo(false);
                    return;
                }
                setIsUploadingVideo(false);
            }

            if (editingLesson.lesson) {
                console.log('[handleSaveLesson] Updating existing lesson:', editingLesson.lesson.id);
                await updateLessonMutation.mutateAsync({
                    lessonId: editingLesson.lesson.id,
                    data: {
                        title: lessonForm.title,
                        content_type: lessonForm.content_type,
                        duration_minutes: lessonForm.duration_minutes,
                        is_free_preview: lessonForm.is_preview,
                        video_url: videoUrl,
                    }
                });
                toast.success('Cập nhật bài học thành công!');
            } else {
                console.log('[handleSaveLesson] Creating new lesson in section:', editingLesson.sectionId);
                const lessonData = {
                    section_id: editingLesson.sectionId,
                    title: lessonForm.title,
                    content_type: lessonForm.content_type,
                    duration_minutes: lessonForm.duration_minutes || 0,
                    is_free_preview: lessonForm.is_preview,
                    video_url: videoUrl || undefined,
                };
                console.log('[handleSaveLesson] Lesson data to send:', lessonData);
                const result = await createLessonMutation.mutateAsync(lessonData);
                console.log('[handleSaveLesson] Lesson created successfully:', result);
                toast.success('Tạo bài học thành công!');
            }
            setShowLessonModal(false);
        } catch (error: any) {
            console.error('[handleSaveLesson] Error saving lesson:', error);
            console.error('[handleSaveLesson] Error response:', error?.response?.data);
            toast.error(`Lỗi khi lưu bài học: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
        }
    };

    const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
        if (confirm('Xóa bài học này?')) {
            try {
                await deleteLessonMutation.mutateAsync(lessonId);
            } catch (error) {
                console.error('Error deleting lesson:', error);
            }
        }
    };

    // ================== OTHER HANDLERS ==================

    const handleSaveSettings = async (data: {
        title: string;
        description: string;
        is_free: boolean;
        price?: number;
        thumbnail_url?: string;
    }) => {
        if (!courseId) return;
        
        await updateCourseMutation.mutateAsync({
            courseId,
            data: {
                title: data.title,
                description: data.description,
                is_free: data.is_free,
                price: data.price,
                thumbnail_url: data.thumbnail_url,
            }
        });
    };

    const handlePublishCourse = async () => {
        if (!courseId) return;
        try {
            await updateCourseMutation.mutateAsync({
                courseId,
                data: { status: 'published' }
            });
        } catch (error) {
            console.error('Error publishing course:', error);
        }
    };

    const handleUnpublishCourse = async () => {
        if (!courseId) return;
        try {
            await updateCourseMutation.mutateAsync({
                courseId,
                data: { status: 'draft' }
            });
        } catch (error) {
            console.error('Error unpublishing course:', error);
        }
    };

    // ================== TAB CONFIG ==================

    const tabs: { key: TabType; label: string; icon: typeof BookOpen }[] = [
        { key: 'overview', label: 'Tổng quan', icon: BarChart3 },
        { key: 'curriculum', label: 'Nội dung', icon: BookOpen },
        { key: 'students', label: 'Học viên', icon: Users },
        { key: 'submissions', label: 'Bài nộp', icon: Star },
        { key: 'settings', label: 'Cài đặt', icon: Settings },
    ];

    // ================== RENDER ==================

    // Loading state
    if (courseLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Error state
    if (courseError || !course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-gray-600">Không thể tải thông tin khóa học</p>
                <Button onClick={() => navigateTo.myCourses()}>
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-8xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => navigateTo.myCourses()}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                            <Badge variant={statusLabels[course.status].variant}>
                                {statusLabels[course.status].label}
                            </Badge>
                        </div>
                        <p className="text-gray-500">{course.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Xem trước
                    </Button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'overview' && (
                    <OverviewTab
                        courseId={courseId}
                        courseData={courseResponse?.data ? {
                            title: courseResponse.data.title || '',
                            description: courseResponse.data.description,
                            content: '',
                            lessons: sections.flatMap(s => s.lessons),
                            enrollmentStats: {
                                total: statsResponse?.data?.total_students || 0,
                                active: statsResponse?.data?.total_students || 0, // Use total_students as active
                            },
                        } : undefined}
                        stats={stats}
                        students={students}
                        onTabChange={setActiveTab}
                    />
                )}

                {activeTab === 'curriculum' && (
                    <CurriculumTab
                        sections={sections}
                        onToggleSection={toggleSection}
                        onAddSection={handleAddSection}
                        onEditSection={handleEditSection}
                        onDeleteSection={handleDeleteSection}
                        onAddLesson={handleAddLesson}
                        onEditLesson={handleEditLesson}
                        onDeleteLesson={handleDeleteLesson}
                    />
                )}

                {activeTab === 'students' && (
                    <StudentsTab students={students} />
                )}

                {activeTab === 'submissions' && (
                    selectedAssignment ? (
                        <SubmissionsTab
                            submissions={submissions}
                            assignmentStats={assignmentStats}
                            assignmentTitle={selectedAssignment.title}
                            courseTitle={course?.title || ''}
                            courseId={courseId || '1'}
                            assignmentId={selectedAssignment.id}
                            assignmentInstructions={selectedAssignment.description || selectedAssignment.title}
                            onBack={() => setSelectedAssignment(null)}
                        />
                    ) : (
                        <AssignmentsListTab
                            assignments={assignments}
                            onSelectAssignment={setSelectedAssignment}
                        />
                    )
                )}

                {activeTab === 'settings' && course && (
                    <SettingsTab
                        course={{
                            ...course,
                            thumbnail_url: course.thumbnail_url || undefined,
                            price: course.price || 0,
                        }}
                        onSave={handleSaveSettings}
                        onPublish={handlePublishCourse}
                        onUnpublish={handleUnpublishCourse}
                        isSaving={updateCourseMutation.isPending}
                    />
                )}
            </div>

            {/* Modals */}
            <SectionModal
                isOpen={showSectionModal}
                editingSection={editingSection}
                sectionTitle={sectionTitle}
                onTitleChange={setSectionTitle}
                onSave={handleSaveSection}
                onClose={() => setShowSectionModal(false)}
            />

            <LessonModal
                isOpen={showLessonModal}
                editingLesson={editingLesson?.lesson ?? null}
                lessonForm={lessonForm}
                onFormChange={setLessonForm}
                onSave={handleSaveLesson}
                onClose={() => setShowLessonModal(false)}
            />
        </div>
    );
}

export default InstructorDetailPage;
