// InstructorCourseDetailPage - Course management for instructors
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Users,
    Settings,
    Star,
    BarChart3,
    Eye,
    ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';

// Import components từ courseDetail
import {
    // Types
    TabType,
    Section,
    Lesson,
    statusLabels,
    Assignment,
    // Mock data
    MOCK_COURSE,
    MOCK_STATS,
    MOCK_SECTIONS,
    MOCK_STUDENTS,
    MOCK_ASSIGNMENTS,
    MOCK_SUBMISSIONS,
    MOCK_ASSIGNMENT_STATS,
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
} from '../components/editor/courseDetail';

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

    // ================== STATE ==================
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [sections, setSections] = useState<Section[]>(MOCK_SECTIONS);
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

    // Mock data
    const course = MOCK_COURSE;
    const stats = MOCK_STATS;
    const students = MOCK_STUDENTS;
    const assignments = MOCK_ASSIGNMENTS;
    const submissions = MOCK_SUBMISSIONS;
    const assignmentStats = MOCK_ASSIGNMENT_STATS;

    // ================== SECTION HANDLERS ==================

    const toggleSection = (sectionId: string) => {
        setSections(sections.map(s =>
            s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s
        ));
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

    const handleSaveSection = () => {
        // TODO: API call - POST /api/instructor/courses/:courseId/sections (create)
        // TODO: API call - PUT /api/instructor/courses/:courseId/sections/:sectionId (update)
        if (editingSection) {
            setSections(sections.map(s =>
                s.id === editingSection.id ? { ...s, title: sectionTitle } : s
            ));
        } else {
            const newSection: Section = {
                id: Date.now().toString(),
                title: sectionTitle,
                lessons: [],
                order_index: sections.length + 1,
                isExpanded: true,
            };
            setSections([...sections, newSection]);
        }
        setShowSectionModal(false);
    };

    const handleDeleteSection = (sectionId: string) => {
        // TODO: API call - DELETE /api/instructor/courses/:courseId/sections/:sectionId
        if (confirm('Xóa chương này? Tất cả bài học trong chương sẽ bị xóa.')) {
            setSections(sections.filter(s => s.id !== sectionId));
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

    const handleSaveLesson = () => {
        // TODO: API call - POST /api/instructor/sections/:sectionId/lessons (create)
        // TODO: API call - PUT /api/instructor/lessons/:lessonId (update)
        if (!editingLesson) return;

        setSections(sections.map(s => {
            if (s.id === editingLesson.sectionId) {
                if (editingLesson.lesson) {
                    return {
                        ...s,
                        lessons: s.lessons.map(l =>
                            l.id === editingLesson.lesson!.id ? { ...l, ...lessonForm } : l
                        ),
                    };
                } else {
                    const newLesson: Lesson = {
                        id: Date.now().toString(),
                        ...lessonForm,
                        order_index: s.lessons.length + 1,
                    };
                    return { ...s, lessons: [...s.lessons, newLesson] };
                }
            }
            return s;
        }));
        setShowLessonModal(false);
    };

    const handleDeleteLesson = (sectionId: string, lessonId: string) => {
        // TODO: API call - DELETE /api/instructor/lessons/:lessonId
        if (confirm('Xóa bài học này?')) {
            setSections(sections.map(s =>
                s.id === sectionId ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) } : s
            ));
        }
    };

    // ================== OTHER HANDLERS ==================

    const handleReplyReview = (reviewId: string, replyText: string) => {
        // TODO: API call - POST /api/instructor/reviews/:reviewId/reply
        console.log('Reply to review:', reviewId, replyText);
    };

    const handleSaveSettings = () => {
        // TODO: API call - PUT /api/instructor/courses/:courseId
        console.log('Save settings');
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

    return (
        <div className="max-w-8xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => navigate(ROUTES.INSTRUCTOR.MY_COURSES)}
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
                            courseTitle={course.title}
                            courseId={courseId || '1'}
                            assignmentId={selectedAssignment.id}
                            onBack={() => setSelectedAssignment(null)}
                        />
                    ) : (
                        <AssignmentsListTab
                            assignments={assignments}
                            onSelectAssignment={setSelectedAssignment}
                        />
                    )
                )}

                {activeTab === 'settings' && (
                    <SettingsTab
                        course={course}
                        onSave={handleSaveSettings}
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
