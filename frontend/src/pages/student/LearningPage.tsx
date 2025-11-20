import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
	ArrowLeft, 
	X, 
	ChevronLeft, 
	ChevronRight as ChevronRightIcon, 
	CheckCircle, 
	Circle, 
	Search,
	FileText,
	MessageSquare,
	FolderOpen,
	AlertCircle,
	ChevronDown,
	ThumbsUp,
	Image,
	Send,
	Download,
	FileArchive
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { useCourseContent } from '@/hooks/useLessonData';
import type { CourseContent, Lesson, Section } from '@/services/api/lesson.api';

// Curriculum Tree Component
interface CurriculumTreeProps {
	sections: Section[];
	activeLessonId: number | null;
	onLessonClick: (lessonId: number) => void;
}

function CurriculumTree({ sections, activeLessonId, onLessonClick }: CurriculumTreeProps) {
	const [expandedSections, setExpandedSections] = useState<number[]>(() => 
		sections.map(s => s.id) // Expand all by default
	);

	const toggleSection = (sectionId: number) => {
		setExpandedSections(prev => 
			prev.includes(sectionId) 
				? prev.filter(id => id !== sectionId)
				: [...prev, sectionId]
		);
	};

	return (
		<div className="py-2">
			{sections.map((section, sectionIndex) => {
				const isExpanded = expandedSections.includes(section.id);
				const completedCount = section.lessons.filter(l => l.is_completed).length;
				const totalCount = section.lessons.length;
				
				return (
					<div key={section.id} className="mb-1">
						{/* Section Header */}
						<button
							onClick={() => toggleSection(section.id)}
							className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors text-left"
						>
							<div className="flex items-center gap-2 flex-1">
								{isExpanded ? (
									<ChevronDown className="w-4 h-4 text-gray-500" />
								) : (
									<ChevronRight className="w-4 h-4 text-gray-500" />
								)}
								<div className="flex-1">
									<p className="text-sm font-semibold text-gray-900">
										Chương {sectionIndex + 1}: {section.title}
									</p>
									<p className="text-xs text-gray-500 mt-0.5">
										{completedCount}/{totalCount} bài học
									</p>
								</div>
							</div>
						</button>

						{/* Lessons List */}
						{isExpanded && (
							<div className="bg-white">
								{section.lessons.map((lesson, lessonIndex) => {
									const isActive = lesson.id === activeLessonId;
									const isCompleted = lesson.is_completed;

									return (
										<button
											key={lesson.id}
											onClick={() => onLessonClick(lesson.id)}
											className={`w-full px-4 py-3 pl-12 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${
												isActive ? 'bg-blue-50 border-l-2 border-blue-600' : ''
											}`}
										>
											{/* Status Icon */}
											{isCompleted ? (
												<CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
											) : (
												<Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
											)}

											{/* Lesson Info */}
											<div className="flex-1 min-w-0">
												<p className={`text-sm ${isActive ? 'font-semibold text-blue-600' : 'text-gray-700'} line-clamp-2`}>
													{lessonIndex + 1}. {lesson.title}
												</p>
												{lesson.duration_minutes && (
													<p className="text-xs text-gray-500 mt-0.5">
														{lesson.duration_minutes} phút
													</p>
												)}
											</div>

											{/* Content Type Icon */}
											{lesson.content_type === 'video' && (
												<FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
											)}
										</button>
									);
								})}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

function ChevronRight({ className }: { className?: string }) {
	return (
		<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
		</svg>
	);
}

// Discussion Tab Component
function DiscussionTab() {
	const [newDiscussion, setNewDiscussion] = useState('');

	const mockDiscussions = [
		{
			id: 1,
			title: 'Several sentences are confusing',
			content: 'This Section, i don\'t understand please explain...',
			likes: 12,
			replies: 2,
			attachments: 0,
			author: 'User A',
			timeAgo: '32m ago'
		},
		{
			id: 2,
			title: 'In banner Remember, not clear',
			content: 'In the banner, there should be a detailed explanation...',
			likes: 3,
			replies: 2,
			attachments: 1,
			author: 'User B',
			timeAgo: '42m ago'
		}
	];

	return (
		<div className="flex flex-col h-full">
			{/* Search Bar */}
			<div className="p-3 border-b border-gray-200 bg-white">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
					<input
						type="text"
						placeholder="Tìm kiếm thảo luận..."
						className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
			</div>

			{/* New Discussion Input */}
			<div className="p-3 bg-gray-50 border-b border-gray-200">
				<textarea
					value={newDiscussion}
					onChange={(e) => setNewDiscussion(e.target.value)}
					placeholder="Viết thảo luận..."
					className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
					rows={3}
				/>
				<div className="flex justify-end mt-2">
					<button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
						<Send className="w-4 h-4" />
						Gửi
					</button>
				</div>
			</div>

			{/* Discussion List */}
			<div className="flex-1 overflow-y-auto">
				{mockDiscussions.map((discussion) => (
					<div key={discussion.id} className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
						{/* Title */}
						<h4 className="font-semibold text-sm text-gray-900 mb-1">
							{discussion.title}
						</h4>
						
						{/* Preview */}
						<p className="text-xs text-gray-500 mb-3 line-clamp-2">
							{discussion.content}
						</p>

						{/* Stats Row */}
						<div className="flex items-center gap-4 mb-2">
							<div className="flex items-center gap-1 text-gray-500">
								<ThumbsUp className="w-3.5 h-3.5" />
								<span className="text-xs">{discussion.likes}</span>
							</div>
							{discussion.attachments > 0 && (
								<div className="flex items-center gap-1 text-gray-500">
									<Image className="w-3.5 h-3.5" />
									<span className="text-xs">{discussion.attachments}</span>
								</div>
							)}
							<div className="flex items-center gap-1 text-gray-500">
								<MessageSquare className="w-3.5 h-3.5" />
								<span className="text-xs">{discussion.replies}</span>
							</div>
						</div>

						{/* Meta Row */}
						<div className="flex items-center gap-2 text-xs text-gray-500">
							<div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
								{discussion.author.charAt(0)}
							</div>
							<span>{discussion.replies} phản hồi</span>
							<span>•</span>
							<span>Trả lời lần cuối {discussion.timeAgo}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// File Tab Component
function FileTab() {
	const mockFiles = [
		{
			id: 1,
			name: 'Memorizing the provided.zip',
			size: '20.23kb',
			type: 'archive'
		},
		{
			id: 2,
			name: 'JavaScript Basics Notes.pdf',
			size: '1.5mb',
			type: 'document'
		},
		{
			id: 3,
			name: 'Code Examples.zip',
			size: '450kb',
			type: 'archive'
		}
	];

	return (
		<div className="flex flex-col h-full">
			{/* Search Bar */}
			<div className="p-3 border-b border-gray-200 bg-white">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
					<input
						type="text"
						placeholder="Tìm kiếm tệp..."
						className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
			</div>

			{/* File List */}
			<div className="flex-1 overflow-y-auto p-3 space-y-2">
				{mockFiles.map((file) => (
					<div 
						key={file.id} 
						className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
					>
						{/* File Icon */}
						<div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
							{file.type === 'archive' ? (
								<FileArchive className="w-5 h-5 text-gray-600" />
							) : (
								<FileText className="w-5 h-5 text-gray-600" />
							)}
						</div>

						{/* File Info */}
						<div className="flex-1 min-w-0">
							<p className="font-medium text-sm text-gray-900 truncate">
								{file.name}
							</p>
							<p className="text-xs text-gray-500">
								{file.size}
							</p>
						</div>

						{/* Download Button */}
						<button className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
							<Download className="w-4 h-4 text-gray-600" />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}

export function LearningPage() {
	const { courseId: paramCourseId } = useParams<{ courseId: string }>();
	const courseId = Number(paramCourseId);

	// Mock data để test UI
	const mockCourse: CourseContent = {
		course_id: courseId || 1,
		course_title: 'Khóa học JavaScript từ cơ bản đến nâng cao',
		total_lessons: 12,
		completed_lessons: 3,
		progress_percentage: 25,
		sections: [
			{
				id: 1,
				course_id: courseId || 1,
				title: 'Giới thiệu về JavaScript',
				description: 'Tìm hiểu các kiến thức cơ bản về JavaScript',
				order_index: 1,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				lessons: [
					{
						id: 1,
						section_id: 1,
						title: 'JavaScript là gì?',
						description: 'JavaScript là ngôn ngữ lập trình phổ biến nhất thế giới. Được sử dụng để tạo các trang web tương tác.',
						content_type: 'document',
						content_url: null,
						duration_minutes: 15,
						order_index: 1,
						is_preview: true,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					},
					{
						id: 2,
						section_id: 1,
						title: 'Cài đặt môi trường',
						description: 'Hướng dẫn cài đặt Node.js, VS Code và các công cụ cần thiết để bắt đầu học JavaScript.',
						content_type: 'video',
						content_url: 'https://example.com/video1.mp4',
						duration_minutes: 20,
						order_index: 2,
						is_preview: false,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					},
				],
			},
			{
				id: 2,
				course_id: courseId || 1,
				title: 'Biến và Kiểu dữ liệu',
				description: 'Học cách khai báo biến và các kiểu dữ liệu trong JavaScript',
				order_index: 2,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				lessons: [
					{
						id: 3,
						section_id: 2,
						title: 'Khai báo biến với var, let, const',
						description: 'Tìm hiểu sự khác biệt giữa var, let và const trong JavaScript và khi nào nên sử dụng.',
						content_type: 'document',
						content_url: null,
						duration_minutes: 25,
						order_index: 1,
						is_preview: false,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					},
					{
						id: 4,
						section_id: 2,
						title: 'Các kiểu dữ liệu cơ bản',
						description: 'String, Number, Boolean, Undefined, Null, Object, Symbol',
						content_type: 'video',
						content_url: 'https://example.com/video2.mp4',
						duration_minutes: 30,
						order_index: 2,
						is_preview: false,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					},
				],
			},
		],
	};

	// Comment API call để test UI
	// const { data, isLoading, error } = useCourseContent(courseId);
	// const course: CourseContent | undefined = data;
	
	// Sử dụng mock data
	const course: CourseContent | undefined = mockCourse;
	const sections: Section[] = course?.sections ?? [];
	const isLoading = false;
	const error = null;

	const flatLessons: Lesson[] = useMemo(() => {
		return sections.flatMap((s) => s.lessons);
	}, [sections]);

	const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
	const [sidebarTab, setSidebarTab] = useState<'content' | 'discussion' | 'files'>('content');

	useEffect(() => {
		if (activeLessonId == null && flatLessons.length > 0) {
			setActiveLessonId(flatLessons[0].id);
		}
	}, [flatLessons, activeLessonId]);

	const activeLesson = useMemo(() => {
		if (activeLessonId == null) return undefined;
		return flatLessons.find((l) => l.id === activeLessonId);
	}, [flatLessons, activeLessonId]);

	const activeIndex = useMemo(() => {
		if (!activeLesson) return -1;
		return flatLessons.findIndex((l) => l.id === activeLesson.id);
	}, [flatLessons, activeLesson]);

	const onBack = () => {
		if (activeIndex > 0) setActiveLessonId(flatLessons[activeIndex - 1].id);
	};
	const onNext = () => {
		if (activeIndex >= 0 && activeIndex < flatLessons.length - 1) setActiveLessonId(flatLessons[activeIndex + 1].id);
	};

	// Comment loading và error states khi test UI
	// if (isLoading) {
	// 	return (
	// 		<div className="min-h-screen flex items-center justify-center">
	// 			<Spinner size="xl" />
	// 		</div>
	// 	);
	// }

	// if (error || !course) {
	// 	return (
	// 		<div className="min-h-screen flex items-center justify-center">
	// 			<div className="text-center">
	// 				<h1 className="text-2xl font-bold text-gray-900 mb-4">Không thể tải nội dung khóa học</h1>
	// 				<Link to="/courses" className="text-blue-600 hover:text-blue-700">Quay lại danh sách khóa học</Link>
	// 			</div>
	// 		</div>
	// 	);
	// }

	return (
		<div className="flex flex-col h-screen bg-white overflow-hidden">
			{/* Fixed Header - 64px */}
			<header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 bg-white">
				<div className="flex items-center gap-4">
					<Link 
						to="/courses" 
						className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
						title="Quay lại"
					>
						<ArrowLeft className="w-5 h-5 text-gray-700" />
					</Link>
					<div className="flex flex-col">
						<h1 className="text-lg font-semibold text-gray-900 line-clamp-1">
							{course.course_title}
						</h1>
						<p className="text-xs text-gray-500">
							Bài {activeIndex + 1}/{flatLessons.length}
						</p>
					</div>
				</div>
				<Link 
					to={`/courses/${courseId}`}
					className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
					title="Đóng"
				>
					<X className="w-5 h-5 text-gray-700" />
				</Link>
			</header>

			{/* Body - Two Column Layout */}
			<div className="flex flex-1 overflow-hidden">
				{/* Main Content Area - 75% */}
				<main className="flex-1 flex flex-col overflow-hidden">
					{/* Scrollable Content */}
					<div className="flex-1 overflow-y-auto">
						<div className="max-w-4xl mx-auto px-8 py-12">
							{/* Breadcrumb */}
							<div className="text-sm text-gray-500 mb-4">
								{sections.find(s => s.lessons.some(l => l.id === activeLessonId))?.title || 'Chương'}
							</div>

							{/* Lesson Title */}
							<h1 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">
								{activeLesson?.title || 'Bài học'}
							</h1>

							{/* Featured Image/Video Area */}
							{activeLesson?.content_type === 'video' ? (
								<div className="aspect-video bg-gray-900 rounded-lg mb-8 flex items-center justify-center overflow-hidden">
									<div className="text-center text-white">
										<FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
										<p className="text-sm opacity-75">Trình phát video</p>
										<p className="text-xs opacity-50 mt-1">{activeLesson?.content_url || 'URL không khả dụng'}</p>
									</div>
								</div>
							) : (
								<div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg mb-8 flex items-center justify-center">
									<FileText className="w-16 h-16 text-indigo-300" />
								</div>
							)}

							{/* Rich Text Content */}
							<article className="prose prose-lg max-w-none">
								<div className="text-gray-700 leading-relaxed space-y-4">
									{activeLesson?.description ? (
										<>
											{activeLesson.description.split('\n').map((paragraph, idx) => (
												<p key={idx} className="mb-4">{paragraph}</p>
											))}
										</>
									) : (
										<p className="text-gray-500 italic">Nội dung đang được cập nhật...</p>
									)}
								</div>

								{/* Demo Rich Content */}
								<div className="mt-8 space-y-6">
									<h2 className="text-2xl font-semibold text-gray-900 mt-8">Nội dung chính</h2>
									<p>Trong bài học này, bạn sẽ học được những kiến thức quan trọng và thực hành các kỹ năng cần thiết.</p>
									
									<h3 className="text-xl font-semibold text-gray-900 mt-6">Các điểm chính:</h3>
									<ul className="list-disc list-inside space-y-2 text-gray-700">
										<li>Hiểu rõ các khái niệm cơ bản</li>
										<li>Thực hành với các ví dụ thực tế</li>
										<li>Áp dụng kiến thức vào dự án</li>
									</ul>
								</div>
							</article>
						</div>
					</div>

					{/* Sticky Footer Navigation - Only for Main Content */}
					<div className="border-t border-gray-200 bg-white px-8 py-4 flex items-center justify-between">
						<button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
							<AlertCircle className="w-4 h-4" />
							Báo cáo vấn đề
						</button>
						<div className="flex items-center gap-3">
							<button
								onClick={onBack}
								disabled={activeIndex <= 0}
								className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
							>
								<ChevronLeft className="w-4 h-4" />
								Quay lại
							</button>
							<button
								onClick={onNext}
								disabled={activeIndex < 0 || activeIndex >= flatLessons.length - 1}
								className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
							>
								Chương tiếp theo
								<ChevronRightIcon className="w-4 h-4" />
							</button>
						</div>
					</div>
				</main>

				{/* Right Sidebar - 25% (320px fixed) */}
				<aside className="w-80 border-l border-gray-200 flex flex-col bg-gray-50 overflow-hidden">
					{/* Tabs */}
					<div className="flex border-b border-gray-200 bg-white">
						{([
							{ key: 'content', label: 'Nội dung', icon: FileText },
							{ key: 'discussion', label: 'Thảo luận', icon: MessageSquare },
							{ key: 'files', label: 'Tệp', icon: FolderOpen }
						] as const).map(({ key, label, icon: Icon }) => (
							<button
								key={key}
								type="button"
								onClick={() => setSidebarTab(key)}
								className={`flex-1 px-3 py-3 text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
									sidebarTab === key 
										? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
										: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
								}`}
							>
								<Icon className="w-4 h-4" />
								{label}
							</button>
						))}
					</div>

					{/* Search Bar */}
					{sidebarTab === 'content' && (
						<div className="p-3 border-b border-gray-200 bg-white">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
								<input
									type="text"
									placeholder="Tìm kiếm bài học..."
									className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>
					)}

					{/* Content Area */}
					<div className="flex-1 overflow-y-auto">
						{sidebarTab === 'content' && (
							<CurriculumTree 
								sections={sections}
								activeLessonId={activeLessonId}
								onLessonClick={setActiveLessonId}
							/>
						)}
						{sidebarTab === 'discussion' && <DiscussionTab />}
						{sidebarTab === 'files' && <FileTab />}
					</div>

					{/* Progress Footer */}
					{sidebarTab === 'content' && (
						<div className="p-4 border-t border-gray-200 bg-white">
							<div className="flex items-center justify-between text-xs text-gray-600 mb-2">
								<span>Tiến độ khóa học</span>
								<span className="font-medium">{course.progress_percentage}%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div 
									className="bg-green-500 h-2 rounded-full transition-all duration-300"
									style={{ width: `${course.progress_percentage}%` }}
								/>
							</div>
							<p className="text-xs text-gray-500 mt-2">
								{course.completed_lessons}/{course.total_lessons} bài đã hoàn thành
							</p>
						</div>
					)}
				</aside>
			</div>
		</div>
	);
}

export default LearningPage;
